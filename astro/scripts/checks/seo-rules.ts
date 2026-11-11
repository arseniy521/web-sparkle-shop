import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import { NOT_FOUND_PATH, redirects } from '../../src/routes/manifest.ts';
import {
  SITE_ORIGIN,
  absoluteUrl,
  allPageEntries,
  canonicalPath,
  hreflangFor,
  isIndexable,
  redirectTarget,
  sitemapEntries,
} from '../../src/routes/urls.ts';
import { extractFacts, listPages, normalizeText } from './lib/html.ts';
import type { PageFacts } from './lib/html.ts';

export interface Finding {
  rule: string;
  path: string;
  detail: string;
  known?: true;
}
export interface KnownDefect {
  rule: string;
  path: string;
  note: string;
}

interface PageInfo {
  entry: ReturnType<typeof allPageEntries>[number];
  facts: PageFacts;
  html: string;
}

interface Ctx {
  distDir: string;
  built: ReadonlySet<string>;
  pages: ReadonlyMap<string, PageInfo>;
  scope: ReadonlySet<string> | undefined;
  pagePaths: ReadonlySet<string>;
  redirectSources: ReadonlySet<string>;
  add: (rule: string, path: string, detail: string) => void;
}

const pageFile = (distDir: string, pagePath: string) =>
  path.join(distDir, pagePath === NOT_FOUND_PATH ? '404.html' : `${pagePath}index.html`);

const readPage = (distDir: string, pagePath: string) =>
  fs.readFileSync(pageFile(distDir, pagePath), 'utf8');

const hasNoindex = (facts: PageFacts) => facts.robots.some((r) => r.toLowerCase().includes('noindex'));

function checkManifestPages(ctx: Ctx, scope: ReadonlySet<string> | undefined): void {
  for (const built of ctx.built) {
    if (built === NOT_FOUND_PATH) continue;
    if (!ctx.pagePaths.has(built) && !ctx.redirectSources.has(built)) {
      ctx.add('page-not-in-manifest', built, 'HTML page without a manifest entry');
    }
  }
  for (const pagePath of ctx.pagePaths) {
    if (!ctx.built.has(pagePath) && (!scope || scope.has(pagePath))) {
      ctx.add('manifest-page-missing', pagePath, 'manifest page has no HTML in the build');
    }
  }
  for (const r of redirects) {
    if (!ctx.built.has(r.from)) {
      ctx.add('manifest-page-missing', r.from, 'redirect page has no HTML in the build');
    }
  }
}

function checkRedirects(ctx: Ctx): void {
  for (const r of redirects) {
    if (!ctx.built.has(r.from)) continue;
    const html = readPage(ctx.distDir, r.from);
    const facts = extractFacts(html, r.from);
    const expected = redirectTarget(r);

    if (!hasNoindex(facts)) ctx.add('missing-noindex', r.from, 'redirect page has no noindex');

    const refreshUrl = facts.metaRefresh?.match(/^\s*0\s*;\s*url=(.+)$/i)?.[1]?.trim();
    if (!refreshUrl) {
      ctx.add('redirect-content', r.from, 'no meta refresh with zero delay');
      continue;
    }
    const targetPath = refreshUrl.startsWith(SITE_ORIGIN) ? refreshUrl.slice(SITE_ORIGIN.length) : null;
    const targetIsPage = targetPath !== null && ctx.pagePaths.has(targetPath);
    if (!targetIsPage) {
      ctx.add('redirect-chain', r.from, `redirect target ${refreshUrl} is not a page`);
    } else if (refreshUrl !== expected) {
      ctx.add('redirect-content', r.from, `refreshes to ${refreshUrl}, expected ${expected}`);
    }
    if (facts.canonicals.length !== 1 || facts.canonicals[0] !== refreshUrl) {
      ctx.add('redirect-content', r.from, `canonical must be ${refreshUrl}`);
    }
    const $ = load(html);
    const hrefs = $('a[href]')
      .map((_, el) => $(el).attr('href'))
      .get();
    if (!hrefs.includes(refreshUrl)) {
      ctx.add('redirect-content', r.from, `no visible link to ${refreshUrl}`);
    }
  }

  if (ctx.built.has(NOT_FOUND_PATH)) {
    const facts = extractFacts(readPage(ctx.distDir, NOT_FOUND_PATH), NOT_FOUND_PATH);
    if (!hasNoindex(facts)) ctx.add('missing-noindex', NOT_FOUND_PATH, '404 page has no noindex');
  }
}

