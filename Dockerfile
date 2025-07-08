# 🛠️ مرحلة البناء (Build Stage)
FROM node:18-alpine AS builder
WORKDIR /app

# نسخ package.json للاستفادة من caching
COPY package*.json ./
RUN npm install

# نسخ باقي الملفات وبناء المشروع
COPY . .
RUN npm run build

# 🚀 مرحلة التشغيل (Production Stage)
FROM node:18-alpine AS runner
WORKDIR /app

# نسخ الملفات المبنية فقط
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# إعداد البورت
EXPOSE 8080
ENV PORT=8080

# ✅ أهم نقطة: تشغيل Astro SSR
CMD ["node", "./dist/server/entry.mjs"]
