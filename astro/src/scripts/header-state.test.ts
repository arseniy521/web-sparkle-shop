import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/scripts/analytics', () => ({ track: vi.fn(), trackCtaClick: vi.fn() }));

const LOADING = 'opacity-60 cursor-wait';

const HEADER = `
  <header>
    <a data-lang-switch="header" data-lang="cs" href="/">CZ</a>
    <a data-lang-switch="header" data-lang="en" href="/en/">EN</a>
    <a aria-disabled="true" data-account-link="header" class="x ${LOADING}"></a>
    <button data-open-cart="header"><span data-cart-count hidden></span></button>
    <button data-open-cart="mobile_header"><span data-cart-count hidden></span></button>
    <div data-mobile-menu>
      <a data-lang-switch="mobile_menu" data-lang="ru" href="/ru/">RU</a>
      <button data-open-cart="mobile_menu"><span data-cart-count hidden></span></button>
      <a aria-disabled="true" data-account-link="mobile_menu" class="y ${LOADING}"></a>
    </div>
  </header>`;

async function setup() {
  vi.resetModules();
  document.body.innerHTML = HEADER;
  document.documentElement.lang = 'cs';
  sessionStorage.clear();
  const analytics = await import('@/scripts/analytics');
  const { cart } = await import('./cart-core');
  const { authStatus } = await import('./auth-status');
  const { initHeaderState } = await import('./header-state');
  return { analytics, cart, authStatus, initHeaderState };
}

function click(selector: string) {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  document.querySelector(selector)!.dispatchEvent(event);
  return event;
}

function answerAuth(status: number) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })));
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('header cart', () => {
  it('shows the cart count in all three places and hides it at zero', async () => {
    const { cart, initHeaderState } = await setup();
    initHeaderState();
    const badges = [...document.querySelectorAll<HTMLElement>('[data-cart-count]')];
    expect(badges).toHaveLength(3);
    expect(badges.every((badge) => badge.hidden)).toBe(true);

    cart.setCodes(['a', 'b']);
    expect(badges.map((badge) => badge.textContent)).toEqual(['2', '2', '2']);
    expect(badges.some((badge) => badge.hidden)).toBe(false);

    cart.setCodes([]);
    expect(badges.every((badge) => badge.hidden)).toBe(true);
  });

  it('shows the count of a draft that is already stored', async () => {
    vi.resetModules();
    sessionStorage.setItem(
      'nius_onboarding_draft_v2',
      JSON.stringify({ codes: ['a', 'b', 'c'], data: {}, savedAt: Date.now() }),
    );
    document.body.innerHTML = HEADER;
    const { initHeaderState } = await import('./header-state');
    initHeaderState();
    expect(document.querySelector('[data-cart-count]')!.textContent).toBe('3');
  });

  it('cart button tracks cta_clicked and opens the form with its source', async () => {
    const { analytics, cart, initHeaderState } = await setup();
    initHeaderState();
    cart.setCodes(['a', 'b']);
    click('[data-open-cart="mobile_header"]');
    expect(analytics.trackCtaClick).toHaveBeenCalledWith('cart', 'mobile_header', { cart_items_count: 2 });
    expect(cart.getState()).toMatchObject({ open: true, openSource: 'mobile_header' });
  });
});

describe('header account link', () => {
  it('stays as rendered while the status is loading and ignores clicks', async () => {
    const { analytics, initHeaderState } = await setup();
    initHeaderState();
    const link = document.querySelector<HTMLElement>('[data-account-link="header"]')!;
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.hasAttribute('href')).toBe(false);
    click('[data-account-link="header"]');
    expect(analytics.trackCtaClick).not.toHaveBeenCalled();
  });

  it('enables the account link once the status is known and tracks the click', async () => {
    const { analytics, authStatus, initHeaderState } = await setup();
    answerAuth(401);
    initHeaderState();
    await authStatus.ensure();

    const link = document.querySelector<HTMLElement>('[data-account-link="header"]')!;
    expect(link.hasAttribute('aria-disabled')).toBe(false);
    expect(link.getAttribute('href')).toMatch(/^https:\/\/app\.nius\.cz\/login/);
    expect(link.classList.contains('opacity-60')).toBe(false);
    expect(link.classList.contains('cursor-wait')).toBe(false);
    expect(link.classList.contains('transition-colors')).toBe(true);

    click('[data-account-link="header"]');
    expect(analytics.trackCtaClick).toHaveBeenCalledWith('account', 'header', { authenticated: false });
  });

  it('points a signed-in visitor to the cabinet from the mobile menu', async () => {
    const { analytics, authStatus, initHeaderState } = await setup();
    answerAuth(200);
    initHeaderState();
    await authStatus.ensure();

    const link = document.querySelector<HTMLElement>('[data-account-link="mobile_menu"]')!;
    expect(link.getAttribute('href')).toBe('https://app.nius.cz/cabinet');
    click('[data-account-link="mobile_menu"]');
    expect(analytics.trackCtaClick).toHaveBeenCalledWith('account', 'mobile_menu', { authenticated: true });
  });
});

describe('header language switch', () => {
  it('tracks language_changed before following the switcher link', async () => {
    const { analytics, initHeaderState } = await setup();
    initHeaderState();
    const event = click('[data-lang-switch="header"][data-lang="en"]');
    expect(analytics.track).toHaveBeenCalledWith('language_changed', {
      from_language: 'cs',
      to_language: 'en',
      source: 'header',
    });
    expect(event.defaultPrevented).toBe(false);
  });

  it('does not track a click on the current language', async () => {
    const { analytics, initHeaderState } = await setup();
    initHeaderState();
    click('[data-lang-switch="header"][data-lang="cs"]');
    expect(analytics.track).not.toHaveBeenCalled();
  });
});

describe('header without markup', () => {
  it('is safe on a page without a header', async () => {
    const { initHeaderState } = await setup();
    document.body.innerHTML = '';
    expect(() => initHeaderState()).not.toThrow();
  });
});
