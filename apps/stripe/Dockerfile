# -----------------------
# Stage 1: Build
# -----------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root pnpm config files from the non-monorepo root
COPY ../../package.json ../../pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm@latest

# Install only production dependencies
RUN pnpm install --prod --ignore-workspace-root-check

# Copy the Stripe app source code
COPY . .

# Build the app
RUN pnpm build

# -----------------------
# Stage 2: Runtime
# -----------------------
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy built output and node_modules from builder
COPY --from=builder /app ./

# Expose port
EXPOSE 3000
ENV PORT=3000

# Start the app
CMD ["pnpm", "start"]
