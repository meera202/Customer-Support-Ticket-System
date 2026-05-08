#!/usr/bin/env bash
set -euo pipefail
ROOT="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OVERLAY="${1:?usage: $0 development|testing|staging|production (see kubernetes/overlays/)}"
OVERLAY_DIR="$ROOT/kubernetes/overlays/$OVERLAY"

if ! command -v kubectl >/dev/null 2>&1; then
  echo "kubectl is required. Install examples:"
  echo "  sudo snap install kubectl --classic"
  echo "  # or sudo apt-get install -y kubectl (if repo configured)"
  exit 1
fi

if [[ ! -d "$OVERLAY_DIR" ]]; then
  echo "Overlay not found: $OVERLAY_DIR" >&2
  exit 1
fi

if ! kubectl cluster-info >/dev/null 2>&1; then
  echo "No reachable Kubernetes cluster context. Start one first (kind/minikube/k3d) and retry." >&2
  exit 1
fi

exec kubectl apply -k "$OVERLAY_DIR"
