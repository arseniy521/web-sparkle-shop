import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

const scriptPath = resolve(dirname(fileURLToPath(import.meta.url)), 'check-env.mjs');
// The script reads the .env files of '..': run it in an empty folder inside an empty folder, so
// that it sees only the variables given here.
const emptyRoot = mkdtempSync(join(tmpdir(), 'nius-check-env-'));
const workDir = join(emptyRoot, 'astro');
mkdirSync(workDir);

const REQUIRED = {
  VITE_AMPLITUDE_API_KEY: 'fake-amplitude-key',
  VITE_GOOGLE_CLIENT_ID: 'fake-client-id.apps.googleusercontent.com',
  VITE_MAPY_API_KEY: 'fake-mapy-key',
};

function runCheck(vars: Record<string, string>, githubActions = false) {
  const inherited = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith('VITE_') && name !== 'GITHUB_ACTIONS'),
  );
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: workDir,
    env: { ...inherited, ...vars, ...(githubActions ? { GITHUB_ACTIONS: 'true' } : {}) },
    encoding: 'utf8',
  });
  return { status: result.status, output: `${result.stdout}\n${result.stderr}` };
}

describe('scripts/check-env.mjs', { timeout: 30_000 }, () => {
  afterAll(() => {
    rmSync(emptyRoot, { recursive: true, force: true });
  });

  it('passes without a warning when both Google Ads values are set', () => {
    const { status, output } = runCheck({
      ...REQUIRED,
      VITE_GOOGLE_ADS_ID: 'AW-0000000000',
      VITE_GOOGLE_ADS_LEAD_LABEL: 'fakeLeadLabel',
    });

    expect(status).toBe(0);
    expect(output).not.toMatch(/warning/i);
    expect(output).not.toContain('VITE_GOOGLE_ADS');
    expect(output).toContain('Release env check passed');
  });

  it('passes with a warning naming both variables when Google Ads is not configured', () => {
    const { status, output } = runCheck(REQUIRED);

    expect(status).toBe(0);
    expect(output).toContain(
      'Release warning: VITE_GOOGLE_ADS_ID and VITE_GOOGLE_ADS_LEAD_LABEL are empty. ' +
        'The site will be built without the Google Ads conversion',
    );
    expect(output).not.toContain('::warning');
    expect(output).toContain('Release env check passed');
  });

  it.each([
    { set: 'VITE_GOOGLE_ADS_ID', value: 'AW-0000000000', empty: 'VITE_GOOGLE_ADS_LEAD_LABEL' },
    { set: 'VITE_GOOGLE_ADS_LEAD_LABEL', value: 'fakeLeadLabel', empty: 'VITE_GOOGLE_ADS_ID' },
  ])('passes with a warning when only $set is set', ({ set, value, empty }) => {
    const { status, output } = runCheck({ ...REQUIRED, [set]: value, [empty]: '  ' });

    expect(status).toBe(0);
    expect(output).toContain(`Release warning: ${empty} is empty.`);
  });

  it('writes a GitHub Actions warning annotation in a workflow', () => {
    const { status, output } = runCheck(REQUIRED, true);

    expect(status).toBe(0);
    expect(output).toContain('::warning title=Google Ads conversion is off::VITE_GOOGLE_ADS_ID and VITE_GOOGLE_ADS_LEAD_LABEL are empty.');
  });

  it('still blocks the release when a required value is missing', () => {
    const { status, output } = runCheck({
      VITE_GOOGLE_ADS_ID: 'AW-0000000000',
      VITE_GOOGLE_ADS_LEAD_LABEL: 'fakeLeadLabel',
    });

    expect(status).toBe(1);
    expect(output).toContain('Release blocked');
  });
});
