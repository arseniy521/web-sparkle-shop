import { describe, expect, it } from 'vitest';
import { getPage } from '@/routes/urls.ts';
import { buildHead, serializeJsonLd } from './head';

const meta = { title: 'T', description: 'D' };

describe('buildHead', () => {
  it('builds one canonical with the site origin', () =>
    expect(buildHead(getPage('iv-drips'), 'cs', meta).canonical).toBe(
      'https://www.nius.cz/iv-kapacky-praha/',
    ));
  it('uses noindex, follow for Russian blog pages', () =>
    expect(buildHead(getPage('blog'), 'ru', meta).robots).toBe('noindex, follow'));
  it('indexes prefixed privacy pages but points canonical to /privacy/', () => {
    const h = buildHead(getPage('privacy'), 'uk', meta);
    expect(h.robots).toBe('index, follow');
    expect(h.canonical).toBe('https://www.nius.cz/privacy/');
    expect(h.alternates).toEqual([]);
  });
  it('maps og locale and lists the other three', () => {
    const h = buildHead(getPage('home'), 'en', meta);
    expect(h.ogLocale).toBe('en_US');
    expect(h.ogLocaleAlternates.sort()).toEqual(['cs_CZ', 'ru_RU', 'uk_UA']);
  });
  it('defaults og image and type', () => {
    const h = buildHead(getPage('home'), 'cs', meta);
    expect(h.ogImage).toBe('https://www.nius.cz/og-image.jpg');
    expect(h.ogType).toBe('website');
  });
});

describe('serializeJsonLd', () => {
  const v = { name: 'a </script><script>alert(1)</script> b', note: '<!-- x' };
  it('emits no angle bracket that could close the script element', () =>
    expect(serializeJsonLd(v)).not.toContain('<'));
  it('round-trips through JSON.parse', () =>
    expect(JSON.parse(serializeJsonLd(v))).toEqual(v));
  // RedirectPage.astro puts a serialized address into an inline script.
  it('turns a string into a JavaScript string literal with the same value', () => {
    const address = 'https://www.nius.cz/a/?q="1"</script><script>alert(1)</script>';
    const literal = serializeJsonLd(address);
    expect(literal).not.toContain('<');
    expect(new Function(`return ${literal};`)()).toBe(address);
    expect(serializeJsonLd('https://www.nius.cz/iv-kapacky-praha/')).toBe('"https://www.nius.cz/iv-kapacky-praha/"');
  });
});
