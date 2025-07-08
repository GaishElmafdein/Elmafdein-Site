# ============ 🏗️ مرحلة البناء ============

FROM node:18-alpine AS builder
WORKDIR /app

# انسخ package.json للاستفادة من Docker caching
COPY package*.json ./
RUN npm install

# انسخ باقي الملفات وابني المشروع
COPY . .
RUN npm run build

# ============ 🚀 مرحلة التشغيل ============

FROM node:18-alpine AS runner
WORKDIR /app

# أضف مستخدم غير root لأمان أفضل
RUN addgroup -S nodejs && adduser -S astro -G nodejs

# انسخ الملفات المبنية
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# تغيير صلاحيات الملفات
RUN chown -R astro:nodejs /app

# استخدم المستخدم غير root
USER astro

# تحديد البورت للتشغيل
EXPOSE 8080
ENV PORT=8080

# فحص الصحة (اختياري لكنه مفيد في Railway)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080', res => process.exit(res.statusCode === 200 ? 0 : 1))"

# أمر التشغيل
CMD ["node", "./dist/server/entry.mjs"]
