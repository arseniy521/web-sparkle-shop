import { handleStubRequest } from '../../stub.js';

export function onRequest({ request, params }) {
  const path = '/' + [].concat(params.path ?? []).join('/');
  const { status, body } = handleStubRequest(request.method, path);
  if (body === undefined) return new Response(null, { status });
  return Response.json(body, { status });
}
