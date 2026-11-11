import fs from 'node:fs';
import path from 'node:path';
import { redirects } from '../../../src/routes/manifest.ts';
import {
  absoluteUrl,
  allPageEntries,
  canonicalPath,
  hreflangFor,
  isIndexable,
  redirectTarget,
  sitemapEntries,
} from '../../../src/routes/urls.ts';
import type { Lang } from '../../../src/routes/types.ts';

const LOCALES: Record<Lang, string> = { cs: 'cs_CZ', en: 'en_US', ru: 'ru_RU', uk: 'uk_UA' };

function write(dir: string, rel: string, content: string): void {
  const file = path.join(dir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function pageHtml(entry: ReturnType<typeof allPageEntries>[number]): string {
  const { route, lang, path: pagePath } = entry;
  const canonical = absoluteUrl(canonicalPath(route, lang));
  const title = `Title ${pagePath}`;
  const description = `Description ${pagePath}`;
  const robots = isIndexable(route, lang) ? 'index, follow' : 'noindex, follow';
  const alternates = hreflangFor(route, lang)
    .map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}">`)
    .join('');
  const locales = (Object.keys(LOCALES) as Lang[])
    .filter((l) => l !== lang)
    .map((l) => `<meta property="og:locale:alternate" content="${LOCALES[l]}">`)
    .join('');
  const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', url: canonical });
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"><title>${title}</title>
<meta name="description" content="${description}"><meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">${alternates}
<meta property="og:title" content="${title}"><meta property="og:description" content="${description}">
<meta property="og:type" content="website"><meta property="og:url" content="${canonical}">
<meta property="og:image" content="${absoluteUrl('/og-image.jpg')}">
<meta property="og:locale" content="${LOCALES[lang]}">${locales}
<script type="application/ld+json">${jsonLd}</script></head>
<body><h1>Heading ${pagePath}</h1><a href="/">Home</a> <a href="/brand/logo.svg">Logo</a>
<img src="/og-image.jpg" alt="Photo"></body></html>`;
}

function redirectHtml(target: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${target}">
<meta name="robots" content="noindex"><title>Redirecting...</title></head>
<body><p>This page has moved. <a href="${target}">Click here</a> if you are not redirected.</p></body></html>`;
}

function sitemapXml(): string {
  const urls = sitemapEntries()
    .map((e) => {
      const links = e.alternates
        .map((a) => `<xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`)
        .join('');
      return `<url><loc>${e.loc}</loc>${links}</url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

// A complete production-like dist built from the real route manifest: every rule passes on it.
export function writeGoodDist(dir: string): void {
  for (const entry of allPageEntries()) write(dir, `${entry.path}index.html`, pageHtml(entry));
  for (const r of redirects) write(dir, `${r.from}index.html`, redirectHtml(redirectTarget(r)));
  write(
    dir,
    '404.html',
    '<!DOCTYPE html><html lang="en"><head><meta name="robots" content="noindex"><title>Not found</title></head><body><a href="/">Home</a></body></html>',
  );
  write(dir, 'CNAME', 'www.nius.cz\n');
  write(dir, '.nojekyll', '');
  write(dir, 'robots.txt', 'User-agent: *\nAllow: /\n\nSitemap: https://www.nius.cz/sitemap.xml\n');
  write(dir, 'sitemap.xml', sitemapXml());
  write(dir, 'og-image.jpg', 'jpg');
  write(dir, 'brand/logo.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>');
  write(dir, '_astro/app.js', 'const API="https://app.nius.cz/api";');
}
