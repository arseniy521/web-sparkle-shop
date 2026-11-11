import { defineConfig, devices } from '@playwright/test';

// The old site is served from the reference build (.baseline/dist, npm run baseline) on 8081,
// the new site from a separate test build (.checks/dist-test) on 8080; see tests/visual/global-setup.ts.
export default defineConfig({
  testMatch: '**/*.spec.ts',
  // Both specs write .checks/registry.json; one worker keeps its read-modify-write safe.
  workers: 1,
  globalSetup: './tests/visual/global-setup.ts',
  projects: [{ name: 'visual', testDir: 'tests/visual', use: { ...devices['Desktop Chrome'] } }],
});
