import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import cs from '../i18n/locales/cs.json' with { type: 'json' };
import { DRIP_GUIDE_CATEGORIES, IV_DRIP_OFFERS } from './dripPrices';

// The landing page's drips must match what the menu shows (public/js/nius-menu.js).
const menuSource = readFileSync(join(process.cwd(), 'public/js/nius-menu.js'), 'utf8');

function menuEntry(name: string): { code: string; price: number } | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = menuSource.match(
    new RegExp(`name: '${escaped}',\\s*code: '([a-z0-9_]+)',\\s*tagline: [^\\n]*\\s*price: (\\d+)`),
  );
  return match ? { code: match[1], price: Number(match[2]) } : null;
}

describe('IV_DRIP_OFFERS', () => {
  it.each(IV_DRIP_OFFERS.map((offer) => [offer.name, offer] as const))(
    '%s has the code and the price of the menu',
    (name, offer) => {
      expect(menuEntry(name)).toEqual({ code: offer.code, price: offer.priceCzk });
    },
  );

  it('points every guide drip to texts of a guide category', () => {
    const categories = cs.ivDripTherapy.menu.categories as Record<string, { items: Record<string, unknown> }>;
    for (const offer of IV_DRIP_OFFERS.filter((o) => o.textPath)) {
      const [category, , item] = offer.textPath!.split('.');
      expect(DRIP_GUIDE_CATEGORIES).toContain(category);
      expect(categories[category].items[item], offer.name).toBeDefined();
    }
  });
});
