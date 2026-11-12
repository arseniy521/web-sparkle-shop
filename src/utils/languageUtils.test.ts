import { describe, expect, it } from 'vitest';
import { getIvDripsUrl, getLocalizedUrl } from './languageUtils';

// Every page whose slug differs between languages: language -> its own address.
const localizedPages: Record<string, Record<string, string>> = {
  'IV drips': {
    cs: '/iv-kapacky-praha/',
    en: '/en/iv-drips-prague/',
    ru: '/ru/kapelnitsy-praga/',
    uk: '/uk/iv-drips-prague/',
  },
  rehydration: {
    cs: '/rehydratace-praha/',
    en: '/en/rehydration-iv-drip-prague/',
    ru: '/ru/regidratatsiya-kapelnitsa-praga/',
    uk: '/uk/rehidratatsiia-krapelnytsia-praga/',
  },
  "women's day gift": {
    cs: '/darek-8-brezna/',
    en: '/en/womens-day-gift-prague/',
    ru: '/ru/podarok-na-8-marta/',
  },
  'birthday gift': {
    cs: '/narozeninovy-darek-praha/',
    en: '/en/birthday-gift-prague/',
    ru: '/ru/podatok-k-dnju-rozhdenija-praga/',
  },
};

describe('getLocalizedUrl (language switch on pages with localized slugs)', () => {
  for (const [page, urls] of Object.entries(localizedPages)) {
    for (const [fromLang, fromUrl] of Object.entries(urls)) {
      for (const [toLang, toUrl] of Object.entries(urls)) {
        it(`${page}: ${fromLang} -> ${toLang} with a trailing slash`, () => {
          expect(getLocalizedUrl(fromUrl, toLang)).toBe(toUrl);
        });

        it(`${page}: ${fromLang} -> ${toLang} without a trailing slash`, () => {
          expect(getLocalizedUrl(fromUrl.replace(/\/$/, ''), toLang)).toBe(toUrl);
        });
      }
    }
  }

  it('returns null for a page that has the same slug in every language', () => {
    expect(getLocalizedUrl('/ivf-support-prague/', 'en')).toBeNull();
    expect(getLocalizedUrl('/en/blog/', 'cs')).toBeNull();
  });
});

describe('getIvDripsUrl (links to the IV drips page never go through a redirect stub)', () => {
  it('returns the final address of the IV drips page in every language', () => {
    expect(getIvDripsUrl('cs')).toBe('/iv-kapacky-praha/');
    expect(getIvDripsUrl('en')).toBe('/en/iv-drips-prague/');
    expect(getIvDripsUrl('ru')).toBe('/ru/kapelnitsy-praga/');
    expect(getIvDripsUrl('uk')).toBe('/uk/iv-drips-prague/');
  });

  it('falls back to the Czech page (the default language) for an unknown language', () => {
    expect(getIvDripsUrl('de')).toBe('/iv-kapacky-praha/');
  });
});
