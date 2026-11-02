import { beforeEach, describe, expect, it } from 'vitest';
import { captureReferral, getReferralCode, resetReferralForTests } from './referral';

const clearCookie = (name: string) => {
  document.cookie = `${name}=; max-age=0; path=/`;
};

describe('referral', () => {
  beforeEach(() => {
    resetReferralForTests();
    clearCookie('nius_ref');
    clearCookie('nius_consent');
  });

  it('captures, normalizes and stores a valid code', () => {
    captureReferral('?ref=k7m2qx');
    expect(getReferralCode()).toBe('K7M2QX');
    expect(document.cookie).toContain('nius_ref=K7M2QX');
  });

  it.each(['?ref=<script>', '?ref=ABC', '?ref=K7M2QL', '?ref='])(
    'ignores invalid value %s',
    (search) => {
      captureReferral(search);
      expect(getReferralCode()).toBeUndefined();
      expect(document.cookie).not.toContain('nius_ref');
    },
  );

  it('invalid value does not overwrite an existing code', () => {
    captureReferral('?ref=K7M2QX');
    captureReferral('?ref=ABC');
    expect(getReferralCode()).toBe('K7M2QX');
    expect(document.cookie).toContain('nius_ref=K7M2QX');
  });

  it('last valid code wins', () => {
    document.cookie = 'nius_ref=AAAAAA; path=/';
    captureReferral('?ref=K7M2QX');
    expect(getReferralCode()).toBe('K7M2QX');
    expect(document.cookie).toContain('nius_ref=K7M2QX');
    expect(document.cookie).not.toContain('AAAAAA');
  });

  it('no-op without ref', () => {
    captureReferral('?utm=1');
    expect(getReferralCode()).toBeUndefined();
    expect(document.cookie).not.toContain('nius_ref');
  });

  it('falls back to the cookie when memory is empty', () => {
    document.cookie = 'nius_ref=K7M2QX; path=/';
    expect(getReferralCode()).toBe('K7M2QX');
  });

  it('ignores an invalid cookie value', () => {
    document.cookie = 'nius_ref=bad; path=/';
    expect(getReferralCode()).toBeUndefined();
  });

  it('writes the cookie even when consent is rejected', () => {
    document.cookie = 'nius_consent=rejected; path=/';
    captureReferral('?ref=K7M2QX');
    expect(document.cookie).toContain('nius_ref=K7M2QX');
  });
});
