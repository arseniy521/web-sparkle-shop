import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchServicesCatalog } from './services';

const row = (code: string) => ({
  id: `svc_${code}`,
  code,
  name: code,
  description: null,
  priceHalers: 290000,
  kind: 'standard' as const,
  iconKey: 'iv',
  durationMin: 45,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchServicesCatalog', () => {
  it('keeps only the services offered on the website, in the API order', async () => {
    const rows = ['immunity_lite', 'nausea_relief', 'standard-iron', 'testovaya_usluga', 'anti_nausea_addon', 'premium_iron'].map(row);
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(rows), { status: 200 })));

    const catalog = await fetchServicesCatalog();

    expect(catalog.map((service) => service.code)).toEqual(['immunity_lite', 'standard_iron', 'premium_iron']);
  });
});
