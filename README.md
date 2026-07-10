# HourBank

HourBank is a neighborhood service-exchange app where people trade help using time credits instead of money. One credit equals one hour, so the product is meant to feel closer to a local trust network than an anonymous marketplace.

The first version (v1) will focus on the core loop:

1. Members create profiles with skills they can offer or want.
2. People post offers and requests in their area.
3. Two members agree on a trade.
4. Credits move through escrow and settle when the work is confirmed.

## Why I am building this

This project is partly a useful product idea and partly a portfolio project. The pieces I want to practice and show are:

- a correctness-focused Go ledger service
- geospatial discovery with PostGIS
- a clean TypeScript web/API surface
- testing and CI from the beginning
- an AI effort estimator with evaluation, not just a prompt

## Planned Outline

This repo will be a small monorepo:

```text
apps/web          Next.js app
apps/api          TypeScript API
services/ledger   Go service for credits, escrow, and account entries
packages/shared   Shared TypeScript types
infra             Local dev and database setup
docs/adr          Short architecture notes
```

The app starts as a modular monolith with one intentionally separate service: the ledger. Credit movement is the part where correctness matters most, so it gets its own boundary.

## Early Milestones

- M0: repo setup, local database, basic app/API shells, CI
- M1: profiles and listings
- M2: trade flow plus the double-entry ledger
- M3: location-based discovery
- M4: chat, reviews, and trust signals
- M5: AI effort estimator and evaluation harness

## Current Status

The repo has the initial database schema, shared domain types, and local Postgres setup in place. The web app, API, and ledger service shells are still next.

## Local Setup

There is no runnable app yet. Once the app packages are added, the goal is to keep local setup to:

```bash
pnpm install
pnpm dev
```

For now, the useful local flow is the database:

```bash
cp .env.example .env
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm db:check
```

`pnpm db:reset` drops the local compose volume, recreates Postgres, reruns the migration, and loads the seed data.

Secrets will live in `.env` files and should not be committed. See `.env.example` for the rough template.
