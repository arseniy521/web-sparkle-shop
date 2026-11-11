// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { writeGoodDist } from './__fixtures__/good-dist.ts';
import { listPages } from './lib/html.ts';
import { checkDist } from './seo-rules.ts';
import type { Finding } from './seo-rules.ts';

const tmpDirs: string[] = [];

// A fresh copy of the good dist; `mutate` breaks exactly one thing in it.
function build(mutate?: (dir: string) => void): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-rules-'));
  tmpDirs.push(dir);
  writeGoodDist(dir);
  mutate?.(dir);
  return dir;
}

function edit(dir: string, rel: string, change: (text: string) => string): void {
  const file = path.join(dir, rel);
  const before = fs.readFileSync(file, 'utf8');
  const after = change(before);
  if (after === before) throw new Error(`mutation did not change ${rel}`);
  fs.writeFileSync(file, after);
}

const remove = (dir: string, rel: string) => fs.rmSync(path.join(dir, rel), { recursive: true });
const rulesOf = (findings: Finding[]) => [...new Set(findings.map((f) => f.rule))].sort();
const only = (dir: string) => rulesOf(checkDist({ distDir: dir }));

afterAll(() => {
  for (const dir of tmpDirs) fs.rmSync(dir, { recursive: true, force: true });
});

describe('the good dist', () => {
  it('reports nothing', () => {
    expect(checkDist({ distDir: build() })).toEqual([]);
  });

  it('reports nothing in production mode', () => {
    expect(checkDist({ distDir: build(), production: true })).toEqual([]);
  });
});

describe('manifest rules', () => {
  it('page-not-in-manifest: an HTML page with no manifest entry', () => {
    const dir = build((d) => {
      fs.mkdirSync(path.join(d, 'extra'));
      fs.writeFileSync(path.join(d, 'extra/index.html'), '<html></html>');
    });
    const findings = checkDist({ distDir: dir });
    expect(rulesOf(findings)).toEqual(['page-not-in-manifest']);
    expect(findings).toContainEqual(expect.objectContaining({ path: '/extra/' }));
  });

  for (const stray of ['foo.html', 'en/other.html']) {
    it(`page-not-in-manifest: a stray HTML file ${stray}`, () => {
      const dir = build((d) => {
        fs.mkdirSync(path.dirname(path.join(d, stray)), { recursive: true });
        fs.writeFileSync(path.join(d, stray), '<html></html>');
      });
      const findings = checkDist({ distDir: dir });
      expect(rulesOf(findings)).toEqual(['page-not-in-manifest']);
      expect(findings).toContainEqual(expect.objectContaining({ path: `/${stray}` }));
    });
  }

  it('manifest-page-missing: a manifest page with no HTML', () => {
    const dir = build((d) => remove(d, 'en/privacy'));
    const findings = checkDist({ distDir: dir });
    expect(rulesOf(findings)).toEqual(['manifest-page-missing']);
    expect(findings).toContainEqual(expect.objectContaining({ path: '/en/privacy/' }));
  });

  it('manifest-page-missing: is not reported for a page outside the scope', () => {
    const dir = build((d) => remove(d, 'en/privacy'));
    const scope = new Set(listPages(dir));
    expect(checkDist({ distDir: dir, scope })).toEqual([]);
  });

  it('manifest-page-missing: is reported for a scope path that is not built', () => {
    const dir = build((d) => remove(d, 'en/privacy'));
    const scope = new Set([...listPages(dir), '/en/privacy/']);
    expect(rulesOf(checkDist({ distDir: dir, scope }))).toEqual(['manifest-page-missing']);
  });

  it('manifest-page-missing: a missing redirect page is reported whatever the scope', () => {
    const dir = build((d) => remove(d, 'iv-drips-prague'));
    const findings = checkDist({ distDir: dir, scope: new Set(['/']) });
    expect(rulesOf(findings)).toEqual(['manifest-page-missing']);
    expect(findings).toContainEqual(expect.objectContaining({ path: '/iv-drips-prague/' }));
  });
});

