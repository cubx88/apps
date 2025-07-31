FROM node:20-slim AS base
WORKDIR /app
RUN corepack enable pnpm

FROM base AS deps
COPY pnpm-lock.yaml package.json ./
RUN pnpm fetch --frozen-lockfile
RUN pnpm install --frozen-lockfile --prod

FROM base AS build
COPY . .
RUN pnpm run build

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next .next
COPY package.json ./
EXPOSE 3000
CMD ["pnpm", "start"]
