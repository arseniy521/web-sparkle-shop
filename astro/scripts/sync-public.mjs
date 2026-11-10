import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function syncPublic(srcDir, destDir) {
  fs.rmSync(destDir, { recursive: true, force: true });
  fs.cpSync(srcDir, destDir, {
    recursive: true,
    filter: (source) => path.relative(srcDir, source) !== '404.html',
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  syncPublic('../public', './public');
}
