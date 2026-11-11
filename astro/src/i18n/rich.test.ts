import { describe, expect, it } from 'vitest';
import { safeRichHtml, stripTags } from './rich';

describe('safeRichHtml', () => {
  it('keeps strong and safe links, drops unsafe hrefs', () => {
    expect(safeRichHtml('<strong>a</strong> <a href="/iv-kapacky-praha/">b</a>')).toBe(
      '<strong>a</strong> <a href="/iv-kapacky-praha/" class="text-primary underline-offset-4 hover:underline">b</a>',
    );
    expect(safeRichHtml('<a href="javascript:alert(1)">b</a>')).toBe(
      '<span class="text-primary underline-offset-4 hover:underline">b</span>',
    );
    expect(safeRichHtml('<a href="https://evil.example/">b</a>')).toContain('<span');
    expect(safeRichHtml('<script>x</script>')).not.toContain('<script');
  });
});

describe('stripTags', () => {
  it('strips tags for JSON-LD', () => expect(stripTags('a <strong>b</strong>')).toBe('a b'));
});
