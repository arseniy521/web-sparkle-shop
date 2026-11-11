import type { Page } from '@playwright/test';

// Replaces Google Identity Services: the auth-code client calls back with `code` as soon as
// the visitor asks for a code, as if the Google popup had been confirmed.
export async function stubGoogleIdentity(page: Page, code: string): Promise<void> {
  const script = `
    window.google = {
      accounts: {
        oauth2: {
          initCodeClient: function (config) {
            return {
              requestCode: function () {
                setTimeout(function () { config.callback({ code: ${JSON.stringify(code)}, scope: config.scope }); }, 0);
              },
            };
          },
        },
      },
    };`;
  await page.route(/^https:\/\/accounts\.google\.com\/gsi\/client(\?|$)/, (route) =>
    route.fulfill({ contentType: 'text/javascript', body: script }),
  );
}

export interface GaCapture {
  /** URLs of the gtag.js requests. */
  scripts(): string[];
  /** Hit URLs sent to Google Analytics, with the request body if any. */
  hits(): Array<{ url: string; body: string }>;
}

// Stands in for gtag.js: it reads the dataLayer the site fills and, like gtag.js with default
// settings, sends a page_view hit per `config` command and a hit per `event` command, with
// page_location (`dl`) = location.href and nothing sent while window['ga-disable-<id>'] is set.
// What the real gtag.js adds to a hit is not checked here.
const GTAG_STUB = `
  (function () {
    var id = new URL(document.currentScript.src).searchParams.get('id');
    function hit(name) {
      if (window['ga-disable-' + id]) return;
      var query = new URLSearchParams({ v: '2', tid: id, en: name, dl: location.href, dt: document.title });
      fetch('https://www.google-analytics.com/g/collect?' + query, { method: 'POST', mode: 'no-cors', keepalive: true });
    }
    function handle(args) {
      if (args[0] === 'config' && args[1] === id) hit('page_view');
      else if (args[0] === 'event') hit(args[1]);
    }
    var layer = (window.dataLayer = window.dataLayer || []);
    Array.prototype.forEach.call(layer, handle);
    var push = layer.push;
    layer.push = function () {
      Array.prototype.forEach.call(arguments, handle);
      return push.apply(layer, arguments);
    };
  })();`;

export async function captureGa(page: Page): Promise<GaCapture> {
  const scripts: string[] = [];
  const hits: Array<{ url: string; body: string }> = [];
  await page.route(/^https:\/\/www\.googletagmanager\.com\/gtag\/js\?/, (route) => {
    scripts.push(route.request().url());
    return route.fulfill({ contentType: 'text/javascript', body: GTAG_STUB });
  });
  await page.route(/^https:\/\/([^/]+\.)?google-analytics\.com\//, (route) => {
    hits.push({ url: route.request().url(), body: route.request().postData() ?? '' });
    return route.fulfill({ status: 204 });
  });
  return { scripts: () => [...scripts], hits: () => [...hits] };
}
