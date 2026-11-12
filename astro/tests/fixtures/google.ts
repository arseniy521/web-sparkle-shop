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

// Stands in for gtag.js. It is NOT gtag.js and proves only what the site hands to gtag through
// dataLayer: that a `config` command for the id is given (and asks for a page view unless it
// passes send_page_view: false), and which event names and parameters the site passes. It cannot
// show what the real gtag.js puts in a hit (enhanced measurement, form interactions, `_ga`
// cookies, its own `dl`/`dt` values), its beacon or unload behaviour, Consent Mode, or whether
// window['ga-disable-<id>'] stops the real library. Annotations based on `dl` are self-fulfilling.
//
// What it does: like gtag.js with default settings, it sends a page_view hit per `config` command
// (none with send_page_view: false) and a hit per `event` command with its parameters as
// `ep.<name>`, page_location (`dl`) = location.href, and nothing while window['ga-disable-<id>'] is set.
const GTAG_STUB = `
  (function () {
    var id = new URL(document.currentScript.src).searchParams.get('id');
    function hit(name, params) {
      if (window['ga-disable-' + id]) return;
      var query = new URLSearchParams({ v: '2', tid: id, en: name, dl: location.href, dt: document.title });
      Object.keys(params || {}).forEach(function (key) {
        var value = params[key];
        query.set('ep.' + key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      });
      fetch('https://www.google-analytics.com/g/collect?' + query, { method: 'POST', mode: 'no-cors', keepalive: true });
    }
    function handle(args) {
      if (args[0] === 'config' && args[1] === id) {
        if (!(args[2] && args[2].send_page_view === false)) hit('page_view', args[2]);
      } else if (args[0] === 'event') hit(args[1], args[2]);
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
