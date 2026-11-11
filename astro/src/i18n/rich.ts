const CLASS = 'text-primary underline-offset-4 hover:underline';
const TOKEN = /^(<strong>|<\/strong>|<\/a>|<a\s+href="([^"]*)"\s*>)/;

function isSafeHref(raw: string): boolean {
  const h = raw.trim();
  if (!h) return false;
  const lower = h.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return false;
  }
  if (h.startsWith('/')) {
    return /^\/[\w./?#&=%-]*$/i.test(h) && !h.includes('//');
  }
  if (/^mailto:/i.test(h)) {
    return h.length <= 900 && /^mailto:[^\s:]+@[^\s]+/i.test(h.split('?')[0] ?? '');
  }
  if (/^tel:/i.test(h)) {
    return /^tel:\+?[0-9\s\-()]{7,30}$/i.test(h);
  }
  try {
    const u = new URL(h);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const host = u.hostname.replace(/^www\./i, '');
    return host === 'nius.cz' || host.endsWith('.nius.cz');
  } catch {
    return false;
  }
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function safeRichHtml(html: string): string {
  let out = '';
  const closers: string[] = [];
  let strongDepth = 0;
  for (let i = 0; i < html.length; ) {
    const match = html[i] === '<' ? TOKEN.exec(html.slice(i)) : null;
    if (!match) {
      out += html[i] === '<' ? '&lt;' : html[i] === '>' ? '&gt;' : html[i];
      i += 1;
      continue;
    }
    const token = match[1] as string;
    if (token === '<strong>') {
      strongDepth += 1;
      out += token;
    } else if (token === '</strong>') {
      if (strongDepth > 0) {
        strongDepth -= 1;
        out += token;
      } else out += '&lt;/strong&gt;';
    } else if (token === '</a>') {
      out += closers.length > 0 ? (closers.pop() as string) : '&lt;/a&gt;';
    } else {
      const href = match[2] as string;
      if (isSafeHref(href)) {
        const external = href.trim().startsWith('http');
        out += `<a href="${escapeAttr(href)}" class="${CLASS}"${
          external ? ' target="_blank" rel="noopener noreferrer"' : ''
        }>`;
        closers.push('</a>');
      } else {
        out += `<span class="${CLASS}">`;
        closers.push('</span>');
      }
    }
    i += token.length;
  }
  return out;
}

export function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}
