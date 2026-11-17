import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
// An entry is { path, viewport, maxRatio, note }: path is a page ("/privacy/"), a page state ("/sestricka-praha-1/ cookie banner") or an order form step ("order-form cart"); viewport is "phone" or "desktop".
import accepted from '../../checks/visual-accepted.json' with { type: 'json' };

// A comparison fails when more than this share of pixels differ (pixelmatch threshold 0.1).
export const MAX_RATIO = 0.001;

export interface PixelResult {
  count: number;
  ratio: number;
  old: { width: number; height: number };
  new: { width: number; height: number };
  sameSize: boolean;
}

export interface AcceptedDifference {
  path: string;
  viewport: string;
  maxRatio: number;
  note: string;
}

export type PixelStatus = 'pass' | 'fail' | 'accepted';

// A size difference always fails; the accepted list can only accept a pixel ratio.
export function pixelStatus(
  pixels: Pick<PixelResult, 'ratio' | 'sameSize'>,
  path: string,
  viewport: string,
  list: readonly AcceptedDifference[] = accepted,
): PixelStatus {
  if (!pixels.sameSize) return 'fail';
  if (pixels.ratio <= MAX_RATIO) return 'pass';
  const listed = list.find((entry) => entry.path === path && entry.viewport === viewport);
  return listed && pixels.ratio <= listed.maxRatio ? 'accepted' : 'fail';
}

export async function settle(page: Page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.fonts.ready);
  // A full-page screenshot shows the whole page, but a lazy image outside the viewport has not
  // started loading (question 98). The old app renders its images from React, which sets src
  // before loading="lazy", so its images load at once; the new static HTML defers them. Every
  // image is loaded before the screenshot; the pixels of a loaded image do not change.
  await page.evaluate(async () => {
    for (const img of document.images) if (img.loading === 'lazy') img.loading = 'eager';
    // decode() waits for the load and the decoding; a broken image rejects and is shown broken.
    await Promise.all([...document.images].map((img) => img.decode().catch(() => undefined)));
  });
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  );
}

// Writes old.png, new.png, diff.png and pixels.json into dir. Images of different size are
// compared over their common part; the size difference is reported by sameSize.
export function comparePngs(oldPng: Buffer, newPng: Buffer, dir: string): PixelResult {
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
  const result: PixelResult = {
    count,
    ratio: count / (width * height),
    old: { width: a.width, height: a.height },
    new: { width: b.width, height: b.height },
    sameSize: a.width === b.width && a.height === b.height,
  };
  fs.writeFileSync(path.join(dir, 'pixels.json'), JSON.stringify(result, null, 2));
  return result;
}

// One row per folder with pixels.json. The status comes from the differences-*.json files of
// the form comparison (any difference fails it), otherwise from result.json (page comparisons,
// an accepted form comparison).
export function writeReport(root: string) {
  if (!fs.existsSync(root)) return;
  const rows: Array<{ name: string; status: string; pixels: PixelResult }> = [];
  const walk = (dir: string) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    if (files.some((f) => f.name === 'pixels.json')) {
      const read = (file: string) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      const differences = files.filter((f) => /^differences-.+\.json$/.test(f.name)).flatMap((f) => read(f.name));
      const status =
        differences.length > 0
          ? 'fail'
          : files.some((f) => f.name === 'result.json')
            ? (read('result.json').status as string)
            : 'pass';
      rows.push({ name: path.relative(root, dir).replace(/\\/g, '/'), status, pixels: read('pixels.json') });
    }
    for (const f of files) if (f.isDirectory()) walk(path.join(dir, f.name));
  };
  walk(root);
  rows.sort((x, y) => x.name.localeCompare(y.name));
  const html = rows.map(({ name, status, pixels }) => {
    const img = (file: string) => `<td><a href="${name}/${file}"><img src="${name}/${file}" width="240"></a></td>`;
    return `<tr><td>${name}</td><td>${status}</td><td>${(pixels.ratio * 100).toFixed(3)} %</td><td>${pixels.old.width}×${pixels.old.height} / ${pixels.new.width}×${pixels.new.height}</td>${img('old.png')}${img('new.png')}${img('diff.png')}</tr>`;
  });
  fs.writeFileSync(
    path.join(root, 'index.html'),
    `<!doctype html><meta charset="utf-8"><title>Visual comparison</title>
<table border="1" cellpadding="4"><tr><th>comparison</th><th>result</th><th>differing pixels</th><th>size old / new</th><th>old</th><th>new</th><th>diff</th></tr>
${html.join('\n')}</table>\n`,
  );
}
