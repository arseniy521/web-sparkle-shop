// @vitest-environment node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startStaticServer } from '../../tests/fixtures/static-server.ts';
import type { StaticServer } from '../../tests/fixtures/static-server.ts';
import { defaultPaths, diffSnapshots, snapshot } from './snapshot-live.mjs';

const SCRIPT = path.join(import.meta.dirname, 'snapshot-live.mjs');

const freePort = () =>
  new Promise<number>((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(0, () => {
      const { port } = probe.address() as net.AddressInfo;
      probe.close(() => resolve(port));
    });
  });

describe('snapshot-live', () => {
  let dir: string;
  let server: StaticServer;

  beforeEach(async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapshot-'));
    fs.mkdirSync(path.join(dir, 'blog'));
    fs.writeFileSync(path.join(dir, 'index.html'), '<h1>home</h1>');
    fs.writeFileSync(path.join(dir, 'blog', 'index.html'), '<h1>blog</h1>');
    server = await startStaticServer({ dir, port: await freePort() });
  });

  afterEach(async () => {
    await server.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('gives equal snapshots for the same folder and names a changed address', async () => {
    const paths = ['/', '/blog/'];
    const before = await snapshot(server.url, paths);
    expect(await snapshot(server.url, paths)).toEqual(before);
    expect(diffSnapshots(before, before)).toEqual([]);

    fs.writeFileSync(path.join(dir, 'blog', 'index.html'), '<h1>changed</h1>');
    expect(diffSnapshots(before, await snapshot(server.url, paths))).toEqual(['/blog/']);
  });

  it('records a missing address with its 404 status and still compares it', async () => {
    const before = await snapshot(server.url, ['/', '/missing/']);
    expect(before['/missing/']).toMatchObject({ status: 404 });
    fs.mkdirSync(path.join(dir, 'missing'));
    fs.writeFileSync(path.join(dir, 'missing', 'index.html'), 'now here');
    expect(diffSnapshots(before, await snapshot(server.url, ['/', '/missing/']))).toEqual(['/missing/']);
  });

  it('records a network error without aborting the run', async () => {
    const closed = await freePort();
    const result = await snapshot(`http://localhost:${closed}`, ['/', '/blog/']);
    expect(Object.keys(result)).toEqual(['/', '/blog/']);
    expect(result['/']).toHaveProperty('error');
  });

  it('builds the default list from the manifest', () => {
    const paths = defaultPaths();
    expect(paths).toEqual(
      expect.arrayContaining(['/', '/robots.txt', '/sitemap.xml', '/nonexistent-page/', '/blog']),
    );
    expect(new Set(paths).size).toBe(paths.length);
  });

  describe('--compare', () => {
    const run = (...args: string[]) =>
      spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });

    it('exits 0 for equal files and 1 with one line per differing address', () => {
      const a = path.join(dir, 'a.json');
      const b = path.join(dir, 'b.json');
      const entry = { status: 200, sha256: 'x' };
      fs.writeFileSync(a, JSON.stringify({ '/': entry, '/blog/': entry }));
      fs.writeFileSync(b, JSON.stringify({ '/': entry, '/blog/': { status: 200, sha256: 'y' } }));
      expect(run('--compare', a, a).status).toBe(0);
      const different = run('--compare', a, b);
      expect(different.status).toBe(1);
      expect(different.stdout.trim().split('\n')).toHaveLength(1);
      expect(different.stdout).toContain('/blog/');
    });

    it('exits 2 on wrong usage', () => {
      expect(run().status).toBe(2);
      expect(run('--compare', 'only-one').status).toBe(2);
      expect(run('--compare', path.join(dir, 'no.json'), path.join(dir, 'no.json')).status).toBe(2);
    });
  });
});
