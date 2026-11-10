import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.nius.cz',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [react()],
  server: { port: 8080, host: true },
  vite: {
    plugins: [tailwindcss()],
    css: { postcss: {} },
    envPrefix: 'VITE_',
    envDir: '..',
    resolve: {
      alias: {
        '@old': fileURLToPath(new URL('../src', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.NIUS_API_PROXY ?? 'http://localhost:3002',
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/api/, ''),
        },
      },
    },
  },
});
