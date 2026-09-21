# plan-monitor

A Windows-focused local monitor for GitHub Copilot, Cursor, Claude Code, and Codex usage. It tracks remaining credits, reset windows, and provider health with no cloud dependency or stored credentials.

## Features

- Poll known coding-plan providers on a configurable interval
- Normalize each provider's usage JSON into a shared snapshot model
- Surface warnings via tray/menu output and scheduler notifications
- Keep adapters and scheduler logic independently testable

## Scripts

- npm run build
- npm test
- npm run dev

## Notes

This app intentionally avoids storing credentials in code. Environment variables are read at runtime only.
