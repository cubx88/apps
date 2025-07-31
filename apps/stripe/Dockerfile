# syntax = docker/dockerfile:1
ARG NODE_VERSION=22.9.0
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app
RUN npm install -g pnpm@8.12.0

FROM base AS build
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false
COPY . .
RUN SECRET_KEY='dummy' pnpm run build
RUN pnpm prune --prod

FROM base AS runner
WORKDIR /app
COPY --from=build /app /app
EXPOSE 3000
CMD ["pnpm", "run", "start"]
