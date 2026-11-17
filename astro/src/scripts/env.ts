const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const appUrl = (import.meta.env.VITE_APP_URL as string | undefined)?.trim();

export const API_BASE = (apiUrl || (import.meta.env.DEV ? '/api' : 'https://app.nius.cz/api')).replace(
  /\/+$/,
  '',
);
export const APP_URL = (appUrl || 'https://app.nius.cz').replace(/\/+$/, '');
