import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ALL_DENIED,
  GRANTED,
  GTAG_LOADER_SELECTOR,
  configuredIds,
  consentUpdates,
  dataLayerEntries,
  googleEvents,
  resetConsentPage,
  runInlineConsentScript,
  type StoredChoice,
} from '../../tests/fixtures/consent-page.ts';

const cookieScope = vi.hoisted(() => ({ domain: undefined as string | undefined }));
vi.mock('@/scripts/cookie-domain', () => ({
  sharedCookieDomain: () => cookieScope.domain,
  cookieAttributes: () => '',
}));

const ADS_ID = 'AW-0000000000';
const LEAD_LABEL = 'synthetic-label';
const CONTACT_LABEL = 'synthetic-contact-label';
const GA4_ID = 'G-VNMLWF0XZG';
const GA_DISABLE_FLAG = `ga-disable-${GA4_ID}`;
const pageFlag = (name: string) => (window as unknown as Record<string, unknown>)[name];

/** One page load: the inline <head> script, then a fresh copy of the module. */
const loadPage = async (stored: { cookie?: StoredChoice; legacy?: StoredChoice } = {}) => {
  resetConsentPage(stored);
  runInlineConsentScript();
  vi.resetModules();
  const ga = await import('./ga');
  const { setConsent } = await import('./consent');
  return { ga, setConsent };
};

const indexOfGrantedUpdate = () =>
  dataLayerEntries().findIndex(
    (entry) => entry[0] === 'consent' && entry[1] === 'update' && (entry[2] as Record<string, string>).ad_storage === 'granted',
  );
const indexOfAdsConfig = () => dataLayerEntries().findIndex((entry) => entry[0] === 'config' && entry[1] === ADS_ID);

beforeEach(() => {
  cookieScope.domain = undefined;
  vi.stubEnv('VITE_GOOGLE_ADS_ID', ADS_ID);
  vi.stubEnv('VITE_GOOGLE_ADS_LEAD_LABEL', LEAD_LABEL);
  vi.stubEnv('VITE_GOOGLE_ADS_CONTACT_LABEL', CONTACT_LABEL);
});

afterEach(() => {
  vi.unstubAllEnvs();
  resetConsentPage();
});

describe('Google Ads account configuration', () => {
  it('configures the Ads id once on the first Accept, after the consent update', async () => {
    const { ga, setConsent } = await loadPage();
    ga.initGoogleIfConsented();
    expect(configuredIds()).toEqual([]);

    setConsent('accepted');
    ga.grantGoogle();

    expect(configuredIds()).toEqual([GA4_ID, ADS_ID]);
    expect(indexOfAdsConfig()).toBeGreaterThan(indexOfGrantedUpdate());
    expect(document.querySelectorAll(GTAG_LOADER_SELECTOR)).toHaveLength(1);
  });

  it.each([
    { name: 'cookie', stored: { cookie: 'accepted' as const } },
    { name: 'legacy localStorage record', stored: { legacy: 'accepted' as const } },
  ])('configures the Ads id on a page load with consent stored in the $name', async ({ stored }) => {
    const { ga } = await loadPage(stored);

    ga.initGoogleIfConsented();

    expect(configuredIds()).toEqual([GA4_ID, ADS_ID]);
    expect(indexOfGrantedUpdate()).toBeGreaterThanOrEqual(0);
    expect(indexOfAdsConfig()).toBeGreaterThan(indexOfGrantedUpdate());
    expect(consentUpdates()).toEqual([GRANTED]);
  });

  it('configures the Ads id only once per page load', async () => {
    const { ga } = await loadPage({ cookie: 'accepted' });

    ga.initGoogleIfConsented();
    ga.initGoogleIfConsented();
    ga.grantGoogle();

    expect(configuredIds().filter((id) => id === ADS_ID)).toHaveLength(1);
    expect(configuredIds().filter((id) => id === GA4_ID)).toHaveLength(1);
  });

  it.each([
    { name: 'before a choice', stored: {} },
    { name: 'with a stored refusal', stored: { cookie: 'rejected' as const, legacy: 'accepted' as const } },
  ])('configures nothing $name', async ({ stored }) => {
    const { ga } = await loadPage(stored);

    ga.initGoogleIfConsented();

    expect(configuredIds()).toEqual([]);
    expect(indexOfGrantedUpdate()).toBe(-1);
    expect(document.querySelectorAll(GTAG_LOADER_SELECTOR)).toHaveLength(0);
  });

  it('configures nothing for Ads when the env id is empty', async () => {
    vi.stubEnv('VITE_GOOGLE_ADS_ID', '  ');
    const { ga, setConsent } = await loadPage({ cookie: 'accepted' });

    ga.initGoogleIfConsented();
    setConsent('accepted');
    ga.grantGoogle();

    expect(configuredIds()).toEqual([GA4_ID]);
  });
});

