// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { assemblePreview } from './assemble.mjs';

const write = (dir: string, file: string, content: string) => {
  const target = path.join(dir, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
};
const read = (dir: string, file: string) => fs.readFileSync(path.join(dir, file), 'utf8');
const exists = (dir: string, file: string) => fs.existsSync(path.join(dir, file));

describe('assemblePreview', () => {
  it('assembles a preview with a disallowing robots.txt and the functions folder, leaving dist untouched', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'preview-'));
    const dist = path.join(root, 'build');
    const out = path.join(root, '.preview', 'dist');
    write(dist, 'robots.txt', 'User-agent: *\nAllow: /\n');
    write(dist, 'index.html', '<html></html>');
    assemblePreview(dist, out);
    expect(read(out, 'robots.txt')).toBe('User-agent: *\nDisallow: /\n');
    expect(read(out, 'index.html')).toBe('<html></html>');
    expect(exists(out, '../functions/_middleware.js')).toBe(true);
    expect(exists(out, '../functions/api/[[path]].js')).toBe(true);
    expect(exists(out, '../stub.js')).toBe(true);
    expect(exists(out, '../stub-data.json')).toBe(true);
    expect(read(dist, 'robots.txt')).not.toContain('Disallow: /');
    expect(exists(dist, 'functions')).toBe(false);
  });

  it('replaces a previous assembly', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'preview-'));
    const dist = path.join(root, 'build');
    const out = path.join(root, '.preview', 'dist');
    write(dist, 'index.html', 'new');
    write(out, 'stale.html', 'old');
    assemblePreview(dist, out);
    expect(exists(out, 'stale.html')).toBe(false);
  });
});
