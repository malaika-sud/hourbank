#!/bin/sh

set -eu

docker compose -f infra/docker-compose.yml down -v
docker compose -f infra/docker-compose.yml up -d postgres

echo "Waiting for Postgres to accept connections..."
until docker compose -f infra/docker-compose.yml exec -T postgres pg_isready -U "${POSTGRES_USER:-hourbank}" -d "${POSTGRES_DB:-hourbank}" >/dev/null 2>&1; do
  sleep 1
done

sh scripts/db/migrate.sh
sh scripts/db/seed.sh
