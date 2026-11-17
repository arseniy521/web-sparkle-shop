// Assembles the closed preview from a finished build: .preview/dist (static files) next to
// .preview/functions, which is where `wrangler pages` looks for Functions.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PREVIEW_SRC = path.resolve(import.meta.dirname, '../../preview');

export function assemblePreview(distDir, outDir) {
  const base = path.dirname(outDir);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.rmSync(path.join(base, 'functions'), { recursive: true, force: true });
  fs.cpSync(distDir, outDir, { recursive: true });
  fs.copyFileSync(path.join(PREVIEW_SRC, 'robots.txt'), path.join(outDir, 'robots.txt'));
  fs.cpSync(path.join(PREVIEW_SRC, 'functions'), path.join(base, 'functions'), { recursive: true });
  // The functions import these relative to themselves.
  for (const file of ['stub.js', 'stub-data.json']) {
    fs.copyFileSync(path.join(PREVIEW_SRC, file), path.join(base, file));
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const build = '.preview/build';
  // The preview differs from the published build only by the relative API address.
  execSync(`node scripts/sync-public.mjs && npx astro build --outDir ${build}`, {
    stdio: 'inherit',
    env: { ...process.env, VITE_API_URL: '/api' },
  });
  assemblePreview(build, '.preview/dist');
}
