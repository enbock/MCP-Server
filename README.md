# MCP Brave Search Server

> 🌐 **English** | [Deutsch](README_DE.md)

A Model Context Protocol (MCP) server that provides web search capabilities via the Brave Search API.

## Prerequisites

- Node.js (version 18 or higher)
- Brave Search API Key (free from Brave)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Get a Brave API Key:
   - Go to [Brave Search API](https://brave.com/search/api/)
   - Sign up for a free API key
   - Copy the API key

## Configuration for IntelliJ GitHub Copilot Plugin

### Step 1: Set Environment Variable

**Windows (PowerShell):**
```powershell
[System.Environment]::SetEnvironmentVariable('BRAVE_API_KEY', 'your-api-key-here', 'User')
```

Or add it to `~/.config/mcp/mcp.json` (see below).

### Step 2: Configure MCP Server in Copilot Plugin

Create or edit the file `~/.config/mcp/mcp.json` (on Windows: `%USERPROFILE%\.config\mcp\mcp.json`):

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "node",
      "args": ["C:\\Users\\endre\\WebstormProjects\\MCP-Server\\index.js"],
      "env": {
        "BRAVE_API_KEY": "your-brave-api-key-here"
      }
    }
  }
}
```

**Important:** Adjust the path in `args` to match your actual project path.

### Alternative Configuration (if installed globally):

If you want to make the server globally available, you can add a `bin` field to `package.json` and link it with `npm link`.

## Usage

The server provides the following tool:

### `brave_search`

Performs a web search using the Brave Search API.

**Parameters:**
- `query` (string, required): The search query
- `count` (number, optional): Number of results (default: 10, maximum: 20)

**Example:**
```
Search the web for "MCP Protocol Specification"
```

## Benefits of Brave Search API

- **Free**: Generous free tier quota
- **Privacy**: No tracking IDs or user profiling
- **Modern**: Current web indexes
- **Additional Features**: News results are automatically displayed

## Manual Testing

You can manually test the server:

```bash
# First, set the environment variable
$env:BRAVE_API_KEY="your-api-key"

# Start the server
npm start
```

## Troubleshooting

### "BRAVE_API_KEY environment variable is not set"
Make sure you have configured the API key as described above.

### Server doesn't start in Copilot Plugin
1. Check the Copilot plugin logs
2. Ensure the path in `mcp.json` is correct
3. Test if Node.js is available: `node --version`

### Brave API Errors
- Verify that your API key is valid
- Make sure you haven't exceeded your quota
- Check the Brave Search API rate limits

## License

MIT
