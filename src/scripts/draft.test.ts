import { beforeEach, describe, expect, it } from 'vitest';
import { clearDraft, loadDraft, saveDraftCodes, saveDraftData } from './draft';
import type { OnboardingFormData } from './draft-types';

const KEY = 'nius_onboarding_draft_v2';
const LEGACY_KEY = 'nius_onboarding_draft_v1';

const data: OnboardingFormData = {
  phone: '+420 600 000 000',
  serviceCode: null,
  address: 'Test street 1, Praha',
  addressGeo: null,
  addressTo: '',
  addressToGeo: null,
  addressFloor: '',
  addressIntercom: '',
  desiredTiming: 'ASAP',
  desiredDate: null,
  paymentPreference: null,
  patientNote: '',
  participantCount: 1,
};

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

describe('draft', () => {
  it('keeps the form data when the codes change and the codes when the data changes', () => {
    saveDraftCodes(['a']);
    saveDraftData(data);
    saveDraftCodes(['a', 'b']);
    expect(loadDraft()).toMatchObject({ codes: ['a', 'b'], data });
  });

  it('migrates a legacy localStorage draft into sessionStorage and removes it', () => {
    localStorage.setItem(LEGACY_KEY, JSON.stringify({ codes: ['a'], data: {}, savedAt: Date.now() }));
    expect(loadDraft()?.codes).toEqual(['a']);
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
    expect(JSON.parse(sessionStorage.getItem(KEY)!).codes).toEqual(['a']);
  });

  it('removes both keys on clear', () => {
    saveDraftCodes(['a']);
    localStorage.setItem(LEGACY_KEY, '{}');
    clearDraft();
    expect(sessionStorage.getItem(KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
  });
});
