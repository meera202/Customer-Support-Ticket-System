# syntax=docker/dockerfile:1
# Multi-stage Node service — small runtime image per microservice (build with --build-arg SERVICE_DIR=...)
ARG SERVICE_DIR=ticket-service
FROM node:22-alpine AS deps
ARG SERVICE_DIR
WORKDIR /app
COPY backend/${SERVICE_DIR}/package.json backend/${SERVICE_DIR}/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine AS runner
ARG SERVICE_DIR
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S svc && adduser -S svc -u 1001 -G svc
COPY --from=deps /app/node_modules ./node_modules
COPY backend/${SERVICE_DIR}/ ./
RUN chown -R svc:svc /app
USER svc
CMD ["node", "server.js"]
