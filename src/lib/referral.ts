/**
 * Partner referral code (NIU-28): `?ref=<CODE>` from a QR link is kept in memory
 * and in the `nius_ref` cookie (.nius.cz, 30 days) and sent as `referralCode`
 * when creating an onboarding order. Written regardless of analytics consent
 * (owner decision). Must never throw: it runs before render and during prerender.
 */

const REFERRAL_COOKIE = 'nius_ref';
const MAX_AGE_SECONDS = 2_592_000;

export const REFERRAL_CODE_RE = /^[A-HJKMNP-Z2-9]{6}$/;

let memoryCode: string | undefined;

const normalize = (raw: string | null | undefined): string | undefined => {
  const code = raw?.trim().toUpperCase();
  return code && REFERRAL_CODE_RE.test(code) ? code : undefined;
};

const readCookie = (): string | undefined => {
  try {
    const raw = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${REFERRAL_COOKIE}=`))
      ?.slice(REFERRAL_COOKIE.length + 1);
    return normalize(raw);
  } catch {
    return undefined;
  }
};

const writeCookie = (code: string): void => {
  try {
    const domain = import.meta.env.PROD ? '; domain=.nius.cz' : '';
    const secure = import.meta.env.PROD ? '; Secure' : '';
    document.cookie =
      `${REFERRAL_COOKIE}=${code}; max-age=${MAX_AGE_SECONDS}; path=/${domain}; SameSite=Lax${secure}`;
  } catch {
    // ignore — cookies may be unavailable
  }
};

export const captureReferral = (search?: string): void => {
  try {
    const query = search ?? window.location.search;
    const code = normalize(new URLSearchParams(query).get('ref'));
    if (!code) return;
    memoryCode = code;
    writeCookie(code);
  } catch {
    // ignore
  }
};

export const getReferralCode = (): string | undefined => memoryCode ?? readCookie();

export const resetReferralForTests = (): void => {
  memoryCode = undefined;
};
