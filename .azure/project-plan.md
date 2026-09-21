# Project Plan

**Status**: Integrated
**Created**: 2026-09-21
**Mode**: NEW
**Execution Mode**: auto

---

## 1. Project Overview

**Goal**: Build a Windows tray app that monitors coding-plan usage across GitHub Copilot, Cursor, Claude Code, and Codex, surfacing remaining credits, reset windows, and health status without storing credentials in the app itself. The project is designed so that every module is independently testable.

**App Type**: Background worker

**API Login**: No

**Mode**: NEW

**Deployment Plan**: No deployment plan found

---

## 2. Desktop — Windows tray client

| Component | Technology |
|-----------|-----------|
| **Language** | TypeScript |
| **Runtime** | Node |
| **Package Manager** | pnpm |
| **Test Runner** | vitest |
| **Mocking Library** | vi.mock |
| **Test Command** | pnpm test |
| **Orchestration** | docker-compose |

> **Language vs Runtime**: `Language` is the source language the user picked in this service's `language` question. `Runtime` is the execution runtime — default `Node` for TypeScript/JavaScript, `CPython` for Python, `.NET` for C#. Only deviate from the default (e.g. `Bun`, `Deno`, `PyPy`) when the user explicitly asks. **Package Manager and Test Runner are language-dependent** — match them to this service's Language (e.g. C# → `dotnet (NuGet)` + `xUnit`/`NUnit`/`MSTest`). The `Orchestration` row is recorded for the scaffold step but hidden in the plan UI — always keep it set to `docker-compose`.

---

## 3. Services Required

| Azure Service | Role in App | Environment Variable | Default Value (Local) | Classification |
|---------------|------------|---------------------|----------------------|----------------|
| None required | Local-only monitoring app with no cloud dependency | — | — | Not required |

---

## 4. Prerequisites

### Run

| Tool | Service(s) | Installed | Version |
|------|------------|-----------|---------|
| Node.js 20 LTS | Desktop | ❓ | Not detected |
| pnpm 9+ | Desktop | ❓ | Not detected |
| Git | Desktop | ❓ | Not detected |
| Windows Developer Mode / tray permissions | Desktop | ❓ | OS config |

### Debug

| Tool | Service(s) | Installed | Version |
|------|------------|-----------|---------|
| VS Code | Desktop | ❓ | Not detected |
| TypeScript extension | Desktop | ❓ | Not detected |
| Vitest extension | Desktop | ❓ | Not detected |
| PowerShell 7+ | Desktop | ❓ | Not detected |

> The detection pass above reflects the actual environment as available to the current agent session. Inform the user to confirm every ❓ tool before proceeding with local execution and packaging.

---

## 5. Project Structure

```text
plan-monitor/
├─ .azure/
│  ├─ requirements.json
│  └─ project-plan.md
├─ src/
│  ├─ app/
│  │  ├─ tray/
│  │  │  ├─ tray.ts
│  │  │  └─ menu.ts
│  │  ├─ settings/
│  │  │  ├─ config.ts
│  │  │  └─ secrets.ts
│  │  ├─ providers/
│  │  │  ├─ registry.ts
│  │  │  ├─ github-copilot.ts
│  │  │  ├─ cursor.ts
│  │  │  ├─ claude-code.ts
│  │  │  └─ codex.ts
│  │  └─ scheduler/
│  │     ├─ poller.ts
│  │     └─ notifications.ts
│  ├─ shared/
│  │  ├─ model.ts
│  │  ├─ normalize.ts
│  │  └─ types.ts
│  └─ index.ts
├─ tests/
│  ├─ adapters/
│  │  ├─ github-copilot.test.ts
│  │  ├─ cursor.test.ts
│  │  ├─ claude-code.test.ts
│  │  └─ codex.test.ts
│  ├─ scheduler/
│  │  ├─ poller.test.ts
│  │  └─ notifications.test.ts
│  └─ fixtures/
│     └─ sample-responses/
├─ package.json
├─ pnpm-lock.yaml
├─ tsconfig.json
├─ vitest.config.ts
├─ README.md
└─ .env.example
```

---

## 6. Route Definitions

| # | Method | Path | Description | Request Body | Response Body | Status Codes |
|---|--------|------|-------------|-------------|--------------|-------------|
| 1 | GET | `/api/health` | Health check for the local monitor loop | — | `{ status, providers, lastUpdated }` | 200, 503 |
| 2 | GET | `/api/providers` | Return the current snapshot for every configured provider | — | `[{ name, remaining, resetAt, status, updatedAt }]` | 200 |
| 3 | POST | `/api/refresh` | Trigger a manual refresh for one or all providers | `{ providerId?: string }` | `{ refreshed, provider, status }` | 200, 400 |
| 4 | POST | `/api/settings` | Save local refresh interval and per-provider enablement | `{ intervalMinutes, disabledProviders[] }` | `{ saved: true }` | 200, 400 |

---

## 7. Next Steps

1. Run **azure-project-scaffold** to execute this plan
2. Run **azure-project-integrate** to wire the frontend to live data, smoke-test the backend, and create the migrations
3. Run **azure-debug-plan** → **azure-debug-generate** for Docker emulators and VS Code debugging
4. Run the **azure-deploy** agent when ready; it uses **azure-app-onboard** for architecture, cost estimation, IaC generation, provisioning, and health verification
