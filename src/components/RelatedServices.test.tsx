import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RelatedServices } from './RelatedServices';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const cardLinks = (path: string): string[] => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <RelatedServices />
    </MemoryRouter>,
  );
  return screen.getAllByRole('link').map((a) => a.getAttribute('href') ?? '');
};

const rehydration: Record<string, string> = {
  cs: '/rehydratace-praha/',
  en: '/en/rehydration-iv-drip-prague/',
  ru: '/ru/regidratatsiya-kapelnitsa-praga/',
  uk: '/uk/rehidratatsiia-krapelnytsia-praga/',
};
const ivDrips: Record<string, string> = {
  cs: '/iv-kapacky-praha/',
  en: '/en/iv-drips-prague/',
  ru: '/ru/kapelnitsy-praga/',
  uk: '/uk/iv-drips-prague/',
};
const prefix: Record<string, string> = { cs: '', en: '/en', ru: '/ru', uk: '/uk' };
const languages = ['cs', 'en', 'ru', 'uk'];

describe('RelatedServices', () => {
  for (const lang of languages) {
    it(`${lang}: the IV drips page links the rehydration page and not itself`, () => {
      expect(cardLinks(ivDrips[lang])).toEqual([
        `${prefix[lang]}/ivf-support-prague/`,
        rehydration[lang],
        `${prefix[lang]}/post-surgery-recovery-care-prague/`,
      ]);
    });

    it(`${lang}: the IVF page links the IV drips and rehydration pages by their final addresses`, () => {
      expect(cardLinks(`${prefix[lang]}/ivf-support-prague/`)).toEqual([
        ivDrips[lang],
        rehydration[lang],
        `${prefix[lang]}/post-surgery-recovery-care-prague/`,
      ]);
    });

    for (const page of ['post-surgery-recovery-care-prague', 'disabled-daily-care-prague']) {
      it(`${lang}: /${page}/ links the IVF, IV drips and rehydration pages`, () => {
        expect(cardLinks(`${prefix[lang]}/${page}/`)).toEqual([
          `${prefix[lang]}/ivf-support-prague/`,
          ivDrips[lang],
          rehydration[lang],
        ]);
      });
    }

    it(`${lang}: the rehydration page shows three other services and not itself`, () => {
      expect(cardLinks(rehydration[lang])).toEqual([
        `${prefix[lang]}/ivf-support-prague/`,
        ivDrips[lang],
        `${prefix[lang]}/post-surgery-recovery-care-prague/`,
      ]);
    });
  }

  it('the hotel page links the IVF, IV drips and rehydration pages', () => {
    expect(cardLinks('/en/iv-drip-hotel-prague/')).toEqual([
      '/en/ivf-support-prague/',
      '/en/iv-drips-prague/',
      '/en/rehydration-iv-drip-prague/',
    ]);
  });

  it('leaves the current page out when the address has no trailing slash', () => {
    expect(cardLinks('/iv-kapacky-praha')).not.toContain('/iv-kapacky-praha/');
  });
});
