import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getConsent, setConsent } from './consent';

const clearCookie = (name: string) => {
  document.cookie = `${name}=; max-age=0; path=/`;
};

describe('consent', () => {
  beforeEach(() => {
    clearCookie('nius_consent');
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('migrates the legacy localStorage value into the cookie', () => {
    localStorage.setItem('nius-cookie-consent', 'accepted');
    expect(getConsent()).toBe('accepted');
    expect(document.cookie).toContain('nius_consent=accepted');
  });

  it('returns null when storage and cookies throw', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(document, 'cookie', 'get').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(getConsent()).toBeNull();
  });

  it('does not throw when cookies and storage are unavailable on write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(document, 'cookie', 'set').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => setConsent('rejected')).not.toThrow();
  });

  it('stores a rejection for the current host on a preview address', () => {
    const written: string[] = [];
    vi.spyOn(document, 'cookie', 'set').mockImplementation((value: string) => {
      written.push(value);
    });
    setConsent('rejected');
    expect(written).toHaveLength(1);
    expect(written[0]).toContain('nius_consent=rejected');
    expect(written[0]).not.toContain('domain=');
  });
});
