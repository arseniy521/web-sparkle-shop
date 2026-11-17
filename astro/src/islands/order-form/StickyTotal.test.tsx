import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartService } from '@/scripts/cart-catalog';
import { fetchServicesCatalog } from './api/services';
import { cart } from '@/scripts/cart-core';
import { StickyTotal, cartTotal } from './StickyTotal';

vi.mock('./api/services', () => ({ fetchServicesCatalog: vi.fn() }));
vi.mock('@/scripts/analytics', () => ({ track: vi.fn(), trackCtaClick: vi.fn() }));

const catalog = [
  { code: 'immunity_lite', priceCzk: 2900 },
  { code: 'pure_hydrate', priceCzk: 2500 },
];

describe('cartTotal', () => {
  it('sums the catalog price of every service of the cart, repeats included', () => {
    expect(cartTotal(['immunity_lite', 'pure_hydrate', 'immunity_lite'], catalog)).toBe(8300);
  });

  it('has no total for an empty cart or a service the catalog does not list', () => {
    expect(cartTotal([], catalog)).toBeNull();
    expect(cartTotal(['immunity_lite', 'no_such_service'], catalog)).toBeNull();
    expect(cartTotal(['immunity_lite'], [])).toBeNull();
  });
});

describe('StickyTotal', () => {
  beforeEach(() => {
    cart.clear();
    vi.mocked(fetchServicesCatalog).mockResolvedValue(catalog as CartService[]);
  });

  const show = (lang: string) =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <StickyTotal lang={lang} />
      </QueryClientProvider>,
    );

  it('shows the total in the page language once the catalog is loaded', async () => {
    cart.setCodes(['immunity_lite', 'pure_hydrate']);
    show('cs');
    // 5 400,00 Kč, with the non-breaking spaces of the Czech format.
    const text = new Intl.NumberFormat('cs', { style: 'currency', currency: 'CZK' }).format(5400);
    expect((await screen.findByText(/Kč/)).textContent).toBe(text);
  });

  it('follows the cart and shows nothing when it is empty, without loading the catalog', async () => {
    const { container } = show('en');
    expect(container.textContent).toBe('');
    expect(fetchServicesCatalog).not.toHaveBeenCalled();
    act(() => cart.setCodes(['pure_hydrate']));
    expect(await screen.findByText('CZK 2,500.00')).toBeTruthy();
    act(() => cart.setCodes([]));
    expect(container.textContent).toBe('');
  });
});
