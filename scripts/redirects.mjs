// Old addresses published as static redirect stubs (GitHub Pages has no server-side redirects).
// Shared by scripts/prerender.js (writes the stubs) and scripts/check-seo-build.mjs (verifies them).

export const SITE_URL = 'https://www.nius.cz';

export const redirects = [
  // IV drips: legacy slugs -> current canonical slugs (no chains)
  { from: '/iv-drips-prague', to: '/iv-kapacky-praha/' },
  { from: '/ru/iv-drips-prague', to: '/ru/kapelnitsy-praga/' },
  { from: '/iv-drip-therapy-prague', to: '/iv-kapacky-praha/' },
  { from: '/en/iv-drip-therapy-prague', to: '/en/iv-drips-prague/' },
  { from: '/ru/iv-drip-therapy-prague', to: '/ru/kapelnitsy-praga/' },
  { from: '/uk/iv-drip-therapy-prague', to: '/uk/iv-drips-prague/' },
  { from: '/ivf-injection-support-prague', to: '/ivf-support-prague/' },
  { from: '/en/ivf-injection-support-prague', to: '/en/ivf-support-prague/' },
  { from: '/ru/ivf-injection-support-prague', to: '/ru/ivf-support-prague/' },
  { from: '/uk/ivf-injection-support-prague', to: '/uk/ivf-support-prague/' },
  // Hangover pages were replaced by the rehydration pages
  { from: '/kapacka-na-kocovinu-praha', to: '/rehydratace-praha/' },
  { from: '/en/hangover-iv-drip-prague', to: '/en/rehydration-iv-drip-prague/' },
  { from: '/ru/kapelnica-ot-pokhmelya-praga', to: '/ru/regidratatsiya-kapelnitsa-praga/' },
  { from: '/uk/krapelnytsia-vid-pokhmellia-praga', to: '/uk/rehidratatsiia-krapelnytsia-praga/' },
  // Language-code prefixes that never existed as real sections
  { from: '/cs', to: '/' },
  { from: '/cz', to: '/' },
];

const escapeHtmlAttribute = (value) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// A JS string literal that is safe inside an inline <script>: the value can neither end the
// string nor close the script element.
const toInlineScriptString = (value) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

// The script runs first and keeps the query string and the hash (?ref=, gclid, utm_*) of the
// incoming address; the meta refresh is the fallback without JavaScript and the redirect signal
// for crawlers. No robots tag: "noindex" would contradict "this page has moved".
export const buildRedirectStub = (targetUrl) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <script>window.location.replace(${toInlineScriptString(targetUrl)} + window.location.search + window.location.hash);</script>
  <meta http-equiv="refresh" content="0;url=${escapeHtmlAttribute(targetUrl)}">
  <link rel="canonical" href="${escapeHtmlAttribute(targetUrl)}">
  <title>Redirecting...</title>
</head>
<body>
  <p>This page has moved. <a href="${escapeHtmlAttribute(targetUrl)}">Click here</a> if you are not redirected.</p>
</body>
</html>`;
