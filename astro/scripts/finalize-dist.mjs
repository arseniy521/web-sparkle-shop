import fs from 'node:fs';

for (const required of ['dist/robots.txt', 'dist/sitemap.xml']) {
  if (!fs.existsSync(required)) {
    console.error(`Build incomplete: ${required} is missing.`);
    process.exit(1);
  }
}

fs.writeFileSync('dist/CNAME', 'www.nius.cz\n');
fs.writeFileSync('dist/.nojekyll', '');
