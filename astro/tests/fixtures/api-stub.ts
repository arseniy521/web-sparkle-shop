import type { Page, Route } from '@playwright/test';
import type { AuthUser, OnboardingOrder } from '../../src/islands/order-form/api/onboarding';
import type { PublicServiceDto } from '../../src/islands/order-form/api/services';
import stubData from '../../preview/stub-data.json' with { type: 'json' };

export interface StubData {
  services: PublicServiceDto[];
  order: OnboardingOrder;
  authUser: AuthUser;
}

export async function installApiStub(page: Page, overrides: Partial<StubData> = {}): Promise<void> {
  const data: StubData = { ...(stubData as StubData), ...overrides };
  await page.route('**/api/**', (route) => respond(route, data));
  await page.route('https://api.mapy.com/**', (route) => route.fulfill({ json: { items: [] } }));
}

function respond(route: Route, data: StubData) {
  const request = route.request();
  const headers = {
    'access-control-allow-origin': request.headers()['origin'] ?? '*',
    'access-control-allow-credentials': 'true',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type, X-Requested-With, x-onboarding-token',
  };
  const path = new URL(request.url()).pathname.replace(/^.*?\/api(?=\/)/, '');
  const call = `${request.method()} ${path}`;
  if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
  if (call === 'GET /services') return route.fulfill({ headers, json: data.services });
  if (call === 'GET /auth/me/public' || call === 'GET /customers/summary') {
    return route.fulfill({ status: 401, headers, json: { message: 'Unauthorized' } });
  }
  if (call === 'POST /onboarding/order') return route.fulfill({ status: 201, headers, json: data.order });
  if (/^POST \/onboarding\/order\/[^/]+\/contact-me$/.test(call)) return route.fulfill({ status: 204, headers });
  if (call === 'POST /auth/google') return route.fulfill({ headers, json: data.authUser });
  if (call === 'POST /auth/link-order') return route.fulfill({ headers, json: { linked: true } });
  return route.fallback();
}
