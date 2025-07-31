# syntax=docker/dockerfile:1

## Build stage
FROM node:20-alpine AS builder

WORKDIR /app
# Copy root-level monorepo dependencies if needed
COPY package.json pnpm-lock.yaml ./
# Install pnpm globally
RUN npm install -g pnpm@latest

# Install dependencies
COPY . .
RUN pnpm install

# Build the app (Next.js)
RUN pnpm build

## Production stage
FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

# Copy production dependencies + app
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT=3000

ENV SECRET_KEY="OsFCtFRfOfDcF7989457177!!!"
ENV APL="FileAPL"
ENV APP_DEBUG="info"

CMD ["node_modules/.bin/next", "start"]
