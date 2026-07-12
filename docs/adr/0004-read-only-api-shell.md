# ADR 0004: Start the API with read-only product endpoints

Status: accepted

## Context

HourBank needs a TypeScript API that eventually owns profiles, listings, trades, messaging, search, and appraisal orchestration. The plan calls for a modular API, but the ledger service and Auth0 flows are still separate pieces of work.

After the schema and local database setup, the next useful step is making sure the app can actually read from the database through a real service boundary.

## Decision

Start the API package with health checks and read-only profile/listing endpoints. The package uses Nest-style modules from the beginning, but keeps the surface small:

- `GET /health`
- `GET /health/db`
- `GET /profiles`
- `GET /profiles/:id`
- `GET /listings`
- `GET /listings/:id`

Writes, Auth0 guards, trade creation, and ledger calls are intentionally left out for later commits.

## Consequences

This gives the project an API that can be run against local seed data without pretending the full product loop exists yet. It also keeps the next commits clean: auth can wrap these routes, listing creation can add validation, and trade acceptance can call the Go ledger service when that boundary exists.
