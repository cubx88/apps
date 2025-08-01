# apps/stripe/Dockerfile
FROM node:22-alpine            

ENV SKIP_ENV_VALIDATION=1      
WORKDIR /app

COPY . .

# pnpm & turbo
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Build ONLY the Stripe workspace
RUN pnpm turbo run build --filter=saleor-app-payment-stripe --no-deps

EXPOSE 3000
CMD ["pnpm","start","--filter=saleor-app-payment-stripe"]
