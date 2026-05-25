/**
 * Compares string key sets across locale JSON files (flat flatten).
 * Usage: node scripts/check-i18n-keys.mjs
 * Exits with code 1 when keys diverge.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '..', 'src', 'i18n', 'locales');

function flattenKeys(obj, prefix = '') {
  /** @type {string[]} */
  const out = [];
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return out;
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...flattenKeys(v, p));
    } else {
      out.push(p);
    }
  }
  return out;
}

const files = ['en.json', 'cs.json', 'ru.json', 'uk.json'];
const baseName = 'en.json';
const basePath = path.join(localesDir, baseName);
const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));
const baseKeys = new Set(flattenKeys(base));

let failed = false;
for (const f of files) {
  if (f === baseName) continue;
  const p = path.join(localesDir, f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const keys = new Set(flattenKeys(data));
  const missing = [...baseKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !baseKeys.has(k));
  if (missing.length) {
    failed = true;
    console.error(`\n=== ${f} vs ${baseName} ===`);
    console.error('Missing keys:', missing.slice(0, 60).join(', '), missing.length > 60 ? `… (+${missing.length - 60})` : '');
  }
  if (extra.length) {
    console.warn(`[i18n] ${f}: ${extra.length} keys extra vs ${baseName} (non-blocking for CI).`);
  }
}

if (failed) {
  console.error('\ni18n: locale key mismatch.');
  process.exit(1);
}
console.log('i18n: en/cs/ru/uk keys match (flat comparison).');
