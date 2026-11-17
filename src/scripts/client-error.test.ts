import { beforeEach, describe, expect, it, vi } from 'vitest';

const analytics = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock('@/scripts/analytics', () => analytics);

const load = () => import('./client-error');

describe('client errors', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('reports block and error type, never the message', async () => {
    const { reportClientError } = await load();
    reportClientError('order_form', new TypeError('phone +420 000 000 000'));
    expect(analytics.track).toHaveBeenCalledWith('client_error', {
      block: 'order_form',
      error_type: 'TypeError',
    });
  });

  it('uses Error for values that are not errors', async () => {
    const { reportClientError } = await load();
    reportClientError('page', 'secret text');
    expect(analytics.track).toHaveBeenCalledWith('client_error', {
      block: 'page',
      error_type: 'Error',
    });
  });

  it('reports at most five errors per page', async () => {
    const { reportClientError } = await load();
    for (let i = 0; i < 7; i += 1) reportClientError(i % 2 ? 'a' : 'b', new Error('x'));
    expect(analytics.track).toHaveBeenCalledTimes(5);
  });

  it('reports window errors and unhandled rejections under the page block', async () => {
    const { installGlobalErrorHandlers } = await load();
    installGlobalErrorHandlers();
    window.dispatchEvent(new ErrorEvent('error', { error: new RangeError('boom'), message: 'boom' }));
    const rejection = new Event('unhandledrejection') as Event & { reason: unknown };
    rejection.reason = new SyntaxError('bad');
    window.dispatchEvent(rejection);
    expect(analytics.track).toHaveBeenCalledWith('client_error', {
      block: 'page',
      error_type: 'RangeError',
    });
    expect(analytics.track).toHaveBeenCalledWith('client_error', {
      block: 'page',
      error_type: 'SyntaxError',
    });
  });
});
