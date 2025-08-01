FROM node:22-alpine
# Make env variables available at build-time too
ENV APL=file \
    SKIP_ENV_VALIDATION=true \
    DYNAMODB_MAIN_TABLE_NAME=dummy \
    AWS_REGION=us-east-1 \
    AWS_ACCESS_KEY_ID=dummy \
    AWS_SECRET_ACCESS_KEY=dummy
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=saleor-app-payment-stripe --only
EXPOSE 3000
CMD ["pnpm","start","--filter=saleor-app-payment-stripe"]