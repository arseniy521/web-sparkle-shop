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
  const button = cartControl(menu).querySelector<HTMLButtonElement>('[data-quick-add]');
  expect(button).toBeTruthy();
  return button as HTMLButtonElement;
}

function cartControl(menu: HTMLElement) {
  const control = menu.shadowRoot?.querySelector<HTMLElement>(
    '[data-cart-control][data-code="immunity_lite"]',
  );
  expect(control).toBeTruthy();
  return control as HTMLElement;
}

describe('nius-menu custom element', () => {
  it.each([
    { locale: 'en', name: 'Immunity Lite', empty: 'Add to cart', decrease: 'Decrease quantity', increase: 'Increase quantity' },
    { locale: 'cs', name: 'Imunita Lite', empty: 'Do košíku', decrease: 'Snížit množství', increase: 'Zvýšit množství' },
    { locale: 'ru', name: 'Иммунитет Лайт', empty: 'В корзину', decrease: 'Уменьшить количество', increase: 'Увеличить количество' },
    { locale: 'uk', name: 'Імунітет Лайт', empty: 'У кошик', decrease: 'Зменшити кількість', increase: 'Збільшити кількість' },
  ])('renders an accessible quantity stepper for $locale', ({
    locale,
    name,
    empty,
    decrease,
    increase,
  }) => {
    const menu = mountMenu(locale);
    const button = quickAddButton(menu);

    expect(button).toHaveTextContent(empty);
    expect(button).toHaveAccessibleName(`${empty}: ${name}`);

    menu.setAttribute('cart-codes', JSON.stringify(['immunity_lite', 'immunity_lite']));

    const control = cartControl(menu);
    expect(control.querySelector('.cart-count')).toHaveTextContent('2');
    expect(control.querySelector('[data-quantity-action="decrease"]'))
      .toHaveAccessibleName(`${decrease}: ${name}`);
    expect(control.querySelector('[data-quantity-action="increase"]'))
      .toHaveAccessibleName(`${increase}: ${name}`);
  });

  it.each(['service_catalog', 'service_modal'])('adds from %s without a popup notification', (source) => {
    const menu = mountMenu('en');
    const listener = vi.fn();
    window.addEventListener('nius:add-to-cart', listener);

    try {
      if (source === 'service_catalog') {
        fireEvent.click(quickAddButton(menu));
      } else {
        const info = menu.shadowRoot!.querySelector<HTMLButtonElement>('[data-drip="immunity-0"] .drip-info')!;
        fireEvent.click(info);
        const addButton = menu.shadowRoot!.querySelector<HTMLButtonElement>('[data-modal-add]')!;
        fireEvent.click(addButton);
      }

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].detail).toMatchObject({ code: 'immunity_lite', source });

      menu.setAttribute('cart-codes', JSON.stringify(['immunity_lite']));

      expect(cartControl(menu).querySelector('.cart-count')).toHaveTextContent('1');
      expect(menu.shadowRoot!.querySelector('[data-cart-feedback], [role="status"]')).toBeNull();
    } finally {
      window.removeEventListener('nius:add-to-cart', listener);
    }
  });

  it('uses the same quantity controls as the cart', () => {
    const menu = mountMenu('en', ['immunity_lite']);
    const listener = vi.fn();
    window.addEventListener('nius:change-cart-quantity', listener);

    try {
      const control = cartControl(menu);
      const remove = control.querySelector<HTMLButtonElement>(
        '[data-quantity-action="remove"]',
      );
      expect(remove).toHaveAccessibleName('Remove from cart: Immunity Lite');
      fireEvent.click(remove!);

      menu.setAttribute(
        'cart-codes',
        JSON.stringify(['immunity_lite', 'immunity_lite']),
      );
      const updatedControl = cartControl(menu);
      fireEvent.click(
        updatedControl.querySelector<HTMLButtonElement>(
          '[data-quantity-action="decrease"]',
        )!,
      );
      fireEvent.click(
        updatedControl.querySelector<HTMLButtonElement>(
          '[data-quantity-action="increase"]',
        )!,
      );

      expect(listener.mock.calls.map(([event]) => event.detail.delta))
        .toEqual([-1, -1, 1]);
    } finally {
      window.removeEventListener('nius:change-cart-quantity', listener);
    }
  });

  it('does not open the service dialog from the quantity stepper', () => {
    const menu = mountMenu('en', ['immunity_lite']);
    const modal = menu.shadowRoot!.querySelector<HTMLDialogElement>('[data-modal]');
    fireEvent.click(
      cartControl(menu).querySelector<HTMLButtonElement>(
        '[data-quantity-action="increase"]',
      )!,
    );
    fireEvent.click(cartControl(menu).querySelector('.cart-count')!);

    expect(modal).not.toHaveAttribute('open');
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
