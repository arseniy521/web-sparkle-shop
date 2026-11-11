import { describe, expect, it } from 'vitest';
import cs from '@old/i18n/locales/cs.json';
import { createT } from './t';

describe('createT', () => {
  it('returns the Czech string and falls back to English', () => {
    expect(createT('cs')('nav.cart')).toBe(cs.nav.cart);
    expect(createT('uk')('__missing__', { defaultValue: 'x' })).toBe('x');
  });
});
