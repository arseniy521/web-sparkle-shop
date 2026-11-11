// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startStaticServer } from './static-server.ts';
import type { StaticServer } from './static-server.ts';

let dir: string;

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'static-server-'));
  fs.writeFileSync(path.join(dir, 'index.html'), 'home');
  fs.writeFileSync(path.join(dir, '404.html'), 'not found');
  fs.mkdirSync(path.join(dir, 'a'));
  fs.writeFileSync(path.join(dir, 'a', 'index.html'), 'page a');
});

afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

async function get(server: StaticServer, urlPath: string) {
  const res = await fetch(server.url + urlPath);
  return { status: res.status, type: res.headers.get('content-type'), body: await res.text() };
}

describe('startStaticServer', () => {
  it('serves directory pages with and without the trailing slash', async () => {
    const server = await startStaticServer({ dir, port: 18_081 });
    try {
      expect(await get(server, '/a/')).toEqual({ status: 200, type: 'text/html; charset=utf-8', body: 'page a' });
      expect((await get(server, '/a')).body).toBe('page a');
    } finally {
      await server.close();
    }
  });

  it('answers unknown paths with index.html and 200 in SPA mode', async () => {
    const server = await startStaticServer({ dir, port: 18_082, spaFallback: true });
    try {
      expect(await get(server, '/privacy')).toMatchObject({ status: 200, body: 'home' });
    } finally {
      await server.close();
    }
  });

  it('answers unknown paths with 404 and the not-found file otherwise', async () => {
    const server = await startStaticServer({ dir, port: 18_083, notFoundFile: '404.html' });
    try {
      expect(await get(server, '/missing/')).toMatchObject({ status: 404, body: 'not found' });
    } finally {
      await server.close();
    }
  });
});
