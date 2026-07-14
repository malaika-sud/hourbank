# ADR 0003: Use Docker Compose for the local database

## Context

HourBank needs PostgreSQL plus two extensions from the beginning: PostGIS for neighborhood and distance queries, and pgvector for the later semantic-search path. Installing those directly on every machine would make setup fragile.

The app services are not scaffolded yet, but the database already has enough project-specific behavior that local setup should be repeatable now.

## Decision

Use Docker Compose for local Postgres. The compose file builds a small Postgres image with PostGIS and pgvector available, then the repo scripts run migrations, seed data, and smoke checks against it.

Keep this compose file focused on Postgres for now. Web, API, and ledger containers can be added after those packages exist.

## Consequences

This makes the database setup closer to the eventual deployed environment and gives the project a real local foundation before feature work starts.

The tradeoff is that Docker has to build a custom database image locally. That is acceptable because the extensions are central to the product, not incidental tooling.
