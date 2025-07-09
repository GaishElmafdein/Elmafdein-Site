import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 4321,
  },
  adapter: node({ mode: 'standalone' }),
});
