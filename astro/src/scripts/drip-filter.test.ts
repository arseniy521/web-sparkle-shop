import { beforeEach, describe, expect, it } from 'vitest';
import { initDripFilter } from './drip-filter';

const CATEGORIES = ['immunity', 'energy', 'hydration', 'specialized'];
const ACTIVE = ['bg-primary', 'text-primary-foreground'];
const INACTIVE = ['bg-muted', 'hover:bg-muted/80', 'text-muted-foreground'];

const button = (key: string, active: boolean) =>
  `<button data-filter="${key}" aria-pressed="${active}" class="px-4 ${(active ? ACTIVE : INACTIVE).join(' ')}">${key}</button>`;

const filterButton = (key: string) => document.querySelector(`[data-filter="${key}"]`) as HTMLButtonElement;
const group = (key: string) => document.querySelector(`[data-category="${key}"]`) as HTMLElement;

describe('drip filter', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div>${['all', ...CATEGORIES].map((k) => button(k, k === 'all')).join('')}</div>
      <div>${CATEGORIES.map((k) => `<div data-category="${k}"><h3>${k}</h3></div>`).join('')}</div>`;
    initDripFilter(document);
  });

  it('shows only the chosen category and keeps the others in the DOM', () => {
    filterButton('energy').click();
    expect(group('energy').hidden).toBe(false);
    for (const k of CATEGORIES.filter((c) => c !== 'energy')) {
      expect(group(k).hidden).toBe(true);
      expect(group(k).isConnected).toBe(true);
    }
  });

  it('shows every category again for all', () => {
    filterButton('energy').click();
    filterButton('all').click();
    for (const k of CATEGORIES) expect(group(k).hidden).toBe(false);
  });

  it('marks only the chosen button as pressed and styles it as active', () => {
    filterButton('hydration').click();
    for (const k of ['all', ...CATEGORIES]) {
      const b = filterButton(k);
      const chosen = k === 'hydration';
      expect(b.getAttribute('aria-pressed')).toBe(String(chosen));
      for (const c of ACTIVE) expect(b.classList.contains(c)).toBe(chosen);
      for (const c of INACTIVE) expect(b.classList.contains(c)).toBe(!chosen);
    }
  });

  it('does nothing on a page without the filter', () => {
    document.body.innerHTML = '<p>no filter</p>';
    expect(() => initDripFilter(document)).not.toThrow();
  });
});
