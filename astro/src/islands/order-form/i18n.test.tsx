import { describe, expect, it, vi } from 'vitest';
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

describe('prefetchFormStrings', () => {
  it('does not make the later load fail when the background fetch failed', async () => {
    vi.resetModules();
    let attempts = 0;
    vi.doMock('./strings/cs', async () => {
      attempts += 1;
      if (attempts === 1) throw new Error('offline');
      return vi.importActual('./strings/cs');
    });
    const fresh = await import('./i18n');

    fresh.prefetchFormStrings('cs');
    await vi.dynamicImportSettled();
    expect(attempts).toBe(1);

    const i18n = await fresh.loadFormI18n('cs');
    expect(attempts).toBe(2);
    expect(i18n.t('onboarding.errors.network')).toBe(cs.onboarding.errors.network);
    vi.doUnmock('./strings/cs');
  });
});
