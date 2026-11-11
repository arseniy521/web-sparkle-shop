import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import { NOT_FOUND_PATH, redirects } from '../../src/routes/manifest.ts';
import { SITE_ORIGIN, allPageEntries, redirectTarget } from '../../src/routes/urls.ts';
import { extractFacts, listPages } from './lib/html.ts';
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

interface Ctx {
  distDir: string;
  built: ReadonlySet<string>;
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

export function checkDist(input: {
  distDir: string;
  scope?: ReadonlySet<string>;
  knownDefects?: readonly KnownDefect[];
  production?: boolean;
}): Finding[] {
  const { distDir, scope, knownDefects = [] } = input;
  const findings: Finding[] = [];
  const ctx: Ctx = {
    distDir,
    built: new Set(listPages(distDir)),
    pagePaths: new Set(allPageEntries().map((e) => e.path)),
    redirectSources: new Set(redirects.map((r) => r.from)),
    add: (rule, pagePath, detail) => findings.push({ rule, path: pagePath, detail }),
  };

  checkManifestPages(ctx, scope);
  checkRedirects(ctx);
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
