ARG NODE_VERSION="24.19"
ARG IMAGE_SHA="sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43"

FROM node:${NODE_VERSION}-alpine@${IMAGE_SHA} AS development-dependencies-env

COPY . /app/
WORKDIR /app
RUN npm ci -w services/frontend

FROM node:${NODE_VERSION}-alpine@${IMAGE_SHA} AS production-dependencies-env

COPY . /app/
WORKDIR /app
RUN npm ci -w services/frontend --omit=dev

FROM node:${NODE_VERSION}-alpine@${IMAGE_SHA} AS build-env

COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
COPY --from=development-dependencies-env /app/services/frontend/node_modules /app/services/frontend/node_modules
WORKDIR /app
RUN npm run -w services/frontend build

FROM node:${NODE_VERSION}-alpine@${IMAGE_SHA}

COPY ./services/frontend/ /app/services/frontend/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=production-dependencies-env /app/services/frontend/node_modules/ /app/services/frontend/node_modules/
COPY --from=build-env /app/services/frontend/build /app/services/frontend/build

ENV NODE_ENV=production
USER node
WORKDIR /app/services/frontend

CMD ["npm", "run", "start"]
