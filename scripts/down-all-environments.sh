#!/usr/bin/env bash
set -euo pipefail

docker compose -p cst-dev -f docker-compose.dev.yml down
docker compose -p cst-test -f docker-compose.test.yml down
docker compose -p cst-prod -f docker-compose.prod.yml down

echo "All environments are stopped."
