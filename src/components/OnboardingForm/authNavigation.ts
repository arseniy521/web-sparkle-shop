import { APP_NIUS_URL } from '@/constants/siteContacts';

const appUrl =
  (import.meta.env.VITE_APP_URL as string | undefined)?.trim() || APP_NIUS_URL;

function appOrigin(): string {
  return appUrl.replace(/\/$/, '');
}

export function cabinetHref(): string {
  return `${appOrigin()}/cabinet`;
}

export function replaceWithIntakeForm(): void {
  window.location.replace(`${appOrigin()}/form`);
}
