import { loadEnv } from 'vite';

const env = loadEnv('production', process.cwd(), 'VITE_');
const amplitudeApiKey = (
  process.env.VITE_AMPLITUDE_API_KEY || env.VITE_AMPLITUDE_API_KEY || ''
).trim();
const mapyApiKey = (
  process.env.VITE_MAPY_API_KEY || env.VITE_MAPY_API_KEY || ''
).trim();
const mapySuggestUrl = (
  process.env.VITE_MAPY_SUGGEST_URL || env.VITE_MAPY_SUGGEST_URL || ''
).trim();
const googleClientId = (
  process.env.VITE_GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID || ''
).trim();

const missing = [];

if (!amplitudeApiKey) {
  missing.push('VITE_AMPLITUDE_API_KEY');
}

if (!googleClientId) {
  missing.push('VITE_GOOGLE_CLIENT_ID');
}

if (!mapyApiKey && !mapySuggestUrl) {
  missing.push('VITE_MAPY_API_KEY or VITE_MAPY_SUGGEST_URL');
}

if (missing.length > 0) {
  console.error(`Release blocked: missing ${missing.join(', ')}.`);
  console.error(
    'Set the required values in the deployment environment or an untracked .env.production.local file.',
  );
  process.exit(1);
}

console.log('Release env check passed: Google, Amplitude and Mapy are configured.');
