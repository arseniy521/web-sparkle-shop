import { test as base, expect } from '@playwright/test';

const LOCAL_HOSTS = new Set(['localhost:8090', '127.0.0.1:8090']);

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
