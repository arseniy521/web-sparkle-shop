import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { blogImageReplacements, finalPath, hotelTextReplacements, sameAsset } from '../../checks/approved-differences.ts';
import { SITE_ORIGIN, absoluteUrl, allPageEntries, canonicalPath, hreflangFor } from '../../src/routes/urls.ts';
import { extractFacts, listPages } from './lib/html.ts';
import type { PageFacts } from './lib/html.ts';
import { record } from './registry.ts';
import type { Finding } from './seo-rules.ts';

type Image = PageFacts['images'][number];

const quote = (values: readonly string[]) => values.map((v) => `"${v}"`).join(', ') || 'none';

// Approved difference 2: where the old page has a react-helmet tag, it is the page's value.
const helmetOr = (helmet: string[], all: string[]) => (helmet.length > 0 ? helmet : all);

// Approved differences 4 and 8 inside JSON-LD: a site URL of a redirect source becomes its target.
function mapSiteUrls(value: unknown): unknown {
  if (typeof value === 'string') {
    if (!value.startsWith(`${SITE_ORIGIN}/`)) return value;
    const url = new URL(value);
    const target = finalPath(url.pathname);
    return target === url.pathname ? value : absoluteUrl(target) + url.search + url.hash;
  }
  if (Array.isArray(value)) return value.map(mapSiteUrls);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapSiteUrls(v)]));
  }
  return value;
}

function firstDifference(a: unknown, b: unknown, at: string): string | null {
  if (isDeepStrictEqual(a, b)) return null;
  if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
    for (const key of keys) {
      const found = firstDifference(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        at ? `${at}.${key}` : key,
      );
      if (found) return found;
    }
  }
  return `${at || '(root)'} old ${JSON.stringify(a)}, new ${JSON.stringify(b)}`;
}

const typeOf = (value: unknown) =>
  value !== null && typeof value === 'object' ? String((value as Record<string, unknown>)['@type'] ?? 'unknown') : 'unknown';

