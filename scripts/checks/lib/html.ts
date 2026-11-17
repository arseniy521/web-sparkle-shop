import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import { SITE_ORIGIN } from '../../../src/routes/urls.ts';

export interface PageFacts {
  path: string;
  lang: string | null;
  titles: string[];
  descriptions: string[];
  robots: string[];
  canonicals: string[];
  hreflang: Array<{ hreflang: string; href: string }>;
  og: Record<string, string[]>;
  metaRefresh: string | null;
  h1: string[];
  internalLinks: string[]; // site-relative hrefs without query and hash
  images: Array<{ src: string; alt: string | null }>;
  jsonLd: unknown[];
  jsonLdErrors: string[];
}

export function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function metaContents($: CheerioAPI, selector: string): string[] {
  return $(selector)
    .map((_, el) => $(el).attr('content') ?? '')
    .get();
}

const SITE_HOSTS = [new URL(SITE_ORIGIN).hostname, new URL(SITE_ORIGIN).hostname.replace(/^www./, '')];

function siteUrlOf(href: string, pagePath: string): URL | null {
  const value = href.trim();
  if (value === '' || value.startsWith('#') || value.startsWith('?')) return null;
  let url: URL;
  try {
    url = new URL(value, SITE_ORIGIN + pagePath);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol) || !SITE_HOSTS.includes(url.hostname)) return null;
  return url;
}

const decodePath = (pathname: string) => {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
};

// The decoded path of a link or image address that points to the site itself, else null.
// Query and hash are dropped; relative addresses resolve against the page path.
export function sitePathOf(href: string, pagePath: string): string | null {
  const url = siteUrlOf(href, pagePath);
  return url === null ? null : decodePath(url.pathname);
}

export function extractFacts(html: string, pagePath: string): PageFacts {
  const $ = load(html);

  const og: Record<string, string[]> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const property = $(el).attr('property') as string;
    (og[property] ??= []).push($(el).attr('content') ?? '');
  });

  const jsonLd: unknown[] = [];
  const jsonLdErrors: string[] = [];
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      jsonLd.push(JSON.parse($(el).text()));
    } catch (error) {
      jsonLdErrors.push(`block ${i + 1}: ${(error as Error).message}`);
    }
  });

  return {
    path: pagePath,
    lang: $('html').attr('lang') ?? null,
    // Only the page title: an inline SVG icon in the body has <title> elements of its own.
    titles: $('head > title')
      .map((_, el) => $(el).text())
      .get(),
    descriptions: metaContents($, 'meta[name="description"]'),
    robots: metaContents($, 'meta[name="robots"]'),
    canonicals: $('link[rel="canonical"]')
      .map((_, el) => $(el).attr('href') ?? '')
      .get(),
    hreflang: $('link[rel="alternate"][hreflang]')
      .map((_, el) => ({ hreflang: $(el).attr('hreflang') as string, href: $(el).attr('href') ?? '' }))
      .get(),
    og,
    metaRefresh: $('meta[http-equiv="refresh" i]').attr('content') ?? null,
    h1: $('h1')
      .map((_, el) => normalizeText($(el).text()))
      .get(),
    internalLinks: $('a[href]')
      .map((_, el) => sitePathOf($(el).attr('href') as string, pagePath))
      .get()
      .filter((href): href is string => href !== null),
    images: $('img')
      .map((_, el) => ({ src: $(el).attr('src') ?? '', alt: $(el).attr('alt') ?? null }))
      .get(),
    jsonLd,
    jsonLdErrors,
  };
}

export function listPages(distDir: string): string[] {
  const pages: string[] = [];
  const walk = (dir: string, urlPath: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(path.join(dir, entry.name), `${urlPath}${entry.name}/`);
      else if (entry.name === 'index.html') pages.push(urlPath);
      else if (entry.name === '404.html' && urlPath === '/') pages.push('/404.html');
    }
  };
  walk(distDir, '/');
  return pages.sort();
}
