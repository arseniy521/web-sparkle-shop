import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initSamePageScroll } from './same-page-scroll';

const MARKUP = `
  <header>
    <a href="/" data-logo-link>NIUS</a>
    <a href="#menu" id="nav-menu">Služby a ceník</a>
    <a href="/" data-lang-switch="header" id="lang">Čeština</a>
  </header>
  <section id="home"><a href="#menu" id="hero-cta">Vybrat službu</a></section>
  <section id="menu"></section>
  <a href="/privacy/" id="other">Privacy</a>
  <a href="#nowhere" id="missing">Nowhere</a>`;

// Clicks a link the way a visitor does and reports whether the browser would follow it. The
// window listener runs after the document's; it then stops jsdom's (unimplemented) navigation.
function click(selector: string, init: MouseEventInit = {}): boolean {
  let followed = false;
  const last = (event: Event) => {
    followed = !event.defaultPrevented;
    event.preventDefault();
  };
  window.addEventListener('click', last, { once: true });
  document.querySelector(selector)!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }));
  return followed;
}

let scrollIntoView: ReturnType<typeof vi.fn>;
let scrollTo: ReturnType<typeof vi.fn>;
const listeners: Array<(event: Event) => void> = [];
const realAdd = document.addEventListener.bind(document);

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  document.body.innerHTML = MARKUP;
  scrollIntoView = vi.fn();
  scrollTo = vi.fn();
  document.querySelector<HTMLElement>('#menu')!.scrollIntoView = scrollIntoView as unknown as HTMLElement['scrollIntoView'];
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  // Keep track of the document listeners of each test, so the next test starts clean.
  vi.spyOn(document, 'addEventListener').mockImplementation((type, listener, options) => {
    listeners.push(listener as (event: Event) => void);
    realAdd(type, listener, options);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  for (const listener of listeners.splice(0)) document.removeEventListener('click', listener);
});

describe('initSamePageScroll', () => {
  it('scrolls smoothly to a section of the page instead of following the link', () => {
    initSamePageScroll();
    expect(click('#nav-menu')).toBe(false);
    expect(click('#hero-cta')).toBe(false);
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('scrolls to the top for the header logo', () => {
    initSamePageScroll();
    expect(click('[data-logo-link]')).toBe(false);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('leaves other pages, language switches, unknown sections and modified clicks to the browser', () => {
    initSamePageScroll();
    expect(click('#other')).toBe(true);
    expect(click('#lang')).toBe(true);
    expect(click('#missing')).toBe(true);
    expect(click('#nav-menu', { ctrlKey: true })).toBe(true);
    expect(click('#nav-menu', { button: 1 })).toBe(true);
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('does nothing on a page without the hero', () => {
    document.querySelector('#home')!.remove();
    document.body.insertAdjacentHTML('beforeend', '<a href="#menu" id="plain">Menu</a>');
    initSamePageScroll();
    expect(click('#plain')).toBe(true);
    expect(click('[data-logo-link]')).toBe(true);
  });
});
