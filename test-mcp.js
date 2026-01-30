#!/usr/bin/env node

/**
 * Test-Skript für den MCP Brave Search Server
 *
 * Verwendung:
 * $env:BRAVE_API_KEY="dein-api-key"; node test-mcp.js
 */

import { spawn } from 'child_process';

// Starte den MCP Server
const serverProcess = spawn('node', ['index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, BRAVE_API_KEY: process.env.BRAVE_API_KEY }
});

let buffer = '';

serverProcess.stdout.on('data', (data) => {
  buffer += data.toString();

  // Versuche JSON-Nachrichten zu parsen
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // Behalte unvollständige Zeile

  lines.forEach(line => {
    if (line.trim()) {
      try {
        const message = JSON.parse(line);
        console.log('📨 Server Antwort:', JSON.stringify(message, null, 2));
      } catch (e) {
        console.log('📝 Server Output:', line);
      }
    }
  });
});

serverProcess.stderr.on('data', (data) => {
  console.log('ℹ️  Server Log:', data.toString().trim());
});

serverProcess.on('close', (code) => {
  console.log(`\n❌ Server beendet mit Code ${code}`);
  process.exit(code);
});

// Warte kurz, dann sende Anfragen
setTimeout(() => {
  console.log('\n🔧 Sende Initialisierungsanfrage...\n');

  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');

  // Liste Tools auf
  setTimeout(() => {
    console.log('\n🔧 Frage verfügbare Tools ab...\n');

    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };

    serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');

    // Führe eine Testsuche durch
    setTimeout(() => {
      console.log('\n🔍 Führe Testsuche durch: "MCP Protocol"...\n');

      const searchRequest = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'internet_search',
          arguments: {
            query: 'MCP Protocol',
            count: 5
          }
        }
      };

      serverProcess.stdin.write(JSON.stringify(searchRequest) + '\n');

      // Beende nach 5 Sekunden
      setTimeout(() => {
        console.log('\n✅ Test abgeschlossen. Beende Server...\n');
        serverProcess.kill();
      }, 5000);

    }, 1000);
  }, 1000);
}, 1000);

// Behandle Strg+C
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test abgebrochen');
  serverProcess.kill();
  process.exit(0);
});
