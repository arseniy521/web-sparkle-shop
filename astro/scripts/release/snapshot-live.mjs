// Records what a site serves (status, redirect target and a hash of the body for every
// address) so that two snapshots taken before and after a publication or a rollback can be compared.
//   node scripts/release/snapshot-live.mjs --origin https://www.nius.cz --out before.json
//   node scripts/release/snapshot-live.mjs --compare before.json after.json
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { URL, pathToFileURL } from 'node:url';
import { redirects } from '../../src/routes/manifest.ts';
import { allPageEntries } from '../../src/routes/urls.ts';

const USER_AGENT = 'nius-snapshot';
const CONCURRENCY = 4;
// Real pages whose addresses are also requested without the trailing slash.
const WITHOUT_SLASH = ['/blog/', '/ivf-support-prague/', '/privacy/'];

// Every page and redirect address of the manifest, the two service files, an address that
// must not exist, and three page addresses without the trailing slash.
export function defaultPaths() {
  return [
    ...new Set([
      ...allPageEntries().map((entry) => entry.path),
      ...redirects.map((redirect) => redirect.from),
      '/robots.txt',
      '/sitemap.xml',
      '/nonexistent-page/',
      ...WITHOUT_SLASH.map((path) => path.slice(0, -1)),
    ]),
  ];
}

async function fetchEntry(origin, path) {
  try {
    const response = await globalThis.fetch(new URL(path, origin), {
      redirect: 'manual',
      headers: { 'user-agent': USER_AGENT },
    });
    const body = Buffer.from(await response.arrayBuffer());
    const entry = { status: response.status, sha256: crypto.createHash('sha256').update(body).digest('hex') };
    const location = response.headers.get('location');
    if (location !== null) entry.location = location;
    return entry;
  } catch (error) {
    return { error: String(error?.cause?.code ?? error?.name ?? 'network error') };
  }
}

export async function snapshot(origin, paths) {
  const result = {};
  let next = 0;
  const worker = async () => {
    while (next < paths.length) {
      const path = paths[next++];
      result[path] = await fetchEntry(origin, path);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, paths.length) }, worker));
  return Object.fromEntries(paths.map((path) => [path, result[path]]));
}

// Addresses whose entries differ, including addresses present in only one snapshot.
export function diffSnapshots(a, b) {
  return [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .filter((path) => JSON.stringify(a[path]) !== JSON.stringify(b[path]))
    .sort();
}

function usageError(message) {
  console.error(`snapshot-live: ${message}`);
  process.exit(2);
}

function readSnapshot(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return usageError(`cannot read ${file}: ${error.message.split('\n')[0]}`);
  }
}

async function main(argv) {
  if (argv[0] === '--compare' && argv.length === 3) {
    const [a, b] = [readSnapshot(argv[1]), readSnapshot(argv[2])];
    const differing = diffSnapshots(a, b);
    for (const path of differing) {
      console.log(`${path}: ${JSON.stringify(a[path] ?? null)} -> ${JSON.stringify(b[path] ?? null)}`);
    }
    process.exit(differing.length > 0 ? 1 : 0);
  }
  if (argv.length === 4 && argv[0] === '--origin' && argv[2] === '--out') {
    const paths = defaultPaths();
    fs.writeFileSync(argv[3], `${JSON.stringify(await snapshot(argv[1], paths), null, 2)}\n`);
    console.log(`snapshot-live: ${paths.length} addresses written to ${argv[3]}`);
    return;
  }
  usageError('usage: --origin <url> --out <file> | --compare <a> <b>');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main(process.argv.slice(2));
}
