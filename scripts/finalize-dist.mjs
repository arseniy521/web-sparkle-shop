import fs from 'node:fs';
import { buildDate, stampLastmod } from './sitemap-dates.mjs';

for (const required of ['dist/robots.txt', 'dist/sitemap.xml']) {
  if (!fs.existsSync(required)) {
    console.error(`Build incomplete: ${required} is missing.`);
    process.exit(1);
  }
}

fs.writeFileSync('dist/sitemap.xml', stampLastmod(fs.readFileSync('dist/sitemap.xml', 'utf8'), buildDate()));
