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

function run(args: string[]) {
  const result = spawnSync(process.execPath, ['scripts/checks/seo-check.ts', ...args], { encoding: 'utf8' });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
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
  it('an unknown argument', () => {
    expectUsageError(['--dist', goodDist(), '--bogus'], /--bogus/);
  });
  it('a scope other than built', () => {
    expectUsageError(['--dist', goodDist(), '--scope', 'pages.json'], /--scope/);
  });
});

describe('seo-check CLI', () => {
  it('exits 0 and prints nothing for a good dist', () => {
    const dist = tmp();
    writeGoodDist(dist);
    const r = run(['--dist', dist]);
    expect(r).toMatchObject({ status: 0, stdout: '' });
  });

  it('prints "rule path detail" and exits 1', () => {
    const dist = tmp();
    writeGoodDist(dist);
    fs.rmSync(path.join(dist, 'CNAME'));
    fs.rmSync(path.join(dist, 'en/privacy'), { recursive: true });
    const r = run(['--dist', dist]);
    expect(r.status).toBe(1);
    expect(r.stdout).toMatch(/^manifest-page-missing \/en\/privacy\/ .+$/m);
    expect(r.stdout).toMatch(/^required-files \/CNAME .+$/m);
  });

  it('--scope built does not report manifest pages that are not built', () => {
    const dist = tmp();
    writeGoodDist(dist);
    fs.rmSync(path.join(dist, 'en/privacy'), { recursive: true });
    expect(run(['--dist', dist, '--scope', 'built']).status).toBe(0);
  });

  it('fails on a built page outside the manifest', () => {
    const dist = tmp();
    writeGoodDist(dist);
    fs.mkdirSync(path.join(dist, 'stray-page'));
    fs.writeFileSync(path.join(dist, 'stray-page/index.html'), '<html></html>');
    const r = run(['--dist', dist, '--scope', 'built']);
    expect(r.stdout).toMatch(/^page-not-in-manifest \/stray-page\/ .+$/m);
    expect(r.status).toBe(1);
  });

  it('--production fails on a build closed to crawlers', () => {
    const dist = tmp();
    writeGoodDist(dist);
    fs.writeFileSync(path.join(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
    expect(run(['--dist', dist, '--production']).stdout).toContain('production-build /robots.txt');
  });
});
