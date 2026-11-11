import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type Page } from '@playwright/test';
import cs from '../../../src/i18n/locales/cs.json' with { type: 'json' };
import accepted from '../../checks/visual-accepted.json' with { type: 'json' };
import { record } from '../../scripts/checks/registry.ts';
import { NOT_FOUND_PATH } from '../../src/routes/manifest.ts';
import { allPageEntries } from '../../src/routes/urls.ts';
import { installApiStub } from '../fixtures/api-stub.ts';
import { NEW_ORIGIN, OLD_ORIGIN } from '../fixtures/servers.ts';
import { MAX_RATIO, comparePngs, settle, type PixelResult } from './compare.ts';
import { TEST_DIST, VISUAL_DIR } from './global-setup.ts';

const SITES = { old: OLD_ORIGIN, new: NEW_ORIGIN } as const;
type Site = keyof typeof SITES;
const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
} as const;
type ViewportId = keyof typeof VIEWPORTS;
const SLICE = '/sestricka-praha-1/';

interface Accepted {
  path: string;
  viewport: ViewportId;
  maxRatio: number;
  note: string;
}

type Status = 'pass' | 'fail' | 'accepted';

// Every manifest page that the test build contains.
const pages = allPageEntries()
  .map((e) => e.path)
  .filter((p) => fs.existsSync(path.join(TEST_DIST, p, 'index.html')));

// The old 404 page is its static 404.html, which GitHub Pages serves for an unknown address;
// the new static server answers an unknown address with 404 and the new 404.html.
const targets: Array<{ path: string; urls: Record<Site, string> }> = [
  ...pages.map((p) => ({ path: p, urls: { old: p, new: p } })),
  { path: NOT_FOUND_PATH, urls: { old: NOT_FOUND_PATH, new: '/no-such-page/' } },
];

async function open(
  browser: Browser,
  site: Site,
  urlPath: string,
  viewport: ViewportId,
  options: { consent: boolean },
): Promise<Page> {
  const context = await browser.newContext({ viewport: VIEWPORTS[viewport], reducedMotion: 'reduce' });
  if (options.consent) {
    await context.addCookies([{ name: 'nius_consent', value: 'rejected', url: SITES[site] }]);
  }
  await context.route(
    /^https?:\/\/([^/]*\.)?(googletagmanager\.com|google-analytics\.com|amplitude\.com)\/|^https?:\/\/(www\.)?google\.com\/maps/,
    (route) => route.abort(),
  );
  const page = await context.newPage();
  await installApiStub(page);
  await page.clock.setFixedTime('2026-11-11T10:00:00+01:00');
  await page.goto(SITES[site] + urlPath, { waitUntil: 'networkidle' });
  await settle(page);
  return page;
}

// subject: the page path, or the page path and the state for a state comparison.
function compare(subject: string, viewport: ViewportId, oldPng: Buffer, newPng: Buffer) {
  const name = `${subject} ${viewport}`;
  const dir = path.join(VISUAL_DIR, name.replace(/[^\w-]+/g, '_'));
  const pixels = comparePngs(oldPng, newPng, dir);
  const listed = (accepted as Accepted[]).find((e) => e.path === subject && e.viewport === viewport);
  // A size difference always fails; the accepted list can only accept a pixel ratio.
  let status: Status;
  if (!pixels.sameSize) status = 'fail';
  else if (pixels.ratio <= MAX_RATIO) status = 'pass';
  else if (listed && pixels.ratio <= listed.maxRatio) status = 'accepted';
  else status = 'fail';
  fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify({ name, status }, null, 2));
  return { name, dir, status, pixels };
}

const summary = (p: PixelResult) =>
  `${(p.ratio * 100).toFixed(3)} %, sizes ${p.old.width}x${p.old.height} / ${p.new.width}x${p.new.height}`;

function expectResult(result: ReturnType<typeof compare>) {
  expect(result.status, `${result.name}: ${summary(result.pixels)}; see ${result.dir}`).not.toBe('fail');
}

async function shoot(
  browser: Browser,
  urls: Record<Site, string>,
  viewport: ViewportId,
  options: { consent: boolean; fullPage: boolean; prepare?: (page: Page) => Promise<void> },
) {
  return Promise.all(
    (['old', 'new'] as const).map(async (site) => {
      const page = await open(browser, site, urls[site], viewport, options);
      try {
        if (options.prepare) {
          await options.prepare(page);
          await settle(page);
        }
        return await page.screenshot({ fullPage: options.fullPage, animations: 'disabled' });
      } finally {
        await page.context().close();
      }
    }),
  );
}

test('the test build contains manifest pages to compare', () => {
  expect(pages.length).toBeGreaterThan(0);
});

for (const target of targets) {
  for (const viewport of Object.keys(VIEWPORTS) as ViewportId[]) {
    test(`${target.path} ${viewport}`, async ({ browser }) => {
      test.setTimeout(120_000);
      const check = viewport === 'phone' ? 'visual-phone' : 'visual-desktop';
      // Overwritten below; a crash must not leave the result of an earlier run.
      record(check, target.path, 'fail', 'not completed');
      const [o, n] = await shoot(browser, target.urls, viewport, { consent: true, fullPage: true });
      const result = compare(target.path, viewport, o, n);
      record(check, target.path, result.status, result.status === 'pass' ? undefined : summary(result.pixels));
      expectResult(result);
    });
  }
}

const clickOpen = (name: string) => async (page: Page) => {
  // A handle, because the old Radix menu hides the rest of the page, its trigger included, from the role tree.
  const trigger = await page.getByRole('button', { name, exact: true }).filter({ visible: true }).elementHandle();
  await trigger!.click();
  await expect.poll(() => trigger!.getAttribute('aria-expanded')).toBe('true');
};

const STATES: Array<{ state: string; viewports: ViewportId[]; consent: boolean; prepare?: (page: Page) => Promise<void> }> = [
  { state: 'cookie banner', viewports: ['phone', 'desktop'], consent: false },
  { state: 'language menu open', viewports: ['desktop'], consent: true, prepare: clickOpen(cs.nav.language) },
  { state: 'contacts menu open', viewports: ['desktop'], consent: true, prepare: clickOpen(cs.nav.contacts) },
  { state: 'mobile menu open', viewports: ['phone'], consent: true, prepare: clickOpen(cs.nav.menu) },
];

for (const { state, viewports, consent, prepare } of STATES) {
  for (const viewport of viewports) {
    test(`${SLICE} ${state} ${viewport}`, async ({ browser }) => {
      test.setTimeout(120_000);
      const [o, n] = await shoot(browser, { old: SLICE, new: SLICE }, viewport, { consent, fullPage: false, prepare });
      expectResult(compare(`${SLICE} ${state}`, viewport, o, n));
    });
  }
}