function checkRobotsAndRequiredFiles(ctx: Ctx): void {
  const { distDir } = ctx;
  for (const file of ['.nojekyll', 'robots.txt', 'sitemap.xml', '404.html']) {
    if (!fs.existsSync(path.join(distDir, file))) {
      ctx.add('required-files', `/${file}`, 'file is missing from the build');
    }
  }
  const cname = path.join(distDir, 'CNAME');
  if (!fs.existsSync(cname)) {
    ctx.add('required-files', '/CNAME', 'file is missing from the build');
  } else if (fs.readFileSync(cname, 'utf8').trim() !== 'www.nius.cz') {
    ctx.add('required-files', '/CNAME', 'CNAME must contain www.nius.cz');
  }

  const robots = path.join(distDir, 'robots.txt');
  if (!fs.existsSync(robots)) return;
  const lines = fs
    .readFileSync(robots, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*$/, '').trim());
  if (!lines.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)) {
    ctx.add('robots-txt', '/robots.txt', `no line "Sitemap: ${SITE_ORIGIN}/sitemap.xml"`);
  }
  for (const line of lines) {
    if (/^disallow:\s*\S/i.test(line)) ctx.add('robots-txt', '/robots.txt', `closes crawling: "${line}"`);
  }
}

const nonEmpty = (values: string[]) => values.length === 1 && values[0].trim() !== '';
const sitePath = (url: string) => (url.startsWith(SITE_ORIGIN) ? url.slice(SITE_ORIGIN.length) || '/' : null);
const pairKey = (pairs: Array<{ hreflang: string; href: string }>) =>
  pairs.map((p) => `${p.hreflang} ${p.href}`).sort();

function checkHead(ctx: Ctx, { entry, facts }: PageInfo): void {
  const { route, lang, path: p } = entry;
  const exactlyOne: Array<[string, string, string[]]> = [
    ['single-title', 'title', facts.titles],
    ['single-description', 'meta description', facts.descriptions],
    ['single-robots', 'meta robots', facts.robots],
    ['single-canonical', 'canonical', facts.canonicals],
    ['single-h1', 'h1', facts.h1],
  ];
  for (const [rule, what, values] of exactlyOne) {
    if (!nonEmpty(values)) ctx.add(rule, p, `expected exactly one non-empty ${what}, found ${values.length}`);
  }

  if (facts.lang !== lang) ctx.add('html-lang', p, `lang is ${facts.lang ?? 'missing'}, expected ${lang}`);

  if (hasNoindex(facts) && isIndexable(route, lang)) {
    ctx.add('unexpected-noindex', p, `noindex on a page that must be indexed: ${facts.robots.join('; ')}`);
  }

  const expectedCanonical = absoluteUrl(canonicalPath(route, lang));
  if (nonEmpty(facts.canonicals) && facts.canonicals[0] !== expectedCanonical) {
    ctx.add('canonical-value', p, `canonical is ${facts.canonicals[0]}, expected ${expectedCanonical}`);
  }
  for (const canonical of facts.canonicals.filter((c) => c.trim() !== '')) {
    const target = sitePath(canonical);
    if (target === null || !ctx.built.has(target)) {
      ctx.add('canonical-target-missing', p, `canonical target ${canonical} is not in the build`);
    }
  }
}

function checkHreflang(ctx: Ctx, { entry, facts }: PageInfo): void {
  const { route, lang, path: p } = entry;
  const expected = hreflangFor(route, lang);
  if (pairKey(facts.hreflang).join('\n') !== pairKey(expected).join('\n')) {
    ctx.add('hreflang-set', p, `hreflang is [${listPairs(facts.hreflang)}], expected [${listPairs(expected)}]`);
  }

  const own = pairKey(facts.hreflang).join('\n');
  for (const target of new Set(facts.hreflang.map((a) => sitePath(a.href)))) {
    if (target === p) continue;
    const other = target === null ? undefined : ctx.pages.get(target);
    if (!other) {
      ctx.add('hreflang-not-reciprocal', p, `alternate ${target} is not in the build or is not a page`);
    } else if (hasNoindex(other.facts)) {
      ctx.add('hreflang-not-reciprocal', p, `alternate ${target} is closed with noindex`);
    } else if (pairKey(other.facts.hreflang).join('\n') !== own) {
      ctx.add('hreflang-not-reciprocal', p, `alternate ${target} lists a different set`);
    }
  }
}

