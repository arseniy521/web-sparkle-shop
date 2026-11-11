import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import cs from '../../../src/i18n/locales/cs.json' with { type: 'json' };
import stubData from '../../preview/stub-data.json' with { type: 'json' };
import { record as recordCheck } from '../../scripts/checks/registry.ts';
import { installApiStub } from '../fixtures/api-stub';
import { NEW_ORIGIN, OLD_ORIGIN } from '../fixtures/servers.ts';
import { MAX_RATIO, comparePngs, settle } from './compare.ts';

const OUT = fileURLToPath(new URL('../../.checks/visual/form/', import.meta.url));
const SITES = {
  old: { url: `${OLD_ORIGIN}/sestricka-praha-1/`, origin: OLD_ORIGIN },
  new: { url: `${NEW_ORIGIN}/sestricka-praha-1/`, origin: NEW_ORIGIN },
} as const;
type Site = keyof typeof SITES;
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
];
const STATES = ['cart', 'address', 'timing', 'phone', 'note', 'final'] as const;
type State = (typeof STATES)[number];
const STYLE_PROPS = [
  'border-radius',
  'box-shadow',
  'border-top-color',
  'height',
  'padding-left',
  'font-size',
  'font-family',
  'background-color',
  'color',
] as const;
const COLOR_PROPS = new Set(['border-top-color', 'background-color', 'color']);

const ADDRESS = 'Testovací 1, Praha';
const FLOOR = '3';
const INTERCOM = 'Test';
const PHONE = '+420 600 000 000';
const NOTE = 'Synthetic test note';
const DRAFT = {
  codes: [stubData.services[0].code, stubData.services[1].code],
  data: {
    phone: '',
    serviceCode: null,
    address: '',
    addressGeo: null,
    addressTo: '',
    addressToGeo: null,
    addressFloor: '',
    addressIntercom: '',
    desiredTiming: null,
    desiredDate: null,
    paymentPreference: null,
    patientNote: '',
    participantCount: 1,
  },
};

interface Difference {
  viewport: string;
  state: string;
  kind: 'text' | 'style' | 'pixels';
  selector?: string;
  property?: string;
  old: unknown;
  new: unknown;
}

type Pages = Record<Site, Page>;

async function openForm(browser: Browser, site: Site, viewport: { width: number; height: number }) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  await context.addCookies([{ name: 'nius_consent', value: 'rejected', url: SITES[site].origin }]);
  await context.route(/^https?:\/\/([^/]*\.)?(googletagmanager\.com|google-analytics\.com|amplitude\.com)\//, (route) =>
    route.abort(),
  );
  const page = await context.newPage();
  await installApiStub(page);
  await page.addInitScript((draft) => {
    sessionStorage.setItem('nius_onboarding_draft_v2', JSON.stringify({ ...draft, savedAt: Date.now() }));
  }, DRAFT);
  await page.goto(SITES[site].url);
  if (site === 'old') {
    await page.getByRole('button', { name: cs.nav.cart, exact: true }).filter({ visible: true }).click();
  } else {
    await page.locator('[data-open-cart]').filter({ visible: true }).click();
  }
  await page.locator('#onboarding-address').waitFor();
  return page;
}

function nextButton(page: Page) {
  return page.locator('[role="dialog"]:visible').getByRole('button', { name: cs.onboarding.next });
}

async function advance(page: Page, state: State) {
  const dialog = page.locator('[role="dialog"]:visible');
  if (state === 'address') {
    await page.locator('#onboarding-address').fill(ADDRESS);
    await page.locator('#onboarding-floor').fill(FLOOR);
    await page.locator('#onboarding-intercom').fill(INTERCOM);
    await expect(page.locator('#onboarding-address')).toHaveAttribute('aria-expanded', 'false');
  } else if (state === 'timing') {
    await nextButton(page).click();
    await dialog.locator('button.snap-start').nth(1).click();
    await dialog.getByRole('button', { name: '10:00', exact: true }).click();
  } else if (state === 'phone') {
    await nextButton(page).click();
    await page.locator('#onboarding-phone').fill(PHONE);
  } else if (state === 'note') {
    await nextButton(page).click();
    await page.locator('#onboarding-note').fill(NOTE);
  } else if (state === 'final') {
    await dialog.getByRole('button', { name: cs.onboarding.finish }).click();
    await dialog.getByText(cs.onboarding.final.title).waitFor();
  }
}

