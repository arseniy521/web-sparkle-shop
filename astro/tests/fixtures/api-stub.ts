import type { Page, Route } from '@playwright/test';
import type { AuthUser, OnboardingOrder } from '../../src/islands/order-form/api/onboarding';
import type { PublicServiceDto } from '../../src/islands/order-form/api/services';
import { handleStubRequest } from '../../preview/stub.js';
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
  if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
  // A call the stub does not know is answered here too (404), never passed to the network.
  const { status, body } = handleStubRequest(request.method(), path, data);
  return route.fulfill({ status, headers, ...(body === undefined ? {} : { json: body }) });
}
