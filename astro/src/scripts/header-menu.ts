const SCROLL_THRESHOLD = 60;

export function initHeaderMenu(doc: Document = document): void {
  const win = doc.defaultView as Window;

  const setMenu = (open: boolean) => {
    const toggle = doc.querySelector<HTMLElement>('[data-menu-toggle]');
    const menu = doc.querySelector<HTMLElement>('[data-mobile-menu]');
    if (!toggle || !menu) return;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    const menuIcon = toggle.querySelector<SVGElement | HTMLElement>('[data-menu-icon="menu"]');
    const closeIcon = toggle.querySelector<SVGElement | HTMLElement>('[data-menu-icon="close"]');
    if (menuIcon) menuIcon.classList.toggle('hidden', open);
    if (closeIcon) closeIcon.classList.toggle('hidden', !open);
  };

  const setDropdown = (root: Element, open: boolean) => {
    const trigger = root.querySelector<HTMLElement>('[data-dropdown-trigger]');
    const panel = root.querySelector<HTMLElement>('[data-dropdown-panel]');
    if (!trigger || !panel) return;
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    trigger.dataset.state = open ? 'open' : 'closed';
  };

  const closeDropdowns = (except?: Element | null) => {
    doc.querySelectorAll('[data-dropdown]').forEach((root) => {
      if (root !== except) setDropdown(root, false);
    });
  };

  win.addEventListener('scroll', () => {
    const header = doc.querySelector<HTMLElement>('header[role="banner"]');
    if (header) header.dataset.scrolled = String(win.scrollY > SCROLL_THRESHOLD);
  });

  doc.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const trigger = target.closest('[data-dropdown-trigger]');
    const root = trigger?.closest('[data-dropdown]') ?? null;
    if (root) {
      const panel = root.querySelector<HTMLElement>('[data-dropdown-panel]');
      closeDropdowns(root);
      setDropdown(root, Boolean(panel?.hidden));
      return;
    }
    if (!target.closest('[data-dropdown]')) closeDropdowns();

    const toggle = target.closest('[data-menu-toggle]');
    if (toggle) {
      const menu = doc.querySelector<HTMLElement>('[data-mobile-menu]');
      setMenu(Boolean(menu?.hidden));
      return;
    }
    if (target.closest('[data-mobile-menu] a[href]')) setMenu(false);
  });

  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDropdowns();
  });
}
