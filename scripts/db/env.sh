#!/bin/sh

set -eu

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

export DATABASE_URL="${DATABASE_URL:-postgres://hourbank:hourbank@localhost:5432/hourbank}"