export function comparePage(oldFacts: PageFacts, newFacts: PageFacts): { missing: Finding[]; added: Finding[] } {
  const p = newFacts.path;
  const entry = allPageEntries().find((e) => e.path === p);
  if (!entry) throw new Error(`${p} is not a page of the manifest`);
  const missing: Finding[] = [];
  const added: Finding[] = [];
  const miss = (rule: string, detail: string) => missing.push({ rule, path: p, detail });
  const add = (rule: string, detail: string) => added.push({ rule, path: p, detail });

  const head = (rule: string, expected: string[], actual: string[]) => {
    if (!isDeepStrictEqual(expected, actual)) miss(rule, `old ${quote(expected)}, new ${quote(actual)}`);
  };
  head('title', oldFacts.titles, newFacts.titles);
  head('description', oldFacts.descriptions, newFacts.descriptions);
  head('keywords', oldFacts.keywords, newFacts.keywords);
  head('robots', helmetOr(oldFacts.helmetRobots, oldFacts.robots), newFacts.robots);
  // Approved difference 11: a page with canonicalLang takes its canonical from the manifest.
  head(
    'canonical',
    entry.route.canonicalLang
      ? [absoluteUrl(canonicalPath(entry.route, entry.lang))]
      : helmetOr(oldFacts.helmetCanonicals, oldFacts.canonicals),
    newFacts.canonicals,
  );

  // Approved difference 7: the new hreflang equals the manifest set; the old set is not compared.
  const pairs = (list: Array<{ hreflang: string; href: string }>) => list.map((h) => `${h.hreflang} ${h.href}`).sort();
  const expectedHreflang = pairs(hreflangFor(entry.route, entry.lang));
  if (!isDeepStrictEqual(expectedHreflang, pairs(newFacts.hreflang))) {
    miss('hreflang', `expected ${quote(expectedHreflang)}, new ${quote(pairs(newFacts.hreflang))}`);
  }

  let from = 0;
  for (const h of oldFacts.headings) {
    const at = newFacts.headings.findIndex((n, i) => i >= from && n.level === h.level && n.text === h.text);
    if (at === -1) miss('heading-missing', `h${h.level} ${h.text}`);
    else from = at + 1;
  }

  const oldText = oldFacts.textBlocks.join(' ');
  const newText = newFacts.textBlocks.join(' ');
  for (const block of new Set(oldFacts.textBlocks)) {
    if (newText.includes(block)) continue;
    // Approved difference 12.
    const replacement = hotelTextReplacements.find((r) => r.path === p && r.old === block);
    if (replacement && newText.includes(replacement.new)) continue;
    miss('text-missing', block);
  }
  for (const block of new Set(newFacts.textBlocks)) {
    if (!oldText.includes(block)) add('text-added', block);
  }

  const oldLinks = new Set(oldFacts.internalLinks);
  const newLinks = new Set(newFacts.internalLinks);
  const finalOldLinks = new Set([...oldLinks].map(finalPath));
  for (const link of oldLinks) {
    if (!newLinks.has(finalPath(link))) {
      miss('link-missing', finalPath(link) === link ? link : `${link} (now ${finalPath(link)})`);
    }
  }
  for (const link of newLinks) if (!finalOldLinks.has(link)) add('link-added', link);

  const describe = (img: Image) => `${img.src} alt=${img.alt === null ? 'none' : `"${img.alt}"`}`;
  const sameImage = (o: Image, n: Image) => o.alt === n.alt && sameAsset(o.src, n.src);
  // Approved difference 13.
  const replacements = blogImageReplacements.filter((r) => r.path === p);
  for (const img of oldFacts.images) {
    const expected = replacements.find((r) => isDeepStrictEqual(r.old, img))?.new ?? img;
    if (!newFacts.images.some((n) => sameImage(expected, n))) miss('image-missing', describe(img));
  }
  for (const img of newFacts.images) {
    const expected = [...oldFacts.images, ...replacements.map((r) => r.new)];
    if (!expected.some((o) => sameImage(o, img))) add('image-added', describe(img));
  }

  const oldJsonLd = oldFacts.jsonLd.map(mapSiteUrls);
  for (const value of oldJsonLd) {
    if (newFacts.jsonLd.some((n) => isDeepStrictEqual(value, n))) continue;
    const sameType = newFacts.jsonLd.find((n) => typeOf(n) === typeOf(value));
    miss('jsonld-missing', `${typeOf(value)}: ${sameType === undefined ? 'no new object of this type' : firstDifference(value, sameType, '')}`);
  }
  for (const value of newFacts.jsonLd) {
    if (!oldJsonLd.some((o) => isDeepStrictEqual(o, value))) add('jsonld-added', typeOf(value));
  }

  return { missing, added };
}

function usageError(message: string): never {
  console.error(`compare-content: ${message}`);
  process.exit(2);
}

function main() {
  const options: Record<string, string> = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (['--old', '--new', '--only'].includes(argv[i]) && i + 1 < argv.length) options[argv[i].slice(2)] = argv[++i];
    else usageError(`unknown or incomplete argument: ${argv[i]}`);
  }
  if (!options.old || !options.new) usageError('--old and --new are required');
  for (const dir of [options.old, options.new]) {
    if (!fs.existsSync(dir)) usageError(`directory ${dir} does not exist${dir === options.old ? ' (run npm run baseline)' : ''}`);
  }

  const built = new Set(listPages(options.new));
  let paths = allPageEntries()
    .map((e) => e.path)
    .filter((p) => built.has(p));
  if (options.only !== undefined) {
    if (!paths.includes(options.only)) usageError(`${options.only} is not a built page of the manifest`);
    paths = [options.only];
  }

  let failed = false;
  for (const p of paths) {
    const read = (dir: string) => fs.readFileSync(path.join(dir, p, 'index.html'), 'utf8');
    const oldFile = path.join(options.old, p, 'index.html');
    const { missing, added } = fs.existsSync(oldFile)
      ? comparePage(extractFacts(read(options.old), p), extractFacts(read(options.new), p))
      : { missing: [{ rule: 'reference-missing', path: p, detail: oldFile }], added: [] };
    for (const f of missing) console.log(`missing ${f.rule} ${f.path} ${f.detail}`);
    for (const f of added) console.log(`added ${f.rule} ${f.path} ${f.detail}`);
    if (missing.length > 0) {
      failed = true;
      record('content', p, 'fail', [...new Set(missing.map((f) => f.rule))].join(', '));
    } else {
      record('content', p, 'pass');
    }
  }
  if (failed) process.exitCode = 1;
}

if (import.meta.main) main();
