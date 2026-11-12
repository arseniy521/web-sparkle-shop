import { beforeEach, describe, expect, it } from 'vitest';
import {
  GTAG_LOADER_SELECTOR,
  dataLayerEntries,
  resetConsentPage,
  runInlineConsentScript,
} from '@/test/consentPage';

const DENIED_BY_DEFAULT = [
  'consent',
  'default',
  {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  },
];
const GRANTED_UPDATE = [
  'consent',
  'update',
  {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  },
];

type Stored = 'accepted' | 'rejected' | null;

// The cookie wins; the legacy localStorage record counts only when there is no cookie
// (same rule as getConsent() in src/lib/consent.ts).
const MATRIX: { cookie: Stored; legacy: Stored; granted: boolean }[] = [
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

describe('inline consent script of index.html', () => {
  beforeEach(() => {
    resetConsentPage();
  });

  it.each(MATRIX)(
    'cookie=$cookie, localStorage=$legacy -> granted=$granted',
    ({ cookie, legacy, granted }) => {
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
        expect((window as unknown as Record<string, unknown>).__niusGtagLoaded).toBe(true);
      } else {
        expect(entries).toHaveLength(2);
        expect(document.querySelectorAll(GTAG_LOADER_SELECTOR)).toHaveLength(0);
        expect((window as unknown as Record<string, unknown>).__niusGtagLoaded).toBeUndefined();
      }
    },
  );

  it('keeps the stored choice untouched', () => {
    resetConsentPage({ cookie: 'rejected', legacy: 'accepted' });

    runInlineConsentScript();

    expect(document.cookie).toContain('nius_consent=rejected');
    expect(localStorage.getItem('nius-cookie-consent')).toBe('accepted');
  });
});
