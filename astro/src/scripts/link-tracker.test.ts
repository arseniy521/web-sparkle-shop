import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { initLinkTracker } from './link-tracker';

// trackCtaClick counts as an event accepted by the SDK unless `active` is false (no consent, SDK
// not loaded or opted out), mirroring trackedEvents() in analytics.ts.
const analytics = vi.hoisted(() => {
  const sdk = { active: true, tracked: 0 };
  return {
    sdk,
    trackCtaClick: vi.fn(() => {
      if (sdk.active) sdk.tracked += 1;
    }),
    trackedEvents: vi.fn(() => sdk.tracked),
    flushAnalyticsWithin: vi.fn(() => Promise.resolve()),
  };
});
vi.mock('@/scripts/analytics', async () => ({
  ...(await vi.importActual<typeof import('./analytics')>('./analytics')),
  ...analytics,
}));

const navigate = vi.fn();

const click = (html: string) => {
  document.body.innerHTML = html;
  document.body.querySelector<HTMLElement>('a')!.click();
};

/** Clicks the first link with the given mouse event options; true when the default action was kept. */
const clickWith = (html: string, init: MouseEventInit = {}) => {
  document.body.innerHTML = html;
  const link = document.body.querySelector('a')!;
  return link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }));
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('link tracker', () => {
  beforeAll(() => initLinkTracker(navigate));
  beforeEach(() => {
    document.body.innerHTML = '';
    analytics.sdk.active = true;
    history.pushState({}, '', '/page/');
  });

  it('tracks tel: and wa.me links with the data-analytics-source of the link', () => {
    click('<a href="tel:+420000000000" data-analytics-source="footer">call</a>');
    expect(analytics.trackCtaClick).toHaveBeenCalledWith('phone', 'footer');
    click('<a href="https://wa.me/420000000000">chat</a>');
    expect(analytics.trackCtaClick).toHaveBeenCalledWith('whatsapp', 'page_content');
  });

  it('tracks [data-cta] links such as the #menu navigation', () => {
    click(
      '<a href="#menu" data-cta="choose_service" data-analytics-source="header_navigation"><span>Menu</span></a>',
    );
    expect(analytics.trackCtaClick).toHaveBeenCalledWith('choose_service', 'header_navigation');
  });

  it('ignores a data-cta value that is not a known CTA', () => {
    click('<a href="#x" data-cta="made_up" data-analytics-source="footer">x</a>');
    expect(analytics.trackCtaClick).not.toHaveBeenCalled();
  });

  it('falls back to page_content for an unknown source', () => {
    click('<a href="tel:+420000000000" data-analytics-source="made_up">call</a>');
    expect(analytics.trackCtaClick).toHaveBeenCalledWith('phone', 'page_content');
  });

  it('ignores other links', () => {
    expect(clickWith('<a href="/en/">home</a>')).toBe(true);
    expect(analytics.trackCtaClick).not.toHaveBeenCalled();
    expect(analytics.flushAnalyticsWithin).not.toHaveBeenCalled();
  });

  describe('a tracked click that leaves the page', () => {
    it('holds the navigation until the upload is done, then follows the link', async () => {
      let uploaded!: () => void;
      analytics.flushAnalyticsWithin.mockImplementationOnce(() => new Promise<void>((resolve) => (uploaded = resolve)));

      expect(clickWith('<a href="/#menu" data-cta="choose_service">Menu</a>')).toBe(false);
      expect(analytics.flushAnalyticsWithin).toHaveBeenCalledWith(300);
      await settle();
      expect(navigate).not.toHaveBeenCalled();

      uploaded();
      await settle();
      expect(navigate).toHaveBeenCalledExactlyOnceWith(`${window.location.origin}/#menu`);
    });

    it('also holds a click tracked by the link’s own listener (account link, language switch)', async () => {
      document.body.innerHTML = '<a href="https://app.nius.cz/login" data-account-link="header">Account</a>';
      const link = document.body.querySelector('a')!;
      link.addEventListener('click', () => analytics.trackCtaClick());
      expect(link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))).toBe(false);
      await settle();
      expect(navigate).toHaveBeenCalledExactlyOnceWith('https://app.nius.cz/login');
    });

    it('is left alone when analytics is not active', async () => {
      analytics.sdk.active = false;
      expect(clickWith('<a href="/en/" data-cta="choose_service">Menu</a>')).toBe(true);
      expect(analytics.trackCtaClick).toHaveBeenCalled();
      expect(analytics.flushAnalyticsWithin).not.toHaveBeenCalled();
      await settle();
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('keeps the native behaviour of a tracked click that does not unload the tab', () => {
    const tracked = (attrs: string, href = '/en/') => `<a href="${href}" data-cta="choose_service" ${attrs}>x</a>`;

    it.each([
      ['Ctrl', { ctrlKey: true }],
      ['Meta', { metaKey: true }],
      ['Shift', { shiftKey: true }],
      ['Alt', { altKey: true }],
      ['the middle button', { button: 1 }],
    ])('with %s', async (_name, init) => {
      expect(clickWith(tracked(''), init)).toBe(true);
      expect(analytics.trackCtaClick).toHaveBeenCalled();
      expect(analytics.flushAnalyticsWithin).not.toHaveBeenCalled();
      await settle();
      expect(navigate).not.toHaveBeenCalled();
    });

    it.each([
      ['target="_blank"', tracked('target="_blank"')],
      ['download', tracked('download')],
      ['tel:', '<a href="tel:+420000000000">call</a>'],
      ['mailto:', tracked('', 'mailto:info@example.com')],
      ['a fragment of this page', tracked('', '#menu')],
      ['a fragment of this page by path', tracked('', '/page/#menu')],
      ['an empty fragment', tracked('', '#')],
    ])('for %s', async (_name, html) => {
      expect(clickWith(html)).toBe(true);
      expect(analytics.trackCtaClick).toHaveBeenCalled();
      expect(analytics.flushAnalyticsWithin).not.toHaveBeenCalled();
      await settle();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('when another listener already cancelled the click', async () => {
      document.body.innerHTML = tracked('');
      const link = document.body.querySelector('a')!;
      link.addEventListener('click', (event) => event.preventDefault());
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      expect(analytics.trackCtaClick).toHaveBeenCalled();
      expect(analytics.flushAnalyticsWithin).not.toHaveBeenCalled();
      await settle();
      expect(navigate).not.toHaveBeenCalled();
    });
  });
});
