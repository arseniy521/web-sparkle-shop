const STRIP =
  '<div style="background:#b45309;color:#fff;font:600 14px/1.4 sans-serif;text-align:center;padding:6px 12px">' +
  'Preview — orders are not sent to NIUS</div>';

export async function onRequest({ next }) {
  // A copy, because headers of a response from next() are immutable.
  const original = await next();
  const response = new Response(original.body, original);
  response.headers.set('X-Robots-Tag', 'noindex');
  if (!response.headers.get('Content-Type')?.includes('text/html')) return response;
  return new HTMLRewriter()
    .on('body', { element: (body) => body.prepend(STRIP, { html: true }) })
    .transform(response);
}
