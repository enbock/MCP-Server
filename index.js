#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import https from 'https';

// Brave Search API Konfiguration
const BRAVE_API_KEY = process.env.BRAVE_API_KEY || '';
const BRAVE_SEARCH_ENDPOINT = 'https://api.search.brave.com/res/v1/web/search';

/**
 * Request Spooler - ensures max 1 request per second
 */
class RequestSpooler {
  constructor(requestsPerSecond = 1) {
    this.queue = [];
    this.processing = false;
    this.minDelay = 1000 / requestsPerSecond; // milliseconds between requests
    this.lastRequestTime = 0;
  }

  /**
   * Add a request to the queue
   * @param {Function} requestFn - The async function to execute
   * @returns {Promise} - Resolves with the result of the request
   */
  async enqueue(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process the queue with rate limiting
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      // Wait if necessary to maintain rate limit
      if (timeSinceLastRequest < this.minDelay) {
        await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastRequest));
      }

      const { requestFn, resolve, reject } = this.queue.shift();
      this.lastRequestTime = Date.now();

      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.processing = false;
  }
}

// Create global spooler instance (1 request per second)
const requestSpooler = new RequestSpooler(1);

/**
 * Führt eine Brave-Websuche durch (intern - ohne Spooler)
 * @param {string} query - Die Suchanfrage
 * @param {number} count - Anzahl der Ergebnisse (Standard: 10)
 * @returns {Promise<Object>} - Die Suchergebnisse
 */
async function braveWebSearchInternal(query, count = 10) {
  if (!BRAVE_API_KEY) {
    throw new Error('BRAVE_API_KEY Umgebungsvariable ist nicht gesetzt');
  }

  return new Promise((resolve, reject) => {
    const url = new URL(BRAVE_SEARCH_ENDPOINT);
    url.searchParams.append('q', query);
    url.searchParams.append('count', count.toString());

    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // 'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_API_KEY,
      },
    };

    const req = https.get(url.toString(), options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (error) {
            reject(new Error(`Fehler beim Parsen der Antwort: ${error.message}`));
          }
        } else {
          reject(new Error(`Brave API Fehler: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Netzwerkfehler: ${error.message}`));
    });

    req.end();
  });
}

/**
 * Führt eine Brave-Websuche durch (mit Rate-Limiting über Spooler)
 * @param {string} query - Die Suchanfrage
 * @param {number} count - Anzahl der Ergebnisse (Standard: 10)
 * @returns {Promise<Object>} - Die Suchergebnisse
 */
async function braveWebSearch(query, count = 10) {
  return requestSpooler.enqueue(() => braveWebSearchInternal(query, count));
}

/**
 * Formatiert die Brave-Suchergebnisse für die Ausgabe
 * @param {Object} searchResults - Die rohen Brave-Suchergebnisse
 * @returns {string} - Formatierte Ergebnisse als Text
 */
function formatSearchResults(searchResults) {
  if (!searchResults.web || !searchResults.web.results || searchResults.web.results.length === 0) {
    return 'Keine Suchergebnisse gefunden.';
  }

  let output = '';

  // Query Information
  if (searchResults.query) {
    output += `Suchanfrage: "${searchResults.query.original}"\n`;
  }

  output += `\nGefundene Ergebnisse:\n\n`;

  searchResults.web.results.forEach((result, index) => {
    output += `${index + 1}. ${result.title}\n`;
    output += `   URL: ${result.url}\n`;
    output += `   ${result.description}\n`;

    if (result.age) {
      output += `   Alter: ${result.age}\n`;
    }

    if (result.language) {
      output += `   Sprache: ${result.language}\n`;
    }

    output += '\n';
  });

  // Extra Informationen wenn vorhanden
  if (searchResults.news && searchResults.news.results && searchResults.news.results.length > 0) {
    output += '\n--- Nachrichten ---\n';
    searchResults.news.results.slice(0, 3).forEach((news, index) => {
      output += `\n${index + 1}. ${news.title}\n`;
      output += `   URL: ${news.url}\n`;
      output += `   ${news.description}\n`;
      if (news.age) {
        output += `   Veröffentlicht: ${news.age}\n`;
      }
    });
  }

  return output;
}

// MCP Server erstellen
const server = new Server(
  {
    name: 'mcp-itbock-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool-Liste bereitstellen
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'internet_search',
        description: 'Performs a web search using the Brave Search API. Returns relevant websites, snippets, and URLs. Optionally displays news results.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query',
            },
            count: {
              type: 'number',
              description: 'Number of results to return (Default: 10, Maximum: 20)',
              default: 10,
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});

// Tool-Aufrufe behandeln
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'internet_search') {
    const { query, count = 10 } = request.params.arguments;

    if (!query || typeof query !== 'string') {
      throw new Error('Parameter "query" ist erforderlich und muss ein String sein');
    }

    const resultCount = Math.min(Math.max(1, count || 10), 20);

    try {
      const searchResults = await braveWebSearch(query, resultCount);
      const formattedResults = formatSearchResults(searchResults);

      return {
        content: [
          {
            type: 'text',
            text: formattedResults,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Fehler bei der Suche: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unbekanntes Tool: ${request.params.name}`);
});

// Server starten
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Serverfehler:', error);
  process.exit(1);
});
