import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { defineConfig } from 'astro/config';
import type { AstroIntegration } from 'astro';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// @vitejs/plugin-react is a dependency of @astrojs/react only, so it is resolved from there.
const fromAstroReact = createRequire(createRequire(import.meta.url).resolve('@astrojs/react'));
const { default: viteReact } = await import(
  /* @vite-ignore */ pathToFileURL(fromAstroReact.resolve('@vitejs/plugin-react')).href
);

// @astrojs/react injects the Fast Refresh preamble only on pages with a client:* island;
// the order form is mounted from a plain script, so in dev every page needs it.
const reactRefreshPreamble: AstroIntegration = {
  name: 'react-refresh-preamble',
  hooks: {
    'astro:config:setup': ({ command, injectScript }) => {
      if (command !== 'dev') return;
      injectScript('page', viteReact.preambleCode.replace('__BASE__', '/'));
    },
  },
};

export default defineConfig({
  site: 'https://www.nius.cz',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [react(), reactRefreshPreamble],
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
