import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type Page } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import cs from '../../../src/i18n/locales/cs.json' with { type: 'json' };
import accepted from '../../checks/visual-accepted.json' with { type: 'json' };
import { record } from '../../scripts/checks/registry.ts';
import { allPageEntries } from '../../src/routes/urls.ts';
import { installApiStub } from '../fixtures/api-stub.ts';
import { TEST_DIST, VISUAL_DIR } from './global-setup.ts';

const SITES = { old: 'http://localhost:8081', new: 'http://localhost:8080' } as const;
type Site = keyof typeof SITES;
const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
} as const;
type ViewportId = keyof typeof VIEWPORTS;
const MAX_RATIO = 0.001;
const SLICE = '/sestricka-praha-1/';

interface Accepted {
  path: string;
  viewport: ViewportId;
  maxRatio: number;
  note: string;
}

interface Result {
  name: string;
  subject: string;
  viewport: ViewportId;
  ratio: number;
  heights: { old: number; new: number };
  status: 'pass' | 'fail' | 'accepted';
  dir: string;
}

// Every manifest page that the test build contains.
const pages = allPageEntries()
  .map((e) => e.path)
  .filter((p) => fs.existsSync(path.join(TEST_DIST, p, 'index.html')));

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

async function settle(page: Page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  );
}

// subject: the page path, or the page path and the state for a state comparison.
function compare(subject: string, viewport: ViewportId, oldPng: Buffer, newPng: Buffer): Result {
  const name = `${subject} ${viewport}`;
  const dir = path.join(VISUAL_DIR, name.replace(/[^\w-]+/g, '_'));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'old.png'), oldPng);
  fs.writeFileSync(path.join(dir, 'new.png'), newPng);
  const [a, b] = [PNG.sync.read(oldPng), PNG.sync.read(newPng)];
  const [width, height] = [Math.min(a.width, b.width), Math.min(a.height, b.height)];
  const crop = (img: PNG) => {
    const out = new PNG({ width, height });
    PNG.bitblt(img, out, 0, 0, width, height, 0, 0);
    return out;
  };
  const diff = new PNG({ width, height });
  const count = pixelmatch(crop(a).data, crop(b).data, diff.data, width, height, { threshold: 0.1 });
  fs.writeFileSync(path.join(dir, 'diff.png'), PNG.sync.write(diff));
  const ratio = count / (width * height);
  const sameSize = a.width === b.width && a.height === b.height;
  const listed = (accepted as Accepted[]).find((e) => e.path === subject && e.viewport === viewport);
  let status: Result['status'];
  if (sameSize && ratio <= MAX_RATIO) status = 'pass';
  else if (listed && ratio <= listed.maxRatio) status = 'accepted';
  else status = 'fail';
  const result: Result = { name, subject, viewport, ratio, heights: { old: a.height, new: b.height }, status, dir };
  fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(result, null, 2));
  return result;
}

function writeReport() {
  const results: Result[] = fs
    .readdirSync(VISUAL_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(VISUAL_DIR, d.name, 'result.json')))
    .map((d) => JSON.parse(fs.readFileSync(path.join(VISUAL_DIR, d.name, 'result.json'), 'utf8')) as Result)
    .sort((x, y) => x.name.localeCompare(y.name));
  const rows = results.map((r) => {
    const rel = path.relative(VISUAL_DIR, r.dir).replace(/\\/g, '/');
    const img = (file: string) => `<td><a href="${rel}/${file}"><img src="${rel}/${file}" width="240"></a></td>`;
    return `<tr><td>${r.name}</td><td>${r.status}</td><td>${(r.ratio * 100).toFixed(3)} %</td><td>${r.heights.old} / ${r.heights.new}</td>${img('old.png')}${img('new.png')}${img('diff.png')}</tr>`;
  });
  fs.writeFileSync(
    path.join(VISUAL_DIR, 'index.html'),
    `<!doctype html><meta charset="utf-8"><title>Visual comparison</title>
<table border="1" cellpadding="4"><tr><th>comparison</th><th>result</th><th>differing pixels</th><th>height old / new</th><th>old</th><th>new</th><th>diff</th></tr>
${rows.join('\n')}</table>\n`,
  );
}

function expectResult(result: Result) {
  expect(
    result.status,
    `${result.name}: ${(result.ratio * 100).toFixed(3)} % pixels differ, heights ${result.heights.old} / ${result.heights.new}; see ${result.dir}`,
  ).not.toBe('fail');
}

async function shoot(
  browser: Browser,
  urlPath: string,
  viewport: ViewportId,
  options: { consent: boolean; fullPage: boolean; prepare?: (page: Page) => Promise<void> },
) {
  return Promise.all(
    (['old', 'new'] as const).map(async (site) => {
      const page = await open(browser, site, urlPath, viewport, options);
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

test.afterAll(() => writeReport());

for (const urlPath of pages) {
  for (const viewport of Object.keys(VIEWPORTS) as ViewportId[]) {
    test(`${urlPath} ${viewport}`, async ({ browser }) => {
      test.setTimeout(120_000);
      const [o, n] = await shoot(browser, urlPath, viewport, { consent: true, fullPage: true });
      const result = compare(urlPath, viewport, o, n);
      record(viewport === 'phone' ? 'visual-phone' : 'visual-desktop', urlPath, result.status, result.status === 'pass' ? undefined : `${(result.ratio * 100).toFixed(3)} %, heights ${result.heights.old}/${result.heights.new}`);
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
      const [o, n] = await shoot(browser, SLICE, viewport, { consent, fullPage: false, prepare });
      expectResult(compare(`${SLICE} ${state}`, viewport, o, n));
    });
  }
}
