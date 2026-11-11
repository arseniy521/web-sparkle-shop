import fs from 'node:fs';
import { NOT_FOUND_PATH, redirects } from '../../src/routes/manifest.ts';
import { allPageEntries } from '../../src/routes/urls.ts';
import { listPages } from './lib/html.ts';
import { record } from './registry.ts';
import { checkDist } from './seo-rules.ts';
import type { KnownDefect } from './seo-rules.ts';

const options: Record<string, string | boolean> = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === '--production') options.production = true;
  else if (['--dist', '--scope', '--known'].includes(arg) && i + 1 < argv.length) {
    options[arg.slice(2)] = argv[++i];
  } else {
    console.error(`Unknown or incomplete argument: ${arg}`);
    process.exit(2);
  }
}

const distDir = (options.dist as string | undefined) ?? 'dist';
const built = listPages(distDir);

// "built": the manifest pages that exist in dist; redirects and the 404 page are always checked.
let scope: Set<string> | undefined;
if (options.scope === 'built') {
  const manifestPaths = new Set(allPageEntries().map((e) => e.path));
  scope = new Set(built.filter((p) => manifestPaths.has(p)));
} else if (typeof options.scope === 'string') {
  scope = new Set(JSON.parse(fs.readFileSync(options.scope, 'utf8')) as string[]);
}
const knownDefects =
  typeof options.known === 'string'
    ? (JSON.parse(fs.readFileSync(options.known, 'utf8')) as KnownDefect[])
    : [];

const findings = checkDist({ distDir, scope, knownDefects, production: options.production === true });
for (const f of findings) console.log(`${f.rule} ${f.path} ${f.detail}${f.known ? ' [known]' : ''}`);
const failing = findings.filter((f) => !f.known);

const knownPaths = new Set([
  ...allPageEntries().map((e) => e.path),
  ...redirects.map((r) => r.from),
  NOT_FOUND_PATH,
]);
const recorded = new Set([...built, ...failing.map((f) => f.path).filter((p) => knownPaths.has(p))]);
for (const p of recorded) {
  const rules = [...new Set(failing.filter((f) => f.path === p).map((f) => f.rule))];
  record('seo', p, rules.length > 0 ? 'fail' : 'pass', rules.join(', ') || undefined);
}

if (failing.length > 0) process.exitCode = 1;
