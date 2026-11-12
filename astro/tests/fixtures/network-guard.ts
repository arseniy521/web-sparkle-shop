import { test as base, expect, type Page } from '@playwright/test';
import { E2E_ORIGIN, E2E_ORIGIN_IP, MERGED_ORIGIN } from './servers.ts';

const LOCAL_HOSTS = new Set([E2E_ORIGIN, E2E_ORIGIN_IP, MERGED_ORIGIN].map((origin) => new URL(origin).host));

// Every e2e test runs behind this guard: a request to any host other than the local server
// that no page route of a fixture or test answered is aborted and fails the test. Page routes
// take precedence over this context route, so stubs installed on the page are not affected.
export const test = base.extend<{ networkGuard: void }>({
  networkGuard: [
    async ({ context }, use) => {
      const escaped: string[] = [];
      await context.route('**/*', (route) => {
        const url = new URL(route.request().url());
        if (LOCAL_HOSTS.has(url.host)) return route.fallback();
        // The layout links the Google Fonts stylesheet; an empty one keeps the page offline.
        if (url.host === 'fonts.googleapis.com') return route.fulfill({ contentType: 'text/css', body: '' });
        escaped.push(`${route.request().method()} ${url.origin}${url.pathname}`);
        return route.abort('blockedbyclient');
      });
      await use();
      expect(escaped, 'requests that would have left the machine').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/**
 * Serves the local build under another origin inside this page, e.g. https://www.nius.cz, where
 * cookies go to `.nius.cz`. Nothing leaves the machine: the page route answers from the local
 * server, the e2e one unless another is given.
 */
export async function serveSiteAt(page: Page, origin: string, server = E2E_ORIGIN): Promise<void> {
  await page.route(`${origin}/**`, async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({ url: `${server}${url.pathname}${url.search}` });
    await route.fulfill({ response });
  });
}