async function reach(pages: Pages, state: State) {
  for (const step of STATES.slice(1, STATES.indexOf(state) + 1)) {
    await Promise.all([advance(pages.old, step), advance(pages.new, step)]);
  }
}

function parseColor(value: string): [number, number, number, number] {
  const v = value.trim();
  if (v === 'transparent') return [0, 0, 0, 0];
  const m = v.match(/^([a-z]+)\((.*)\)$/);
  if (!m) throw new Error(`Unknown color: ${v}`);
  const [fn, body] = [m[1], m[2]];
  const [main, slash] = body.includes('/') ? body.split('/') : [body, undefined];
  const parts = main.replace(/,/g, ' ').trim().split(/\s+/);
  const num = (s: string, scale = 1) => (s.endsWith('%') ? (parseFloat(s) / 100) * scale : parseFloat(s));
  let alpha = slash !== undefined ? num(slash.trim()) : 1;
  if (fn === 'rgb' || fn === 'rgba') {
    if (parts.length === 4) alpha = num(parts[3]);
    return [num(parts[0], 255), num(parts[1], 255), num(parts[2], 255), alpha];
  }
  if (fn === 'color' && parts[0] === 'srgb') {
    return [num(parts[1]) * 255, num(parts[2]) * 255, num(parts[3]) * 255, alpha];
  }
  let L: number, a: number, b: number;
  if (fn === 'oklab') {
    [L, a, b] = [num(parts[0]), num(parts[1], 0.4), num(parts[2], 0.4)];
  } else if (fn === 'oklch') {
    const [c, h] = [num(parts[1], 0.4), (parseFloat(parts[2]) * Math.PI) / 180];
    [L, a, b] = [num(parts[0]), c * Math.cos(h), c * Math.sin(h)];
  } else {
    throw new Error(`Unknown color: ${v}`);
  }
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ];
  const [r, g, bl] = linear.map((c) => {
    const x = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.abs(c) ** (1 / 2.4) - 0.055;
    return Math.min(255, Math.max(0, x * 255));
  });
  return [r, g, bl, alpha];
}

function sameColor(a: string, b: string) {
  const [x, y] = [parseColor(a), parseColor(b)];
  return x.slice(0, 3).every((c, i) => Math.abs(c - y[i]) <= 2) && Math.abs(x[3] - y[3]) <= 0.02;
}

