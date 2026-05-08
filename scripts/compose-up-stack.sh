#!/usr/bin/env bash
# Start exactly one Compose stack defined by env/<name>.env
# Usage: scripts/compose-up-stack.sh env/development.env
set -euo pipefail
ROOT="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_REL="${1:-env/development.env}"
ENV_ABS="$ROOT/$ENV_REL"
if [[ ! -f "$ENV_ABS" ]]; then
  ENV_ABS="$ENV_REL"
fi
if [[ ! -f "$ENV_ABS" ]]; then
  echo "Env file not found: $ENV_REL" >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif docker-compose version >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Install Docker Compose v2 ('docker compose') or v1 standalone ('docker-compose')." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not reachable (permission denied?). Try one of:" >&2
  echo "  • Add your user to the docker group: sudo usermod -aG docker \"\$USER\"  (then log out and back in)" >&2
  echo "  • Or run the same compose command with sudo (not ideal for daily use)" >&2
  exit 1
fi

"${COMPOSE[@]}" --env-file "$ENV_ABS" up -d --build "${@:2}"

FRONT="$(grep -m1 '^FRONTEND_HOST_PORT=' "$ENV_ABS" | cut -d= -f2- || true)"
if [[ -n "${FRONT}" ]]; then
  echo "UI: http://localhost:${FRONT}/"
fi