describe('redirects and the 404 page', () => {
  const redirect = 'iv-drips-prague/index.html';
  const target = 'https://www.nius.cz/iv-kapacky-praha/';

  it('redirect-chain: the refresh target is another redirect', () => {
    const other = 'https://www.nius.cz/iv-drip-therapy-prague/';
    const dir = build((d) => edit(d, redirect, (t) => t.replaceAll(target, other)));
    const findings = checkDist({ distDir: dir });
    expect(rulesOf(findings)).toEqual(['redirect-chain']);
    expect(findings[0].path).toBe('/iv-drips-prague/');
  });

  it('redirect-chain: the refresh target is not a page', () => {
    const dir = build((d) =>
      edit(d, redirect, (t) => t.replaceAll(target, 'https://www.nius.cz/nowhere/')),
    );
    expect(only(dir)).toEqual(['redirect-chain']);
  });

  it('redirect-content: no meta refresh', () => {
    const dir = build((d) => edit(d, redirect, (t) => t.replace(/<meta http-equiv="refresh"[^>]*>/, '')));
    expect(only(dir)).toEqual(['redirect-content']);
  });

  it('redirect-content: no canonical', () => {
    const dir = build((d) => edit(d, redirect, (t) => t.replace(/<link rel="canonical"[^>]*>/, '')));
    expect(only(dir)).toEqual(['redirect-content']);
  });

  it('redirect-content: no visible link', () => {
    const dir = build((d) =>
      edit(d, redirect, (t) => t.replace(/<a href[^>]*>Click here<\/a>/, 'Click here')),
    );
    expect(only(dir)).toEqual(['redirect-content']);
  });

  it('redirect-content: refreshes to a page other than the manifest target', () => {
    const dir = build((d) => edit(d, redirect, (t) => t.replaceAll(target, 'https://www.nius.cz/en/')));
    expect(only(dir)).toEqual(['redirect-content']);
  });

  it('missing-noindex: a redirect page without noindex', () => {
    const dir = build((d) => edit(d, redirect, (t) => t.replace('noindex', 'index')));
    expect(only(dir)).toEqual(['missing-noindex']);
  });

  it('missing-noindex: the 404 page without noindex', () => {
    const dir = build((d) => edit(d, '404.html', (t) => t.replace('noindex', 'index')));
    const findings = checkDist({ distDir: dir });
    expect(rulesOf(findings)).toEqual(['missing-noindex']);
    expect(findings[0].path).toBe('/404.html');
  });
});

describe('404 page content', () => {
  it('notfound-content: no link to the home page', () => {
    const dir = build((d) => edit(d, '404.html', (t) => t.replace('<a href="/">Home</a>', 'Home')));
    const findings = checkDist({ distDir: dir });
    expect(rulesOf(findings)).toEqual(['notfound-content']);
    expect(findings[0].path).toBe('/404.html');
  });
});

describe('robots.txt and required files', () => {
  it('robots-txt: no Sitemap line', () => {
    const dir = build((d) => edit(d, 'robots.txt', (t) => t.replace(/Sitemap:.*\n/, '')));
    expect(only(dir)).toEqual(['robots-txt']);
  });

  it('robots-txt: a Disallow with a path', () => {
    const dir = build((d) => edit(d, 'robots.txt', (t) => t.replace('Allow: /', 'Disallow: /private/')));
    expect(only(dir)).toEqual(['robots-txt']);
  });

  it('robots-txt: an empty Disallow is allowed', () => {
    const dir = build((d) => edit(d, 'robots.txt', (t) => t.replace('Allow: /', 'Disallow:')));
    expect(checkDist({ distDir: dir })).toEqual([]);
  });

  for (const file of ['CNAME', '.nojekyll', 'robots.txt', 'sitemap.xml', '404.html']) {
    it(`required-files: ${file} is missing`, () => {
      const dir = build((d) => remove(d, file));
      const findings = checkDist({ distDir: dir });
      expect(findings).toContainEqual(
        expect.objectContaining({ rule: 'required-files', path: `/${file}` }),
      );
    });
  }

  it('required-files: a missing 404 page is the only finding', () => {
    const dir = build((d) => remove(d, '404.html'));
    expect(only(dir)).toEqual(['required-files']);
  });

  it('required-files: CNAME with another host', () => {
    const dir = build((d) => edit(d, 'CNAME', () => 'nius.cz\n'));
    expect(only(dir)).toEqual(['required-files']);
  });
});

