# 🛠️ مرحلة البناء (Build Stage)
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 🚀 مرحلة التشغيل (Production Stage)
FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 8080
ENV PORT=8080

CMD ["node", "./dist/server/entry.mjs"]
