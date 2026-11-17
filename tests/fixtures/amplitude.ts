import { gunzipSync } from 'node:zlib';
import type { Page } from '@playwright/test';

export interface AmplitudeEvent {
  event_type: string;
  event_properties: Record<string, unknown>;
}

export interface AmplitudeCapture {
  /** Events uploaded to https://api2.amplitude.com/2/httpapi, in upload order. */
  events(): AmplitudeEvent[];
  /** Every request the SDK made, with its decoded body (for searching the raw payloads). */
  requests(): Array<{ url: string; body: string }>;
}

// The pinned SDK (@amplitude/analytics-browser 2.49) requests two endpoints:
// - GET https://sr-client-cfg.amplitude.com/config/<api key>?config_group=browser — remote
//   configuration, answered with an empty object (nothing configured remotely);
// - POST https://api2.amplitude.com/2/httpapi — the gzip-compressed event upload.
// Any other Amplitude request is left to the network guard, which fails the test.
export async function captureAmplitude(page: Page): Promise<AmplitudeCapture> {
  const events: AmplitudeEvent[] = [];
  const requests: Array<{ url: string; body: string }> = [];
  await page.route(/^https:\/\/([^/]+\.)?amplitude\.com\//, (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const raw = request.postDataBuffer();
    const body = raw
      ? (request.headers()['content-encoding'] === 'gzip' ? gunzipSync(raw) : raw).toString('utf8')
      : '';
    if (url.host === 'sr-client-cfg.amplitude.com' && request.method() === 'GET') {
      requests.push({ url: request.url(), body });
      return route.fulfill({ json: {} });
    }
    if (request.url() === 'https://api2.amplitude.com/2/httpapi' && request.method() === 'POST') {
      requests.push({ url: request.url(), body });
      const uploaded = (JSON.parse(body) as { events: Array<Partial<AmplitudeEvent>> }).events;
      for (const event of uploaded) {
        events.push({ ...event, event_type: String(event.event_type), event_properties: event.event_properties ?? {} });
      }
      return route.fulfill({
        json: {
          code: 200,
          events_ingested: uploaded.length,
          payload_size_bytes: body.length,
          server_upload_time: Date.now(),
        },
      });
    }
    return route.fallback();
  });
  return { events: () => [...events], requests: () => [...requests] };
}

// Recognisable synthetic visitor data: the order tests type it into the form and every test
// that captures analytics checks that none of it reaches a payload.
export const VISITOR = {
  phone: '+420 700 000 123',
  phoneDigits: '700000123',
  address: 'Testovací 1, Praha',
  floor: '3',
  intercom: 'e2e-intercom-marker',
  note: 'e2e-note-marker',
  name: 'Test Patient',
  tokens: ['test-order-token', 'e2e-google-code'],
};

/** Visitor values found in the given payloads, empty when there are none. */
export function visitorDataIn(payloads: string[]): string[] {
  const text = payloads.join('\n');
  // The phone may appear formatted or URL-encoded: allow separators between its digits.
  const phone = new RegExp(VISITOR.phoneDigits.split('').join('(?:[\\s./()-]|%20|\\+)?'));
  // 'Testovac' also matches the address in JSON-escaped or URL-encoded form.
  // The name also in form encoding ('+' for spaces), as URLSearchParams writes the GA hits.
  const needles = [
    'Testovac',
    VISITOR.intercom,
    VISITOR.note,
    VISITOR.name,
    encodeURIComponent(VISITOR.name),
    VISITOR.name.replace(/ /g, '+'),
    ...VISITOR.tokens,
  ];
  return [...(phone.test(text) ? ['phone'] : []), ...needles.filter((needle) => text.includes(needle))];
}

/** Properties of the captured events of one type, in upload order. */
export const events = (amplitude: AmplitudeCapture, type: string) =>
  amplitude.events().filter((event) => event.event_type === type).map((event) => event.event_properties);
