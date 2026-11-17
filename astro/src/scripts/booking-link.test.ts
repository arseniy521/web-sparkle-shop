import { beforeEach, describe, expect, it, vi } from 'vitest';

const analytics = vi.hoisted(() => ({ track: vi.fn(), trackCtaClick: vi.fn() }));
vi.mock('@/scripts/analytics', async () => ({
  ...(await vi.importActual<typeof import('./analytics')>('./analytics')),
  ...analytics,
}));

let cart: typeof import('./cart-core').cart;

const link = (selector: string) => document.querySelector<HTMLAnchorElement>(selector)!;

function click(target: HTMLElement, init: MouseEventInit = {}): MouseEvent {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
  target.dispatchEvent(event);
  return event;
}

beforeEach(async () => {
  vi.resetModules();
  sessionStorage.clear();
  document.body.innerHTML = `
    <a id="plain" href="https://app.nius.cz/form" data-open-form="page_content"><span>Objednat</span></a>
    <a id="hero" href="https://app.nius.cz/form" data-open-form="hero" data-service-code="immunity_lite">Objednat</a>
    <a id="unknown" href="https://app.nius.cz/form" data-open-form="somewhere">Objednat</a>`;
  ({ cart } = await import('./cart-core'));
  const { initBookingLinks } = await import('./booking-link');
  initBookingLinks();
});

describe('booking links', () => {
  it('opens the order form instead of following the link', () => {
    const event = click(link('#plain span'));

    expect(event.defaultPrevented).toBe(true);
    expect(cart.getState()).toMatchObject({ open: true, openSource: 'page_content', codes: [] });
    expect(analytics.trackCtaClick).toHaveBeenCalledExactlyOnceWith('choose_service', 'page_content', undefined);
  });

  it('orders the service of data-service-code and reports it', () => {
    const event = click(link('#hero'));

    expect(event.defaultPrevented).toBe(true);
    expect(cart.getState()).toMatchObject({ open: true, openSource: 'hero', codes: ['immunity_lite'] });
    expect(analytics.trackCtaClick).toHaveBeenCalledExactlyOnceWith('choose_service', 'hero', {
      service_code: 'immunity_lite',
    });
    expect(analytics.track).toHaveBeenCalledWith('cart_service_added', { service_code: 'immunity_lite', source: 'hero' });
  });

  it('reports an unknown source as page_content', () => {
    click(link('#unknown'));

    expect(analytics.trackCtaClick).toHaveBeenCalledExactlyOnceWith('choose_service', 'page_content', undefined);
    expect(cart.getState().openSource).toBe('page_content');
  });

  it.each([
    { name: 'Ctrl', init: { ctrlKey: true } },
    { name: 'Cmd', init: { metaKey: true } },
    { name: 'Shift', init: { shiftKey: true } },
    { name: 'middle button', init: { button: 1 } },
  ])('follows the link on a $name click', ({ init }) => {
    const event = click(link('#hero'), init);

    expect(event.defaultPrevented).toBe(false);
    expect(cart.getState()).toMatchObject({ open: false, codes: [] });
    expect(analytics.trackCtaClick).not.toHaveBeenCalled();
  });

  it('binds the links present at start only', () => {
    document.body.insertAdjacentHTML('beforeend', '<a id="late" href="https://app.nius.cz/form" data-open-form="hero">x</a>');

    const event = click(link('#late'));

    expect(event.defaultPrevented).toBe(false);
    expect(cart.getState().open).toBe(false);
  });
});
