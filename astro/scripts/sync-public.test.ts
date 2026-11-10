import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
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
