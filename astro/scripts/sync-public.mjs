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
  // Resolved from this file, not from the current directory: the destination is emptied first.
  const here = import.meta.dirname;
  syncPublic(path.join(here, '../../public'), path.join(here, '../public'));
}
