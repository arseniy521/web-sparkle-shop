import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const CLASS = 'text-primary underline-offset-4 hover:underline';

function isSafeI18nHref(raw: unknown): raw is string {
  if (raw == null) return false;
  const h = String(raw).trim();
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

export function I18nSafeAnchor({
  href,
  children,
  className,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) {
  if (!isSafeI18nHref(href)) {
    return <span className={cn(CLASS, className)}>{children}</span>;
  }
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      className={cn(CLASS, className)}
      rel={external ? 'noopener noreferrer' : undefined}
      target={external ? '_blank' : undefined}
      {...rest}
    >
      {children}
    </a>
  );
}
