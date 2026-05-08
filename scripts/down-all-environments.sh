#!/usr/bin/env bash
set -euo pipefail
ROOT="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

for f in env/development.env env/testing.env env/staging.env env/production.env; do
  bash "$ROOT/scripts/compose-env.sh" "$f" down
done

echo "All environments are stopped: development, testing, staging, production."
