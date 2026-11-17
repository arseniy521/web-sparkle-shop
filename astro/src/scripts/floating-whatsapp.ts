const SCROLL_THRESHOLD = 300;
const SHOWN = ['opacity-100', 'translate-y-0'];
const HIDDEN = ['opacity-0', 'translate-y-10', 'pointer-events-none'];

/**
 * The floating WhatsApp link appears once the page is scrolled past SCROLL_THRESHOLD. Like the
 * old component it reacts to scroll events only, so it starts hidden.
 */
export function initFloatingWhatsApp(): void {
  const link = document.querySelector<HTMLElement>('[data-floating-whatsapp]');
  if (!link) return;
  window.addEventListener('scroll', () => {
    const visible = window.scrollY > SCROLL_THRESHOLD;
    link.classList.remove(...(visible ? HIDDEN : SHOWN));
    link.classList.add(...(visible ? SHOWN : HIDDEN));
  });
}
