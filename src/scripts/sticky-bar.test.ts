import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/scripts/analytics', () => ({ track: vi.fn(), trackCtaClick: vi.fn() }));

const MARKUP = `
  <section id="home"></section>
  <section id="menu"></section>
  <div data-mobile-sticky class="translate-y-full" style="display: var(--sticky-bar-display, none)">
    <button type="button" tabindex="-1" data-sticky-main data-label-choose="Vybrat službu" data-label-cart="Košík">
      <span data-sticky-label>Vybrat službu</span><span data-sticky-total class="contents"></span>
    </button>
    <a href="https://wa.me/420773629123" tabindex="-1">WhatsApp</a>
  </div>`;

// One observer per observed element; intersect() plays the browser's callback.
const observers = new Map<Element, (entries: Array<{ isIntersecting: boolean }>) => void>();
class FakeObserver {
  constructor(private cb: (entries: Array<{ isIntersecting: boolean }>) => void) {}
  observe(el: Element) {
    observers.set(el, this.cb);
  }
  disconnect() {}
}
const intersect = (selector: string, isIntersecting: boolean) =>
  observers.get(document.querySelector(selector)!)!([{ isIntersecting }]);

let cart: typeof import('./cart-core').cart;
let trackCtaClick: ReturnType<typeof vi.fn>;
let initStickyBar: typeof import('./sticky-bar').initStickyBar;

const bar = () => document.querySelector<HTMLElement>('[data-mobile-sticky]')!;
const button = () => document.querySelector<HTMLButtonElement>('[data-sticky-main]')!;
const label = () => document.querySelector('[data-sticky-label]')!.textContent;
const whatsapp = () => bar().querySelector('a')!;
const shown = () => bar().classList.contains('translate-y-0') && !bar().classList.contains('translate-y-full');

beforeEach(async () => {
  vi.resetModules();
  sessionStorage.clear();
  observers.clear();
  vi.stubGlobal('IntersectionObserver', FakeObserver);
  document.body.innerHTML = MARKUP;
  ({ cart } = await import('./cart-core'));
  ({ trackCtaClick } = (await import('./analytics')) as unknown as { trackCtaClick: ReturnType<typeof vi.fn> });
  ({ initStickyBar } = await import('./sticky-bar'));
});

describe('initStickyBar', () => {
  it('slides in once the hero leaves the viewport and is focusable only then', () => {
    initStickyBar();
    expect(shown()).toBe(false);
    expect(button().getAttribute('tabindex')).toBe('-1');
    intersect('#home', false);
    expect(shown()).toBe(true);
    expect(button().hasAttribute('tabindex')).toBe(false);
    expect(whatsapp().hasAttribute('tabindex')).toBe(false);
    intersect('#home', true);
    expect(shown()).toBe(false);
    expect(whatsapp().getAttribute('tabindex')).toBe('-1');
  });

  it('with an empty cart hides its button over the catalog and scrolls to it', () => {
    initStickyBar();
    const scroll = vi.fn();
    document.querySelector<HTMLElement>('#menu')!.scrollIntoView = scroll;
    intersect('#menu', true);
    expect(button().hidden).toBe(true);
    intersect('#menu', false);
    expect(button().hidden).toBe(false);
    expect(label()).toBe('Vybrat službu');
    button().click();
    expect(trackCtaClick).toHaveBeenCalledWith('choose_service', 'mobile_sticky');
    expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(cart.getState().open).toBe(false);
  });

  it('with a cart names it, stays over the catalog and opens the form', () => {
    initStickyBar();
    intersect('#menu', true);
    cart.add('immunity_lite');
    cart.add('pure_hydrate');
    expect(button().hidden).toBe(false);
    expect(label()).toBe('Košík (2) →');
    button().click();
    expect(trackCtaClick).toHaveBeenCalledWith('cart', 'mobile_sticky', { cart_items_count: 2 });
    expect(cart.getState()).toMatchObject({ open: true, openSource: 'mobile_sticky' });
  });

  it('is not displayed while the form or a service dialog is open', () => {
    initStickyBar();
    expect(bar().style.display).toBe('var(--sticky-bar-display, none)');
    cart.openForm('header');
    expect(bar().style.display).toBe('none');
    cart.setOpen(false);
    expect(bar().style.display).toBe('var(--sticky-bar-display, none)');
    window.dispatchEvent(new CustomEvent('nius:service-modal', { detail: { open: true } }));
    expect(bar().style.display).toBe('none');
    window.dispatchEvent(new CustomEvent('nius:service-modal', { detail: { open: false } }));
    expect(bar().style.display).toBe('var(--sticky-bar-display, none)');
  });

  it('does nothing on a page without the bar', () => {
    document.body.innerHTML = '<section id="home"></section>';
    expect(() => initStickyBar()).not.toThrow();
    expect(observers.size).toBe(0);
  });
});
