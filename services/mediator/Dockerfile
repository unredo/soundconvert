FROM node:24.19-bookworm-slim@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43 AS base

FROM base AS builder

RUN apk add --no-cache gcompat
WORKDIR /app

COPY . ./

RUN npm ci -w services/mediator && \
  npm run build -w services/mediator && \
  npm prune -w services/mediator --production

FROM base AS runner
WORKDIR /app

COPY --from=builder --chown=node:node /app/node_modules /app/node_modules
COPY --from=builder --chown=node:node /app/services/mediator/dist /app/dist
COPY --from=builder --chown=node:node /app/services/mediator/package.json /app/package.json

USER node 
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "/app/dist/index.js"]
