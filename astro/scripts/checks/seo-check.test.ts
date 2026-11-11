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
