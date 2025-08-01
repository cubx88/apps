# syntax=docker/dockerfile:1.5
ARG NODE_MAJOR=22
FROM node:${NODE_MAJOR}-alpine
LABEL node_version=${NODE_MAJOR}

# --- silence DynamoDB env validation in the Stripe app -------------
ENV APL=file \
    SKIP_ENV_VALIDATION=true \
    DYNAMODB_MAIN_TABLE_NAME=dummy \
    AWS_REGION=us-east-1 \
    AWS_SECRET_ACCESS_KEY=dummy \
    NODE_ENV=production \
    NEXT_RUNTIME=nodejs \
    OTEL_ENABLED=false \
    APP_LOG_LEVEL=info \
    ENV=production \
    PORT=3000 \
    OTEL_ACCESS_TOKEN=dummy \
    OTEL_SERVICE_NAME=stripe-app \
    REPOSITORY_URL=https://github.com/saleor/apps \
    VERCEL_ENV=production \
    VERCEL_GIT_COMMIT_SHA=dummy

WORKDIR /app

# Enable corepack and use the same pnpm version as specified in package.json
RUN corepack enable && corepack use pnpm@10.6.3

# Copy workspace configuration files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy all necessary packages and apps
COPY packages/ ./packages/
COPY apps/ ./apps/

# Install all dependencies (this will resolve the catalog references)
RUN pnpm install --frozen-lockfile

# Build the stripe app with relaxed linting
RUN ESLINT_NO_DEV_ERRORS=true DISABLE_ESLINT_PLUGIN=true pnpm --filter=saleor-app-payment-stripe build

# Set working directory to the stripe app
WORKDIR /app/apps/stripe

EXPOSE 3000
CMD ["pnpm", "start"]