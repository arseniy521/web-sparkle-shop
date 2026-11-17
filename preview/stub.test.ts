// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { handleStubRequest } from './stub.js';
import { SERVICE_I18N, isOfferedOnWebsite } from '../src/scripts/cart-catalog';

describe('handleStubRequest', () => {
  it('answers the seven form requests', () => {
    expect(handleStubRequest('GET', '/services').status).toBe(200);
    expect(handleStubRequest('GET', '/auth/me/public').status).toBe(401);
    expect(handleStubRequest('GET', '/customers/summary').status).toBe(401);
    expect(handleStubRequest('POST', '/onboarding/order').status).toBe(201);
    expect(handleStubRequest('POST', '/onboarding/order/ord_test_1/contact-me').status).toBe(204);
    expect(handleStubRequest('POST', '/auth/google').status).toBe(200);
    expect(handleStubRequest('POST', '/auth/link-order').status).toBe(200);
  });

  it('answers 404 to anything else', () => {
    expect(handleStubRequest('GET', '/admin/users').status).toBe(404);
    expect(handleStubRequest('POST', '/services').status).toBe(404);
  });

  it('answers from the data it is given', () => {
    const data = { services: [], order: { id: 'x' }, authUser: { id: 'u' } };
    expect(handleStubRequest('GET', '/services', data).body).toEqual([]);
    expect(handleStubRequest('POST', '/onboarding/order', data).body).toEqual({ id: 'x' });
  });

  // The order form lists only the cart services the catalog answer knows; a service missing
  // here showed an empty cart on the preview after "Add to cart".
  it('serves every service the site offers', () => {
    const served = new Set(
      (handleStubRequest('GET', '/services').body as Array<{ code: string }>).map((s) => s.code),
    );
    // iv_infusion and escort are legacy aliases: the production catalog no longer serves them.
    const legacy = new Set(['iv_infusion', 'escort']);
    const offered = Object.keys(SERVICE_I18N).filter((code) => isOfferedOnWebsite(code) && !legacy.has(code));
    expect(offered.length).toBeGreaterThan(0);
    expect(offered.filter((code) => !served.has(code))).toEqual([]);
  });
});
