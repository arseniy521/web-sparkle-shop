// The single stand-in for the NIUS API: used by the Playwright stub and by the preview's
// Cloudflare Pages Function. Plain ES module without dependencies. Never echoes the request.
import stubData from './stub-data.json' with { type: 'json' };

const UNAUTHORIZED = { message: 'Unauthorized' };

/** @param {{ services: unknown; order: unknown; authUser: unknown }} [data] */
export function handleStubRequest(method, path, data = stubData) {
  const call = `${method} ${path}`;
  if (call === 'GET /services') return { status: 200, body: data.services };
  if (call === 'GET /auth/me/public' || call === 'GET /customers/summary') {
    return { status: 401, body: UNAUTHORIZED };
  }
  if (call === 'POST /onboarding/order') return { status: 201, body: data.order };
  if (/^POST \/onboarding\/order\/[^/]+\/contact-me$/.test(call)) return { status: 204 };
  if (call === 'POST /auth/google') return { status: 200, body: data.authUser };
  if (call === 'POST /auth/link-order') return { status: 200, body: { linked: true } };
  return { status: 404 };
}
