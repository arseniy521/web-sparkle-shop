import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(
      'test-client.apps.googleusercontent.com',
    ),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    clearMocks: true,
    // The workflows run the unit tests with the real release keys in the environment. Tests
    // must not depend on them: each key starts empty, and a test that needs one stubs it.
    env: {
      VITE_AMPLITUDE_API_KEY: '',
      VITE_MAPY_API_KEY: '',
      VITE_MAPY_SUGGEST_URL: '',
      VITE_GOOGLE_ADS_ID: '',
      VITE_GOOGLE_ADS_LEAD_LABEL: '',
      VITE_GOOGLE_ADS_CONTACT_LABEL: '',
    },
    exclude: [...configDefaults.exclude, 'tests/**/*.spec.ts'],
  },
});
