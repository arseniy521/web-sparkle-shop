/**
 * On the home page the old site scrolled smoothly instead of following its own links: the header
 * links to its sections (#menu, #how-it-works, #our-nurses, #testimonials), the "choose a service"
 * buttons of the hero and the final call, and the header logo (to the top). The address stays as it
 * was. Analytics of these links is the link tracker's (data-cta), which runs on the document.
 *
 * Only on a page with the hero (#home); a link to another page, a link to this page without a
 * section (the language switch to the current language) and a modified or non-primary click keep
 * the browser's behaviour.
 */
export function initSamePageScroll(): void {
  if (!document.querySelector('#home')) return;

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) return;
    if (anchor.target && anchor.target !== '_self') return;

    let url: URL;
    try {
      url = new URL(anchor.href);
    } catch {
      return;
    }
    const here = window.location;
    if (url.origin !== here.origin || url.pathname !== here.pathname || url.search !== here.search) return;

    if (url.hash) {
      const section = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!section) return;
      event.preventDefault();
      section.scrollIntoView({ behavior: 'smooth' });
    } else if (anchor.hasAttribute('data-logo-link')) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
