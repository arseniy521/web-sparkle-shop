/**
 * Analytics consent, shared across www.nius.cz and app.nius.cz.
 *
 * Stored in a `nius_consent` cookie on `.nius.cz` (180 days) so consent given
 * on either surface applies to both — same trick as the Amplitude device_id.
 * A twin helper lives in nius/frontend/src/lib/consent.ts; keep them in sync.
 */

const CONSENT_COOKIE = 'nius_consent';
const LEGACY_STORAGE_KEY = 'nius-cookie-consent';
const MAX_AGE_SECONDS = 180 * 86_400;

export type ConsentValue = 'accepted' | 'rejected';

const isConsentValue = (v: string | undefined | null): v is ConsentValue =>
  v === 'accepted' || v === 'rejected';

const readCookie = (): ConsentValue | null => {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`))
    ?.split('=')[1];
  return isConsentValue(match) ? match : null;
};

export const setConsent = (value: ConsentValue): void => {
  const domain = import.meta.env.PROD ? '; domain=.nius.cz' : '';
  const secure = import.meta.env.PROD ? '; Secure' : '';
  document.cookie =
    `${CONSENT_COOKIE}=${value}; max-age=${MAX_AGE_SECONDS}; path=/${domain}; SameSite=Lax${secure}`;
  try {
    // Keep the legacy key updated so older cached bundles stay consistent.
    localStorage.setItem(LEGACY_STORAGE_KEY, value);
  } catch {
    // ignore — private browsing mode may throw
  }
};

export const getConsent = (): ConsentValue | null => {
  const fromCookie = readCookie();
  if (fromCookie) return fromCookie;

  // Migrate the pre-cookie localStorage consent so returning visitors are
  // not asked again.
  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (isConsentValue(legacy)) {
      setConsent(legacy);
      return legacy;
    }
  } catch {
    // ignore
  }
  return null;
};
