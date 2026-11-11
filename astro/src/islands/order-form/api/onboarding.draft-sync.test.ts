import { describe, expect, expectTypeOf, it } from 'vitest';
import { DESIRED_TIMINGS, PAYMENT_PREFERENCES } from '@/scripts/draft';
import type * as Draft from '@/scripts/draft-types';
import { onboardingOrderSchema, type DesiredTiming, type PaymentPreference } from './onboarding';

describe('draft allowed values', () => {
  it('match the API enums for desired timing and payment preference', () => {
    const { desiredTiming, paymentPreference } = onboardingOrderSchema.shape;
    expect([...DESIRED_TIMINGS].sort()).toEqual([...desiredTiming.unwrap().options].sort());
    expect([...PAYMENT_PREFERENCES].sort()).toEqual([...paymentPreference.unwrap().options].sort());
    expectTypeOf<Draft.DesiredTiming>().toEqualTypeOf<DesiredTiming>();
    expectTypeOf<Draft.PaymentPreference>().toEqualTypeOf<PaymentPreference>();
  });
});
