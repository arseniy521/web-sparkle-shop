// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { record, renderReport } from './registry.ts';

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-'));
  process.env.NIUS_CHECKS_DIR = dir;
});
afterEach(() => {
  delete process.env.NIUS_CHECKS_DIR;
  fs.rmSync(dir, { recursive: true, force: true });
});

const readRegistry = () => JSON.parse(fs.readFileSync(path.join(dir, 'registry.json'), 'utf8'));

describe('record', () => {
  it('creates registry.json with the status of a page', () => {
    record('seo', '/a/', 'pass');
    const registry = readRegistry();
    expect(registry.pages['/a/'].seo).toEqual({ status: 'pass' });
    expect(Number.isNaN(Date.parse(registry.generatedAt))).toBe(false);
  });

  it('keeps the results of other checks for the same page and of other pages', () => {
    record('seo', '/a/', 'pass');
    record('content', '/a/', 'fail', 'text-missing');
    record('seo', '/b/', 'skipped');
    const { pages } = readRegistry();
    expect(pages['/a/']).toEqual({ seo: { status: 'pass' }, content: { status: 'fail', detail: 'text-missing' } });
    expect(pages['/b/'].seo.status).toBe('skipped');
  });

  it('overwrites an earlier result of the same check', () => {
    record('seo', '/a/', 'fail', 'old');
    record('seo', '/a/', 'pass');
    expect(readRegistry().pages['/a/'].seo).toEqual({ status: 'pass' });
  });
});

describe('renderReport', () => {
  it('is a Markdown table with a row per page and a column per check', () => {
    record('seo', '/b/', 'fail', 'x');
    record('seo', '/a/', 'pass');
    record('content', '/a/', 'accepted');
    const lines = renderReport().trim().split('\n');
    expect(lines).toEqual([
      '| page | content | visual-phone | visual-desktop | seo | e2e | lighthouse |',
      '| --- | --- | --- | --- | --- | --- | --- |',
      '| /a/ | accepted | - | - | pass | - | - |',
      '| /b/ | - | - | - | fail | - | - |',
    ]);
  });

  it('has only the header when nothing was recorded', () => {
    expect(renderReport().trim().split('\n')).toHaveLength(2);
  });
});
