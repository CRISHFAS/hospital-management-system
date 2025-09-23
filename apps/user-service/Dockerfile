# apps/user-service/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY apps/user-service ./apps/user-service
COPY libs ./libs

RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/user-service ./apps/user-service
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/package*.json ./

EXPOSE 3001
CMD ["node", "apps/user-service/dist/main.js"]