# syntax=docker/dockerfile:1.5
ARG NODE_MAJOR=22
FROM node:${NODE_MAJOR}-alpine
LABEL node_version=${NODE_MAJOR}

# --- silence DynamoDB env validation in the Stripe app -------------
ENV APL=file \
    SKIP_ENV_VALIDATION=true \
    DYNAMODB_MAIN_TABLE_NAME=dummy \
    AWS_REGION=us-east-1 \
    AWS_SECRET_ACCESS_KEY=dummy

WORKDIR /app

RUN corepack enable && corepack use pnpm@10.6.3

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/ ./apps/

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/stripe

# <---- This line builds your Next.js app for production
RUN pnpm build

EXPOSE 3000

# <---- This line runs the optimized, production server!
CMD ["pnpm", "start"]
