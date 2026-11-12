import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { mergeDist, referenceOnlyAddresses } from '../../scripts/release/merge-dist.ts';
import wave1 from '../../checks/wave1-paths.json' with { type: 'json' };
import { MERGED_PORT } from '../fixtures/servers.ts';
import { startStaticServer } from '../fixtures/static-server.ts';

export const OLD_DIST = '.baseline/dist';
// The new site built with the environment of the e2e build, in its own folder, never dist/.
const NEW_DIST = '.checks/dist-merged';
export const MERGED_DIST = '.checks/release-dist';

export default async function globalSetup() {
  if (!fs.existsSync(OLD_DIST)) {
    throw new Error(`${OLD_DIST} is missing: run npm run baseline first.`);
  }
  execSync(`node scripts/sync-public.mjs && npx astro build --outDir ${NEW_DIST}`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_API_URL: '/api',
      VITE_AMPLITUDE_API_KEY: 'test-amplitude-key',
      VITE_GOOGLE_CLIENT_ID: 'test-google-client-id',
      VITE_MAPY_API_KEY: 'test-mapy-key',
    },
  });
  // What finalize-dist adds to dist/ after a release build.
  fs.writeFileSync(path.join(NEW_DIST, 'CNAME'), 'www.nius.cz\n');
  fs.writeFileSync(path.join(NEW_DIST, '.nojekyll'), '');
  mergeDist({
    oldDist: OLD_DIST,
    newDist: NEW_DIST,
    paths: wave1,
    outDir: MERGED_DIST,
    skipOld: referenceOnlyAddresses(OLD_DIST),
  });

  // GitHub Pages has no fallback to index.html: an address without a file gets 404.html with
  // status 404, which is why the old SPA's unrendered routes answer 404 in production today.
  const server = await startStaticServer({ dir: MERGED_DIST, port: MERGED_PORT, notFoundFile: '404.html' });
  return () => server.close();
}
