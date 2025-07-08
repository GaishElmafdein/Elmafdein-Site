import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    server: {
      host: '0.0.0.0', // مهم جداً: السماح بالاتصال من أي IP
      port: process.env.PORT || 8080 // Railway يرسل PORT ديناميكي
    }
  }
});
