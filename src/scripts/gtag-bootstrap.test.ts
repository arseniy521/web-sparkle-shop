import { beforeEach, describe, expect, it } from 'vitest';
import {
  DENIED_BY_DEFAULT,
  GRANTED,
  GTAG_LOADER_SELECTOR,
  dataLayerEntries,
  resetConsentPage,
  runInlineConsentScript,
  type StoredChoice,
} from '../../tests/fixtures/consent-page.ts';

const GRANTED_UPDATE = ['consent', 'update', GRANTED];

// The cookie wins; the legacy localStorage record counts only without a valid cookie
// (the rule of getConsent() in consent.ts).
const MATRIX: { cookie: StoredChoice; legacy: StoredChoice; granted: boolean }[] = [
  { cookie: null, legacy: null, granted: false },
  { cookie: null, legacy: 'accepted', granted: true },
  { cookie: null, legacy: 'rejected', granted: false },
  { cookie: 'accepted', legacy: null, granted: true },
  { cookie: 'accepted', legacy: 'accepted', granted: true },
  { cookie: 'accepted', legacy: 'rejected', granted: true },
  { cookie: 'rejected', legacy: null, granted: false },
  { cookie: 'rejected', legacy: 'accepted', granted: false },
  { cookie: 'rejected', legacy: 'rejected', granted: false },
];

describe('inline Consent Mode script of the <head>', () => {
  beforeEach(() => {
    resetConsentPage();
  });

  it.each(MATRIX)('cookie=$cookie, localStorage=$legacy -> granted=$granted', ({ cookie, legacy, granted }) => {
    resetConsentPage({ cookie, legacy });

    runInlineConsentScript();

    const entries = dataLayerEntries();
    expect(entries.slice(0, 2)).toEqual([DENIED_BY_DEFAULT, ['set', 'ads_data_redaction', true]]);
    if (granted) {
      expect(entries).toHaveLength(5);
      expect(entries[2]).toEqual(GRANTED_UPDATE);
      expect(entries[3]).toEqual(['js', expect.any(Date)]);
      expect(entries[4]).toEqual(['config', 'G-VNMLWF0XZG']);
      expect(document.querySelectorAll(GTAG_LOADER_SELECTOR)).toHaveLength(1);
      expect(document.querySelector<HTMLScriptElement>(GTAG_LOADER_SELECTOR)?.src).toBe(
        'https://www.googletagmanager.com/gtag/js?id=G-VNMLWF0XZG',
      );
      expect(window.__niusGtagLoaded).toBe(true);
    } else {
      expect(entries).toHaveLength(2);
      expect(document.querySelectorAll(GTAG_LOADER_SELECTOR)).toHaveLength(0);
      expect(window.__niusGtagLoaded).toBeUndefined();
    }
  });

  it('ignores a cookie value other than accepted or rejected and falls back to the legacy record', () => {
    document.cookie = 'nius_consent=maybe; path=/';
    localStorage.setItem('nius-cookie-consent', 'accepted');

    runInlineConsentScript();

    expect(dataLayerEntries()[2]).toEqual(GRANTED_UPDATE);
  });

  it('does not read a cookie whose name only ends in nius_consent', () => {
    document.cookie = 'x_nius_consent=accepted; path=/';

    runInlineConsentScript();

    expect(dataLayerEntries()).toHaveLength(2);
    document.cookie = 'x_nius_consent=; max-age=0; path=/';
  });

  it('survives a localStorage that throws', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage')!;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError');
      },
    });
    try {
      expect(() => runInlineConsentScript()).not.toThrow();
      expect(dataLayerEntries()).toHaveLength(2);
    } finally {
      Object.defineProperty(window, 'localStorage', original);
    }
  });

  it('loads gtag.js once however often consent is granted', () => {
    runInlineConsentScript();

    window.__niusGrantConsent?.();
    window.__niusGrantConsent?.();

    expect(document.querySelectorAll(GTAG_LOADER_SELECTOR)).toHaveLength(1);
    expect(dataLayerEntries().filter((entry) => entry[0] === 'config')).toHaveLength(1);
    expect(dataLayerEntries().filter((entry) => entry[0] === 'consent' && entry[1] === 'update')).toHaveLength(2);
  });

  it('keeps the stored choice untouched', () => {
    resetConsentPage({ cookie: 'rejected', legacy: 'accepted' });

    runInlineConsentScript();

    expect(document.cookie).toContain('nius_consent=rejected');
    expect(localStorage.getItem('nius-cookie-consent')).toBe('accepted');
  });
});
