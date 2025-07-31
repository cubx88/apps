FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./
COPY --from=builder /app/public ./public
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod
EXPOSE 3000
ENV NODE_ENV=production
CMD ["pnpm", "start"]