import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { initLinkTracker } from './link-tracker';

const analytics = vi.hoisted(() => ({ trackCtaClick: vi.fn() }));
vi.mock('@/scripts/analytics', () => analytics);

const click = (html: string) => {
  document.body.innerHTML = html;
  document.body.querySelector<HTMLElement>('a')!.click();
};

describe('link tracker', () => {
  beforeAll(() => initLinkTracker());
  beforeEach(() => {
    document.body.innerHTML = '';
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

  it('ignores other links', () => {
    click('<a href="/en/">home</a>');
    expect(analytics.trackCtaClick).not.toHaveBeenCalled();
  });
});
