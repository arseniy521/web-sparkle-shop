// @vitest-environment node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { writeGoodDist } from './__fixtures__/good-dist.ts';

const tmpDirs: string[] = [];
const tmp = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-check-'));
  tmpDirs.push(dir);
  return dir;
};
afterAll(() => tmpDirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

function run(args: string[], checksDir = tmp()) {
  const result = spawnSync(process.execPath, ['scripts/checks/seo-check.ts', ...args], {
    encoding: 'utf8',
    env: { ...process.env, NIUS_CHECKS_DIR: checksDir },
  });
  const registryFile = path.join(checksDir, 'registry.json');
  const registry = fs.existsSync(registryFile) ? JSON.parse(fs.readFileSync(registryFile, 'utf8')) : null;
  return { status: result.status, stdout: result.stdout, stderr: result.stderr, registry };
}

describe('seo-check usage errors', () => {
  const goodDist = () => {
    const dist = tmp();
    writeGoodDist(dist);
    return dist;
  };
  const file = (content: string) => {
    const f = path.join(tmp(), 'input.json');
    fs.writeFileSync(f, content);
    return f;
  };
  const expectUsageError = (args: string[], message: RegExp) => {
    const r = run(args);
    expect(r.status).toBe(2);
    expect(r.stderr.trim().split(/\r?\n/)).toHaveLength(1);
    expect(r.stderr).toMatch(message);
    expect(r.stderr).not.toMatch(/\bat .*:\d+/);
    expect(r.stdout).toBe('');
  };

  it('a missing dist directory', () => {
    expectUsageError(['--dist', path.join(tmp(), 'nope')], /dist/);
  });
  it('a dist that is a file', () => {
    expectUsageError(['--dist', file('{}')], /dist/);
  });
  it('a missing scope file', () => {
    expectUsageError(['--dist', goodDist(), '--scope', path.join(tmp(), 'nope.json')], /scope/);
  });
  it('a scope file that is not JSON', () => {
    expectUsageError(['--dist', goodDist(), '--scope', file('not json')], /scope/);
  });
  it('a scope file that is not an array of strings', () => {
    expectUsageError(['--dist', goodDist(), '--scope', file('{"a":1}')], /scope/);
  });
  it('a scope entry that is not a manifest path', () => {
    expectUsageError(['--dist', goodDist(), '--scope', file('["/", "/nowhere/"]')], /\/nowhere\//);
  });
  it('a missing known-defects file', () => {
    expectUsageError(['--dist', goodDist(), '--known', path.join(tmp(), 'nope.json')], /known/);
  });
  it('a known-defects file with a malformed entry', () => {
    expectUsageError(['--dist', goodDist(), '--known', file('[{"rule":"x"}]')], /known/);
  });
  it('an unknown argument', () => {
    expectUsageError(['--dist', goodDist(), '--bogus'], /--bogus/);
  });
  it('--old-pages without a scope file', () => {
    expectUsageError(['--dist', goodDist(), '--old-pages'], /--old-pages needs --scope/);
  });
  it('--old-pages with --scope built', () => {
    expectUsageError(['--dist', goodDist(), '--scope', 'built', '--old-pages'], /--old-pages needs --scope/);
  });
});

describe('seo-check CLI', () => {
  it('exits 0, prints nothing and records pass for every page of a good dist', () => {
    const dist = tmp();
    writeGoodDist(dist);
    const r = run(['--dist', dist]);
    expect(r).toMatchObject({ status: 0, stdout: '' });
    expect(r.registry.pages['/en/'].seo).toEqual({ status: 'pass' });
  });

  it('prints "rule path detail", exits 1 and records fail for the page', () => {
    const dist = tmp();
    writeGoodDist(dist);
    fs.rmSync(path.join(dist, 'CNAME'));
    fs.rmSync(path.join(dist, 'en/privacy'), { recursive: true });
    const r = run(['--dist', dist]);
    expect(r.status).toBe(1);
    expect(r.stdout).toMatch(/^manifest-page-missing \/en\/privacy\/ .+$/m);
    expect(r.stdout).toMatch(/^required-files \/CNAME .+$/m);
    expect(r.registry.pages['/en/privacy/'].seo).toEqual({ status: 'fail', detail: 'manifest-page-missing' });
  });

  it('--scope built does not report manifest pages that are not built', () => {
    const dist = tmp();
    writeGoodDist(dist);
    fs.rmSync(path.join(dist, 'en/privacy'), { recursive: true });
    expect(run(['--dist', dist, '--scope', 'built']).status).toBe(0);
  });

  it('--scope <file.json> reports a listed path that is not built', () => {
    const dist = tmp();
    writeGoodDist(dist);
    fs.rmSync(path.join(dist, 'en/privacy'), { recursive: true });
    const scopeFile = path.join(tmp(), 'scope.json');
    fs.writeFileSync(scopeFile, JSON.stringify(['/', '/en/privacy/']));
    expect(run(['--dist', dist, '--scope', scopeFile]).stdout).toContain('manifest-page-missing /en/privacy/');
  });

  it('--known marks a finding on an old page and does not fail the run', () => {
    const dist = tmp();
    writeGoodDist(dist);
    fs.mkdirSync(path.join(dist, 'old-page'));
    fs.writeFileSync(path.join(dist, 'old-page/index.html'), '<html></html>');
    const knownFile = path.join(tmp(), 'known.json');
    fs.writeFileSync(knownFile, JSON.stringify([{ rule: 'page-not-in-manifest', path: '/old-page/', note: 'old' }]));
    const r = run(['--dist', dist, '--scope', 'built', '--known', knownFile]);
    expect(r.stdout).toMatch(/^page-not-in-manifest \/old-page\/ .+ \[known\]$/m);
    expect(r.status).toBe(0);
    expect(r.registry.pages['/old-page/'].seo).toEqual({ status: 'accepted', detail: 'page-not-in-manifest' });
  });

  it('--production fails on a preview artifact', () => {
    const dist = tmp();
    writeGoodDist(dist);
    fs.mkdirSync(path.join(dist, 'functions'));
    expect(run(['--dist', dist]).status).toBe(0);
    expect(run(['--dist', dist, '--production']).stdout).toContain('preview-artifact /functions/');
  });
});

describe('seo-check --old-pages', () => {
  // The pages of the new build in a release; every other built page is an old one.
  const scopeFile = () => {
    const f = path.join(tmp(), 'scope.json');
    fs.writeFileSync(f, JSON.stringify(['/', '/en/privacy/']));
    return f;
  };
  const dist = (mutate: (dir: string) => void = () => {}) => {
    const dir = tmp();
    writeGoodDist(dir);
    mutate(dir);
    return dir;
  };
  const edit = (dir: string, rel: string, change: (text: string) => string) => {
    const before = fs.readFileSync(path.join(dir, rel), 'utf8');
    const after = change(before);
    if (after === before) throw new Error(`mutation did not change ${rel}`);
    fs.writeFileSync(path.join(dir, rel), after);
  };
  const noCanonical = (t: string) => t.replace(/<link rel="canonical"[^>]*>/, '');
  const oldPage = 'en/birthday-gift-prague/index.html';
  const lines = (stdout: string) => stdout.trim().split(/\r?\n/);
  const summary = (findings: number, pages: number) =>
    `seo-check: reported for information, not failing the run: findings ${findings}, old pages ${pages}`;
  // A finding line that carries no mark.
  const failing = (start: string) => expect.stringMatching(new RegExp(`^${start} .+(?<!\\])$`));

  it('reports a finding of an old page for information and exits 0; without the flag it fails', () => {
    const args = ['--dist', dist((d) => edit(d, oldPage, noCanonical)), '--scope', scopeFile()];

    const informed = run([...args, '--old-pages']);
    expect(lines(informed.stdout)).toEqual([
      expect.stringMatching(/^single-canonical \/en\/birthday-gift-prague\/ .+ \[old page\]$/),
      summary(1, 1),
    ]);
    expect(informed.status).toBe(0);

    const strict = run(args);
    expect(lines(strict.stdout)).toEqual([failing('single-canonical /en/birthday-gift-prague/')]);
    expect(strict.status).toBe(1);
  });

  it('counts the findings and the old pages in the summary, the last line', () => {
    const dir = dist((d) => {
      edit(d, oldPage, (t) => noCanonical(t).replace(/<h1>.*?<\/h1>/, ''));
      edit(d, 'en/index.html', noCanonical);
    });
    const r = run(['--dist', dir, '--scope', scopeFile(), '--old-pages']);
    expect(lines(r.stdout)).toHaveLength(4);
    expect(lines(r.stdout).at(-1)).toBe(summary(3, 2));
    expect(r.status).toBe(0);
  });

  it('prints the summary alone and exits 0 when nothing is found', () => {
    const r = run(['--dist', dist(), '--scope', scopeFile(), '--old-pages']);
    expect(r).toMatchObject({ status: 0, stdout: `${summary(0, 0)}\n` });
  });

  it('still fails on a finding of a scope page', () => {
    const dir = dist((d) => {
      edit(d, 'en/privacy/index.html', noCanonical);
      edit(d, oldPage, noCanonical);
    });
    const r = run(['--dist', dir, '--scope', scopeFile(), '--old-pages']);
    expect(lines(r.stdout)).toContainEqual(failing('single-canonical /en/privacy/'));
    expect(lines(r.stdout).at(-1)).toBe(summary(1, 1));
    expect(r.status).toBe(1);
  });

  it('still fails on a site-wide finding, also when it names an old page', () => {
    const noCname = dist((d) => fs.rmSync(path.join(d, 'CNAME')));
    const first = run(['--dist', noCname, '--scope', scopeFile(), '--old-pages']);
    expect(lines(first.stdout)).toEqual([failing('required-files /CNAME'), summary(0, 0)]);
    expect(first.status).toBe(1);

    const hotelUrl = /<url><loc>https:\/\/www\.nius\.cz\/en\/iv-drip-hotel-prague\/<\/loc>.*?<\/url>\n?/s;
    const noSitemapEntry = dist((d) => edit(d, 'sitemap.xml', (t) => t.replace(hotelUrl, '')));
    const second = run(['--dist', noSitemapEntry, '--scope', scopeFile(), '--old-pages']);
    expect(lines(second.stdout)).toEqual([failing('sitemap-missing-page /en/iv-drip-hotel-prague/'), summary(0, 0)]);
    expect(second.status).toBe(1);
  });

  it('reports a redirect address and the 404 page outside the scope for information', () => {
    const dir = dist((d) => {
      edit(d, 'iv-drips-prague/index.html', (t) => t.replace('<title>', '<meta name="robots" content="noindex"><title>'));
      edit(d, '404.html', (t) => t.replace('noindex', 'index'));
    });
    const args = ['--dist', dir, '--scope', scopeFile()];
    const r = run([...args, '--old-pages']);
    expect(r.stdout).toMatch(/^redirect-noindex \/iv-drips-prague\/ .+ \[old page\]$/m);
    expect(r.stdout).toMatch(/^missing-noindex \/404\.html .+ \[old page\]$/m);
    expect(lines(r.stdout).at(-1)).toBe(summary(2, 2));
    expect(r.status).toBe(0);
    expect(run(args).status).toBe(1);
  });

  it('keeps --known working: a listed finding is marked known, not old', () => {
    const knownFile = path.join(tmp(), 'known.json');
    fs.writeFileSync(knownFile, JSON.stringify([{ rule: 'single-canonical', path: '/en/birthday-gift-prague/', note: 'old' }]));
    const dir = dist((d) => edit(d, oldPage, noCanonical));
    const r = run(['--dist', dir, '--scope', scopeFile(), '--known', knownFile, '--old-pages']);
    expect(lines(r.stdout)).toEqual([
      expect.stringMatching(/^single-canonical \/en\/birthday-gift-prague\/ .+ \[known\]$/),
      summary(0, 0),
    ]);
    expect(r.status).toBe(0);
  });

  it('does not write the registry: an existing file keeps its bytes and none is created', () => {
    const dir = dist((d) => {
      edit(d, oldPage, noCanonical);
      edit(d, 'en/privacy/index.html', noCanonical);
    });
    const args = ['--dist', dir, '--scope', scopeFile()];
    expect(run([...args, '--old-pages'])).toMatchObject({ status: 1, registry: null });

    const checksDir = tmp();
    const registryFile = path.join(checksDir, 'registry.json');
    const before = '{"generatedAt":"earlier","pages":{"/en/":{"seo":{"status":"pass"},"content":{"status":"pass"}}}}\n';
    fs.writeFileSync(registryFile, before);
    expect(run([...args, '--old-pages'], checksDir).status).toBe(1);
    expect(fs.readFileSync(registryFile, 'utf8')).toBe(before);
    // The same run without the flag rewrites the seo column.
    const strict = run(args, checksDir);
    expect(strict.registry.pages['/en/privacy/'].seo.status).toBe('fail');
    expect(strict.registry.pages['/en/birthday-gift-prague/'].seo.status).toBe('fail');
  });
});
