import { defineConfig, devices } from '@playwright/test';
import { E2E_ORIGIN } from './tests/fixtures/servers.ts';

// e2e: the site from its own test build (.checks/dist-e2e) on E2E_PORT; see tests/e2e/global-setup.ts.
// The port is shifted by NIUS_PORT_OFFSET, see tests/fixtures/servers.ts.
export default defineConfig({
  testMatch: '**/*.spec.ts',
  // One worker: the scenarios share one static server and one port.
  workers: 1,
  globalSetup: ['./tests/e2e/global-setup.ts'],
  reporter: process.env.CI ? 'dot' : 'list',
  projects: [
    {
      name: 'e2e',
      testDir: 'tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: E2E_ORIGIN,
        // No host but the local server resolves, so nothing leaves the machine even where request
        // routing does not reach: requests sent while a page unloads (sendBeacon, keepalive fetch),
        // preconnects. Page routes still answer stubbed hosts; the network guard reports the rest.
        launchOptions: { args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1'] },
      },
    },
  ],
});
