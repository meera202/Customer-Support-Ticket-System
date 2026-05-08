#!/usr/bin/env bash
# Run compose commands against a selected env file with v1/v2 auto-detection.
# Example: scripts/compose-env.sh env/testing.env ps
#          scripts/compose-env.sh env/development.env config
set -euo pipefail
ROOT="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_REL="${1:?usage: $0 env/<name>.env <compose-args...>}"
shift
if [[ $# -eq 0 ]]; then
  echo "Provide compose args, e.g. 'ps' or 'config'" >&2
  exit 1
fi
ENV_ABS="$ROOT/$ENV_REL"
if [[ ! -f "$ENV_ABS" ]]; then
  ENV_ABS="$ENV_REL"
fi
if [[ ! -f "$ENV_ABS" ]]; then
  echo "Env file not found: $ENV_REL" >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  exec docker compose --env-file "$ENV_ABS" "$@"
elif docker-compose version >/dev/null 2>&1; then
  exec docker-compose --env-file "$ENV_ABS" "$@"
else
  echo "Install Docker Compose v2 ('docker compose') or v1 standalone ('docker-compose')." >&2
  exit 1
fi
