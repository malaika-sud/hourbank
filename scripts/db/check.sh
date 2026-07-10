#!/bin/sh

set -eu

. "$(dirname "$0")/env.sh"

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f infra/checks/db_smoke.sql
