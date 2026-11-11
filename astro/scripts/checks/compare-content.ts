import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { blogImageReplacements, finalPath, hotelTextReplacements, sameAsset } from '../../checks/approved-differences.ts';
import { NOT_FOUND_PATH } from '../../src/routes/manifest.ts';
import { SITE_ORIGIN, absoluteUrl, allPageEntries, canonicalPath, hreflangFor } from '../../src/routes/urls.ts';
import { extractFacts, listPages, sitePathOf } from './lib/html.ts';
import type { PageFacts } from './lib/html.ts';
import { record } from './registry.ts';
import type { Finding } from './seo-rules.ts';

type Image = PageFacts['images'][number];
type Link = PageFacts['links'][number];

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
  // The 404 page has no manifest entry: its head values come from the old 404 page alone.
  if (!entry && p !== NOT_FOUND_PATH) throw new Error(`${p} is not a page of the manifest`);
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
    entry?.route.canonicalLang
      ? [absoluteUrl(canonicalPath(entry.route, entry.lang))]
      : helmetOr(oldFacts.helmetCanonicals, oldFacts.canonicals),
    newFacts.canonicals,
  );

  // Approved difference 7: the new hreflang of a page equals the manifest set; the old set is not compared.
  const pairs = (list: Array<{ hreflang: string; href: string }>) => list.map((h) => `${h.hreflang} ${h.href}`).sort();
  const expectedHreflang = pairs(entry ? hreflangFor(entry.route, entry.lang) : oldFacts.hreflang);
  if (!isDeepStrictEqual(expectedHreflang, pairs(newFacts.hreflang))) {
    miss('hreflang', `expected ${quote(expectedHreflang)}, new ${quote(pairs(newFacts.hreflang))}`);
  }

  let from = 0;
  for (const h of oldFacts.headings) {
    const at = newFacts.headings.findIndex((n, i) => i >= from && n.level === h.level && n.text === h.text);
    if (at === -1) miss('heading-missing', `h${h.level} ${h.text}`);
    else from = at + 1;
  }

  // The old runs must be a subsequence of the new runs: exact, in order, repeats counted.
  // The longest common subsequence decides which runs are in order, so one moved block
  // does not push every later run out of order.
  // Approved difference 12.
  const oldRuns = oldFacts.textBlocks.map((run) => hotelTextReplacements.find((r) => r.path === p && r.old === run)?.new ?? run);
  const newRuns = newFacts.textBlocks;
  const lcs = Array.from({ length: oldRuns.length + 1 }, () => new Array<number>(newRuns.length + 1).fill(0));
  for (let i = oldRuns.length - 1; i >= 0; i--) {
    for (let j = newRuns.length - 1; j >= 0; j--) {
      lcs[i][j] = oldRuns[i] === newRuns[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const inOrder = new Set<number>();
  const used = new Set<number>();
  for (let i = 0, j = 0; i < oldRuns.length && j < newRuns.length; ) {
    if (oldRuns[i] === newRuns[j]) {
      inOrder.add(i);
      used.add(j);
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  oldFacts.textBlocks.forEach((run, i) => {
    if (inOrder.has(i)) return;
    const elsewhere = newRuns.findIndex((n, j) => !used.has(j) && n === oldRuns[i]);
    if (elsewhere === -1) {
      miss('text-missing', run);
    } else {
      used.add(elsewhere);
      miss('text-order', run);
    }
  });
  newRuns.forEach((run, j) => {
    if (!used.has(j)) add('text-added', run);
  });

  // Links and images are multisets: each old item must occur in the new page as many times.
  const matchAll = <T>(
    olds: readonly T[],
    news: readonly T[],
    same: (o: T, n: T) => boolean,
    onMissing: (o: T) => void,
    onAdded: (n: T) => void,
  ) => {
    const taken = new Set<number>();
    for (const o of olds) {
      const at = news.findIndex((n, i) => !taken.has(i) && same(o, n));
      if (at === -1) onMissing(o);
      else taken.add(at);
    }
    news.forEach((n, i) => {
      if (!taken.has(i)) onAdded(n);
    });
  };

  // Approved differences 4 and 8: a site link to a redirect source counts as its target.
  const linkTarget = (href: string, from: PageFacts) => {
    const sitePath = sitePathOf(href, from.path);
    return sitePath === null ? href : finalPath(sitePath);
  };
  const describeLink = (l: Link, from: PageFacts) => {
    const sitePath = sitePathOf(l.href, from.path);
    const target = linkTarget(l.href, from);
    const shown = sitePath === null ? l.href : sitePath === target ? sitePath : `${sitePath} (now ${target})`;
    return `${shown} "${l.text}"`;
  };
  matchAll(
    oldFacts.links,
    newFacts.links,
    (o, n) => o.text === n.text && linkTarget(o.href, oldFacts) === linkTarget(n.href, newFacts),
    (o) => miss('link-missing', describeLink(o, oldFacts)),
    (n) => add('link-added', describeLink(n, newFacts)),
  );

  const describe = (img: Image) => `${img.src} alt=${img.alt === null ? 'none' : `"${img.alt}"`}`;
  // Approved difference 13.
  const replacements = blogImageReplacements.filter((r) => r.path === p);
  matchAll(
    oldFacts.images.map((img) => ({ img, expected: replacements.find((r) => isDeepStrictEqual(r.old, img))?.new ?? img })),
    newFacts.images.map((img) => ({ img, expected: img })),
    (o, n) => o.expected.alt === n.img.alt && sameAsset(o.expected.src, n.img.src),
    (o) => miss('image-missing', describe(o.img)),
    (n) => add('image-added', describe(n.img)),
  );

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
  // The 404 page is compared with the old static 404.html, the page GitHub Pages serves for an unknown address.
  let paths = [...allPageEntries().map((e) => e.path), NOT_FOUND_PATH].filter((p) => built.has(p));
  if (options.only !== undefined) {
    if (!paths.includes(options.only)) usageError(`${options.only} is not a built page of the manifest or the 404 page`);
    paths = [options.only];
  }

  let failed = false;
  for (const p of paths) {
    const file = (dir: string) => (p === NOT_FOUND_PATH ? path.join(dir, '404.html') : path.join(dir, p, 'index.html'));
    const read = (dir: string) => fs.readFileSync(file(dir), 'utf8');
    const oldFile = file(options.old);
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
