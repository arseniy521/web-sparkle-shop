import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildDate, stampLastmod } from './sitemap-dates.mjs';

const OLD_SITEMAP = path.resolve(import.meta.dirname, '../../public/sitemap.xml');

describe('sitemap dates', () => {
  it('writes the UTC date of the build, as the old postbuild does', () => {
    expect(buildDate(new Date('2026-11-16T23:30:00+01:00'))).toBe('2026-11-16');
    expect(buildDate(new Date('2026-11-17T00:30:00+01:00'))).toBe('2026-11-16');
  });

  it('replaces every lastmod and nothing else', () => {
    const xml = fs.readFileSync(OLD_SITEMAP, 'utf8');
    const stamped = stampLastmod(xml, '2030-01-02');
    const count = (xml.match(/<lastmod>/g) ?? []).length;
    expect(count).toBeGreaterThan(0);
    expect(stamped.match(/<lastmod>2030-01-02<\/lastmod>/g)).toHaveLength(count);
    expect(stamped.replace(/<lastmod>[^<]*<\/lastmod>/g, '')).toBe(xml.replace(/<lastmod>[^<]*<\/lastmod>/g, ''));
  });
});
