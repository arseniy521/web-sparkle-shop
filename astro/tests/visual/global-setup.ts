import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { NEW_PORT, OLD_PORT } from '../fixtures/servers.ts';
import { startStaticServer } from '../fixtures/static-server.ts';
import { writeReport } from './compare.ts';

export const OLD_DIST = '.baseline/dist';
// The test build calls the stubbed relative API, so it lives apart from the publishable dist/.
export const TEST_DIST = '.checks/dist-test';
export const VISUAL_DIR = '.checks/visual';

export default async function globalSetup() {
  if (!fs.existsSync(OLD_DIST)) {
    throw new Error(`${OLD_DIST} is missing: run npm run baseline first.`);
  }
  fs.rmSync(VISUAL_DIR, { recursive: true, force: true });
  execSync(`node scripts/sync-public.mjs && npx astro build --outDir ${TEST_DIST}`, {
    stdio: 'inherit',
    env: { ...process.env, VITE_API_URL: '/api' },
  });
  const servers = await Promise.all([
    startStaticServer({ dir: OLD_DIST, port: OLD_PORT, spaFallback: true }),
    startStaticServer({ dir: TEST_DIST, port: NEW_PORT, notFoundFile: '404.html' }),
  ]);
  return async () => {
    await Promise.all(servers.map((s) => s.close()));
    writeReport(VISUAL_DIR);
  };
}
