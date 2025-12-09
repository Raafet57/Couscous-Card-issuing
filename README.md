# Instant Digital Card Issuing Demo

This repo hosts a minimal demo aligned to `instant-digital-card-issuing-prd.md`. It includes a mock API and a React + TypeScript SPA.

## Project Layout
- `mock-api/` — Node + Express in-memory service implementing the PRD endpoints.
- `frontend/` — React + TypeScript + Vite SPA with `/`, `/card`, `/controls`.

## Quickstart
1) Mock API
- `cd mock-api`
- `npm install`
- `npm run dev` (start API with autoreload) or `npm start` (plain node)
- API defaults to `http://localhost:3001`

2) Frontend
- `cd frontend`
- `npm install`
- `npm run dev` (Vite dev server)
- App defaults to `http://localhost:5173`

## Endpoints (implemented in mock API)
- `POST /cards` — issue virtual card
- `GET /cards/:id` — fetch card snapshot
- `POST /cards/:id/provision` — simulate wallet provisioning
- `POST /cards/:id/controls` — update controls and status
