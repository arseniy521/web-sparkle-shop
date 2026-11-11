// Fails the build when public-facing copy contains terms that endanger Google Ads approval
// (Healthcare and medicines policy, misrepresentation) or Czech ad law (40/1995 Sb.).
// Add `ads-check:ignore` to a line to skip it (use sparingly, with a reason).
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const RULES = [
  ['prescription drug name', /gonal-?f|menopur|cetrotide|orgalutran|ovitrelle|decapeptyl|pregnyl|clexane|ferinject|ferrlecit|intralipid/i],
  ['alcohol / hangover / party', /hangover|kocovin|похмел|похміл|bachelor|stag do|hen party|rozlučk|мальчишник|парубоч|champagne/i],
  ['disease / effect claim', /detox|\bviral\b|virov|вирус|вірус|migrain|migrén|мигрен|мігрен|burnout|vyhoření|выгорани|вигоран|rapid relief|\bcure\b/i],
  ['guarantee', /guarantee|garantuj|garantov|гарантируем|гарантуємо/i],
  ['unverifiable time promise', /24\s?\/\s?7|60[- ]?minute arrival|under an hour|within (?:1|2|3|4) ?(?:-|–) ?\d? ?hours?/i],
  ['Setmore', /setmore/i],
  ['named partner / venue', /\bunica\b|formé|\bamc\b|reprofit|iscare|gennet|pronatal|four seasons|augustine|mandarin oriental|hilton|intercontinental|thomayer|gymbeam/i],
  ['unverifiable statistic / superlative', /500\+|100\+ (?:patients|pacient)|3[ ,]?000\+|#1\b|\b97 ?%|\b70 ?% of our|NIUS vs\.? other/i],
  ['dosage / potency', /high[- ]dose|vysokodávk|высокодоз|високодоз|\b\d+\s?(?:mg|mcg|µg)\b/i],
];

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'ui']);
const SCAN_EXT = new Set(['.ts', '.tsx', '.json', '.js', '.html', '.txt']);

const collect = (rel) => {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return [];
  const stat = fs.statSync(abs);
  if (stat.isFile()) return [rel];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) return SKIP_DIRS.has(e.name) ? [] : collect(path.join(rel, e.name));
    return SCAN_EXT.has(path.extname(e.name)) ? [path.join(rel, e.name)] : [];
  });
};

const files = [...collect('src'), ...collect('public'), 'index.html'].filter(
  (f) => !/\.test\.[tj]sx?$/.test(f) && !f.endsWith('sitemap.xml'),
);

const failures = [];
for (const file of files) {
  const lines = fs.readFileSync(path.join(root, file), 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.includes('ads-check:ignore')) return;
    // In JSON only the value is public copy; key names are internal identifiers.
    const text = file.endsWith('.json') ? line.replace(/^\s*"[^"]*":\s*/, '') : line;
    for (const [label, re] of RULES) {
      const m = text.match(re);
      if (m) failures.push(`${file}:${i + 1}  [${label}]  "${m[0]}"`);
    }
  });
}

if (failures.length) {
  console.error(`Ads compliance check failed: ${failures.length} finding(s)\n${failures.slice(0, 200).join('\n')}`);
  if (failures.length > 200) console.error(`... and ${failures.length - 200} more`);
  process.exit(1);
}
console.log(`✓ Ads compliance check passed (${files.length} files)`);
