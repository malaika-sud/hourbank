# HourBank API

This is the first API surface for HourBank. It is still early, but it now supports the core profile and listing flows needed to browse the seed marketplace, create demo listings, and edit public profile details before auth is added.

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

The API reads `DATABASE_URL`, `API_PORT`, and `CORS_ORIGIN` from the environment. A root `.env` file is loaded automatically in local development.
