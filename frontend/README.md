# Frontend (React + Vite)

Simple SPA for the instant issuing demo. Routes:
- `/` — KYC stub (click through)
- `/card` — dashboard showing issued card, wallet status, and events; can trigger wallet provisioning
- `/controls` — manage active flag, daily limit, and e-commerce allowed; keeps status in sync

## Run locally
```bash
cd frontend
npm install
npm run dev
```
App defaults to `http://localhost:5174` and expects the mock API at `http://localhost:3001`.
