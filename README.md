# Customer Support Ticketing System

Multi-service customer support ticketing platform: **Angular** frontend, **Node.js** microservices, **MongoDB**, with **Docker**, **Docker Compose** (multi-environment), and **Kubernetes** (Kustomize).

## Documentation

**[DOCUMENTATION.md](./DOCUMENTATION.md)** — structure, components, dev setup, deployment (Docker, Compose, Kubernetes).

## Quick start (Docker Compose)

```bash
bash scripts/compose-up-stack.sh env/development.env
```

Open **http://localhost:8080** (see `env/*.env` for other ports).

## Repository layout

- `frontend/` — Angular app  
- `backend/*-service/` — APIs  
- `docker-compose.yml` + `env/` — per-environment stacks  
- `kubernetes/` — Kustomize base + overlays  
- `scripts/` — compose and K8s helpers  

## License

See project files for license terms if applicable.
