import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initFloatingWhatsApp } from './floating-whatsapp';

const HIDDEN = ['opacity-0', 'translate-y-10', 'pointer-events-none'];
const SHOWN = ['opacity-100', 'translate-y-0'];

function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  window.dispatchEvent(new Event('scroll'));
}

const link = () => document.querySelector('[data-floating-whatsapp]') as HTMLElement;
const expectShown = (shown: boolean) => {
  for (const c of SHOWN) expect(link().classList.contains(c)).toBe(shown);
  for (const c of HIDDEN) expect(link().classList.contains(c)).toBe(!shown);
};

describe('floating WhatsApp button', () => {
  beforeEach(() => {
    document.body.innerHTML = `<a data-floating-whatsapp href="https://wa.me/420773629123" class="fixed ${HIDDEN.join(' ')}"></a>`;
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    initFloatingWhatsApp();
  });

  afterEach(() => scrollTo(0));

  it('stays hidden until the page is scrolled past 300 px', () => {
    expectShown(false);
    scrollTo(300);
    expectShown(false);
  });

  it('shows after scrolling past 300 px and hides again above it', () => {
    scrollTo(301);
    expectShown(true);
    scrollTo(100);
    expectShown(false);
  });

  it('does nothing on a page without the button', () => {
    document.body.innerHTML = '<p>no button</p>';
    expect(() => {
      initFloatingWhatsApp();
      scrollTo(500);
    }).not.toThrow();
  });
});
