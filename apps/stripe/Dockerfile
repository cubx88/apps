# syntax=docker/dockerfile:1.5
ARG NODE_MAJOR=22
FROM node:${NODE_MAJOR}-alpine AS base

# Force BuildKit to invalidate cache if we bump NODE_MAJOR
LABEL node_version=${NODE_MAJOR}

ENV APL=file \
    SKIP_ENV_VALIDATION=true \
    DYNAMODB_MAIN_TABLE_NAME=dummy \
    AWS_REGION=us-east-1 \
    AWS_ACCESS_KEY_ID=dummy \
    AWS_SECRET_ACCESS_KEY=dummy

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate

# --- install deps in an isolated layer ------------------------------
RUN pnpm install --frozen-lockfile
RUN pnpm install --no-frozen-lockfile

# copy the rest of the source *after* deps are cached
COPY . .

# build only the Stripe workspace (skip the rest of the monorepo)
RUN pnpm turbo run build --filter=saleor-app-payment-stripe --only

EXPOSE 3000
CMD ["pnpm","start","--filter=saleor-app-payment-stripe"]
