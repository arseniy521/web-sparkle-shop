import type { FullConfig, Reporter, Suite, TestCase } from '@playwright/test/reporter';
import { record } from '../../scripts/checks/registry.ts';

// The pages the e2e scenarios run on; each later page task adds its page here.
const PAGES = ['/sestricka-praha-1/'];

// Writes the e2e row of .checks/registry.json once per run (not for --list): pass only if
// every e2e test of the run ran and passed.
export default class RegistryReporter implements Reporter {
  private tests: TestCase[] = [];

  onBegin(_config: FullConfig, suite: Suite) {
    this.tests = suite.allTests().filter((test) => test.parent.project()?.name === 'e2e');
  }

  onEnd() {
    if (this.tests.every((test) => test.results.length === 0)) return;
    const failed = this.tests.filter((test) => test.outcome() !== 'expected');
    const status = failed.length === 0 ? 'pass' : 'fail';
    const detail = failed.length === 0 ? undefined : `${failed.length} of ${this.tests.length} not passed`;
    for (const page of PAGES) record('e2e', page, status, detail);
  }
}