function splitTop(value: string, sep: RegExp) {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth === 0 && sep.test(ch)) {
      if (cur.trim()) out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function shadowLayers(value: string) {
  if (value === 'none') return [];
  return splitTop(value, /,/)
    .map((layer) => {
      const tokens = splitTop(layer, /\s/);
      const color = tokens.find((t) => /^[a-z]+\(|^transparent$/.test(t)) ?? 'currentcolor';
      const lengths = tokens.filter((t) => /^-?[\d.]+px$/.test(t));
      return { color, lengths, inset: tokens.includes('inset') };
    })
    .filter((l) => !(parseColor(l.color)[3] === 0 && l.lengths.every((x) => parseFloat(x) === 0)));
}

function sameShadow(a: string, b: string) {
  const [x, y] = [shadowLayers(a), shadowLayers(b)];
  return (
    x.length === y.length &&
    x.every(
      (l, i) => l.inset === y[i].inset && l.lengths.join(' ') === y[i].lengths.join(' ') && sameColor(l.color, y[i].color),
    )
  );
}

function radius(value: string) {
  return value
    .split(/\s+/)
    .map((v) => (parseFloat(v) >= 9999 ? 'full' : v))
    .join(' ');
}

function sameValue(property: string, a: string, b: string) {
  if (COLOR_PROPS.has(property)) return sameColor(a, b);
  if (property === 'box-shadow') return sameShadow(a, b);
  if (property === 'border-radius') return radius(a) === radius(b);
  return a === b;
}

interface ElementStyles {
  selector: string;
  styles: Record<string, string>;
  outline: boolean;
}

async function readStyles(root: Locator, props: readonly string[]): Promise<ElementStyles[]> {
  const list = await root.evaluate((dialog, names) => {
    const describe = (el: Element, kind: string, i: number) =>
      `${kind}:nth(${i}) "${(el.getAttribute('aria-label') ?? (el as HTMLElement).innerText ?? '').trim().slice(0, 40)}"`;
    const els: [Element, string][] = [[dialog, '[role="dialog"]']];
    dialog.querySelectorAll('button:enabled').forEach((el, i) => els.push([el, describe(el, 'button', i)]));
    dialog.querySelectorAll('input').forEach((el, i) => els.push([el, describe(el, 'input', i)]));
    return els.map(([el, selector]) => {
      const computed = getComputedStyle(el);
      const styles: Record<string, string> = {};
      for (const name of names) styles[name] = computed.getPropertyValue(name);
      const outline =
        computed.outlineStyle !== 'none' && parseFloat(computed.outlineWidth) > 0 ? computed.outlineColor : 'none';
      return { selector, styles, outline };
    });
  }, props as string[]);
  return list.map((e) => ({ ...e, outline: outlineVisible(e.outline) }));
}

function outlineVisible(color: string) {
  return color !== 'none' && parseColor(color)[3] > 0;
}

function compareStyles(old: ElementStyles[], neu: ElementStyles[], base: Omit<Difference, 'kind' | 'old' | 'new'>) {
  const diffs: Difference[] = [];
  if (old.length !== neu.length) {
    diffs.push({ ...base, kind: 'style', property: 'element count', old: old.map((e) => e.selector), new: neu.map((e) => e.selector) });
  }
  for (let i = 0; i < Math.min(old.length, neu.length); i++) {
    const [o, n] = [old[i], neu[i]];
    for (const p of STYLE_PROPS) {
      if (!sameValue(p, o.styles[p], n.styles[p])) {
        diffs.push({ ...base, kind: 'style', selector: o.selector, property: p, old: o.styles[p], new: n.styles[p] });
      }
    }
    if (o.outline !== n.outline) {
      diffs.push({ ...base, kind: 'style', selector: o.selector, property: 'outline visible', old: o.outline, new: n.outline });
    }
  }
  return diffs;
}

function comparePixels(oldPng: Buffer, newPng: Buffer, dir: string, base: Omit<Difference, 'kind' | 'old' | 'new'>) {
  const p = comparePngs(oldPng, newPng, dir);
  const diffs: Difference[] = [];
  if (!p.sameSize) {
    diffs.push({ ...base, kind: 'pixels', property: 'size', old: `${p.old.width}x${p.old.height}`, new: `${p.new.width}x${p.new.height}` });
  }
  if (p.ratio > MAX_RATIO) {
    diffs.push({ ...base, kind: 'pixels', property: 'differing pixels', old: 0, new: `${p.count} (${(p.ratio * 100).toFixed(3)} %)` });
  }
  return diffs;
}

function record(viewport: string, state: string, kind: string, diffs: Difference[]) {
  const dir = join(OUT, viewport, state);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `differences-${kind}.json`), JSON.stringify(diffs, null, 2));
  const all: Difference[] = [];
  const walk = (d: string) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const path = join(d, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/^differences-.+\.json$/.test(entry.name)) all.push(...JSON.parse(readFileSync(path, 'utf8')));
    }
  };
  walk(OUT);
  writeFileSync(join(OUT, 'differences.json'), JSON.stringify(all, null, 2));
}

