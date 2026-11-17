import { NOT_FOUND_PATH, redirects } from '../../src/routes/manifest.ts';
import { allPageEntries } from '../../src/routes/urls.ts';
import { listPages } from './lib/html.ts';
import { clear, record } from './registry.ts';
import { checkDist } from './seo-rules.ts';

// Exit code 1 means "findings"; a usage error is 2.
function usageError(message: string): never {
  console.error(`seo-check: ${message}`);
  process.exit(2);
}

const options: Record<string, string | boolean> = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === '--production') options.production = true;
  else if (['--dist', '--scope'].includes(arg) && i + 1 < argv.length) {
    options[arg.slice(2)] = argv[++i];
  } else {
    usageError(`unknown or incomplete argument: ${arg}`);
  }
}

if (options.scope !== undefined && options.scope !== 'built') {
  usageError(`--scope takes only "built", got ${String(options.scope)}`);
}

const distDir = (options.dist as string | undefined) ?? 'dist';
let built: string[];
try {
  built = listPages(distDir);
} catch {
  usageError(`dist directory ${distDir} cannot be read`);
}

const manifestPaths = new Set(allPageEntries().map((e) => e.path));
const knownPaths = new Set([...manifestPaths, ...redirects.map((r) => r.from), NOT_FOUND_PATH]);

// "built": the manifest pages that exist in dist; redirects and the 404 page are always checked.
// Without --scope every manifest page must be built.
const scope = options.scope === 'built' ? new Set(built.filter((p) => manifestPaths.has(p))) : undefined;

const findings = checkDist({ distDir, scope, production: options.production === true });
for (const f of findings) console.log(`${f.rule} ${f.path} ${f.detail}`);

const recorded = new Set([...built, ...findings.map((f) => f.path).filter((p) => knownPaths.has(p))]);
// Every run is complete: it records every built page, so no seo result of an earlier run stays.
clear('seo');
for (const p of recorded) {
  const failed = [...new Set(findings.filter((f) => f.path === p).map((f) => f.rule))];
  if (failed.length > 0) record('seo', p, 'fail', failed.join(', '));
  else record('seo', p, 'pass');
}

if (findings.length > 0) process.exitCode = 1;
