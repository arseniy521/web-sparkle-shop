// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { previewStrip } from './functions/_middleware.js';

describe('previewStrip', () => {
  it('stays in the flow of an ordinary page', () => {
    expect(previewStrip(200)).toContain('Preview — orders are not sent to NIUS');
    expect(previewStrip(200)).not.toContain('position:');
  });

  // The body of 404.html is a centring flex container: a strip in its flow becomes a column.
  it('is pinned to the top of the 404 page', () => {
    expect(previewStrip(404)).toContain('Preview — orders are not sent to NIUS');
    expect(previewStrip(404)).toContain('position:absolute;top:0;left:0;right:0');
  });
});
