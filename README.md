# plan-monitor

A Windows-focused local monitor for GitHub Copilot, Cursor, Claude Code, and Codex usage. It tracks remaining credits, reset windows, and provider health with no cloud dependency or stored credentials.

## Features

- Poll known coding-plan providers on a configurable interval
- Normalize each provider's usage JSON into a shared snapshot model
- Surface warnings via tray/menu output and scheduler notifications
- Keep adapters and scheduler logic independently testable

## Prerequisites

Before installing or building the project, make sure you have:

- Node.js 18 or newer
- npm 9 or newer
- A terminal with access to PowerShell or Command Prompt on Windows

## Full install and setup flow

1. Open PowerShell in the project folder.
2. Check the installed runtime version:
   ```powershell
   node -v
   npm -v
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Run the preflight validation:
   ```powershell
   npm run preflight
   ```
5. Build the TypeScript project:
   ```powershell
   npm run build
   ```
6. Run tests:
   ```powershell
   npm test
   ```
7. Start the app locally:
   ```powershell
   npm run dev
   ```

## Environment variables

This app intentionally avoids storing credentials in code. Set the needed values before running the monitor:

```powershell
$env:GITHUB_COPILOT_TOKEN = "your-token"
$env:CURSOR_API_KEY = "your-key"
$env:CLAUDE_CODE_API_KEY = "your-key"
$env:CODEX_API_KEY = "your-key"
```

If you want to disable one or more providers, set:

```powershell
$env:DISABLED_PROVIDERS = "cursor,claude-code"
```

The interval can also be customized:

```powershell
$env:MONITOR_INTERVAL_MINUTES = "15"
```

## Scripts

- npm run preflight
- npm run build
- npm test
- npm run dev

## Notes

This app intentionally avoids storing credentials in code. Environment variables are read at runtime only.
