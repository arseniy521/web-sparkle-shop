import { test as base, expect, type Page } from '@playwright/test';
import { E2E_ORIGIN, E2E_ORIGIN_IP } from './servers.ts';

const LOCAL_HOSTS = new Set([new URL(E2E_ORIGIN).host, new URL(E2E_ORIGIN_IP).host]);

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
 * cookies go to `.nius.cz`. Nothing leaves the machine: the page route answers from the e2e server.
 */
export async function serveSiteAt(page: Page, origin: string): Promise<void> {
  await page.route(`${origin}/**`, async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({ url: `${E2E_ORIGIN}${url.pathname}${url.search}` });
    await route.fulfill({ response });
  });
}
