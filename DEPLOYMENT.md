# Customer Support Ticketing System - Deployment Guide

This document completes the Linux hosting, Docker, multi-environment, and Kubernetes requirements.

## 1) Linux hosting requirement

Host this project on a Linux VM/server (Ubuntu/Debian/RHEL/etc.), not Windows/macOS.

Example Ubuntu prerequisites:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin kubectl
sudo usermod -aG docker $USER
newgrp docker
```

## 2) Multi-container architecture

The stack runs as multiple communicating containers:

- `frontend` (Angular + Nginx)
- `auth-service`
- `ticket-service`
- `support-service`
- `notification-service`
- `mongo`

This uses more than 3 different images:

- `cst/frontend:*`
- `cst/auth-service:*`
- `cst/ticket-service:*`
- `cst/support-service:*`
- `cst/notification-service:*`
- `mongo:7`
- `nginx:1.27-alpine` (inside frontend multistage final image)

## 3) Docker containerization and optimized images

Each service has its own Dockerfile:

- `frontend/Dockerfile` (multi-stage: Node build -> Nginx runtime)
- `backend/auth-service/Dockerfile`
- `backend/ticket-service/Dockerfile`
- `backend/support-service/Dockerfile`
- `backend/notification-service/Dockerfile`

Optimization choices:

- Alpine base images (`node:22-alpine`, `nginx:1.27-alpine`)
- Multi-stage build for frontend
- `npm ci --omit=dev` in backend images
- `.dockerignore` files to reduce build context size

## 4) Multiple environments with Docker Compose

Environment definitions:

- Development: `docker-compose.dev.yml`
- Testing: `docker-compose.test.yml`
- Production: `docker-compose.prod.yml`

### Start one environment

```bash
docker compose -p cst-dev -f docker-compose.dev.yml up -d --build
docker compose -p cst-test -f docker-compose.test.yml up -d --build
docker compose -p cst-prod -f docker-compose.prod.yml up -d --build
```

### Start all environments simultaneously on one machine

```bash
bash scripts/up-all-environments.sh
```

Environment frontend endpoints:

- Dev: `http://localhost:8080`
- Test: `http://localhost:8081`
- Prod: `http://localhost:8082`

MongoDB Compass endpoints per environment:

- Dev Mongo: `mongodb://127.0.0.1:27020`
- Test Mongo: `mongodb://127.0.0.1:27018`
- Prod Mongo: `mongodb://127.0.0.1:27019`

Stop all:

```bash
bash scripts/down-all-environments.sh
```

## 5) Kubernetes orchestration

Kubernetes manifests are in `k8s/`:

- Namespace, ConfigMap, sample Secret
- Deployments + Services for Mongo and all app services
- `kustomization.yaml`

### Apply on cluster

1. Build and push images to your registry (example names in manifests use `cst/...:prod`).
2. Create real secret from template:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.example.yaml
```

3. Deploy all resources:

```bash
kubectl apply -k k8s/
```

4. Verify:

```bash
kubectl get pods -n cst
kubectl get svc -n cst
```

Frontend is exposed via NodePort `30080`.

## Notes

- For production-grade deployment, store secrets in a secure secret manager (not plaintext files).
- Add readiness/liveness probes and Ingress for HTTPS domains as a next step.
- If you run Kubernetes in cloud, switch frontend service from `NodePort` to `LoadBalancer` or Ingress.
