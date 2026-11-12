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

const googleAdsId = (
  process.env.VITE_GOOGLE_ADS_ID || env.VITE_GOOGLE_ADS_ID || ''
).trim();
const googleAdsLeadLabel = (
  process.env.VITE_GOOGLE_ADS_LEAD_LABEL || env.VITE_GOOGLE_ADS_LEAD_LABEL || ''
).trim();

// Google Ads is optional: the site must build without it, but a release that silently
// measures no conversions should be visible.
const emptyAdsVariables = [
  ...(googleAdsId ? [] : ['VITE_GOOGLE_ADS_ID']),
  ...(googleAdsLeadLabel ? [] : ['VITE_GOOGLE_ADS_LEAD_LABEL']),
];

if (emptyAdsVariables.length > 0) {
  const message =
    `${emptyAdsVariables.join(' and ')} ${emptyAdsVariables.length > 1 ? 'are' : 'is'} empty. ` +
    'The site will be built without the Google Ads conversion: both values are needed to measure orders from ads.';
  console.warn(`Release warning: ${message}`);
  if (process.env.GITHUB_ACTIONS === 'true') {
    console.log(`::warning title=Google Ads conversion is off::${message}`);
  }
}

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
