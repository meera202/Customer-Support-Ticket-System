#!/usr/bin/env bash
# Bring up development + testing + production stacks on non-conflicting ports in parallel.
set -euo pipefail
ROOT="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

for f in env/development.env env/testing.env env/staging.env env/production.env; do
  bash "$ROOT/scripts/compose-up-stack.sh" "$f"
done

echo "Compose stacks scheduled: dev http://localhost:8080  test http://localhost:8081  staging http://localhost:8090  production http://localhost:8082"
