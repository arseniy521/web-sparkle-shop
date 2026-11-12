// @vitest-environment node
import { describe, expect, it } from 'vitest';
import vm from 'node:vm';
import { buildRedirectStub, redirects, SITE_URL } from './redirects.mjs';

const TARGET = 'https://www.nius.cz/rehydratace-praha/';

// Runs the inline script of a stub against a fake `window` and returns the address it navigates to.
const runStubScript = (html, { search = '', hash = '' } = {}) => {
  const script = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!script) throw new Error('stub has no inline script');
  let replacedWith = null;
  const window = { location: { search, hash, replace: (url) => { replacedWith = url; } } };
  vm.runInNewContext(script[1], { window, location: window.location });
  return replacedWith;
};

describe('redirect stub', () => {
  it('carries no robots meta tag (a redirect must not be noindex)', () => {
    const html = buildRedirectStub(TARGET);
    expect(html).not.toMatch(/<meta[^>]*name="robots"/i);
    expect(html).not.toMatch(/noindex/i);
  });

  it('keeps the instant meta refresh and the canonical to the target', () => {
    const html = buildRedirectStub(TARGET);
    expect(html).toContain(`<meta http-equiv="refresh" content="0;url=${TARGET}">`);
    expect(html).toContain(`<link rel="canonical" href="${TARGET}">`);
  });

  it('puts the script redirect before the meta refresh fallback', () => {
    const html = buildRedirectStub(TARGET);
    expect(html.indexOf('<script>')).toBeGreaterThan(-1);
    expect(html.indexOf('<script>')).toBeLessThan(html.indexOf('http-equiv="refresh"'));
  });

  it('preserves the query string and the hash of the incoming URL', () => {
    const html = buildRedirectStub(TARGET);
    expect(runStubScript(html, { search: '?ref=K7M2QX&utm_source=x', hash: '#a' })).toBe(
      `${TARGET}?ref=K7M2QX&utm_source=x#a`,
    );
    expect(runStubScript(html)).toBe(TARGET);
  });

  it('escapes the target for the script and for HTML attributes', () => {
    const nasty = 'https://www.nius.cz/a"b/</script><script>alert(1)</script>/\u2028&x=1';
    const html = buildRedirectStub(nasty);
    // Exactly one script element: the target cannot close it or open another one.
    expect(html.match(/<script>/g)).toHaveLength(1);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html.split('<script>')[1].split('</script>')[0]).not.toContain('\u2028');
    expect(runStubScript(html, { search: '?q=1' })).toBe(`${nasty}?q=1`);
    expect(html).toContain('href="https://www.nius.cz/a&quot;b/&lt;/script&gt;');
  });
});

describe('redirect list', () => {
  it('sends every old address straight to an absolute final address with a trailing slash', () => {
    const sources = new Set(redirects.map((r) => r.from));
    expect(redirects.length).toBeGreaterThan(0);
    expect(sources.size).toBe(redirects.length);
    for (const { from, to } of redirects) {
      expect(from.startsWith('/')).toBe(true);
      expect(to.startsWith('/') && to.endsWith('/')).toBe(true);
      // No chains: a target is never itself an old address.
      expect(sources.has(to.replace(/\/$/, ''))).toBe(false);
    }
    expect(SITE_URL).toBe('https://www.nius.cz');
  });
});