async function open(browser: Browser, viewport: { width: number; height: number }): Promise<Pages> {
  const [o, n] = await Promise.all([openForm(browser, 'old', viewport), openForm(browser, 'new', viewport)]);
  return { old: o, new: n };
}

async function close(pages: Pages | undefined) {
  await pages?.old.context().close();
  await pages?.new.context().close();
}

// The registry row order-form: a viewport passes only when all its tests ran and passed.
const STATUS_DIR = join(OUT, 'status');
const TESTS_PER_VIEWPORT = STATES.length * 3 + 3;
const checkOf = (vp: string) => (vp === '390x844' ? 'visual-phone' : 'visual-desktop');

test.beforeAll(() => {
  for (const { width, height } of VIEWPORTS) {
    const vp = `${width}x${height}`;
    if (!existsSync(join(STATUS_DIR, vp))) recordCheck(checkOf(vp), 'order-form', 'fail', 'not completed');
  }
});

// Playwright requires the fixtures argument to be a destructuring pattern.
// eslint-disable-next-line no-empty-pattern
test.afterEach(({}, testInfo) => {
  const vp = (testInfo.titlePath.find((t) => /^\d+x\d+ /.test(t)) as string).split(' ')[0];
  const dir = join(STATUS_DIR, vp);
  mkdirSync(dir, { recursive: true });
  const passed = testInfo.status === testInfo.expectedStatus;
  writeFileSync(join(dir, `${testInfo.titlePath.join(' ').replace(/[^\w-]+/g, '_')}.txt`), passed ? 'passed' : 'failed');
  const statuses = readdirSync(dir).map((file) => readFileSync(join(dir, file), 'utf8'));
  const failed = statuses.filter((status) => status !== 'passed').length;
  const missing = TESTS_PER_VIEWPORT - statuses.length;
  if (failed === 0 && missing === 0) recordCheck(checkOf(vp), 'order-form', 'pass');
  else recordCheck(checkOf(vp), 'order-form', 'fail', `${failed} failed, ${missing} not completed`);
});

