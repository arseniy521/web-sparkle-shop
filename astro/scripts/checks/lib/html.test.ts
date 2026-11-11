// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractFacts, listPages } from './html.ts';

const facts = (html: string, p = '/x/') => extractFacts(html, p);

describe('extractFacts', () => {
  it('reads the language and the path', () => {
    const f = facts('<html lang="ru"><head></head><body></body></html>', '/ru/');
    expect(f.lang).toBe('ru');
    expect(f.path).toBe('/ru/');
    expect(facts('<html><body></body></html>').lang).toBeNull();
  });

  it('collects title, description, keywords and robots', () => {
    const f = facts(
      `<html><head><title>T &amp; U</title>
       <meta name="description" content="D">
       <meta name="keywords" content="a, b">
       <meta name="robots" content="noindex, follow"></head></html>`,
    );
    expect(f.titles).toEqual(['T & U']);
    expect(f.descriptions).toEqual(['D']);
    expect(f.keywords).toEqual(['a, b']);
    expect(f.robots).toEqual(['noindex, follow']);
  });

  it('keeps every canonical, so a duplicate is visible', () => {
    const f = facts(
      '<link rel="canonical" href="https://www.nius.cz/a/"><link rel="canonical" href="https://www.nius.cz/b/">',
    );
    expect(f.canonicals).toHaveLength(2);
  });

  it('marks the canonical and robots tags set by react-helmet', () => {
    const f = facts(
      `<link rel="canonical" href="https://www.nius.cz/"><meta name="robots" content="index, follow">
       <link rel="canonical" href="https://www.nius.cz/a/" data-rh="true">
       <meta name="robots" content="noindex, follow" data-rh="true">`,
    );
    expect(f.helmetCanonicals).toEqual(['https://www.nius.cz/a/']);
    expect(f.helmetRobots).toEqual(['noindex, follow']);
    expect(facts('<link rel="canonical" href="https://www.nius.cz/a/">').helmetCanonicals).toEqual([]);
  });

  it('collects hreflang alternates only', () => {
    const f = facts(
      `<link rel="alternate" hreflang="cs" href="https://www.nius.cz/">
       <link rel="alternate" type="application/rss+xml" href="/feed.xml">`,
    );
    expect(f.hreflang).toEqual([{ hreflang: 'cs', href: 'https://www.nius.cz/' }]);
  });

  it('groups Open Graph values by property', () => {
    const f = facts(
      `<meta property="og:locale" content="cs_CZ">
       <meta property="og:locale:alternate" content="en_US">
       <meta property="og:locale:alternate" content="ru_RU">
       <meta name="twitter:card" content="summary">`,
    );
    expect(f.og).toEqual({
      'og:locale': ['cs_CZ'],
      'og:locale:alternate': ['en_US', 'ru_RU'],
    });
  });

  it('reads the meta refresh', () => {
    expect(facts('<meta http-equiv="refresh" content="0;url=https://www.nius.cz/a/">').metaRefresh)
      .toBe('0;url=https://www.nius.cz/a/');
    expect(facts('<p>x</p>').metaRefresh).toBeNull();
  });

  it('collects h1 and all headings with their level', () => {
    const f = facts('<h1>One</h1><h2> Two  <b>b</b></h2><h3>Three</h3>');
    expect(f.h1).toEqual(['One']);
    expect(f.headings).toEqual([
      { level: 1, text: 'One' },
      { level: 2, text: 'Two b' },
      { level: 3, text: 'Three' },
    ]);
  });

  it('keeps hidden text and drops script, style and nius-menu', () => {
    const f = facts(
      `<body><p>Visible   text</p><div class="sr-only">Hidden text</div>
       <nius-menu><p>Catalog</p></nius-menu>
       <script>var secret = 1;</script><style>.a{}</style></body>`,
    );
    expect(f.textBlocks).toEqual(['Visible text', 'Hidden text']);
  });

  it('keeps text placed directly in the body', () => {
    expect(facts('<body>Direct <b>bold</b></body>').textBlocks).toEqual(['Direct bold']);
  });

  it('joins inline elements into one run and cuts runs at other elements, in document order', () => {
    expect(facts('<body><p><b>A</b> B <i>C</i></p>D<div>E<p>F</p>G</div></body>').textBlocks).toEqual([
      'A B C',
      'D',
      'E',
      'F',
      'G',
    ]);
    expect(facts('<body><p><span>2800</span>Kč</p><p>Volejte<br>24 hodin</p></body>').textBlocks).toEqual([
      '2800Kč',
      'Volejte 24 hodin',
    ]);
    expect(facts('<body><p>A</p><template><p>T</p></template><noscript>N</noscript></body>').textBlocks).toEqual(['A']);
  });

  it('collects every body link with its text or aria-label', () => {
    const f = facts(
      '<head><link rel="canonical" href="/x/"></head><body><a href="/blog/"> Blog  </a>' +
        '<a href="tel:+420773629123" aria-label="Call"><svg></svg></a><a href="https://wa.me/1">WhatsApp</a></body>',
    );
    expect(f.links).toEqual([
      { href: '/blog/', text: 'Blog' },
      { href: 'tel:+420773629123', text: 'Call' },
      { href: 'https://wa.me/1', text: 'WhatsApp' },
    ]);
  });

  it('reduces internal links to the path without query and hash', () => {
    const f = facts(
      `<a href="/en/blog/?a=1#x">a</a><a href="#top">b</a><a href="https://example.com/">c</a>
       <a href="tel:+420123">d</a><a href="//cdn.example.com/x">e</a><a href="/brand/logo.svg">f</a>`,
    );
    expect(f.internalLinks).toEqual(['/en/blog/', '/brand/logo.svg']);
  });

  it('follows absolute, protocol-relative and relative links to the site itself', () => {
    const f = facts(
      `<a href="https://www.nius.cz/a/?q=1#h">1</a><a href="http://nius.cz/b/">2</a>
       <a href="//www.nius.cz/c/">3</a><a href="d/">4</a><a href="../e/">5</a>
       <a href="./f.html">6</a><a href="/p%C5%99/">7</a><a href="https://www.nius.cz">8</a>`,
      '/en/x/',
    );
    expect(f.internalLinks).toEqual(['/a/', '/b/', '/c/', '/en/x/d/', '/en/e/', '/en/x/f.html', '/př/', '/']);
  });

  it('ignores other hosts, other schemes, hash-only and query-only links', () => {
    const f = facts(
      `<a href="https://example.com/a/">1</a><a href="https://www.nius.com/">2</a>
       <a href="https://evilnius.cz/">3</a><a href="javascript:void(0)">4</a>
       <a href="mailto:a@b.cz">5</a><a href="tel:+420">6</a><a href="#a">7</a><a href="?x=1">8</a><a href="">9</a>`,
    );
    expect(f.internalLinks).toEqual([]);
  });

  it('reads images with a missing alt as null and an empty alt as empty', () => {
    const f = facts('<img src="/a.jpg"><img src="/b.jpg" alt=""><img src="/c.jpg" alt="C">');
    expect(f.images).toEqual([
      { src: '/a.jpg', alt: null },
      { src: '/b.jpg', alt: '' },
      { src: '/c.jpg', alt: 'C' },
    ]);
  });

  it('parses JSON-LD and reports a broken block with its position', () => {
    const f = facts(
      `<script type="application/ld+json">{"@type":"Thing"}</script>
       <script type="application/ld+json">{"@type": </script>`,
    );
    expect(f.jsonLd).toEqual([{ '@type': 'Thing' }]);
    expect(f.jsonLdErrors).toHaveLength(1);
    expect(f.jsonLdErrors[0]).toMatch(/^block 2:/);
  });
});

describe('listPages', () => {
  it('lists index.html directories and 404.html', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pages-'));
    for (const f of ['index.html', 'en/index.html', 'a/b/index.html', '404.html', 'a/other.html', 'x.txt']) {
      fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
      fs.writeFileSync(path.join(dir, f), '');
    }
    expect(listPages(dir)).toEqual(['/', '/404.html', '/a/b/', '/en/']);
    fs.rmSync(dir, { recursive: true });
  });
});
