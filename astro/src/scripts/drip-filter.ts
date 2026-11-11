// The classes the old React filter switched between for the chosen and the other buttons.
const ACTIVE = ['bg-primary', 'text-primary-foreground'];
const INACTIVE = ['bg-muted', 'hover:bg-muted/80', 'text-muted-foreground'];

/**
 * Category filter of the drip menu: a [data-filter] button shows the [data-category] group of
 * its value ("all" shows every group). Other groups get `hidden` and stay in the HTML, so
 * without JavaScript every drip is shown.
 */
export function initDripFilter(root: ParentNode = document): void {
  const buttons = Array.from(root.querySelectorAll<HTMLElement>('[data-filter]'));
  const groups = Array.from(root.querySelectorAll<HTMLElement>('[data-category]'));
  if (buttons.length === 0) return;

  const select = (chosen: HTMLElement) => {
    const value = chosen.dataset.filter;
    for (const group of groups) group.hidden = value !== 'all' && group.dataset.category !== value;
    for (const button of buttons) {
      const active = button === chosen;
      button.setAttribute('aria-pressed', String(active));
      button.classList.remove(...(active ? INACTIVE : ACTIVE));
      button.classList.add(...(active ? ACTIVE : INACTIVE));
    }
  };

  for (const button of buttons) button.addEventListener('click', () => select(button));
}
