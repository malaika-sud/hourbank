# HourBank API

This is the first API shell for HourBank. It is deliberately read-only right now: enough to check the service, connect to Postgres, and browse seeded profiles/listings before auth and write flows exist.

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
- `GET http://localhost:4100/listings`
- `GET http://localhost:4100/listings/:id`

The API reads `DATABASE_URL`, `API_PORT`, and `CORS_ORIGIN` from the environment. A root `.env` file is loaded automatically in local development.
