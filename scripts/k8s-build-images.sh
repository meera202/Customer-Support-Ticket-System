#!/usr/bin/env bash
# Tag images to match manifests in kubernetes/base (use with kind load / registry push).
set -euo pipefail
ROOT="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! docker version >/dev/null 2>&1; then
  echo "Docker is required to build runtime images." >&2
  exit 1
fi

SERVICES=(auth-service ticket-service notification-service support-service)
for svc in "${SERVICES[@]}"; do
  tag="cst-${svc}:latest"
  docker build -f docker/node-service.Dockerfile \
    --build-arg "SERVICE_DIR=${svc}" \
    -t "${tag}" "${ROOT}"
  echo "Built ${tag}"
done

docker build -f docker/frontend.Dockerfile -t cst-frontend:latest "${ROOT}"
echo "Built cst-frontend:latest"
