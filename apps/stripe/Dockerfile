# syntax=docker/dockerfile:1.5
ARG NODE_MAJOR=22
FROM node:${NODE_MAJOR}-alpine AS base
LABEL node_version=${NODE_MAJOR}

# Stop DynamoDB checks
ENV APL=file \
    SKIP_ENV_VALIDATION=true \
    DYNAMODB_MAIN_TABLE_NAME=dummy \
    AWS_REGION=us-east-1 \
    AWS_ACCESS_KEY_ID=dummy \
    AWS_SECRET_ACCESS_KEY=dummy

WORKDIR /app

# cache deps layer
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.6.3 --activate
RUN pnpm install --frozen-lockfile        # ✅ now succeeds

# copy sources & build only the Stripe package
COPY . .
RUN pnpm turbo run build --filter=saleor-app-payment-stripe --only

EXPOSE 3000
CMD ["pnpm","start","--filter=saleor-app-payment-stripe"]
