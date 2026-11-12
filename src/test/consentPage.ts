import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const indexHtmlPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../index.html');

export const GTAG_LOADER_SELECTOR = 'script[src^="https://www.googletagmanager.com/gtag/js"]';

type StoredChoice = 'accepted' | 'rejected' | null;

/** The Consent Mode bootstrap exactly as shipped: the first inline <script> of index.html. */
export function readInlineConsentScript(): string {
  const html = readFileSync(indexHtmlPath, 'utf8');
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!match) throw new Error('index.html: inline consent script not found');
  return match[1];
}

/** Puts the jsdom page into the state of a fresh page load with the given stored choices. */
export function resetConsentPage(stored: { cookie?: StoredChoice; legacy?: StoredChoice } = {}) {
  const page = window as unknown as Record<string, unknown>;
  delete page.dataLayer;
  delete page.__niusGtagLoaded;
  delete page['ga-disable-G-VNMLWF0XZG'];
  document.querySelectorAll(GTAG_LOADER_SELECTOR).forEach((node) => node.remove());
  document.cookie = 'nius_consent=; max-age=0; path=/';
  localStorage.clear();
  if (stored.cookie) document.cookie = `nius_consent=${stored.cookie}; path=/`;
  if (stored.legacy) localStorage.setItem('nius-cookie-consent', stored.legacy);
}

/** Runs the inline script the way the browser does, as a classic script in the page's global scope. */
export function runInlineConsentScript() {
  vm.runInThisContext(readInlineConsentScript(), { filename: indexHtmlPath });
}

/** dataLayer entries (gtag pushes `arguments` objects) as plain arrays. */
export function dataLayerEntries(): unknown[][] {
  return (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));
}
