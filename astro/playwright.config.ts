import { defineConfig, devices } from '@playwright/test';

// Global setup is not per project, so each project's setup runs only when the command line
// selects that project (or selects none). The visual project needs the reference build
// (.baseline/dist), the e2e project does not.
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

// visual: the old site from the reference build (.baseline/dist, npm run baseline) on 8081,
// the new site from a separate test build (.checks/dist-test) on 8080; see tests/visual/global-setup.ts.
// e2e: the new site from its own test build (.checks/dist-e2e) on 8090; see tests/e2e/global-setup.ts.
export default defineConfig({
  testMatch: '**/*.spec.ts',
  // The visual specs write .checks/registry.json; one worker keeps its read-modify-write safe.
  workers: 1,
  globalSetup: [
    ...(runs('visual') ? ['./tests/visual/global-setup.ts'] : []),
    ...(runs('e2e') ? ['./tests/e2e/global-setup.ts'] : []),
  ],
  reporter: [[process.env.CI ? 'dot' : 'list'], ['./tests/e2e/registry-reporter.ts']],
  projects: [
    { name: 'visual', testDir: 'tests/visual', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'e2e',
      testDir: 'tests/e2e',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:8090' },
    },
  ],
});
