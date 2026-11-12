import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

const scriptPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../scripts/check-release-env.mjs');
// An empty working directory: the script must see only the variables given here, no .env file.
const emptyDir = mkdtempSync(join(tmpdir(), 'nius-release-env-'));

const REQUIRED = {
  VITE_AMPLITUDE_API_KEY: 'fake-amplitude-key',
  VITE_GOOGLE_CLIENT_ID: 'fake-client-id.apps.googleusercontent.com',
  VITE_MAPY_API_KEY: 'fake-mapy-key',
};

function runCheck(vars: Record<string, string>) {
  const inherited = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith('VITE_') && name !== 'GITHUB_ACTIONS'),
  );
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: emptyDir,
    env: { ...inherited, ...vars },
    encoding: 'utf8',
  });
  return { status: result.status, output: `${result.stdout}\n${result.stderr}` };
}

describe('scripts/check-release-env.mjs', { timeout: 30_000 }, () => {
  afterAll(() => {
    rmSync(emptyDir, { recursive: true, force: true });
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
  });

  it('passes with a warning naming both variables when Google Ads is not configured', () => {
    const { status, output } = runCheck(REQUIRED);

    expect(status).toBe(0);
    expect(output).toMatch(/warning/i);
    expect(output).toContain('VITE_GOOGLE_ADS_ID');
    expect(output).toContain('VITE_GOOGLE_ADS_LEAD_LABEL');
    expect(output).toContain('Release env check passed');
  });

  it.each([
    { set: 'VITE_GOOGLE_ADS_ID', value: 'AW-0000000000', empty: 'VITE_GOOGLE_ADS_LEAD_LABEL' },
    { set: 'VITE_GOOGLE_ADS_LEAD_LABEL', value: 'fakeLeadLabel', empty: 'VITE_GOOGLE_ADS_ID' },
  ])('passes with a warning when only $set is set', ({ set, value, empty }) => {
    const { status, output } = runCheck({ ...REQUIRED, [set]: value, [empty]: '  ' });

    expect(status).toBe(0);
    expect(output).toMatch(new RegExp(`warning: ${empty} is empty`, 'i'));
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
