# HourBank API

This is the first API surface for HourBank. It is still early, but it now supports the core profile and listing flows needed to browse the seed marketplace, create demo listings, edit public profile details, move seed-backed trade proposals through basic accept/cancel decisions, and read wallet balances from the ledger tables before auth is added.

## Local Commands

From the repo root:

```bash
pnpm install
pnpm db:reset
pnpm api:dev
```

Useful endpoints:

- `GET http://localhost:4100/health`
- `GET http://localhost:4100/health/db`
- `GET http://localhost:4100/profiles`
- `GET http://localhost:4100/profiles/:id`
- `PATCH http://localhost:4100/profiles/:id`
- `GET http://localhost:4100/skills`
- `GET http://localhost:4100/listings`
- `POST http://localhost:4100/listings`
- `GET http://localhost:4100/listings/:id`
- `GET http://localhost:4100/trades`
- `GET http://localhost:4100/trades/:id`
- `POST http://localhost:4100/trades`
- `PATCH http://localhost:4100/trades/:id/status`
- `GET http://localhost:4100/wallets`
- `GET http://localhost:4100/wallets/:profileId`

The API reads `DATABASE_URL`, `API_PORT`, and `CORS_ORIGIN` from the environment. A root `.env` file is loaded automatically in local development.
