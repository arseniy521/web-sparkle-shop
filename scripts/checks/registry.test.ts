// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clear, groupRows, record, renderReport } from './registry.ts';

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
    record('e2e', '/a/', 'fail', '1 of 2 not passed');
    record('seo', '/b/', 'skipped');
    const { pages } = readRegistry();
    expect(pages['/a/']).toEqual({ seo: { status: 'pass' }, e2e: { status: 'fail', detail: '1 of 2 not passed' } });
    expect(pages['/b/'].seo.status).toBe('skipped');
  });

  it('overwrites an earlier result of the same check', () => {
    record('seo', '/a/', 'fail', 'old');
    record('seo', '/a/', 'pass');
    expect(readRegistry().pages['/a/'].seo).toEqual({ status: 'pass' });
  });
});

describe('clear', () => {
  it('removes the column of one check from every row and keeps the other checks', () => {
    record('seo', '/a/', 'pass');
    record('lighthouse', '/a/', 'fail', 'categories:performance');
    record('lighthouse', '/b/', 'pass');
    clear('lighthouse');
    expect(readRegistry().pages).toEqual({ '/a/': { seo: { status: 'pass' } } });
  });

  it('clears several columns at once', () => {
    record('e2e', '/a/', 'pass');
    record('lighthouse', '/a/', 'fail', 'x');
    record('seo', '/a/', 'pass');
    clear('e2e', 'lighthouse');
    expect(readRegistry().pages).toEqual({ '/a/': { seo: { status: 'pass' } } });
  });

  it('leaves no stale result once a full run has written its own', () => {
    record('seo', '/a/', 'pass');
    record('seo', '/gone/', 'pass');
    clear('seo');
    record('seo', '/a/', 'fail', 'canonical');
    expect(readRegistry().pages).toEqual({ '/a/': { seo: { status: 'fail', detail: 'canonical' } } });
  });

  it('does nothing when there is no registry yet', () => {
    clear('seo');
    expect(fs.existsSync(path.join(dir, 'registry.json'))).toBe(false);
  });
});

describe('groupRows', () => {
  it('sorts the rows into pages, redirects, the 404 page and other', () => {
    const groups = groupRows([
      'order-form',
      '/sestricka-praha-1/',
      '/iv-drips-prague/',
      '/404.html',
      '/en/',
      '/nowhere/',
      '/en/ivf-injection-support-prague/',
    ]);
    expect(groups).toEqual({
      pages: ['/en/', '/sestricka-praha-1/'],
      redirects: ['/en/ivf-injection-support-prague/', '/iv-drips-prague/'],
      notFound: ['/404.html'],
      other: ['/nowhere/', 'order-form'],
    });
  });
});

describe('renderReport', () => {
  const header = '| page | seo | e2e | lighthouse |';
  const rule = '| --- | --- | --- | --- |';

  it('prints a table per group under its heading; redirects show only seo', () => {
    record('seo', '/sestricka-praha-1/', 'fail', 'x');
    record('seo', '/', 'pass');
    record('lighthouse', '/', 'pass');
    record('seo', '/iv-drips-prague/', 'pass');
    record('seo', '/404.html', 'pass');
    expect(renderReport().trim().split('\n')).toEqual([
      '## Pages',
      '',
      header,
      rule,
      '| / | pass | - | pass |',
      '| /sestricka-praha-1/ | fail | - | - |',
      '',
      '## Redirects',
      '',
      '| redirect | seo |',
      '| --- | --- |',
      '| /iv-drips-prague/ | pass |',
      '',
      '## 404 page',
      '',
      header,
      rule,
      '| /404.html | pass | - | - |',
    ]);
  });

  it('prints a row that belongs to no group under Other', () => {
    record('e2e', '/nowhere/', 'pass');
    const lines = renderReport().trim().split('\n');
    expect(lines.slice(-5)).toEqual(['## Other', '', header, rule, '| /nowhere/ | - | pass | - |']);
  });

  it('prints the three headings with empty tables when nothing was recorded', () => {
    const lines = renderReport().trim().split('\n');
    expect(lines.filter((l) => l.startsWith('## '))).toEqual(['## Pages', '## Redirects', '## 404 page']);
    expect(lines.filter((l) => l.startsWith('| /'))).toEqual([]);
  });
});
