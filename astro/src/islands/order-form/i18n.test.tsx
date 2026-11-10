import { describe, expect, it } from 'vitest';
import { loadFormI18n } from './i18n';
import * as cs from './strings/cs';
import * as en from './strings/en';

describe('loadFormI18n', () => {
  it('translates onboarding and serviceCatalog keys in the page language', async () => {
    const i18n = await loadFormI18n('cs');
    expect(i18n.t('onboarding.errors.network')).toBe(cs.onboarding.errors.network);
    expect(i18n.exists('serviceCatalog')).toBe(true);
    expect(i18n.t('services.ivInfusion.title')).toBe(cs.services.ivInfusion.title);
  });
  it('falls back to English for a key missing in the page language', async () => {
    const i18n = await loadFormI18n('ru');
    i18n.removeResourceBundle('ru', 'translation');
    expect(i18n.t('onboarding.errors.network')).toBe(en.onboarding.errors.network);
  });
});
