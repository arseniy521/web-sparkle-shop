export const GA_ID = 'G-VNMLWF0XZG';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

let loaded = false;

/** Loads gtag.js; called only after the visitor accepted cookies. */
export function loadGa(): void {
  if (loaded) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  // gtag.js reads the `arguments` object, an array would be ignored
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function gtag(..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  gtag('js', new Date());
  gtag('config', GA_ID);
}

/** Cookie banner "Reject" and a stored rejection. */
export function disableGa(): void {
  (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = true;
  document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = '_ga_VNMLWF0XZG=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}
