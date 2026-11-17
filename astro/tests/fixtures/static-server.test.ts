// @vitest-environment node
import fs from 'node:fs';
import net from 'node:net';
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

// Whether a TCP connection to the port opens at this address. A listening local port answers
// within milliseconds; Windows takes about two seconds to report a refusal, hence the timeout.
const accepts = (host: string, port: number) =>
  new Promise<boolean>((resolve) => {
    const socket = net.connect({ host, port, timeout: 1000 });
    const done = (open: boolean) => {
      socket.destroy();
      resolve(open);
    };
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    socket.once('timeout', () => done(false));
  });

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

  // A test server is for this machine only: nothing on the network may read a build from it.
  it('listens on 127.0.0.1 only and still answers at its localhost url', async () => {
    const port = 18_084;
    const server = await startStaticServer({ dir, port });
    try {
      expect(server.url).toBe(`http://localhost:${port}`);
      expect((await get(server, '/a/')).body).toBe('page a');
      expect(await accepts('127.0.0.1', port)).toBe(true);
      const otherInterfaces = Object.values(os.networkInterfaces())
        .flatMap((addresses) => addresses ?? [])
        .filter((address) => !address.internal && address.family === 'IPv4')
        .map((address) => address.address);
      const closed = ['::1', ...otherInterfaces];
      const open = await Promise.all(closed.map((host) => accepts(host, port)));
      expect(closed.filter((_, i) => open[i])).toEqual([]);
    } finally {
      await server.close();
    }
  });
});
