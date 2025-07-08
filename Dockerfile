# 🛠️ مرحلة البناء (Build Stage)
FROM node:18-alpine AS builder
WORKDIR /app

# نسخ package.json للاستفادة من layer caching
COPY package*.json ./
RUN npm install

# نسخ باقي الملفات وبناء المشروع
COPY . .
RUN npm run build

# 🚀 مرحلة التشغيل (Production Stage)
FROM node:18-alpine AS runner
WORKDIR /app

# تثبيت serve لتشغيل الملفات
RUN npm install -g serve

# نسخ الملفات الناتجة فقط
COPY --from=builder /app/dist ./dist

# تعريف البورت
EXPOSE 8080
ENV PORT=8080

# الأمر النهائي لتشغيل السيرفر
CMD ["serve", "dist", "--single", "--listen", "8080"]
