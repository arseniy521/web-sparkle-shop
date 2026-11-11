import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.spec.ts',
  use: { baseURL: 'http://localhost:8080' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm --prefix .. ci && npm --prefix .. run dev -- --port 8081',
      env: { PUPPETEER_SKIP_DOWNLOAD: 'true' },
      url: 'http://localhost:8081/',
      reuseExistingServer: true,
      timeout: 600_000,
    },
    {
      command: 'npm run build && npm run preview -- --port 8080',
      env: { VITE_API_URL: '/api' },
      url: 'http://localhost:8080/prototype/',
      reuseExistingServer: true,
      timeout: 600_000,
    },
  ],
});
