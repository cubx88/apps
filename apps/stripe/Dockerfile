# syntax=docker/dockerfile:1.5
ARG NODE_MAJOR=22
FROM node:${NODE_MAJOR}-alpine
LABEL node_version=${NODE_MAJOR}

# --- silence DynamoDB env validation in the Stripe app -------------
ENV APL=file \
    SKIP_ENV_VALIDATION=true \
    DYNAMODB_MAIN_TABLE_NAME=dummy \
    AWS_REGION=us-east-1 \
    AWS_ACCESS_KEY_ID=dummy \
    AWS_SECRET_ACCESS_KEY=dummy

WORKDIR /app

# 1️⃣ copy only manifest & lockfile to build the deps layer
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
# Use --no-frozen-lockfile to allow lockfile updates
RUN pnpm install --no-frozen-lockfile

# 2️⃣ copy source and build ONLY the Stripe workspace
COPY . .
RUN pnpm turbo run build --filter=saleor-app-payment-stripe --only

EXPOSE 3000
CMD ["pnpm","start","--filter=saleor-app-payment-stripe"]