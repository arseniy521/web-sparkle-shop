// Writes dist/sitemap.xml with every <lastmod> set to the build date.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '..', 'public', 'sitemap.xml');
const dest = path.join(__dirname, '..', 'dist', 'sitemap.xml');

const today = new Date().toISOString().split('T')[0];
const sitemap = fs
  .readFileSync(src, 'utf8')
  .replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`);

fs.writeFileSync(dest, sitemap, 'utf8');
console.log(`✓ dist/sitemap.xml lastmod set to ${today}`);
