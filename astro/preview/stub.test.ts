// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { handleStubRequest } from './stub.js';

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
});
