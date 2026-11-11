import fs from 'node:fs';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { record } from './registry.ts';
import type { Status } from './registry.ts';

export interface AssertionResult {
  url: string;
  auditId?: string;
  level?: string;
  passed: boolean;
}

// A page fails when an error-level assertion failed for it, or when LHCI failed and left
// no results for it (the run itself broke).
export function mapResults(
  pages: string[],
  results: AssertionResult[],
  lhciExitCode: number,
): Record<string, { status: Status; detail?: string }> {
  const mapped: Record<string, { status: Status; detail?: string }> = {};
  for (const page of pages) {
    const own = results.filter((r) => new URL(r.url).pathname === page);
    const failed = own.filter((r) => !r.passed && (r.level ?? 'error') === 'error');
    if (failed.length > 0) {
      mapped[page] = { status: 'fail', detail: failed.map((r) => r.auditId ?? 'unknown').join(', ') };
    } else if (own.length === 0 && lhciExitCode !== 0) {
      mapped[page] = { status: 'fail', detail: 'no assertion results' };
    } else {
      mapped[page] = { status: 'pass' };
    }
  }
  return mapped;
}

if (import.meta.main) {
  const require = createRequire(import.meta.url);
  const lhci = require.resolve('@lhci/cli/src/cli.js');
  const pages: string[] = require('../../lighthouserc.cjs').ci.collect.url;
  fs.rmSync('.lighthouseci', { recursive: true, force: true });

  const { status } = spawnSync(process.execPath, [lhci, 'autorun'], { stdio: 'inherit' });
  const exitCode = status ?? 1;

  const file = '.lighthouseci/assertion-results.json';
  const results: AssertionResult[] = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  for (const [page, { status: result, detail }] of Object.entries(mapResults(pages, results, exitCode))) {
    record('lighthouse', page, result, detail);
  }
  process.exit(exitCode);
}
