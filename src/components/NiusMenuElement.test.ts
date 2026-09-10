import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { fireEvent } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const menuScriptPath = resolve(currentDir, '../../public/js/nius-menu.js');

beforeAll(() => {
  if (typeof HTMLDialogElement !== 'undefined') {
    if (!HTMLDialogElement.prototype.showModal) {
      Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
        configurable: true,
        value(this: HTMLDialogElement) {
          this.setAttribute('open', '');
        },
      });
    }
    if (!HTMLDialogElement.prototype.close) {
      Object.defineProperty(HTMLDialogElement.prototype, 'close', {
        configurable: true,
        value(this: HTMLDialogElement) {
          this.removeAttribute('open');
          this.dispatchEvent(new Event('close'));
        },
      });
    }
  }

  if (!customElements.get('nius-menu')) {
    vm.runInThisContext(readFileSync(menuScriptPath, 'utf8'), { filename: menuScriptPath });
  }
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

function mountMenu(locale: string, codes: string[] = []) {
  const menu = document.createElement('nius-menu');
  menu.setAttribute('locale', locale);
  menu.setAttribute('section', 'menu');
  menu.setAttribute('cart-codes', JSON.stringify(codes));
  document.body.append(menu);
  return menu;
}

function quickAddButton(menu: HTMLElement) {
  const button = menu.shadowRoot?.querySelector<HTMLButtonElement>(
    '[data-quick-add][data-code="immunity_lite"]',
  );
  expect(button).toBeTruthy();
  return button as HTMLButtonElement;
}

describe('nius-menu custom element', () => {
  it.each([
    { locale: 'en', name: 'Immunity Lite', empty: 'Add to cart', inCart: 'In cart' },
    { locale: 'cs', name: 'Imunita Lite', empty: 'Do košíku', inCart: 'V košíku' },
    { locale: 'ru', name: 'Иммунитет Лайт', empty: 'В корзину', inCart: 'В корзине' },
    { locale: 'uk', name: 'Імунітет Лайт', empty: 'У кошик', inCart: 'У кошику' },
  ])('keeps the visible quick-add label in the accessible name for $locale', ({ locale, name, empty, inCart }) => {
    const menu = mountMenu(locale);
    const button = quickAddButton(menu);

    expect(button).toHaveTextContent(empty);
    expect(button).toHaveAccessibleName(`${empty}: ${name}`);

    menu.setAttribute('cart-codes', JSON.stringify(['immunity_lite', 'immunity_lite']));

    expect(button).toHaveTextContent(`✓ ${inCart} (2)`);
    expect(button).toHaveAccessibleName(`${inCart} (2): ${name}`);
  });

  it('lets a selected service add boosters from the detail dialog', () => {
    const menu = mountMenu('en', ['immunity_lite']);
    const listener = vi.fn();
    window.addEventListener('nius:add-to-cart', listener);

    const card = menu.shadowRoot?.querySelector<HTMLElement>('[data-drip="immunity-0"]');
    expect(card).toBeTruthy();
    fireEvent.click(card as HTMLElement);

    const modal = menu.shadowRoot?.querySelector<HTMLDialogElement>('[data-modal]');
    const boosterBox = modal?.querySelector<HTMLDetailsElement>('.upsell-box');
    const booster = modal?.querySelector<HTMLButtonElement>('[data-code="vitamin_d_shot"]');
    const addButton = modal?.querySelector<HTMLButtonElement>('[data-modal-add]');
    expect(boosterBox).toBeTruthy();
    expect(booster).toBeTruthy();
    expect(addButton).toHaveTextContent('View cart →');

    boosterBox!.open = true;
    fireEvent.click(booster as HTMLButtonElement);

    expect(addButton).toHaveTextContent('Add selected');

    fireEvent.click(addButton as HTMLButtonElement);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toMatchObject({
      code: 'immunity_lite',
      source: 'service_modal',
      boosterCodes: ['vitamin_d_shot'],
    });

    window.removeEventListener('nius:add-to-cart', listener);
  });
});
