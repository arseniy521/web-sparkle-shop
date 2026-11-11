// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mergeDist, referenceOnlyAddresses } from './merge-dist.ts';

const write = (dir: string, file: string, content: string) => {
  const target = path.join(dir, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
};
const read = (dir: string, file: string) => fs.readFileSync(path.join(dir, file), 'utf8');
const exists = (dir: string, file: string) => fs.existsSync(path.join(dir, file));

const NEW_PAGE = `<html><head><link rel="stylesheet" href="/_astro/page.css">
<script type="module" src="/_astro/page.js"></script></head>
<body><img src="/photos/nurse.jpg" alt=""><h1>new</h1></body></html>`;

describe('mergeDist', () => {
  let root: string;
  let oldDist: string;
  let newDist: string;
  let outDir: string;
  const paths = ['/sestricka-praha-1/', '/ru/privacy/'];

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-dist-'));
    oldDist = path.join(root, 'old');
    newDist = path.join(root, 'new');
    outDir = path.join(root, 'out');
    // Files that sync-public copies from the old public/ into the new build: in both builds.
    for (const dir of [oldDist, newDist]) {
      write(dir, 'robots.txt', 'User-agent: *\n');
      write(dir, 'sitemap.xml', '<urlset></urlset>\n');
      write(dir, 'photos/nurse.jpg', 'jpg');
    }
    write(oldDist, 'index.html', '<h1>old home</h1>');
    write(oldDist, 'sestricka-praha-1/index.html', '<h1>old district</h1>');
    write(oldDist, 'ru/privacy/index.html', '<h1>old privacy</h1>');
    write(oldDist, 'assets/index-abc.js', 'old code');
    write(oldDist, '404.html', '<h1>old 404</h1>');
    // The old build writes CNAME with `echo`, which on Windows leaves "www.nius.cz \r\n".
    write(oldDist, 'CNAME', 'www.nius.cz \r\n');

    write(newDist, 'sestricka-praha-1/index.html', NEW_PAGE);
    write(newDist, 'ru/privacy/index.html', '<h1>new privacy</h1>');
    write(newDist, 'iv-drips-prague/index.html', '<h1>not in this wave</h1>');
    write(newDist, '_astro/page.js', 'new code');
    write(newDist, '_astro/page.css', 'body{}');
    write(newDist, '.nojekyll', '');
    write(newDist, '404.html', '<h1>new 404</h1>');
    write(newDist, 'CNAME', 'www.nius.cz\n');
  });

  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  it('keeps the old site and takes the listed pages, _astro/ and .nojekyll from the new build', () => {
    write(outDir, 'stale.txt', 'from an earlier merge');
    mergeDist({ oldDist, newDist, paths, outDir });

    expect(read(outDir, 'index.html')).toBe('<h1>old home</h1>');
    expect(read(outDir, 'assets/index-abc.js')).toBe('old code');
    expect(read(outDir, 'sestricka-praha-1/index.html')).toBe(NEW_PAGE);
    expect(read(outDir, 'ru/privacy/index.html')).toBe('<h1>new privacy</h1>');
    expect(exists(outDir, 'iv-drips-prague/index.html')).toBe(false);
    expect(read(outDir, '_astro/page.js')).toBe('new code');
    expect(exists(outDir, '.nojekyll')).toBe(true);
    expect(read(outDir, '404.html')).toBe('<h1>old 404</h1>');
    expect(read(outDir, 'CNAME')).toBe('www.nius.cz \r\n');
    expect(exists(outDir, 'stale.txt')).toBe(false);

    // Every local file the new page refers to is in the merged site.
    const refs = [...NEW_PAGE.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1]);
    expect(refs).toHaveLength(3);
    for (const ref of refs) expect(exists(outDir, ref), ref).toBe(true);
  });

  it('leaves out the old addresses it is told to skip', () => {
    write(oldDist, 'en/iv-drip-hotel-prague/index.html', '<h1>rendered only for comparison</h1>');
    mergeDist({ oldDist, newDist, paths, outDir, skipOld: ['/en/iv-drip-hotel-prague/'] });
    expect(exists(outDir, 'en/iv-drip-hotel-prague')).toBe(false);
    expect(read(outDir, 'index.html')).toBe('<h1>old home</h1>');
  });

  it('takes a skipped old address that is also listed from the new build', () => {
    mergeDist({ oldDist, newDist, paths, outDir, skipOld: ['/ru/privacy/'] });
    expect(read(outDir, 'ru/privacy/index.html')).toBe('<h1>new privacy</h1>');
  });

  it('reads the addresses to skip from baseline.json next to a reference folder', () => {
    const reference = path.join(root, '.baseline', 'dist');
    fs.mkdirSync(reference, { recursive: true });
    expect(() => referenceOnlyAddresses(reference)).toThrow('baseline.json');
    write(root, '.baseline/baseline.json', '{"extraRoutes": "not a list"}');
    expect(() => referenceOnlyAddresses(reference)).toThrow('baseline.json');
    write(root, '.baseline/baseline.json', '{"extraRoutes": ["/privacy/", "/en/iv-drip-hotel-prague/"]}');
    expect(referenceOnlyAddresses(reference)).toEqual(['/privacy/', '/en/iv-drip-hotel-prague/']);
    // Any other old folder is a plain build of the old site: nothing to skip.
    expect(referenceOnlyAddresses(oldDist)).toEqual([]);
  });

  it('refuses an address that the new build does not have', () => {
    expect(() => mergeDist({ oldDist, newDist, paths: [...paths, '/sestricka-praha-zizkov/'], outDir })).toThrow(
      '/sestricka-praha-zizkov/',
    );
    expect(exists(outDir, 'index.html')).toBe(false);
  });

  it('refuses an address that is not a plain site path', () => {
    expect(() => mergeDist({ oldDist, newDist, paths: ['/../new/sestricka-praha-1/'], outDir })).toThrow(
      '/../new/sestricka-praha-1/',
    );
    expect(() => mergeDist({ oldDist, newDist, paths: ['/sestricka-praha-1'], outDir })).toThrow('/sestricka-praha-1');
  });

  it('refuses an old build that already contains _astro/', () => {
    write(oldDist, '_astro/other.js', 'x');
    expect(() => mergeDist({ oldDist, newDist, paths, outDir })).toThrow(/_astro/);
  });

  it('refuses a file from public/ that differs between the builds', () => {
    write(newDist, 'robots.txt', 'User-agent: *\nDisallow: /\n');
    expect(() => mergeDist({ oldDist, newDist, paths, outDir })).toThrow('robots.txt');
  });

  it('refuses a file from public/ that only the new build has', () => {
    write(newDist, 'photos/new.jpg', 'jpg');
    expect(() => mergeDist({ oldDist, newDist, paths, outDir })).toThrow('photos/new.jpg');
  });

  it('refuses CNAME files that name different hosts', () => {
    write(newDist, 'CNAME', 'nius.cz\n');
    expect(() => mergeDist({ oldDist, newDist, paths, outDir })).toThrow('CNAME');
  });

  it('accepts a 404.html that differs and keeps the old one', () => {
    expect(read(oldDist, '404.html')).not.toBe(read(newDist, '404.html'));
    expect(() => mergeDist({ oldDist, newDist, paths, outDir })).not.toThrow();
  });

  it('leaves an existing output folder as it was when it refuses a merge', () => {
    write(outDir, 'stale.txt', 'from an earlier merge');
    const refusals: [string, () => void][] = [
      ['.nojekyll', () => fs.rmSync(path.join(newDist, '.nojekyll'))],
      [
        '_astro',
        () => {
          write(newDist, '.nojekyll', '');
          fs.rmSync(path.join(newDist, '_astro'), { recursive: true });
        },
      ],
    ];
    for (const [missing, remove] of refusals) {
      remove();
      expect(() => mergeDist({ oldDist, newDist, paths, outDir }), missing).toThrow(missing);
      expect(fs.readdirSync(outDir), missing).toEqual(['stale.txt']);
      expect(read(outDir, 'stale.txt')).toBe('from an earlier merge');
    }
  });

  it('refuses an output folder that is an input, lies inside one or contains one', () => {
    for (const bad of [oldDist, newDist, path.join(oldDist, 'out'), path.join(newDist, 'nested', 'out'), root]) {
      expect(() => mergeDist({ oldDist, newDist, paths, outDir: bad }), bad).toThrow(/output folder/);
    }
    expect(read(oldDist, 'index.html')).toBe('<h1>old home</h1>');
    expect(read(newDist, '_astro/page.js')).toBe('new code');
  });
});
