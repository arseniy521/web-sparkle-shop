// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { MAX_RATIO, pixelStatus, type AcceptedDifference } from './compare.ts';

describe('pixelStatus', () => {
  const list: AcceptedDifference[] = [
    { path: 'order-form cart', viewport: 'phone', maxRatio: 0.017, note: 'accepted by the owner' },
    { path: '/privacy/', viewport: 'desktop', maxRatio: 0.005, note: 'accepted by the owner' },
  ];
  const status = (ratio: number, path = 'order-form cart', viewport = 'phone', sameSize = true) =>
    pixelStatus({ ratio, sameSize }, path, viewport, list);

  it('passes up to MAX_RATIO, listed or not', () => {
    expect(status(0)).toBe('pass');
    expect(status(MAX_RATIO)).toBe('pass');
    expect(status(MAX_RATIO, 'order-form note')).toBe('pass');
  });

  it('accepts a listed comparison above MAX_RATIO up to its own bound', () => {
    expect(status(MAX_RATIO + 0.0001)).toBe('accepted');
    expect(status(0.017)).toBe('accepted');
    expect(status(0.005, '/privacy/', 'desktop')).toBe('accepted');
  });

  it('fails a listed comparison above its bound', () => {
    expect(status(0.0171)).toBe('fail');
    expect(status(0.0051, '/privacy/', 'desktop')).toBe('fail');
  });

  it('fails on a size difference even when listed, whatever the ratio', () => {
    expect(status(0.01, 'order-form cart', 'phone', false)).toBe('fail');
    expect(status(0, 'order-form cart', 'phone', false)).toBe('fail');
  });

  it('fails a comparison that is not listed: another path or another viewport', () => {
    expect(status(0.01, 'order-form note')).toBe('fail');
    expect(status(0.01, 'order-form cart', 'desktop')).toBe('fail');
    expect(status(0.004, '/privacy/', 'phone')).toBe('fail');
  });

  it('reads checks/visual-accepted.json when no list is given', () => {
    expect(pixelStatus({ ratio: 0.01, sameSize: true }, '/no-such-page/', 'phone')).toBe('fail');
    expect(pixelStatus({ ratio: 0, sameSize: true }, '/no-such-page/', 'phone')).toBe('pass');
  });
});
