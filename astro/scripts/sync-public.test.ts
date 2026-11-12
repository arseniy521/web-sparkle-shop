import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, onTestFinished } from 'vitest';
import { syncPublic } from './sync-public.mjs';

const write = (dir: string, file: string, content: string) => {
  const target = path.join(dir, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
};
const read = (dir: string, file: string) => fs.readFileSync(path.join(dir, file), 'utf8');
const exists = (dir: string, file: string) => fs.existsSync(path.join(dir, file));

describe('syncPublic', () => {
  it('copies nested files, skips 404.html and removes stale files', () => {
    const src = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-src-'));
    const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-dest-'));
    write(src, 'robots.txt', 'a'); write(src, 'brand/logo.svg', 'b'); write(src, '404.html', 'c');
    write(dest, 'stale.txt', 'x');
    syncPublic(src, dest);
    expect(read(dest, 'robots.txt')).toBe('a');
    expect(read(dest, 'brand/logo.svg')).toBe('b');
    expect(exists(dest, '404.html')).toBe(false);
    expect(exists(dest, 'stale.txt')).toBe(false);
  });
});

describe('the sync-public command', () => {
  // The command empties its destination, so it must not depend on where it is started from:
  // started from the repository root, the old relative paths emptied the old site's public/.
  it('copies <repo>/public to <repo>/astro/public from any current directory', () => {
    const repo = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'sync-cli-')));
    const script = path.join(repo, 'astro/scripts/sync-public.mjs');
    fs.mkdirSync(path.dirname(script), { recursive: true });
    fs.copyFileSync(path.join(import.meta.dirname, 'sync-public.mjs'), script);
    write(repo, 'public/robots.txt', 'a');
    write(repo, 'public/404.html', 'c');
    fs.mkdirSync(path.join(repo, 'elsewhere/deep'), { recursive: true });
    onTestFinished(() => fs.rmSync(repo, { recursive: true, force: true }));

    for (const cwd of [repo, path.join(repo, 'astro'), path.join(repo, 'elsewhere/deep')]) {
      write(repo, 'astro/public/stale.txt', 'x');
      const result = spawnSync(process.execPath, [script], { cwd, encoding: 'utf8' });
      expect(result.status, `${cwd}: ${result.stderr}`).toBe(0);
      expect(fs.readdirSync(path.join(repo, 'public')).sort(), cwd).toEqual(['404.html', 'robots.txt']);
      expect(fs.readdirSync(path.join(repo, 'astro/public')), cwd).toEqual(['robots.txt']);
      expect(read(repo, 'astro/public/robots.txt')).toBe('a');
    }
    expect(fs.readdirSync(path.join(repo, 'elsewhere/deep'))).toEqual([]);
    expect(fs.readdirSync(repo).sort()).toEqual(['astro', 'elsewhere', 'public']);
  });
});
