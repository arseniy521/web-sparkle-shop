import { loadEnv } from 'vite';

const env = loadEnv('production', process.cwd(), 'VITE_');
const amplitudeApiKey = (
  process.env.VITE_AMPLITUDE_API_KEY || env.VITE_AMPLITUDE_API_KEY || ''
).trim();

if (!amplitudeApiKey) {
  console.error(
    'Release blocked: VITE_AMPLITUDE_API_KEY is missing. ' +
    'Set it in the deployment environment or an untracked .env.production.local file.',
  );
  process.exit(1);
}

console.log('Release env check passed: Amplitude is configured.');
