import { APP_URL } from '@/scripts/env';

function appOrigin(): string {
  return APP_URL;
}

export function cabinetHref(): string {
  return `${appOrigin()}/cabinet`;
}

export function replaceWithIntakeForm(groupOrderId?: string): void {
  window.location.replace(groupOrderId ? `${appOrigin()}/cabinet/orders/${encodeURIComponent(groupOrderId)}` : `${appOrigin()}/form`);
}
