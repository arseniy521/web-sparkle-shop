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

describe('clear', () => {
  it('removes the column of one check from every row and keeps the other checks', () => {
    record('seo', '/a/', 'pass');
    record('content', '/a/', 'fail', 'text-missing');
    record('content', '/b/', 'pass');
    clear('content');
    expect(readRegistry().pages).toEqual({ '/a/': { seo: { status: 'pass' } } });
  });

  it('clears several columns at once', () => {
    record('visual-phone', '/a/', 'pass');
    record('visual-desktop', '/a/', 'fail', 'x');
    record('seo', '/a/', 'pass');
    clear('visual-phone', 'visual-desktop');
    expect(readRegistry().pages).toEqual({ '/a/': { seo: { status: 'pass' } } });
  });

  it('leaves no stale result once a full run has written its own', () => {
    record('content', '/a/', 'pass');
    record('content', '/gone/', 'pass');
    clear('content');
    record('content', '/a/', 'fail', 'text-missing');
    expect(readRegistry().pages).toEqual({ '/a/': { content: { status: 'fail', detail: 'text-missing' } } });
  });

  it('does nothing when there is no registry yet', () => {
    clear('seo');
    expect(fs.existsSync(path.join(dir, 'registry.json'))).toBe(false);
  });
});

describe('groupRows', () => {
  it('sorts the rows into pages, redirects, the 404 page, the order form and other', () => {
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
      orderForm: ['order-form'],
      other: ['/nowhere/'],
    });
  });
});

describe('renderReport', () => {
  const header = '| page | content | visual-phone | visual-desktop | seo | e2e | lighthouse |';
  const rule = '| --- | --- | --- | --- | --- | --- | --- |';

  it('prints a table per group under its heading; redirects show only seo', () => {
    record('seo', '/sestricka-praha-1/', 'fail', 'x');
    record('seo', '/', 'pass');
    record('content', '/', 'accepted');
    record('seo', '/iv-drips-prague/', 'pass');
    record('seo', '/404.html', 'pass');
    record('visual-phone', 'order-form', 'fail', 'x');
    expect(renderReport().trim().split('\n')).toEqual([
      '## Pages',
      '',
      header,
      rule,
      '| / | accepted | - | - | pass | - | - |',
      '| /sestricka-praha-1/ | - | - | - | fail | - | - |',
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
      '| /404.html | - | - | - | pass | - | - |',
      '',
      '## Order form',
      '',
      header,
      rule,
      '| order-form | - | fail | - | - | - | - |',
    ]);
  });

  it('prints a row that belongs to no group under Other', () => {
    record('content', '/nowhere/', 'pass');
    const lines = renderReport().trim().split('\n');
    expect(lines.slice(-5)).toEqual(['## Other', '', header, rule, '| /nowhere/ | pass | - | - | - | - | - |']);
  });

  it('prints the four headings with empty tables when nothing was recorded', () => {
    const lines = renderReport().trim().split('\n');
    expect(lines.filter((l) => l.startsWith('## '))).toEqual(['## Pages', '## Redirects', '## 404 page', '## Order form']);
    expect(lines.filter((l) => l.startsWith('| /') || l.startsWith('| order-form'))).toEqual([]);
  });
});