for (const viewport of VIEWPORTS) {
  const vp = `${viewport.width}x${viewport.height}`;

  for (const state of STATES) {
    test.describe(`${vp} ${state}`, () => {
      let pages: Pages;

      test.beforeAll(async ({ browser }) => {
        test.setTimeout(120_000);
        pages = await open(browser, viewport);
        await reach(pages, state);
        await Promise.all([settle(pages.old), settle(pages.new)]);
      });

      test.afterAll(async () => close(pages));

      test('text', async () => {
        const [o, n] = await Promise.all([
          pages.old.locator('[role="dialog"]:visible').innerText(),
          pages.new.locator('[role="dialog"]:visible').innerText(),
        ]);
        const diffs: Difference[] = o === n ? [] : [{ viewport: vp, state, kind: 'text', old: o, new: n }];
        record(vp, state, 'text', diffs);
        expect(diffs).toEqual([]);
      });

      test('styles', async () => {
        const [o, n] = await Promise.all([
          readStyles(pages.old.locator('[role="dialog"]:visible'), STYLE_PROPS),
          readStyles(pages.new.locator('[role="dialog"]:visible'), STYLE_PROPS),
        ]);
        const diffs = compareStyles(o, n, { viewport: vp, state });
        record(vp, state, 'style', diffs);
        expect(diffs).toEqual([]);
      });

      test('pixels', async () => {
        const [o, n] = await Promise.all([
          pages.old.locator('[role="dialog"]:visible').screenshot({ animations: 'disabled' }),
          pages.new.locator('[role="dialog"]:visible').screenshot({ animations: 'disabled' }),
        ]);
        const diffs = comparePixels(o, n, join(OUT, vp, state), { viewport: vp, state });
        record(vp, state, 'pixels', diffs);
        expect(diffs).toEqual([]);
      });
    });
  }

  test.describe(`${vp} submit`, () => {
    let pages: Pages | undefined;
    test.afterEach(async () => close(pages));

    test('a failed order shows an error toast and keeps the data', async ({ browser }) => {
      test.setTimeout(120_000);
      pages = await open(browser, viewport);
      for (const page of Object.values(pages)) {
        await page.route('**/api/onboarding/order', (route) =>
          route.request().method() === 'POST'
            ? route.fulfill({
                status: 500,
                headers: { 'access-control-allow-origin': route.request().headers()['origin'] ?? '*', 'access-control-allow-credentials': 'true' },
                json: { message: 'Internal error' },
              })
            : route.fallback(),
        );
      }
      await reach(pages, 'note');
      const toasts = await Promise.all(
        Object.values(pages).map(async (page) => {
          await page.locator('[role="dialog"]:visible').getByRole('button', { name: cs.onboarding.finish }).click();
          const toast = page.locator('[data-sonner-toast]');
          await toast.waitFor();
          await settle(page);
          await expect(page.locator('#onboarding-note')).toHaveValue(NOTE);
          await expect(page.locator('[role="dialog"]:visible')).toContainText(ADDRESS);
          await expect(page.locator('[role="dialog"]:visible')).toContainText('+420600000000');
          return { text: await toast.innerText(), png: await toast.screenshot({ animations: 'disabled' }) };
        }),
      );
      const [o, n] = toasts;
      const base = { viewport: vp, state: 'error-toast' };
      const diffs: Difference[] = [
        ...(o.text === n.text ? [] : [{ ...base, kind: 'text' as const, old: o.text, new: n.text }]),
        ...comparePixels(o.png, n.png, join(OUT, vp, 'error-toast'), base),
      ];
      record(vp, 'error-toast', 'all', diffs);
      expect(o.text).toBe(cs.onboarding.errors.server);
      expect(diffs).toEqual([]);
    });

    test('a successful order shows the final screen', async ({ browser }) => {
      test.setTimeout(120_000);
      pages = await open(browser, viewport);
      await reach(pages, 'final');
      for (const page of Object.values(pages)) {
        await expect(page.locator('[role="dialog"]:visible').getByText(cs.onboarding.final.title)).toBeVisible();
      }
    });

    test('a keyboard-focused button has the same focus ring', async ({ browser }) => {
      test.setTimeout(120_000);
      pages = await open(browser, viewport);
      await reach(pages, 'address');
      const rings = await Promise.all(
        Object.values(pages).map(async (page) => {
          await page.locator('#onboarding-intercom').focus();
          await page.keyboard.press('Tab');
          await settle(page);
          return page.evaluate(() => {
            const el = document.activeElement as HTMLElement;
            const s = getComputedStyle(el);
            return {
              tag: el.tagName,
              text: el.innerText,
              focusVisible: el.matches(':focus-visible'),
              boxShadow: s.boxShadow,
              outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 ? s.outlineColor : 'none',
            };
          });
        }),
      );
      const [o, n] = rings;
      expect(o).toMatchObject({ tag: 'BUTTON', text: n.text, focusVisible: true });
      expect(n).toMatchObject({ tag: 'BUTTON', focusVisible: true });
      const base = { viewport: vp, state: 'focus-ring', selector: `button "${o.text}"` };
      const diffs: Difference[] = [
        ...(sameShadow(o.boxShadow, n.boxShadow)
          ? []
          : [{ ...base, kind: 'style' as const, property: 'box-shadow', old: o.boxShadow, new: n.boxShadow }]),
        ...(outlineVisible(o.outline) === outlineVisible(n.outline)
          ? []
          : [{ ...base, kind: 'style' as const, property: 'outline visible', old: outlineVisible(o.outline), new: outlineVisible(n.outline) }]),
      ];
      record(vp, 'focus-ring', 'style', diffs);
      expect(diffs).toEqual([]);
    });
  });
}

