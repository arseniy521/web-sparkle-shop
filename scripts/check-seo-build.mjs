// Post-build SEO sanity checks on dist/: sitemap URLs exist, one canonical per page,
// canonical matches the page's own URL, no Setmore leftovers.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');
const base = 'https://www.nius.cz';
const errors = [];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
  );

const fileFor = (url) => {
  const p = new URL(url).pathname;
  return path.join(dist, p.endsWith('/') ? `${p}index.html` : p);
};

const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const loc of locs) {
  const f = fileFor(loc);
  if (!fs.existsSync(f)) {
    errors.push(`sitemap URL has no file: ${loc}`);
    continue;
  }
  const html = fs.readFileSync(f, 'utf8');
  const canon = [...html.matchAll(/<link[^>]*rel="canonical"[^>]*>/g)].map((m) => m[0]);
  if (canon.length !== 1) errors.push(`${loc}: ${canon.length} canonical tags`);
  else if (!canon[0].includes(`href="${loc}"`)) errors.push(`${loc}: canonical is ${canon[0]}`);
  if (/noindex/.test(html)) errors.push(`${loc}: noindex page listed in sitemap`);
}

for (const f of walk(dist).filter((x) => /\.(html|js|txt|xml|json)$/.test(x))) {
  const text = fs.readFileSync(f, 'utf8');
  if (/setmore/i.test(text)) errors.push(`Setmore mention in ${path.relative(dist, f)}`);
}

if (errors.length) {
  console.error(`SEO check failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✓ SEO check: ${locs.length} sitemap URLs OK`);
