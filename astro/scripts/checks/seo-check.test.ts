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
  return { status: result.status, stdout: result.stdout, registry };
}

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
  });

  it('--production fails on a preview artifact', () => {
    const dist = tmp();
    writeGoodDist(dist);
    fs.mkdirSync(path.join(dist, 'functions'));
    expect(run(['--dist', dist]).status).toBe(0);
    expect(run(['--dist', dist, '--production']).stdout).toContain('preview-artifact /functions/');
  });
});