describe('Accept and Reject', () => {
  it('Reject pushes the denied signals, sets the opt-out flag and configures nothing', async () => {
    const { ga, setConsent } = await loadPage();

    setConsent('rejected');
    ga.denyGoogle();

    expect(consentUpdates()).toEqual([ALL_DENIED]);
    expect(configuredIds()).toEqual([]);
    expect(pageFlag(GA_DISABLE_FLAG)).toBe(true);
    expect(document.querySelectorAll(GTAG_LOADER_SELECTOR)).toHaveLength(0);
  });

  it('Accept after a refusal on the same page clears the opt-out flag', async () => {
    const { ga, setConsent } = await loadPage({ cookie: 'rejected' });
    ga.disableGa();

    setConsent('accepted');
    ga.grantGoogle();

    expect(pageFlag(GA_DISABLE_FLAG)).toBe(false);
    expect(consentUpdates()).toEqual([GRANTED]);
  });

  it('disables the property and expires the _ga cookies', async () => {
    document.cookie = '_ga=GA1.1.1; path=/';
    document.cookie = '_ga_VNMLWF0XZG=GS1; path=/';
    const { ga } = await loadPage();
    ga.disableGa();
    expect(pageFlag(GA_DISABLE_FLAG)).toBe(true);
    expect(document.cookie).not.toContain('_ga');
  });

  // Analytics and, once the Ads account was configured with consent, Google Ads cookies.
  const GOOGLE_COOKIES = ['_ga', '_ga_VNMLWF0XZG', '_gcl_au', '_gcl_aw', '_gcl_gs', '_gcl_dc'];
  const expiredNames = (calls: string[][], withDomain: boolean) =>
    calls
      .map(([value]) => value)
      .filter((value) => value.includes('expires=Thu, 01 Jan 1970') && value.includes('domain=') === withDomain)
      .map((value) => value.split('=')[0])
      .sort();

  it('expires the cookies on the shared domain as well', async () => {
    cookieScope.domain = '.nius.cz';
    const { ga } = await loadPage();
    const writes = vi.spyOn(document, 'cookie', 'set');
    try {
      ga.disableGa();
      expect(expiredNames(writes.mock.calls, false)).toEqual([...GOOGLE_COOKIES].sort());
      expect(expiredNames(writes.mock.calls, true)).toEqual([...GOOGLE_COOKIES].sort());
      expect(writes.mock.calls.filter(([value]) => value.includes('domain=')).every(([value]) => value.includes('domain=.nius.cz'))).toBe(true);
    } finally {
      writes.mockRestore();
    }
  });

  it('expires only host cookies without a shared domain', async () => {
    const { ga } = await loadPage();
    const writes = vi.spyOn(document, 'cookie', 'set');
    try {
      ga.disableGa();
      expect(expiredNames(writes.mock.calls, false)).toEqual([...GOOGLE_COOKIES].sort());
      expect(writes.mock.calls.some(([value]) => value.includes('domain='))).toBe(false);
    } finally {
      writes.mockRestore();
    }
  });
});

describe('Google events', () => {
  it('sends an event with consent', async () => {
    const { ga } = await loadPage({ cookie: 'accepted' });

    ga.trackGoogleEvent('contact', { method: 'phone', source: 'footer' });

    expect(googleEvents()).toEqual([['event', 'contact', { method: 'phone', source: 'footer' }]]);
  });

  it.each([{ cookie: null }, { cookie: 'rejected' as const }])('sends nothing without consent (cookie=$cookie)', async (stored) => {
    const { ga } = await loadPage(stored);

    ga.trackGoogleEvent('contact', { method: 'phone', source: 'footer' });

    expect(googleEvents()).toEqual([]);
  });

  it('sends nothing after a refusal made on the same page', async () => {
    const { ga, setConsent } = await loadPage({ cookie: 'accepted' });

    setConsent('rejected');
    ga.denyGoogle();
    ga.trackGoogleEvent('contact', { method: 'phone', source: 'footer' });
    ga.trackContactClick('whatsapp', 'footer');
    ga.trackLeadConversion({ orderId: 'order-synthetic-1', value: 2900, serviceCodes: ['immunity_lite'] });

    expect(googleEvents()).toEqual([]);
  });
});

