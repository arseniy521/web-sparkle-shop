import { defineConfig, devices } from '@playwright/test';
import { E2E_ORIGIN, MERGED_ORIGIN } from './tests/fixtures/servers.ts';

// Global setup is not per project, so each project's setup runs only when the command line
// selects that project (or selects none). The visual and merged projects need the reference
// build (.baseline/dist), the e2e project does not.
function selectedProjects(): string[] {
  const names: string[] = [];
  process.argv.forEach((arg, i) => {
    if (arg.startsWith('--project=')) names.push(arg.slice('--project='.length));
    else if (arg === '--project' && process.argv[i + 1]) names.push(process.argv[i + 1]);
  });
  return names;
}
const selected = selectedProjects();
const runs = (project: string) => selected.length === 0 || selected.includes(project);

// visual: the old site from the reference build (.baseline/dist, npm run baseline) on OLD_PORT,
// the new site from a separate test build (.checks/dist-test) on NEW_PORT; see tests/visual/global-setup.ts.
// e2e: the new site from its own test build (.checks/dist-e2e) on E2E_PORT; see tests/e2e/global-setup.ts.
// merged: the release merge of the reference build and a build of the new site (.checks/release-dist)
// on MERGED_PORT; see tests/e2e/merged-global-setup.ts.
// The ports are shifted by NIUS_PORT_OFFSET, see tests/fixtures/servers.ts.
export default defineConfig({
  testMatch: '**/*.spec.ts',
  // The visual specs write .checks/registry.json; one worker keeps its read-modify-write safe.
  workers: 1,
  globalSetup: [
    ...(runs('visual') ? ['./tests/visual/global-setup.ts'] : []),
    ...(runs('e2e') ? ['./tests/e2e/global-setup.ts'] : []),
    ...(runs('merged') ? ['./tests/e2e/merged-global-setup.ts'] : []),
  ],
  reporter: [[process.env.CI ? 'dot' : 'list'], ['./tests/e2e/registry-reporter.ts']],
  projects: [
    { name: 'visual', testDir: 'tests/visual', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'e2e',
      testDir: 'tests/e2e',
      testIgnore: 'merged.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: E2E_ORIGIN,
        // No host but the local server resolves, so nothing leaves the machine even where request
        // routing does not reach: requests sent while a page unloads (sendBeacon, keepalive fetch),
        // preconnects. Page routes still answer stubbed hosts; the network guard reports the rest.
        launchOptions: { args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1'] },
      },
    },
    {
      name: 'merged',
      testDir: 'tests/e2e',
      testMatch: 'merged.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: MERGED_ORIGIN,
        launchOptions: { args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1'] },
      },
    },
  ],
});
