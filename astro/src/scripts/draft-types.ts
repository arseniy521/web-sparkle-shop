export type DesiredTiming = 'ASAP' | 'MORNING' | 'AFTERNOON' | 'EVENING' | 'CUSTOM_DATE';
export type PaymentPreference = 'CARD_ONLINE' | 'CASH' | 'BANK_TRANSFER';

export interface AddressGeo {
  label: string;
  lat: number;
  lon: number;
  zip: string | null;
  city: string | null;
  cityPart: string | null;
  country: string;
  source: 'mapy' | 'manual';
}

export interface OnboardingFormData {
  participantCount: number;
  phone: string;
  serviceCode: string | null;
  address: string;
  addressGeo: AddressGeo | null;
  addressTo: string;
  addressToGeo: AddressGeo | null;
  addressFloor: string;
  addressIntercom: string;
  desiredTiming: DesiredTiming | null;
  desiredDate: string | null;
  paymentPreference: PaymentPreference | null;
  patientNote: string;
}
