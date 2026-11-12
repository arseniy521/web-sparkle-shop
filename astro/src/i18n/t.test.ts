import { describe, expect, it } from 'vitest';
import cs from '@old/i18n/locales/cs.json';
import { createT } from './t';

describe('createT', () => {
  it('returns the Czech string and falls back to English', () => {
    expect(createT('cs')('nav.cart')).toBe(cs.nav.cart);
    expect(createT('uk')('__missing__', { defaultValue: 'x' })).toBe('x');
  });
  it('reuses one instance per language', () => {
    expect(createT('cs')).toBe(createT('cs'));
    expect(createT('cs')).not.toBe(createT('en'));
  });
});
