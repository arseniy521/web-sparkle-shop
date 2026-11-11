import type { FullConfig, Reporter, Suite, TestCase } from '@playwright/test/reporter';
import { record } from '../../scripts/checks/registry.ts';

// The pages the e2e scenarios run on; each later page task adds its page here.
const PAGES = ['/sestricka-praha-1/'];

// Options of `playwright test` that take a separate value, so that value is not a file filter.
const VALUE_OPTIONS = new Set([
  '-c', '--config', '--project', '--reporter', '-j', '--workers', '--retries', '--repeat-each',
  '--timeout', '--global-timeout', '--max-failures', '--output', '--trace', '--tsconfig', '--browser',
]);
// Options that select a part of the tests.
const NARROWING = /^(-g|--grep|--grep-invert|--last-failed|--only-changed|--test-list|--test-list-invert|--shard)(=|$)/;

/**
 * Whether the command line runs every test of the selected projects. Playwright does not show the
 * reporter its command-line filters, so they are read from process.argv: a file or line filter
 * (any positional argument), -g/--grep, --grep-invert, --last-failed, --only-changed, --test-list
 * or --shard makes the run partial. An option this list does not know is read as a filter, so
 * such a run is not recorded either. A --reporter given on the command line replaces the config's
 * reporters, so that run records nothing at all.
 */
function isCompleteRun(config: FullConfig): boolean {
  if (config.shard) return false;
  const start = process.argv.indexOf('test');
  if (start === -1) return false;
  const args = process.argv.slice(start + 1);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (NARROWING.test(arg)) return false;
    if (VALUE_OPTIONS.has(arg)) i++;
    else if (!arg.startsWith('-')) return false;
  }
  return true;
}

// Writes the e2e row of .checks/registry.json once per complete run (not for --list or a narrowed
// run): pass only if every e2e test of the run ran and passed.
export default class RegistryReporter implements Reporter {
  private tests: TestCase[] = [];
  private complete = false;

  onBegin(config: FullConfig, suite: Suite) {
    this.complete = isCompleteRun(config);
    this.tests = suite.allTests().filter((test) => test.parent.project()?.name === 'e2e');
  }

  onEnd() {
    if (!this.complete || this.tests.every((test) => test.results.length === 0)) return;
    const failed = this.tests.filter((test) => test.outcome() !== 'expected');
    const status = failed.length === 0 ? 'pass' : 'fail';
    const detail = failed.length === 0 ? undefined : `${failed.length} of ${this.tests.length} not passed`;
    for (const page of PAGES) record('e2e', page, status, detail);
  }
}
