FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@latest
COPY . .
RUN pnpm i

RUN pnpm build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

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
