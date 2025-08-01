# apps/stripe/Dockerfile
FROM node:22-alpine

# --- universal envs --------------------------------------------------
ENV APL=file 
ENV SKIP_ENV_VALIDATION=1
WORKDIR /app
COPY . .

# --- install & build only the Stripe workspace -----------------------
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=saleor-app-payment-stripe --only

EXPOSE 3000
CMD ["pnpm","start","--filter=saleor-app-payment-stripe"]