describe('head of a page', () => {
  const page = 'en/birthday-gift-prague/index.html';
  const url = 'https://www.nius.cz/en/birthday-gift-prague/';
  const breakPage = (change: (text: string) => string) => build((d) => edit(d, page, change));
  const drop = (pattern: RegExp) => (t: string) => t.replace(pattern, '');
  const expectOnly = (dir: string, rule: string, pagePath = '/en/birthday-gift-prague/') => {
    const findings = checkDist({ distDir: dir });
    expect(rulesOf(findings)).toEqual([rule]);
    expect(findings).toContainEqual(expect.objectContaining({ path: pagePath }));
  };

  it('single-title: no title', () => {
    expectOnly(breakPage(drop(/<title>.*?<\/title>/)), 'single-title');
  });
  it('single-title: two titles', () => {
    expectOnly(breakPage((t) => t.replace('</head>', '<title>Second</title></head>')), 'single-title');
  });
  it('single-title: the title of an inline SVG icon in the body is not a page title', () => {
    const dir = breakPage((t) => t.replace('</body>', '<svg viewBox="0 0 24 24"><title>Icon</title></svg></body>'));
    expect(checkDist({ distDir: dir })).toEqual([]);
  });
  it('single-title: an empty title', () => {
    expectOnly(breakPage((t) => t.replace(/<title>.*?<\/title>/, '<title> </title>')), 'single-title');
  });

  it('single-description: no description', () => {
    expectOnly(breakPage(drop(/<meta name="description"[^>]*>/)), 'single-description');
  });
  it('single-description: an empty description', () => {
    expectOnly(
      breakPage((t) => t.replace(/(<meta name="description" content=")[^"]*"/, '$1"')),
      'single-description',
    );
  });

  it('single-robots: no robots', () => {
    expectOnly(breakPage(drop(/<meta name="robots"[^>]*>/)), 'single-robots');
  });
  it('single-robots: two robots', () => {
    expectOnly(
      breakPage((t) => t.replace('</head>', '<meta name="robots" content="index"></head>')),
      'single-robots',
    );
  });

  it('single-canonical: no canonical', () => {
    expectOnly(breakPage(drop(/<link rel="canonical"[^>]*>/)), 'single-canonical');
  });
  it('single-canonical: two canonicals', () => {
    expectOnly(
      breakPage((t) => t.replace('</head>', `<link rel="canonical" href="${url}"></head>`)),
      'single-canonical',
    );
  });

  it('single-h1: no h1', () => {
    expectOnly(breakPage(drop(/<h1>.*?<\/h1>/)), 'single-h1');
  });
  it('single-h1: two h1', () => {
    expectOnly(breakPage((t) => t.replace('</body>', '<h1>Another</h1></body>')), 'single-h1');
  });

  it('html-lang: lang differs from the language of the address', () => {
    expectOnly(breakPage((t) => t.replace('<html lang="en">', '<html lang="cs">')), 'html-lang');
  });

  it('canonical-value: canonical points to another page', () => {
    const other = 'https://www.nius.cz/en/blog/';
    const dir = breakPage((t) =>
      t
        .replace(`<link rel="canonical" href="${url}">`, `<link rel="canonical" href="${other}">`)
        .replace(`property="og:url" content="${url}"`, `property="og:url" content="${other}"`),
    );
    expectOnly(dir, 'canonical-value');
  });
  it('canonical-value: a privacy page under a prefix must point to /privacy/', () => {
    const own = 'https://www.nius.cz/ru/privacy/';
    const dir = build((d) =>
      edit(d, 'ru/privacy/index.html', (t) =>
        t.replaceAll('https://www.nius.cz/privacy/', own),
      ),
    );
    expectOnly(dir, 'canonical-value', '/ru/privacy/');
  });

  it('canonical-target-missing: the canonical target is not in the build', () => {
    const dir = build((d) => remove(d, 'privacy'));
    const scope = new Set(listPages(dir));
    const findings = checkDist({ distDir: dir, scope });
    expect(rulesOf(findings)).toEqual(['canonical-target-missing']);
    expect(findings).toContainEqual(expect.objectContaining({ path: '/ru/privacy/' }));
  });

  it('hreflang-set: the set differs from the manifest', () => {
    const dir = build((d) => {
      for (const p of ['narozeninovy-darek-praha', 'en/birthday-gift-prague', 'ru/podatok-k-dnju-rozhdenija-praga']) {
        edit(d, `${p}/index.html`, drop(/<link rel="alternate" hreflang="x-default"[^>]*>/));
      }
    });
    const findings = checkDist({ distDir: dir });
    expect(rulesOf(findings)).toEqual(['hreflang-set']);
    expect(findings).toContainEqual(expect.objectContaining({ path: '/en/birthday-gift-prague/' }));
  });
  it('hreflang-set: a page that must have no hreflang lists one', () => {
    const dir = build((d) =>
      edit(d, 'ru/privacy/index.html', (t) =>
        t.replace('</head>', '<link rel="alternate" hreflang="ru" href="https://www.nius.cz/ru/privacy/"></head>'),
      ),
    );
    expectOnly(dir, 'hreflang-set', '/ru/privacy/');
  });

  it('hreflang-not-reciprocal: a listed page is not in the build', () => {
    const dir = build((d) => remove(d, 'ru/podatok-k-dnju-rozhdenija-praga'));
    const findings = checkDist({ distDir: dir, scope: new Set(listPages(dir)) });
    expect(rulesOf(findings)).toEqual(['hreflang-not-reciprocal']);
    expect(findings.map((f) => f.detail).join('\n')).toContain('not in the build');
  });
  it('hreflang-not-reciprocal: a listed page is closed to indexing', () => {
    const dir = build((d) =>
      edit(d, 'ru/podatok-k-dnju-rozhdenija-praga/index.html', (t) =>
        t.replace('index, follow', 'noindex, follow'),
      ),
    );
    const findings = checkDist({ distDir: dir });
    expect(rulesOf(findings)).toEqual(['hreflang-not-reciprocal', 'unexpected-noindex']);
    expect(findings.map((f) => f.detail).join('\n')).toContain('noindex');
  });
  it('hreflang-not-reciprocal: a listed page lists another set', () => {
    const dir = build((d) =>
      edit(d, 'ru/podatok-k-dnju-rozhdenija-praga/index.html', drop(/<link rel="alternate" hreflang="x-default"[^>]*>/)),
    );
    const findings = checkDist({ distDir: dir });
    expect(rulesOf(findings)).toEqual(['hreflang-not-reciprocal', 'hreflang-set']);
    expect(findings.map((f) => f.detail).join('\n')).toContain('different set');
  });

  it('unexpected-noindex: noindex on a page that must be indexed', () => {
    const dir = build((d) =>
      edit(d, 'en/iv-drip-hotel-prague/index.html', (t) => t.replace('index, follow', 'noindex, follow')),
    );
    expectOnly(dir, 'unexpected-noindex', '/en/iv-drip-hotel-prague/');
  });

  it('missing-noindex: a page that must be closed is open', () => {
    const dir = build((d) => edit(d, 'ru/blog/index.html', (t) => t.replace('noindex, follow', 'index, follow')));
    expectOnly(dir, 'missing-noindex', '/ru/blog/');
  });
  it('missing-noindex: a page that must be closed says noindex without follow', () => {
    const dir = build((d) => edit(d, 'uk/blog/index.html', (t) => t.replace('noindex, follow', 'noindex')));
    expectOnly(dir, 'missing-noindex', '/uk/blog/');
  });
  it('robots-value: an indexable page with nofollow', () => {
    const dir = build((d) =>
      edit(d, 'en/iv-drip-hotel-prague/index.html', (t) => t.replace('index, follow', 'index, nofollow')),
    );
    expectOnly(dir, 'robots-value', '/en/iv-drip-hotel-prague/');
  });

  const ogCases: Array<[string, (t: string) => string]> = [
    ['og:url differs from canonical', (t) => t.replace(`property="og:url" content="${url}"`, 'property="og:url" content="https://www.nius.cz/en/"')],
    ['og:title differs from title', (t) => t.replace(/(property="og:title" content=")[^"]*/, '$1Other')],
    ['og:description differs from description', (t) => t.replace(/(property="og:description" content=")[^"]*/, '$1Other')],
    ['no og:locale', drop(/<meta property="og:locale" content="[^"]*">/)],
    ['og:image is not absolute', (t) => t.replace('content="https://www.nius.cz/og-image.jpg"', 'content="/og-image.jpg"')],
    ['og:image file is missing', (t) => t.replace('og-image.jpg', 'missing.jpg')],
    ['og:locale is not the page locale', (t) => t.replace('property="og:locale" content="en_US"', 'property="og:locale" content="cs_CZ"')],
    ['og:locale:alternate misses a locale', drop(/<meta property="og:locale:alternate" content="cs_CZ">/)],
    ['og:locale:alternate repeats the page locale', (t) => t.replace('content="cs_CZ"', 'content="en_US"')],
    ['no og:type', drop(/<meta property="og:type"[^>]*>/)],
    ['an empty og:type', (t) => t.replace('property="og:type" content="website"', 'property="og:type" content=""')],
    ['og:site_name differs', (t) => t.replace('content="Nurse in Prague"', 'content="Other"')],
    ['og:image:width is not 1200', (t) => t.replace('property="og:image:width" content="1200"', 'property="og:image:width" content="1000"')],
    ['og:image:height is not 630', drop(/<meta property="og:image:height"[^>]*>/)],
    ['twitter:card is not summary_large_image', (t) => t.replace('content="summary_large_image"', 'content="summary"')],
    ['twitter:title differs from title', (t) => t.replace(/(name="twitter:title" content=")[^"]*/, '$1Other')],
    ['twitter:description differs from description', (t) => t.replace(/(name="twitter:description" content=")[^"]*/, '$1Other')],
    ['twitter:image differs from og:image', (t) => t.replace(/(name="twitter:image" content=")[^"]*/, '$1https://www.nius.cz/other.jpg')],
  ];
  for (const [name, change] of ogCases) {
    it(`og-mismatch: ${name}`, () => {
      expectOnly(breakPage(change), 'og-mismatch');
    });
  }

  it('jsonld-invalid: JSON-LD that does not parse', () => {
    expectOnly(breakPage((t) => t.replace('"@type":"WebPage"', '"@type":')), 'jsonld-invalid');
  });

  it('jsonld-url-not-page: a site address that is a redirect', () => {
    const dir = breakPage((t) =>
      t.replace(`"url":"${url}"`, `"url":"${url}","sameAs":"https://www.nius.cz/iv-drips-prague/"`),
    );
    expectOnly(dir, 'jsonld-url-not-page');
  });
  it('jsonld-url-not-page: a site address that is not in the manifest', () => {
    const dir = breakPage((t) =>
      t.replace(`"url":"${url}"`, `"url":"${url}","sameAs":"https://www.nius.cz/nowhere/"`),
    );
    expectOnly(dir, 'jsonld-url-not-page');
  });
  it('jsonld-url-not-page: files and external addresses are fine', () => {
    const dir = breakPage((t) =>
      t.replace(
        `"url":"${url}"`,
        `"url":"${url}","logo":"https://www.nius.cz/og-image.jpg","sameAs":"https://example.com/x/"`,
      ),
    );
    expect(checkDist({ distDir: dir })).toEqual([]);
  });
});

describe('FAQ markup', () => {
  const page = 'en/birthday-gift-prague/index.html';
  const questions = [
    { q: 'How fast?', a: 'Within <b>one</b> hour.' },
    { q: 'How much?', a: 'See the price list.' },
  ];

  function withFaq(options: { block?: boolean; ld?: unknown; items?: typeof questions } = {}) {
    const { block = true, items = questions } = options;
    const ld =
      'ld' in options
        ? options.ld
        : {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: questions.map((x) => ({
              '@type': 'Question',
              name: x.q,
              acceptedAnswer: { '@type': 'Answer', text: `<p>${x.a}</p>` },
            })),
          };
    const html = items
      .map(
        (x) =>
          `<div data-faq-item><h3 data-faq-question>  ${x.q} </h3><div data-faq-answer><p>${x.a}</p>\n</div></div>`,
      )
      .join('');
    return build((d) =>
      edit(d, page, (t) => {
        let out = t;
        if (ld) out = out.replace('</head>', `<script type="application/ld+json">${JSON.stringify(ld)}</script></head>`);
        if (block) out = out.replace('</body>', `<section data-faq>${html}</section></body>`);
        return out;
      }),
    );
  }

  it('passes when the markup equals the block, tags and spacing aside', () => {
    expect(checkDist({ distDir: withFaq() })).toEqual([]);
  });
  it('passes for a FAQPage inside @graph', () => {
    const ld = { '@graph': [{ '@type': 'FAQPage', mainEntity: [{ name: 'Q', acceptedAnswer: { text: 'A' } }] }] };
    expect(checkDist({ distDir: withFaq({ ld, items: [{ q: 'Q', a: 'A' }] }) })).toEqual([]);
  });

  it('jsonld-faq-mismatch: an answer differs', () => {
    const dir = withFaq({ items: [questions[0], { q: 'How much?', a: 'Another answer.' }] });
    const findings = checkDist({ distDir: dir });
    expect(rulesOf(findings)).toEqual(['jsonld-faq-mismatch']);
    expect(findings[0].path).toBe('/en/birthday-gift-prague/');
  });
  it('jsonld-faq-mismatch: the order differs', () => {
    expect(rulesOf(checkDist({ distDir: withFaq({ items: [...questions].reverse() }) }))).toEqual([
      'jsonld-faq-mismatch',
    ]);
  });
  it('jsonld-faq-mismatch: a question is missing from the block', () => {
    expect(rulesOf(checkDist({ distDir: withFaq({ items: [questions[0]] }) }))).toEqual([
      'jsonld-faq-mismatch',
    ]);
  });
  it('jsonld-faq-mismatch: FAQPage without a FAQ block', () => {
    expect(rulesOf(checkDist({ distDir: withFaq({ block: false }) }))).toEqual(['jsonld-faq-mismatch']);
  });
  it('jsonld-faq-mismatch: a FAQ block without FAQPage', () => {
    expect(rulesOf(checkDist({ distDir: withFaq({ ld: null }) }))).toEqual(['jsonld-faq-mismatch']);
  });
});

describe('links and images', () => {
  const page = 'en/birthday-gift-prague/index.html';
  const withBody = (body: string, mutate?: (dir: string) => void) =>
    build((d) => {
      mutate?.(d);
      edit(d, page, (t) => t.replace('</body>', `${body}</body>`));
    });
  const link = (href: string) => `<a href="${href}">x</a>`;
  const expectOnly = (dir: string, rule: string, detail: string) => {
    const findings = checkDist({ distDir: dir });
    expect(rulesOf(findings)).toEqual([rule]);
    expect(findings).toContainEqual(
      expect.objectContaining({ path: '/en/birthday-gift-prague/', detail: expect.stringContaining(detail) }),
    );
  };

  it('link-to-redirect: a link to a redirect source', () => {
    expectOnly(withBody(link('/iv-drips-prague/')), 'link-to-redirect', '/iv-drips-prague/');
  });
  it('link-to-redirect: query and hash do not hide the redirect', () => {
    expectOnly(withBody(link('/iv-drips-prague/?a=1#x')), 'link-to-redirect', '/iv-drips-prague/');
  });
  it('link-to-redirect: a scope does not excuse a redirect', () => {
    const dir = withBody(link('/iv-drips-prague/'));
    const findings = checkDist({ distDir: dir, scope: new Set(listPages(dir)) });
    expect(rulesOf(findings)).toEqual(['link-to-redirect']);
  });

  it('link-to-redirect: an absolute link to the site', () => {
    expectOnly(withBody(link('https://www.nius.cz/iv-drips-prague/')), 'link-to-redirect', '/iv-drips-prague/');
  });
  it('link-to-redirect: a relative link', () => {
    expectOnly(withBody(link('../../iv-drips-prague/')), 'link-to-redirect', '/iv-drips-prague/');
  });
  it('link-broken: an absolute link to a missing page', () => {
    expectOnly(withBody(link('http://nius.cz/nowhere/')), 'link-broken', '/nowhere/');
  });
  it('link-broken: a link to an address that does not exist', () => {
    expectOnly(withBody(link('/nowhere/')), 'link-broken', '/nowhere/');
  });
  it('link-broken: a link to a missing file', () => {
    expectOnly(withBody(link('/brand/missing.svg')), 'link-broken', '/brand/missing.svg');
  });
  it('link-broken: a page address without the trailing slash', () => {
    expectOnly(withBody(link('/blog')), 'link-broken', '/blog');
  });
  it('link-broken: a manifest page that is not built, unless a scope is given', () => {
    const dir = withBody(link('/sestricka-praha-vinohrady/'), (d) => remove(d, 'sestricka-praha-vinohrady'));
    expect(rulesOf(checkDist({ distDir: dir }))).toEqual(['link-broken', 'manifest-page-missing']);
    expect(checkDist({ distDir: dir, scope: new Set(listPages(dir)) })).toEqual([]);
  });
  it('ignores hash-only, external, tel, mailto links and links to built pages and files', () => {
    const body = ['#top', 'https://example.com/x', 'tel:+420123456789', 'mailto:a@b.cz', '/blog/', '/brand/logo.svg', '/sitemap.xml', '/en/blog/?a=1#x']
      .map(link)
      .join('');
    expect(checkDist({ distDir: withBody(body) })).toEqual([]);
  });

  it('image-no-alt: an image without alt', () => {
    expectOnly(withBody('<img src="/og-image.jpg">'), 'image-no-alt', '/og-image.jpg');
  });
  it('image-no-alt: an empty alt is allowed', () => {
    expect(checkDist({ distDir: withBody('<img src="/og-image.jpg" alt="">') })).toEqual([]);
  });
  it('image-missing: a file that is not in the build', () => {
    expectOnly(withBody('<img src="/photos/missing.jpg" alt="x">'), 'image-missing', '/photos/missing.jpg');
  });
  it('image-missing: an absolute site address of a missing file', () => {
    expectOnly(
      withBody('<img src="https://www.nius.cz/photos/missing.jpg" alt="x">'),
      'image-missing',
      'photos/missing.jpg',
    );
  });
  it('image-missing: a relative path and a percent-encoded path', () => {
    expectOnly(withBody('<img src="../../photos/missing.jpg" alt="x">'), 'image-missing', 'missing.jpg');
    expectOnly(withBody('<img src="/photos/m%C5%99.jpg" alt="x">'), 'image-missing', 'm%C5%99.jpg');
  });
  it('image-missing: a relative path to an existing file is fine', () => {
    expect(checkDist({ distDir: withBody('<img src="../../og-image.jpg" alt="x">') })).toEqual([]);
  });
  it('image-missing: external and inline images are not checked', () => {
    const body = '<img src="https://cdn.example.com/a.jpg" alt="x"><img src="data:image/gif;base64,AAAA" alt="x">';
    expect(checkDist({ distDir: withBody(body) })).toEqual([]);
  });
});

describe('sitemap', () => {
  const block = (loc: string) => new RegExp(`<url><loc>${loc}</loc>.*?</url>\\n?`, 's');
  const sitemap = (change: (text: string) => string) => build((d) => edit(d, 'sitemap.xml', change));
  const addUrl = (loc: string) => (t: string) => t.replace('</urlset>', `<url><loc>${loc}</loc></url>\n</urlset>`);

  it('sitemap-missing-page: an indexable page is absent', () => {
    const dir = sitemap((t) => t.replace(block('https://www.nius.cz/en/iv-drip-hotel-prague/'), ''));
    const findings = checkDist({ distDir: dir });
    expect(rulesOf(findings)).toEqual(['sitemap-missing-page']);
    expect(findings).toContainEqual(expect.objectContaining({ path: '/en/iv-drip-hotel-prague/' }));
  });

  const extras: Array<[string, string, string]> = [
    ['a page with the privacy prefix', 'https://www.nius.cz/ru/privacy/', '/ru/privacy/'],
    ['a noindex page', 'https://www.nius.cz/ru/blog/', '/ru/blog/'],
    ['a redirect', 'https://www.nius.cz/iv-drips-prague/', '/iv-drips-prague/'],
    ['an address that does not exist', 'https://www.nius.cz/nowhere/', '/nowhere/'],
  ];
  for (const [name, loc, pagePath] of extras) {
    it(`sitemap-extra-url: ${name}`, () => {
      const findings = checkDist({ distDir: sitemap(addUrl(loc)) });
      expect(rulesOf(findings)).toEqual(['sitemap-extra-url']);
      expect(findings).toContainEqual(expect.objectContaining({ path: pagePath }));
    });
  }

  it('sitemap-alternates: x-default of the blog points to /en/blog/', () => {
    const dir = sitemap((t) =>
      t.replace(block('https://www.nius.cz/blog/'), (m) =>
        m.replace('hreflang="x-default" href="https://www.nius.cz/blog/"', 'hreflang="x-default" href="https://www.nius.cz/en/blog/"'),
      ),
    );
    const findings = checkDist({ distDir: dir });
    expect(rulesOf(findings)).toEqual(['sitemap-alternates']);
    expect(findings[0].path).toBe('/blog/');
    expect(findings[0].detail).toContain('x-default=https://www.nius.cz/blog/');
  });
  it('sitemap-alternates: an alternate is missing', () => {
    const dir = sitemap((t) =>
      t.replace(block('https://www.nius.cz/blog/'), (m) => m.replace(/<xhtml:link[^>]*hreflang="en"[^>]*\/>/, '')),
    );
    expect(rulesOf(checkDist({ distDir: dir }))).toEqual(['sitemap-alternates']);
  });
});

describe('preview artifacts in a production build', () => {
  const production = (dir: string) => rulesOf(checkDist({ distDir: dir, production: true }));
  const write = (dir: string, rel: string, content: string) => {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), content);
  };

  it('preview-artifact: robots.txt closes the whole site', () => {
    const dir = build((d) => edit(d, 'robots.txt', (t) => t.replace('Allow: /', 'Disallow: /')));
    expect(production(dir)).toEqual(['preview-artifact', 'robots-txt']);
  });
  it('preview-artifact: a functions directory', () => {
    const dir = build((d) => write(d, 'functions/api/[[path]].js', 'export {}'));
    expect(production(dir)).toEqual(['preview-artifact']);
  });
  it('preview-artifact: a _headers file with X-Robots-Tag', () => {
    const dir = build((d) => write(d, '_headers', '/*\n  X-Robots-Tag: noindex\n'));
    expect(production(dir)).toEqual(['preview-artifact']);
  });
  it('preview-artifact: a _headers file without X-Robots-Tag is fine', () => {
    const dir = build((d) => write(d, '_headers', '/*\n  Cache-Control: max-age=60\n'));
    expect(production(dir)).toEqual([]);
  });
  it('preview-artifact: the code has a relative API address', () => {
    const dir = build((d) => edit(d, '_astro/app.js', (t) => t.replace('https://app.nius.cz/api', '/api')));
    expect(production(dir)).toEqual(['preview-artifact']);
  });
  it('preview-artifact: no script directory at all', () => {
    const dir = build((d) => remove(d, '_astro'));
    expect(production(dir)).toEqual(['preview-artifact']);
  });
  it('preview-artifact: a noindex page is reported once, as unexpected-noindex', () => {
    const dir = build((d) =>
      edit(d, 'en/iv-drip-hotel-prague/index.html', (t) => t.replace('index, follow', 'noindex, follow')),
    );
    expect(production(dir)).toEqual(['unexpected-noindex']);
  });
  it('preview-artifact: is not checked without the production flag', () => {
    const dir = build((d) => {
      write(d, 'functions/api.js', 'export {}');
      write(d, '_headers', 'X-Robots-Tag: noindex');
      edit(d, '_astro/app.js', (t) => t.replace('https://app.nius.cz/api', '/api'));
    });
    expect(checkDist({ distDir: dir })).toEqual([]);
  });
});

describe('known defects', () => {
  const known = [
    { rule: 'page-not-in-manifest', path: '/old-page/', note: 'old page' },
    { rule: 'page-not-in-manifest', path: '/new-page/', note: 'listed by mistake' },
  ];
  const withExtras = () =>
    build((d) => {
      for (const p of ['old-page', 'new-page']) {
        fs.mkdirSync(path.join(d, p));
        fs.writeFileSync(path.join(d, p, 'index.html'), '<html></html>');
      }
    });

  it('downgrades a listed defect outside the scope and keeps one inside it', () => {
    const dir = withExtras();
    const scope = new Set(listPages(dir).filter((p) => p !== '/old-page/'));
    const findings = checkDist({ distDir: dir, scope, knownDefects: known });
    expect(findings.find((f) => f.path === '/old-page/')?.known).toBe(true);
    expect(findings.find((f) => f.path === '/new-page/')?.known).toBeUndefined();
  });

  it('downgrades only the listed path and keeps the other finding as it is', () => {
    const dir = withExtras();
    const scope = new Set(listPages(dir).filter((p) => p !== '/old-page/' && p !== '/new-page/'));
    const findings = checkDist({ distDir: dir, scope, knownDefects: [known[0]] });
    expect(findings.find((f) => f.path === '/old-page/')?.known).toBe(true);
    expect(findings.find((f) => f.path === '/new-page/')?.known).toBeUndefined();
  });

  it('downgrades nothing when there is no scope', () => {
    const findings = checkDist({ distDir: withExtras(), knownDefects: known });
    expect(findings.every((f) => f.known === undefined)).toBe(true);
  });
});
