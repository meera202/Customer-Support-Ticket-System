# syntax=docker/dockerfile:1
# Build Angular prod bundle, serve via nginx-alpine (~minimal attack surface vs node dev-server)
FROM node:22-alpine AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci && npm cache clean --force
COPY frontend/ ./
RUN npm run build

FROM nginx:1.26-alpine
RUN apk add --no-cache curl \
  && rm -rf /usr/share/nginx/html/*
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
HEALTHCHECK --interval=30s --timeout=5s CMD curl -sf http://127.0.0.1/ >/dev/null || exit 1
EXPOSE 80