describe('lead conversion', () => {
  const ORDER = { orderId: 'order-synthetic-1', value: 3550, serviceCodes: ['immunity_lite', 'b12_energy_shot'] };
  const PAYLOAD = {
    transaction_id: 'order-synthetic-1',
    currency: 'CZK',
    value: 3550,
    service_codes: 'immunity_lite,b12_energy_shot',
  };

  it('sends generate_lead and the Ads conversion with the order id as transaction_id and nothing else', async () => {
    const { ga } = await loadPage({ cookie: 'accepted' });

    ga.trackLeadConversion(ORDER);

    // toEqual on the whole list: no extra event and no extra key in either payload.
    expect(googleEvents()).toEqual([
      ['event', 'generate_lead', PAYLOAD],
      ['event', 'conversion', { send_to: `${ADS_ID}/${LEAD_LABEL}`, ...PAYLOAD }],
    ]);
  });

  it('reports one order only once, however often it is called', async () => {
    const { ga } = await loadPage({ cookie: 'accepted' });

    ga.trackLeadConversion(ORDER);
    ga.trackLeadConversion(ORDER);
    ga.trackLeadConversion({ ...ORDER, value: 1 });

    expect(googleEvents()).toHaveLength(2);
  });

  it('reports a second order separately', async () => {
    const { ga } = await loadPage({ cookie: 'accepted' });

    ga.trackLeadConversion(ORDER);
    ga.trackLeadConversion({ ...ORDER, orderId: 'order-synthetic-2' });

    expect(googleEvents().map((entry) => (entry[2] as { transaction_id: string }).transaction_id)).toEqual([
      'order-synthetic-1',
      'order-synthetic-1',
      'order-synthetic-2',
      'order-synthetic-2',
    ]);
  });

  it.each([{ cookie: null }, { cookie: 'rejected' as const }])('sends nothing without consent (cookie=$cookie)', async (stored) => {
    const { ga } = await loadPage(stored);

    ga.trackLeadConversion(ORDER);

    expect(googleEvents()).toEqual([]);
  });

  it('a lead dropped without consent is not marked as reported', async () => {
    const { ga, setConsent } = await loadPage();

    ga.trackLeadConversion(ORDER);
    setConsent('accepted');
    ga.grantGoogle();
    ga.trackLeadConversion(ORDER);

    expect(googleEvents()).toHaveLength(2);
  });

  it.each(['VITE_GOOGLE_ADS_LEAD_LABEL', 'VITE_GOOGLE_ADS_ID'])('sends only generate_lead when %s is empty', async (name) => {
    vi.stubEnv(name, '');
    const { ga } = await loadPage({ cookie: 'accepted' });

    ga.trackLeadConversion(ORDER);

    expect(googleEvents()).toEqual([['event', 'generate_lead', PAYLOAD]]);
  });
});

describe('contact conversion (phone and WhatsApp clicks)', () => {
  const CONVERSION = ['event', 'conversion', { send_to: `${ADS_ID}/${CONTACT_LABEL}`, value: 1, currency: 'CZK' }];

  it.each(['phone', 'whatsapp'] as const)('a %s click sends contact and the Ads conversion, and nothing else', async (method) => {
    const { ga } = await loadPage({ cookie: 'accepted' });

    ga.trackContactClick(method, 'floating_contact');

    // toEqual on the whole list: no extra event and no extra key (no number, no message text).
    expect(googleEvents()).toEqual([['event', 'contact', { method, source: 'floating_contact' }], CONVERSION]);
  });

  it('counts every click', async () => {
    const { ga } = await loadPage({ cookie: 'accepted' });

    ga.trackContactClick('phone', 'footer');
    ga.trackContactClick('phone', 'footer');

    expect(googleEvents().filter((entry) => entry[1] === 'conversion')).toEqual([CONVERSION, CONVERSION]);
  });

  it.each([{ cookie: null }, { cookie: 'rejected' as const }])('sends nothing without consent (cookie=$cookie)', async (stored) => {
    const { ga } = await loadPage(stored);

    ga.trackContactClick('phone', 'footer');

    expect(googleEvents()).toEqual([]);
  });

  it.each(['VITE_GOOGLE_ADS_CONTACT_LABEL', 'VITE_GOOGLE_ADS_ID'])('sends only contact when %s is empty', async (name) => {
    vi.stubEnv(name, ' ');
    const { ga } = await loadPage({ cookie: 'accepted' });

    ga.trackContactClick('whatsapp', 'footer');

    expect(googleEvents()).toEqual([['event', 'contact', { method: 'whatsapp', source: 'footer' }]]);
  });

  it('the lead conversion keeps its own label', async () => {
    const { ga } = await loadPage({ cookie: 'accepted' });

    ga.trackLeadConversion({ orderId: 'order-synthetic-1', value: 2900, serviceCodes: ['immunity_lite'] });

    expect(googleEvents().filter((entry) => entry[1] === 'conversion').map((entry) => (entry[2] as { send_to: string }).send_to)).toEqual([
      `${ADS_ID}/${LEAD_LABEL}`,
    ]);
  });
});
