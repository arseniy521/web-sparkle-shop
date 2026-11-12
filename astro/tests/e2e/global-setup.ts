import { execSync } from 'node:child_process';
import { E2E_PORT } from '../fixtures/servers.ts';
import { startStaticServer } from '../fixtures/static-server.ts';

// Apart from dist/ and from the visual build: this build calls the stubbed relative API and
// carries fake keys that switch on the Amplitude and Google sign-in code paths.
export const E2E_DIST = '.checks/dist-e2e';

export default async function globalSetup() {
  execSync(`node scripts/sync-public.mjs && npx astro build --outDir ${E2E_DIST}`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_API_URL: '/api',
      VITE_AMPLITUDE_API_KEY: 'test-amplitude-key',
      VITE_GOOGLE_CLIENT_ID: 'test-google-client-id',
      VITE_MAPY_API_KEY: 'test-mapy-key',
    },
  });
  const server = await startStaticServer({ dir: E2E_DIST, port: E2E_PORT, notFoundFile: '404.html' });
  return () => server.close();
}