function checkSocial(ctx: Ctx, { entry, facts }: PageInfo): void {
  const p = entry.path;
  const first = (key: string) => facts.og[key]?.[0];
  const expectEqual = (key: string, actual: string | undefined, expected: string | undefined) => {
    if (expected === undefined) return; // the single-* rule already reports the page
    if (actual !== expected) ctx.add('og-mismatch', p, `${key} is ${actual ?? 'missing'}, expected ${expected}`);
  };
  expectEqual('og:url', first('og:url'), nonEmpty(facts.canonicals) ? facts.canonicals[0] : undefined);
  expectEqual('og:title', first('og:title'), nonEmpty(facts.titles) ? facts.titles[0] : undefined);
  expectEqual(
    'og:description',
    first('og:description'),
    nonEmpty(facts.descriptions) ? facts.descriptions[0] : undefined,
  );
  if (!first('og:locale')) ctx.add('og-mismatch', p, 'og:locale is missing');

  const image = first('og:image');
  if (!image || !/^https?:\/\//.test(image)) {
    ctx.add('og-mismatch', p, `og:image is not an absolute address: ${image ?? 'missing'}`);
  } else if (image.startsWith(SITE_ORIGIN) && !fileExists(ctx, image.slice(SITE_ORIGIN.length))) {
    ctx.add('og-mismatch', p, `og:image file is not in the build: ${image}`);
  }
}

