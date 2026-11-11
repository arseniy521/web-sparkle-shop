import { defineConfig, devices } from '@playwright/test';

// The old site is served from the reference build (.baseline/dist, npm run baseline) on 8081,
// the new site from a separate test build (.checks/dist-test) on 8080; see tests/visual/global-setup.ts.
export default defineConfig({
  testMatch: '**/*.spec.ts',
  globalSetup: './tests/visual/global-setup.ts',
  projects: [{ name: 'visual', testDir: 'tests/visual', use: { ...devices['Desktop Chrome'] } }],
});
