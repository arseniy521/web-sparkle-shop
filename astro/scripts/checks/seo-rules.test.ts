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

  it('does not downgrade an unlisted finding', () => {
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
