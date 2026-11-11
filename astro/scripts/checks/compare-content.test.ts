// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { comparePage } from './compare-content.ts';
import { extractFacts } from './lib/html.ts';

const PATH = '/sestricka-praha-1/';
const URL = `https://www.nius.cz${PATH}`;
const HREFLANG = `<link rel="alternate" hreflang="x-default" href="${URL}"><link rel="alternate" hreflang="cs" href="${URL}">`;

interface Page {
  head?: string;
  body?: string;
  title?: string;
  canonical?: string;
  hreflang?: string;
  path?: string;
}

function page({ head = '', body = '', title = 'T', canonical = `<link rel="canonical" href="${URL}">`, hreflang = HREFLANG, path = PATH }: Page) {
  return extractFacts(
    `<html lang="cs"><head><title>${title}</title><meta name="description" content="D">
     <meta name="robots" content="index, follow">${canonical}${hreflang}${head}</head><body>${body}</body></html>`,
    path,
  );
}

const jsonLd = (value: unknown) => `<script type="application/ld+json">${JSON.stringify(value)}</script>`;
const rules = (list: Array<{ rule: string }>) => list.map((f) => f.rule);

describe('comparePage', () => {
  it('reports nothing for identical pages', () => {
    const facts = page({ body: '<h1>A</h1><p>B</p><a href="/blog/">x</a><img src="/a.png" alt="a">' });
    expect(comparePage(facts, facts)).toEqual({ missing: [], added: [] });
  });

  it('reports old text missing from the new page', () => {
    const r = comparePage(page({ body: '<p>Rychlý příjezd</p><p>Celá Praha 1</p>' }), page({ body: '<p>Celá Praha 1</p>' }));
    expect(r.missing).toContainEqual(expect.objectContaining({ rule: 'text-missing', path: PATH, detail: 'Rychlý příjezd' }));
  });

  it('finds old text inside differently split new text', () => {
    const r = comparePage(page({ body: '<p>Celá Praha 1</p>' }), page({ body: '<p><b>Celá</b> Praha 1</p>' }));
    expect(r.missing).toEqual([]);
  });

  it('lists added text without failing', () => {
    const r = comparePage(page({ body: '<p>A</p>' }), page({ body: '<p>A</p><details><p>FAQ answer</p></details>' }));
    expect(r.missing).toEqual([]);
    expect(r.added).toContainEqual(expect.objectContaining({ rule: 'text-added', detail: 'FAQ answer' }));
  });

  it('does not accept an unlisted difference: a changed price inside a text block', () => {
    const r = comparePage(page({ body: '<p>Kapačka od 2380 Kč</p>' }), page({ body: '<p>Kapačka od 2480 Kč</p>' }));
    expect(r.missing).toContainEqual(expect.objectContaining({ rule: 'text-missing', detail: 'Kapačka od 2380 Kč' }));
  });

  it('does not find a removed run inside a longer one: Prague 1 next to Prague 10', () => {
    const r = comparePage(page({ body: '<ul><li>Prague 1</li><li>Prague 10</li></ul>' }), page({ body: '<ul><li>Prague 10</li></ul>' }));
    expect(r.missing).toContainEqual(expect.objectContaining({ rule: 'text-missing', detail: 'Prague 1' }));
  });

  it('reports a price that grew a digit', () => {
    const r = comparePage(page({ body: '<div><span>2800 Kč</span></div>' }), page({ body: '<div><span>12800 Kč</span></div>' }));
    expect(r.missing).toContainEqual(expect.objectContaining({ rule: 'text-missing', detail: '2800 Kč' }));
  });

  it('counts repeated runs: one of five identical runs removed', () => {
    const card = '<p>Rychlý příjezd</p>';
    const r = comparePage(page({ body: card.repeat(5) }), page({ body: card.repeat(4) }));
    expect(r.missing).toEqual([expect.objectContaining({ rule: 'text-missing', detail: 'Rychlý příjezd' })]);
  });

  it('reports prices swapped between cards as out of order', () => {
    const cards = (a: string, b: string) => `<div><h3>A</h3><p>${a}</p></div><div><h3>B</h3><p>${b}</p></div>`;
    const r = comparePage(page({ body: cards('1990 Kč', '2380 Kč') }), page({ body: cards('2380 Kč', '1990 Kč') }));
    expect(rules(r.missing)).toContain('text-order');
  });

  it('reports only a moved block as out of order, not every run after it', () => {
    const r = comparePage(page({ body: '<p>Banner</p><p>A</p><p>B</p>' }), page({ body: '<p>A</p><p>B</p><p>Banner</p>' }));
    expect(r.missing).toEqual([expect.objectContaining({ rule: 'text-order', detail: 'Banner' })]);
    expect(r.added).toEqual([]);
  });

  it('does not join a phrase across a block boundary', () => {
    const r = comparePage(page({ body: '<p>Volejte 24 hodin</p>' }), page({ body: '<p>Volejte</p><p>24 hodin denně</p>' }));
    expect(r.missing).toContainEqual(expect.objectContaining({ rule: 'text-missing', detail: 'Volejte 24 hodin' }));
  });

  it('reports a changed title, description and keywords', () => {
    const old = page({ title: 'Old', head: '<meta name="keywords" content="a, b">' });
    const r = comparePage(old, page({ title: 'New', head: '<meta name="keywords" content="a">' }));
    expect(r.missing).toContainEqual(expect.objectContaining({ rule: 'title', detail: 'old "Old", new "New"' }));
    expect(rules(r.missing)).toContain('keywords');
    const d = comparePage(page({}), extractFacts(`<html><head><title>T</title></head></html>`, PATH));
    expect(rules(d.missing)).toEqual(expect.arrayContaining(['description', 'robots', 'canonical']));
  });

  it('reports a heading that is missing, changed in level or out of order', () => {
    const old = page({ body: '<h1>A</h1><h2>B</h2><h2>C</h2>' });
    expect(comparePage(old, page({ body: '<h1>A</h1><h2>C</h2>' })).missing).toContainEqual(
      expect.objectContaining({ rule: 'heading-missing', detail: 'h2 B' }),
    );
    expect(rules(comparePage(old, page({ body: '<h1>A</h1><h3>B</h3><h2>C</h2>' })).missing)).toContain('heading-missing');
    expect(rules(comparePage(old, page({ body: '<h1>A</h1><h2>C</h2><h2>B</h2>' })).missing)).toContain('heading-missing');
  });

  it('reports a missing internal link and lists an added one', () => {
    const r = comparePage(page({ body: '<a href="/blog/">x</a>' }), page({ body: '<a href="/privacy/">x</a>' }));
    expect(r.missing).toContainEqual(expect.objectContaining({ rule: 'link-missing', detail: '/blog/ "x"' }));
    expect(r.added).toContainEqual(expect.objectContaining({ rule: 'link-added', detail: '/privacy/ "x"' }));
  });

  it('reports a card link retargeted to a page the header also links to', () => {
    const nav = '<nav><a href="/blog/">Blog</a><a href="/iv-kapacky-praha/">Kapačky</a></nav>';
    const r = comparePage(
      page({ body: nav + '<a href="/iv-kapacky-praha/">Více</a>' }),
      page({ body: nav + '<a href="/blog/">Více</a>' }),
    );
    expect(r.missing).toContainEqual(expect.objectContaining({ rule: 'link-missing', detail: '/iv-kapacky-praha/ "Více"' }));
  });

  it('reports a changed digit in a tel: link and a changed link text', () => {
    const old = page({ body: '<a href="tel:+420773629123">Zavolat</a><a href="/blog/">Blog</a>' });
    const r = comparePage(old, page({ body: '<a href="tel:+420773629124">Zavolat</a><a href="/blog/">Články</a>' }));
    expect(r.missing).toContainEqual(expect.objectContaining({ rule: 'link-missing', detail: 'tel:+420773629123 "Zavolat"' }));
    expect(r.missing).toContainEqual(expect.objectContaining({ rule: 'link-missing', detail: '/blog/ "Blog"' }));
  });

  it('reports one of two identical images removed', () => {
    const img = '<img src="/brand/a.svg" alt="NIUS">';
    const r = comparePage(page({ body: img + img }), page({ body: img }));
    expect(r.missing).toContainEqual(expect.objectContaining({ rule: 'image-missing', detail: '/brand/a.svg alt="NIUS"' }));
  });

  it('accepts approved differences 4 and 8: a link to /iv-drips-prague/ becomes /iv-kapacky-praha/', () => {
    const r = comparePage(page({ body: '<a href="/iv-drips-prague/">x</a>' }), page({ body: '<a href="/iv-kapacky-praha/">x</a>' }));
    expect(r).toEqual({ missing: [], added: [] });
  });

  it('does not accept a link to a page other than the redirect target', () => {
    const r = comparePage(page({ body: '<a href="/iv-drips-prague/">x</a>' }), page({ body: '<a href="/en/iv-drips-prague/">x</a>' }));
    expect(r.missing).toContainEqual(expect.objectContaining({ rule: 'link-missing', detail: '/iv-drips-prague/ (now /iv-kapacky-praha/) "x"' }));
  });

  it('reports a missing or changed image', () => {
    const old = page({ body: '<img src="/brand/a.svg" alt="NIUS">' });
    expect(comparePage(old, page({ body: '<img src="/brand/a.svg" alt="">' })).missing).toContainEqual(
      expect.objectContaining({ rule: 'image-missing', detail: '/brand/a.svg alt="NIUS"' }),
    );
    expect(rules(comparePage(old, page({ body: '<img src="/brand/b.svg" alt="NIUS">' })).missing)).toContain('image-missing');
  });

  it('accepts approved difference 5: a Vite asset and the same Astro asset', () => {
    const r = comparePage(
      page({ body: '<img src="/assets/drp-2-CJkRSYpf.webp" alt="a">' }),
      page({ body: '<img src="/_astro/drp-2.Bx81kQ2a.webp" alt="a">' }),
    );
    expect(r).toEqual({ missing: [], added: [] });
    const other = comparePage(
      page({ body: '<img src="/assets/drp-2-CJkRSYpf.webp" alt="a">' }),
      page({ body: '<img src="/_astro/drp-3.Bx81kQ2a.webp" alt="a">' }),
    );
    expect(rules(other.missing)).toContain('image-missing');
  });

  it('reports a changed JSON-LD value and names it', () => {
    const value = { '@context': 'https://schema.org', '@type': 'Service', offers: { price: '2380' } };
    const r = comparePage(page({ head: jsonLd(value) }), page({ head: jsonLd({ ...value, offers: { price: '2480' } }) }));
    expect(r.missing).toContainEqual(
      expect.objectContaining({ rule: 'jsonld-missing', detail: 'Service: offers.price old "2380", new "2480"' }),
    );
    expect(rules(r.added)).toContain('jsonld-added');
  });

  it('accepts approved difference 8 inside JSON-LD and nothing else', () => {
    const old = { '@type': 'Service', url: 'https://www.nius.cz/iv-drips-prague/' };
    expect(comparePage(page({ head: jsonLd(old) }), page({ head: jsonLd({ ...old, url: 'https://www.nius.cz/iv-kapacky-praha/' }) }))).toEqual({
      missing: [],
      added: [],
    });
    const wrong = comparePage(page({ head: jsonLd(old) }), page({ head: jsonLd({ ...old, url: 'https://www.nius.cz/blog/' }) }));
    expect(rules(wrong.missing)).toContain('jsonld-missing');
  });

  it('accepts approved difference 2: the page-specific canonical of two', () => {
    const old = page({
      canonical: `<link rel="canonical" href="https://www.nius.cz/"><link rel="canonical" href="${URL}" data-rh="true">`,
    });
    expect(comparePage(old, page({}))).toEqual({ missing: [], added: [] });
    expect(rules(comparePage(old, page({ canonical: '<link rel="canonical" href="https://www.nius.cz/">' })).missing)).toContain('canonical');
  });

  it('accepts approved difference 2 for robots', () => {
    const old = page({ head: '<meta name="robots" content="noindex, follow" data-rh="true">' });
    expect(rules(comparePage(old, page({})).missing)).toContain('robots');
    const neu = extractFacts(
      `<html lang="cs"><head><title>T</title><meta name="description" content="D"><meta name="robots" content="noindex, follow">
       <link rel="canonical" href="${URL}">${HREFLANG}</head></html>`,
      PATH,
    );
    expect(comparePage(old, neu)).toEqual({ missing: [], added: [] });
  });

  it('accepts approved difference 7: hreflang equals the manifest set, whatever the old one was', () => {
    const old = page({ hreflang: `<link rel="alternate" hreflang="en" href="https://www.nius.cz/en/">` });
    expect(comparePage(old, page({}))).toEqual({ missing: [], added: [] });
    expect(rules(comparePage(page({}), page({ hreflang: '' })).missing)).toContain('hreflang');
  });

  it('compares the 404 page, which has no manifest entry, with the old static 404 page', () => {
    const notFound = (body: string) =>
      extractFacts(`<html lang="en"><head><title>Page Not Found</title><meta name="robots" content="noindex"></head><body>${body}</body></html>`, '/404.html');
    const old = notFound('<h1>404</h1><p>Missing page.</p><a href="/">Go to Homepage</a>');
    expect(comparePage(old, old)).toEqual({ missing: [], added: [] });
    const r = comparePage(old, notFound('<h1>404</h1><a href="/">Go to Homepage</a>'));
    expect(r.missing).toEqual([expect.objectContaining({ rule: 'text-missing', path: '/404.html', detail: 'Missing page.' })]);
  });

  it('accepts approved difference 11: the privacy canonical follows the manifest', () => {
    const p = '/en/privacy/';
    const old = page({ path: p, hreflang: '', canonical: '<link rel="canonical" href="https://www.nius.cz/en/privacy/">' });
    const neu = page({ path: p, hreflang: '', canonical: '<link rel="canonical" href="https://www.nius.cz/privacy/">' });
    expect(comparePage(old, neu)).toEqual({ missing: [], added: [] });
    expect(rules(comparePage(neu, old).missing)).toContain('canonical');
  });
});
