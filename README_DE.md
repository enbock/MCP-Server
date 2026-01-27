# MCP Brave Search Server

> 🌐 [English](README.md) | **Deutsch**

Ein Model Context Protocol (MCP) Server, der Websuche über die Brave Search API bereitstellt.

## Voraussetzungen

- Node.js (Version 18 oder höher)
- Brave Search API Key (kostenlos von Brave)

## Installation

1. Abhängigkeiten installieren:
```bash
npm install
```

2. Brave API Key erhalten:
   - Gehe zu [Brave Search API](https://brave.com/search/api/)
   - Registriere dich für einen kostenlosen API-Key
   - Kopiere den API-Key

## Konfiguration für IntelliJ GitHub Copilot Plugin

### Schritt 1: Umgebungsvariable setzen

**Windows (PowerShell):**
```powershell
[System.Environment]::SetEnvironmentVariable('BRAVE_API_KEY', 'dein-api-key-hier', 'User')
```

Oder füge es zur `~/.config/mcp/mcp.json` hinzu (siehe unten).

### Schritt 2: MCP Server im Copilot Plugin konfigurieren

Erstelle oder bearbeite die Datei `~/.config/mcp/mcp.json` (unter Windows: `%USERPROFILE%\.config\mcp\mcp.json`):

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "node",
      "args": ["C:\\Users\\endre\\WebstormProjects\\MCP-Server\\index.js"],
      "env": {
        "BRAVE_API_KEY": "dein-brave-api-key-hier"
      }
    }
  }
}
```

**Wichtig:** Passe den Pfad in `args` an deinen tatsächlichen Projektpfad an.

### Alternative Konfiguration (wenn global installiert):

Falls du den Server global verfügbar machen möchtest, kannst du in der `package.json` ein `bin` Feld hinzufügen und mit `npm link` verlinken.

## Verwendung

Der Server stellt folgendes Tool bereit:

### `brave_search`

Führt eine Websuche mit der Brave Search API durch.

**Parameter:**
- `query` (string, erforderlich): Die Suchanfrage
- `count` (number, optional): Anzahl der Ergebnisse (Standard: 10, Maximum: 20)

**Beispiel:**
```
Suche im Web nach "MCP Protocol Specification"
```

## Vorteile der Brave Search API

- **Kostenlos**: Großzügiges kostenloses Kontingent
- **Datenschutz**: Keine Tracking-IDs oder User-Profiling
- **Modern**: Aktuelle Web-Indizes
- **Zusätzliche Features**: News-Ergebnisse werden automatisch mit angezeigt

## Manueller Test

Du kannst den Server manuell testen:

```bash
# Setze zuerst die Umgebungsvariable
$env:BRAVE_API_KEY="dein-api-key"

# Starte den Server
npm start
```

## Fehlerbehebung

### "BRAVE_API_KEY Umgebungsvariable ist nicht gesetzt"
Stelle sicher, dass du den API-Key wie oben beschrieben konfiguriert hast.

### Server startet nicht im Copilot Plugin
1. Überprüfe die Logs des Copilot Plugins
2. Stelle sicher, dass der Pfad in der `mcp.json` korrekt ist
3. Teste, ob Node.js verfügbar ist: `node --version`

### Brave API Fehler
- Überprüfe, ob dein API-Key gültig ist
- Stelle sicher, dass du dein Kontingent nicht überschritten hast
- Beachte die Rate Limits der Brave Search API

## Lizenz

MIT
