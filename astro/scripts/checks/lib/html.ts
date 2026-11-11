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
  keywords: string[];
  robots: string[];
  canonicals: string[];
  // The old site carries a static tag from index.html and the page-specific one from react-helmet.
  helmetCanonicals: string[];
  helmetRobots: string[];
  hreflang: Array<{ hreflang: string; href: string }>;
  og: Record<string, string[]>;
  metaRefresh: string | null;
  h1: string[];
  headings: Array<{ level: number; text: string }>;
  textBlocks: string[]; // normalized text nodes, hidden ones included; script/style excluded
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

// The decoded path of a link or image address that points to the site itself, else null.
// Query and hash are dropped; relative addresses resolve against the page path.
export function sitePathOf(href: string, pagePath: string): string | null {
  const value = href.trim();
  if (value === '' || value.startsWith('#') || value.startsWith('?')) return null;
  let url: URL;
  try {
    url = new URL(value, SITE_ORIGIN + pagePath);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol) || !SITE_HOSTS.includes(url.hostname)) return null;
  try {
    return decodeURIComponent(url.pathname);
  } catch {
    return url.pathname;
  }
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

  const textBlocks: string[] = [];
  const $text = load(html);
  $text('script, style, nius-menu').remove();
  // Depth-first, so the blocks keep document order and can be joined into the page text.
  const walk = (nodes: ReturnType<typeof $text>) =>
    nodes.contents().each((_, node) => {
      if (node.type === 'text') {
        const text = normalizeText((node as unknown as { data: string }).data);
        if (text) textBlocks.push(text);
      } else if (node.type === 'tag') {
        walk($text(node));
      }
    });
  walk($text('body'));

  return {
    path: pagePath,
    lang: $('html').attr('lang') ?? null,
    titles: $('title')
      .map((_, el) => $(el).text())
      .get(),
    descriptions: metaContents($, 'meta[name="description"]'),
    keywords: metaContents($, 'meta[name="keywords"]'),
    robots: metaContents($, 'meta[name="robots"]'),
    canonicals: $('link[rel="canonical"]')
      .map((_, el) => $(el).attr('href') ?? '')
      .get(),
    helmetCanonicals: $('link[rel="canonical"][data-rh]')
      .map((_, el) => $(el).attr('href') ?? '')
      .get(),
    helmetRobots: metaContents($, 'meta[name="robots"][data-rh]'),
    hreflang: $('link[rel="alternate"][hreflang]')
      .map((_, el) => ({ hreflang: $(el).attr('hreflang') as string, href: $(el).attr('href') ?? '' }))
      .get(),
    og,
    metaRefresh: $('meta[http-equiv="refresh" i]').attr('content') ?? null,
    h1: $('h1')
      .map((_, el) => normalizeText($(el).text()))
      .get(),
    headings: $('h1, h2, h3, h4, h5, h6')
      .map((_, el) => ({
        level: Number((el as unknown as { name: string }).name.slice(1)),
        text: normalizeText($(el).text()),
      }))
      .get(),
    textBlocks,
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
