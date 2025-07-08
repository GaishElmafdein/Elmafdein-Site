import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    server: {
      host: true, // ⬅️ دي أهم حاجة بتخلي السيرفر يشتغل على 0.0.0.0
      port: process.env.PORT || 8080
    }
  }
});
