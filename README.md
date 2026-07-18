# HourBank

HourBank is a neighborhood time-banking marketplace for exchanging local help through hour-based credits instead of money. The idea is simple: if you spend an hour helping someone, you earn one credit to spend on an hour of help from someone else.

This is an active portfolio project that I am building in the open. The goal is not just to make another CRUD app, but to practice the kind of backend and product engineering that matters in a trust-based marketplace: reliable accounting, local discovery, clear service boundaries, and eventually measured AI assistance.

## What It Does

Members will be able to:

- create a profile with skills they offer and skills they need
- post local offers and requests, like tutoring, moving help, repair, or pet care
- browse nearby services by category and location
- agree on a trade using estimated hours
- settle credits through escrow once the work is confirmed

The product is inspired by the local-trust side of neighborhood apps and the listing flow of a marketplace, but the exchange is based on time credits instead of money.

## Current Status

HourBank is early, but the backend foundation is real and growing steadily.

Built so far:

- pnpm monorepo with shared TypeScript domain types
- Dockerized PostgreSQL setup with PostGIS and pgvector support
- SQL migrations for users, skills, listings, trades, messages, reviews, appraisals, and ledger tables
- seed data and database smoke-check scripts
- initial NestJS API with health checks and read-only profile/listing endpoints
- first Next.js web surface for browsing seed-backed offers, requests, and neighbor profiles
- Architecture Decision Records in [docs/adr](docs/adr)

Still upcoming:

- Auth0 login and user onboarding
- write flows for profiles, listings, and trade proposals
- Go ledger service for credit movement and escrow
- PostGIS map discovery
- AI effort estimator with an evaluation harness

## Why This Is Interesting

The main technical challenge is not the listing UI. It is making a local exchange system feel trustworthy.

**Correct credit movement.** Time credits behave like money inside the product, so the ledger is designed around double-entry accounting, idempotency keys, derived balances, and escrow. The current schema lays the groundwork for a separate Go service that will own credit-moving operations.

**Local discovery.** Listings are modeled with PostGIS-ready geography fields so the app can support queries like "services within 5 km of me" while only showing approximate public areas for privacy.

**Fair effort estimates.** Since one credit equals one hour, fair trades depend on reasonable hour estimates. The planned AI appraiser will suggest hours and a rationale, but the important part is the evaluation layer: consistency checks, calibration against labeled examples, and bias-audit cases.

## Architecture Direction

The project starts as a modular TypeScript API with one deliberately separate service planned for the ledger. That keeps most product work simple while giving the correctness-critical credit system its own boundary.

```text
Next.js web
    |
    | HTTP
    v
NestJS API
    |-- profiles
    |-- listings
    |-- trades
    |-- messaging
    |-- search
    |-- appraisal
    |
    | internal REST
    v
Go ledger service
    |
    v
PostgreSQL + PostGIS + pgvector
```

Later, the AI appraiser may be extracted into a small Python/DSPy service once the product flow is ready for it.

## Tech Stack

| Layer            | Choice                                       |
| ---------------- | -------------------------------------------- |
| API              | NestJS, TypeScript                           |
| Shared contracts | TypeScript package in `packages/shared`      |
| Database         | PostgreSQL, PostGIS, pgvector                |
| Local dev        | Docker Compose, pnpm workspaces              |
| Planned web      | Next.js, Tailwind, shadcn/ui, TanStack Query |
| Planned ledger   | Go, chi, pgx, sqlc                           |
| Planned maps     | MapLibre, OpenStreetMap                      |
| Planned auth     | Auth0                                        |
| Planned AI       | DSPy-based effort estimator                  |

## Credit Model

HourBank starts with the standard time-bank rule: one hour equals one credit. That is intentional. The first version keeps the exchange egalitarian instead of pricing people's time differently based on the type of work.

The schema still stores `agreed_hours`, `credit_multiplier`, and generated `agreed_credits` on each trade. The multiplier defaults to `1.0`, which keeps v1 simple while leaving room for a capped weighting model later without redesigning the trade table.

## Roadmap

| Milestone | Focus                                                       | Status      |
| --------- | ----------------------------------------------------------- | ----------- |
| M0        | Monorepo, local Postgres/PostGIS, base schema, API shell    | In progress |
| M1        | Profiles and offer/request listings                         | In progress |
| M2        | Go ledger, double-entry credit movement, escrow, trade loop | Planned     |
| M3        | PostGIS discovery and map view                              | Planned     |
| M4        | Trade chat, reviews, and reputation                         | Planned     |
| M5        | AI effort estimator with eval and bias checks               | Planned     |
| M6        | Observability, E2E tests, deployment polish                 | Planned     |

## Running Locally

Prerequisites:

- Node 20+
- pnpm
- Docker

```bash
git clone https://github.com/malaika-sud/hourbank.git
cd hourbank
pnpm install
cp .env.example .env
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm db:check
pnpm api:dev
```

In another terminal:

```bash
pnpm web:dev
```

The web app runs on `http://localhost:3000` by default.
The API runs on `http://localhost:4100` by default.

Current endpoints:

- `GET /health`
- `GET /health/db`
- `GET /profiles`
- `GET /profiles/:id`
- `GET /listings`
- `GET /listings/:id`

`pnpm db:reset` drops the local Docker volume, recreates Postgres, reruns the migration, and loads the seed data.

## Design Notes

Short ADRs live in [docs/adr](docs/adr). They explain decisions like the modular API plus extracted ledger service, the 1:1 credit model, the local database stack, and the read-only API shell.
