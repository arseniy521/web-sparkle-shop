import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json',
};

export interface StaticServer {
  url: string;
  close(): Promise<void>;
}

// Serves dir like GitHub Pages: /a/ → a/index.html, /a → a/index.html.
// spaFallback answers unknown paths with index.html and 200 (the old React site);
// otherwise unknown paths get 404 with notFoundFile, if given.
export async function startStaticServer(options: {
  dir: string;
  port: number;
  spaFallback?: boolean;
  notFoundFile?: string;
}): Promise<StaticServer> {
  const root = path.resolve(options.dir);

  const fileFor = (urlPath: string): string | null => {
    const target = path.join(root, urlPath);
    if (target !== root && !target.startsWith(root + path.sep)) return null;
    for (const candidate of [target, path.join(target, 'index.html')]) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
    return null;
  };

  const send = (res: http.ServerResponse, status: number, file: string) => {
    res.writeHead(status, { 'content-type': TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  };

  const server = http.createServer((req, res) => {
    let urlPath: string;
    try {
      urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    const file = fileFor(urlPath);
    if (file) return send(res, 200, file);
    if (options.spaFallback) return send(res, 200, path.join(root, 'index.html'));
    if (options.notFoundFile) return send(res, 404, path.join(root, options.notFoundFile));
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(options.port, () => resolve());
  });

  return {
    url: `http://localhost:${options.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.closeAllConnections();
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}
