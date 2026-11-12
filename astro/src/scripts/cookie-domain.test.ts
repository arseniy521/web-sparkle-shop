import { describe, expect, it } from 'vitest';
import { cookieAttributes, sharedCookieDomain } from './cookie-domain';

describe('cookie scope', () => {
  it('uses .nius.cz only on www.nius.cz', () => {
    expect(cookieAttributes({ hostname: 'www.nius.cz', protocol: 'https:' })).toBe('; domain=.nius.cz; Secure');
    expect(cookieAttributes({ hostname: 'nius-site-preview.pages.dev', protocol: 'https:' })).toBe('; Secure');
    expect(cookieAttributes({ hostname: 'localhost', protocol: 'http:' })).toBe('');
    expect(sharedCookieDomain({ hostname: 'app.nius.cz', protocol: 'https:' })).toBeUndefined();
  });
});