function fileExists(ctx: Ctx, urlPath: string): boolean {
  const file = path.join(ctx.distDir, urlPath.replace(/[?#].*$/, ''));
  return fs.existsSync(file) && fs.statSync(file).isFile();
}

function collectStrings(node: unknown, out: string[] = []): string[] {
  if (typeof node === 'string') out.push(node);
  else if (Array.isArray(node)) node.forEach((n) => collectStrings(n, out));
  else if (node && typeof node === 'object') Object.values(node).forEach((n) => collectStrings(n, out));
  return out;
}

function collectFaqPages(node: unknown, out: Array<Record<string, unknown>> = []) {
  if (Array.isArray(node)) node.forEach((n) => collectFaqPages(n, out));
  else if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>;
    if ([record['@type']].flat().includes('FAQPage')) out.push(record);
    Object.values(record).forEach((n) => collectFaqPages(n, out));
  }
  return out;
}

const plainText = (html: unknown) =>
  normalizeText(typeof html === 'string' ? load(html, null, false).text() : '');

function checkStructuredData(ctx: Ctx, { entry, facts, html }: PageInfo): void {
  const p = entry.path;
  for (const error of facts.jsonLdErrors) ctx.add('jsonld-invalid', p, error);

  for (const text of collectStrings(facts.jsonLd)) {
    const target = sitePath(text.replace(/[?#].*$/, ''));
    const lastSegment = target?.split('/').pop() ?? '';
    if (target !== null && !lastSegment.includes('.') && !ctx.pagePaths.has(target)) {
      ctx.add('jsonld-url-not-page', p, `${text} is not a page of the manifest`);
    }
  }

  const faqPages = collectFaqPages(facts.jsonLd);
  const $ = load(html);
  const hasBlock = $('[data-faq]').length > 0;
  if (faqPages.length === 0 && !hasBlock) return;
  if (faqPages.length === 0) return ctx.add('jsonld-faq-mismatch', p, 'FAQ block without FAQPage JSON-LD');
  if (!hasBlock) return ctx.add('jsonld-faq-mismatch', p, 'FAQPage JSON-LD without a FAQ block');

  const fromJson = faqPages.flatMap((faq) =>
    [faq.mainEntity ?? []].flat().map((q) => {
      const question = q as { name?: unknown; acceptedAnswer?: { text?: unknown } };
      return { q: plainText(question.name), a: plainText(question.acceptedAnswer?.text) };
    }),
  );
  const fromPage = $('[data-faq] [data-faq-item]')
    .map((_, item) => ({
      q: normalizeText($(item).find('[data-faq-question]').first().text()),
      a: normalizeText($(item).find('[data-faq-answer]').first().text()),
    }))
    .get();
  if (fromJson.length !== fromPage.length) {
    ctx.add('jsonld-faq-mismatch', p, `JSON-LD has ${fromJson.length} questions, the block ${fromPage.length}`);
    return;
  }
  fromJson.forEach((item, i) => {
    if (item.q !== fromPage[i].q) ctx.add('jsonld-faq-mismatch', p, `question ${i + 1}: "${item.q}" vs "${fromPage[i].q}"`);
    else if (item.a !== fromPage[i].a) ctx.add('jsonld-faq-mismatch', p, `answer ${i + 1} differs: "${item.a}" vs "${fromPage[i].a}"`);
  });
}

function checkLinksAndImages(ctx: Ctx, { entry, facts }: PageInfo): void {
  const p = entry.path;
  for (const link of new Set(facts.internalLinks)) {
    if (ctx.redirectSources.has(link)) {
      ctx.add('link-to-redirect', p, `link to the redirect ${link}`);
      continue;
    }
    // A manifest page whose template is not ported yet is tolerated only under a scope.
    const exists = link.endsWith('/') ? ctx.built.has(link) : fileExists(ctx, link);
    const comingLater = ctx.scope !== undefined && ctx.pagePaths.has(link);
    if (!exists && !comingLater) ctx.add('link-broken', p, `link to ${link}, which is not in the build`);
  }

  for (const image of facts.images) {
    if (image.alt === null) ctx.add('image-no-alt', p, `image ${image.src} has no alt attribute`);
    const urlPath = image.src.startsWith('/') ? image.src : sitePath(image.src);
    if (urlPath?.startsWith('/') && !urlPath.startsWith('//') && !fileExists(ctx, urlPath)) {
      ctx.add('image-missing', p, `image file ${image.src} is not in the build`);
    }
  }
}

const listPairs = (pairs: Array<{ hreflang: string; href: string }>) =>
  pairs.map((x) => `${x.hreflang}=${x.href}`).join(', ') || 'none';

function checkSitemap(ctx: Ctx): void {
  const file = path.join(ctx.distDir, 'sitemap.xml');
  if (!fs.existsSync(file)) return;
  const $ = load(fs.readFileSync(file, 'utf8'), { xml: true });
  const actual = new Map<string, Array<{ hreflang: string; href: string }>>();
  $('url').each((_, url) => {
    const alternates = $(url)
      .children()
      .toArray()
      .filter((child) => (child as { name?: string }).name === 'xhtml:link')
      .map((child) => ({ hreflang: $(child).attr('hreflang') ?? '', href: $(child).attr('href') ?? '' }));
    actual.set($(url).children('loc').text().trim(), alternates);
  });

  const expected = sitemapEntries();
  const expectedLocs = new Set(expected.map((e) => e.loc));
  for (const e of expected) {
    const found = actual.get(e.loc);
    const entryPath = sitePath(e.loc) ?? e.loc;
    if (!found) {
      ctx.add('sitemap-missing-page', entryPath, 'indexable page is absent from sitemap.xml');
    } else if (pairKey(found).join('\n') !== pairKey(e.alternates).join('\n')) {
      ctx.add(
        'sitemap-alternates',
        entryPath,
        `alternates are [${listPairs(found)}], expected [${listPairs(e.alternates)}]`,
      );
    }
  }
  for (const loc of actual.keys()) {
    if (!expectedLocs.has(loc)) {
      ctx.add('sitemap-extra-url', sitePath(loc) ?? loc, 'sitemap.xml lists an address that must not be there');
    }
  }
}

export function checkDist(input: {
  distDir: string;
  scope?: ReadonlySet<string>;
  knownDefects?: readonly KnownDefect[];
  production?: boolean;
}): Finding[] {
  const { distDir, scope, knownDefects = [] } = input;
  const findings: Finding[] = [];
  const built = new Set(listPages(distDir));
  const pages = new Map<string, PageInfo>();
  for (const entry of allPageEntries()) {
    if (!built.has(entry.path)) continue;
    const html = readPage(distDir, entry.path);
    pages.set(entry.path, { entry, facts: extractFacts(html, entry.path), html });
  }
  const ctx: Ctx = {
    distDir,
    built,
    pages,
    scope,
    pagePaths: new Set(allPageEntries().map((e) => e.path)),
    redirectSources: new Set(redirects.map((r) => r.from)),
    add: (rule, pagePath, detail) => findings.push({ rule, path: pagePath, detail }),
  };

  checkManifestPages(ctx, scope);
  for (const info of pages.values()) {
    checkHead(ctx, info);
    checkHreflang(ctx, info);
    checkSocial(ctx, info);
    checkStructuredData(ctx, info);
    checkLinksAndImages(ctx, info);
  }
  checkRedirects(ctx);
  checkSitemap(ctx);
  checkRobotsAndRequiredFiles(ctx);

  // Redirects and the 404 page are always in scope.
  const inScope = (p: string) =>
    scope === undefined || scope.has(p) || ctx.redirectSources.has(p) || p === NOT_FOUND_PATH;
  return findings.map((f) =>
    !inScope(f.path) && knownDefects.some((k) => k.rule === f.rule && k.path === f.path)
      ? { ...f, known: true }
      : f,
  );
}
