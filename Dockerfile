# 🛠️ مرحلة البناء (Build Stage)
FROM node:18-alpine AS builder
WORKDIR /app

# نسخ package.json أولاً للاستفادة من Docker layer caching
COPY package*.json ./
RUN npm install

# نسخ باقي الملفات وبناء المشروع
COPY . .
RUN npm run build

# 🚀 مرحلة التشغيل (Production Stage)
FROM node:18-alpine AS runner
WORKDIR /app

# نسخ الملفات المبنية فقط (هذا يقلل حجم الحاوية النهائية بشكل كبير)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# تعريف البورت - Railway يحتاج هذا للتوجيه الصحيح
EXPOSE 8080
ENV PORT=8080

# تشغيل السيرفر الفعلي لـ Astro SSR
CMD ["node", "./dist/server/entry.mjs"]
