# Integration hand-off

## Backend
- Project folder: `.`
- Run command: `npm run dev`
- Port: `N/A` (local Node tray app)
- Build command: `npm run build`
- Health endpoint: `N/A` (app runs as local worker; no HTTP server yet)

## Frontend
- Project folder: `N/A` (no UI frontend planned; this project is local-only background worker)
- Build command: `N/A`
- Dev command: `N/A`
- API seam: `N/A`
- Mock files to delete: `N/A`

## API routes
- `GET /api/health` — health check for the local monitor loop
- `GET /api/providers` — current snapshot for configured providers
- `POST /api/refresh` — manual refresh for one or all providers
- `POST /api/settings` — save local refresh interval and per-provider enablement

## Database
- Type: `None` (local-only monitor, no database required)
- Migration tool: `None`
- Migration directory: `None`
- Connection env vars: `None`
- No seed data is to be created.

## Shared types
- Shared package: `src/shared`
- Import alias: `None` (no monorepo package alias for this local service)

## Services
- Essential: provider registry, polling scheduler, tray updates, settings loader
- Enhancement: provider status normalization, optional env-based payload overrides, notification formatting

## Integration results

- Database migrations: N/A. The project is explicitly local-only and has no relational database, persistence layer, or migration tool. No seed data or migration files were created.
- Backend smoke test: `npm test` and `npm run build` pass. The application starts as a local worker through `npm run dev`; it does not expose an HTTP server.
- API routes: N/A at runtime. The four routes listed in the project plan are not implemented in the scaffold, so no endpoint probes were run or represented as passing.
- Frontend wiring: N/A. The hand-off identifies no frontend project, API seam, mock client, or mock data files.
- End-to-end verification: N/A for frontend/backend communication because this project contains only the local worker.
