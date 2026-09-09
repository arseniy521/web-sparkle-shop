const appUrl =
  (import.meta.env.VITE_APP_URL as string | undefined)?.trim() ||
  'https://app.nius.cz';

export function replaceWithIntakeForm(): void {
  window.location.replace(`${appUrl.replace(/\/$/, '')}/form`);
}
