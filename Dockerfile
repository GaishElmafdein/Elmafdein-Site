# -----------------------
# 🛠️ مرحلة البناء (Build)
# -----------------------
FROM node:18-alpine AS builder
WORKDIR /app

# انسخ ملفات الباكيج أولًا للاستفادة من الكاش
COPY package*.json ./
RUN npm install

# انسخ باقي ملفات المشروع وابني الموقع
COPY . .
RUN npm run build

# -----------------------
# 🚀 مرحلة التشغيل (Serve)
# -----------------------
FROM node:18-alpine AS runner
WORKDIR /app

# انسخ الملفات الناتجة من مرحلة البناء
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# إعداد البورت وENV المطلوب من Railway
ENV PORT=8080
EXPOSE 8080

# شغّل السيرفر باستخدام serve
CMD ["npx", "serve", "dist", "--single", "--listen", "8080"]
