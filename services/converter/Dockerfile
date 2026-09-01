FROM node:24.19-bookworm@sha256:934240a162082fd8b8a2f90cd5114446443f1eba1c5378f6687167ca405e6584 AS base

FROM base AS builder
WORKDIR /app

COPY . ./

RUN npm ci -w services/converter && \
  npm run build -w services/converter && \
  npm prune -w services/converter --production

FROM base AS runner
WORKDIR /app

COPY --from=builder --chown=node:node /app/node_modules /app/node_modules
COPY --from=builder --chown=node:node /app/services/converter/dist /app/dist
COPY --from=builder --chown=node:node /app/services/converter/package.json /app/package.json

USER node
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "/app/dist/index.js"]
