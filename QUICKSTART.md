# 🚀 MCP Server Schnellstart

## Schritt 1: Brave API Key holen

1. Gehe zu: https://brave.com/search/api/
2. Registriere dich (kostenlos)
3. Kopiere deinen API Key

## Schritt 2: MCP Server testen

### Option A: Mit dem Test-Skript (empfohlen für erste Tests)

```powershell
# Setze deinen API Key
$env:BRAVE_API_KEY="DEIN_API_KEY_HIER"

# Führe das Test-Skript aus
node test-mcp.js
```

Das Test-Skript wird:
- ✅ Den Server initialisieren
- ✅ Verfügbare Tools auflisten
- ✅ Eine Test-Suche durchführen
- ✅ Die Ergebnisse anzeigen

### Option B: In WebStorm/IntelliJ mit GitHub Copilot nutzen

1. **Bearbeite die Konfigurationsdatei:**
   ```
   C:\Users\endre\.config\mcp\mcp.json
   ```
   
2. **Ersetze `HIER_DEINEN_BRAVE_API_KEY_EINFÜGEN` mit deinem echten API Key**

3. **Starte WebStorm/IntelliJ neu**

4. **Im Copilot Chat kannst du jetzt fragen:**
   - "Suche im Web nach aktuellen JavaScript Trends"
   - "Finde Informationen über MCP Protocol"
   - "Suche nach TypeScript Best Practices"

## Schritt 3: Testen ob es funktioniert

Nach der Konfiguration solltest du in WebStorm/IntelliJ im Copilot Chat sehen können, dass das Tool "brave_search" verfügbar ist.

## 📝 Hinweise

- Der kostenlose Brave API Plan bietet 2.000 Anfragen/Monat
- Der Server läuft über stdio (stdin/stdout) - perfekt für MCP
- Alle Logs gehen nach stderr, damit sie die MCP-Kommunikation nicht stören

## 🔧 Fehlerbehebung

### "BRAVE_API_KEY Umgebungsvariable ist nicht gesetzt"
➡️ Stelle sicher, dass der API Key in der mcp.json korrekt eingetragen ist

### Server startet nicht
➡️ Überprüfe den Pfad in der mcp.json
➡️ Stelle sicher, dass Node.js installiert ist: `node --version`

### Keine Suchergebnisse
➡️ Überprüfe, ob dein API Key gültig ist
➡️ Prüfe, ob du dein monatliches Limit erreicht hast

## 📚 Weitere Infos

Siehe [README.md](README.md) für detaillierte Dokumentation.
