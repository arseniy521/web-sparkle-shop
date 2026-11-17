const STRIP_STYLE = 'background:#b45309;color:#fff;font:600 14px/1.4 sans-serif;text-align:center;padding:6px 12px';

// The body of 404.html is a centring flex container, where a strip in the flow would become a
// column next to the content; there it is pinned to the top instead.
export function previewStrip(status) {
  const style = status === 404 ? `position:absolute;top:0;left:0;right:0;${STRIP_STYLE}` : STRIP_STYLE;
  return `<div style="${style}">Preview — orders are not sent to NIUS</div>`;
}

export async function onRequest({ next }) {
  // A copy, because headers of a response from next() are immutable.
  const original = await next();
  const response = new Response(original.body, original);
  response.headers.set('X-Robots-Tag', 'noindex');
  if (!response.headers.get('Content-Type')?.includes('text/html')) return response;
  const strip = previewStrip(response.status);
  return new HTMLRewriter()
    .on('body', { element: (body) => body.prepend(strip, { html: true }) })
    .transform(response);
}
