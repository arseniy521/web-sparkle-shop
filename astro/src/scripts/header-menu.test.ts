import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { initHeaderMenu } from './header-menu';

const dropdown = (id: string) => `
  <div data-dropdown>
    <button type="button" id="trigger-${id}" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false" data-state="closed"></button>
    <div id="panel-${id}" data-dropdown-panel role="menu" hidden><a href="/x/" role="menuitem">x</a></div>
  </div>`;

const html = (id: string) => document.getElementById(id) as HTMLElement;

describe('header menu', () => {
  beforeAll(() => initHeaderMenu(document));

  beforeEach(() => {
    document.body.innerHTML = `
      <header role="banner">
        <button type="button" id="toggle" data-menu-toggle aria-expanded="false">
          <svg id="icon-open" data-menu-icon="menu"></svg>
          <svg id="icon-close" data-menu-icon="close" hidden></svg>
        </button>
        ${dropdown('a')}
        ${dropdown('b')}
        <div id="menu" data-mobile-menu hidden><a id="link" href="/#menu">Menu</a></div>
      </header>`;
  });

  it('toggles the mobile menu and aria-expanded', () => {
    const toggle = html('toggle');
    const menu = html('menu');
    toggle.click();
    expect(menu.hidden).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(html('icon-open').hasAttribute('hidden')).toBe(true);
    expect(html('icon-close').hasAttribute('hidden')).toBe(false);
    toggle.click();
    expect(menu.hidden).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(html('icon-open').hasAttribute('hidden')).toBe(false);
    expect(html('icon-close').hasAttribute('hidden')).toBe(true);
  });

  it('opens a dropdown on trigger click and closes it on outside click and Escape', () => {
    const trigger = html('trigger-a');
    const panel = html('panel-a');
    trigger.click();
    expect(panel.hidden).toBe(false);
    expect(trigger.dataset.state).toBe('open');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    document.body.click();
    expect(panel.hidden).toBe(true);
    expect(trigger.dataset.state).toBe('closed');
    trigger.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(panel.hidden).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps only one dropdown open', () => {
    html('trigger-a').click();
    html('trigger-b').click();
    expect(html('panel-a').hidden).toBe(true);
    expect(html('panel-b').hidden).toBe(false);
  });

  it('marks the header as scrolled past 60px', () => {
    const header = document.querySelector('header') as HTMLElement;
    Object.defineProperty(window, 'scrollY', { value: 61, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(header.dataset.scrolled).toBe('true');
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(header.dataset.scrolled).toBe('false');
  });

  it('closes the mobile menu after a link inside it is clicked', () => {
    const toggle = html('toggle');
    toggle.click();
    html('link').addEventListener('click', (e) => e.preventDefault());
    html('link').click();
    expect(html('menu').hidden).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});
