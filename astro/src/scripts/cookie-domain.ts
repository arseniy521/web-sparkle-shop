type Loc = Pick<Location, 'hostname' | 'protocol'>;

const SHARED_HOST = 'www.nius.cz';
const SHARED_DOMAIN = '.nius.cz';

export function sharedCookieDomain(loc: Loc = window.location): string | undefined {
  return loc.hostname === SHARED_HOST ? SHARED_DOMAIN : undefined;
}

export function cookieAttributes(loc: Loc = window.location): string {
  const domain = sharedCookieDomain(loc);
  const secure = loc.protocol === 'https:' ? '; Secure' : '';
  return `${domain ? `; domain=${domain}` : ''}${secure}`;
}
