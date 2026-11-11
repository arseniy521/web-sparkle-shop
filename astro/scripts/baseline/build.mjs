// Builds the reference copy of the old site into .baseline/: the old prerender plus the
// routes the old prerender skips, rendered from the old SPA.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { load } from 'cheerio';
import { installApiStub } from '../../tests/fixtures/api-stub.ts';
import { startStaticServer } from '../../tests/fixtures/static-server.ts';

const ASTRO = path.resolve(import.meta.dirname, '../..');
const OLD_ROOT = path.resolve(ASTRO, '..');
const OUT = path.join(ASTRO, '.baseline');
const DIST = path.join(OUT, 'dist');
const PORT = 8082;

// Routes of the old router that its prerender does not render (approved differences 3 and 11).
const EXTRA_ROUTES = [
  '/iv-kapacky-praha/',
  '/ru/kapelnitsy-praga/',
  '/en/iv-drip-hotel-prague/',
  '/privacy/',
  '/en/privacy/',
  '/ru/privacy/',
  '/uk/privacy/',
];

const run = (command, env = {}) =>
  execSync(command, { cwd: OLD_ROOT, stdio: 'inherit', env: { ...process.env, ...env } });

run('npm ci', { PUPPETEER_SKIP_DOWNLOAD: 'true' });
run('npx puppeteer browsers install chrome');
run('npm run build');

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(OLD_ROOT, 'dist'), DIST, { recursive: true });

const server = await startStaticServer({ dir: DIST, port: PORT, spaFallback: true });
const browser = await chromium.launch();
try {
  for (const route of EXTRA_ROUTES) {
    const page = await browser.newPage();
    // The API stub answers like production does for an anonymous visitor; analytics stay off.
    await installApiStub(page);
    await page.route(/^https?:\/\/([^/]*\.)?(googletagmanager\.com|google-analytics\.com|amplitude\.com)\//, (r) =>
      r.abort(),
    );
    await page.goto(`${server.url}${route}`, { waitUntil: 'networkidle' });
    await page.locator('link[rel="canonical"][data-rh]').waitFor({ state: 'attached' });
    await page.waitForLoadState('networkidle');
    const html = await page.content();
    // The old prerender removes duplicate head tags; these routes are saved as rendered, so check.
    const $ = load(html);
    const [titles, descriptions] = [$('head title').length, $('head meta[name="description"]').length];
    if (titles !== 1 || descriptions !== 1) {
      throw new Error(`${route}: expected one title and one meta description, found ${titles} and ${descriptions}`);
    }
    const file = path.join(DIST, route, 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    console.log(`Rendered ${route}`);
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}

const git = (args) => execSync(`git ${args}`, { cwd: OLD_ROOT, encoding: 'utf8' }).trim();
const commit = git('rev-parse HEAD');
let differsFromMain = null;
try {
  git('rev-parse --verify origin/main');
  try {
    git(`diff --quiet origin/main -- . ":(exclude)astro"`);
    differsFromMain = false;
  } catch {
    differsFromMain = true;
    console.warn('WARNING: the old site in this checkout differs from origin/main; the reference is not main.');
  }
} catch {
  console.warn('WARNING: origin/main is unavailable; cannot tell whether the reference matches main.');
}

fs.writeFileSync(
  path.join(OUT, 'baseline.json'),
  `${JSON.stringify({ commit, differsFromMain, builtAt: new Date().toISOString(), extraRoutes: EXTRA_ROUTES }, null, 2)}\n`,
);
console.log(`Reference built in ${DIST}`);
