import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

// A comparison fails when more than this share of pixels differ (pixelmatch threshold 0.1).
export const MAX_RATIO = 0.001;

export interface PixelResult {
  count: number;
  ratio: number;
  old: { width: number; height: number };
  new: { width: number; height: number };
  sameSize: boolean;
}

export async function settle(page: Page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.fonts.ready);
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

// One row per folder with pixels.json. The status comes from result.json (page comparisons)
// or from the differences-*.json files of the form comparison.
export function writeReport(root: string) {
  if (!fs.existsSync(root)) return;
  const rows: Array<{ name: string; status: string; pixels: PixelResult }> = [];
  const walk = (dir: string) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    if (files.some((f) => f.name === 'pixels.json')) {
      const read = (file: string) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      const differences = files.filter((f) => /^differences-.+\.json$/.test(f.name)).flatMap((f) => read(f.name));
      const status = files.some((f) => f.name === 'result.json')
        ? (read('result.json').status as string)
        : differences.length > 0
          ? 'fail'
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
