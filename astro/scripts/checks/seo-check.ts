import fs from 'node:fs';
import { NOT_FOUND_PATH, redirects } from '../../src/routes/manifest.ts';
import { allPageEntries } from '../../src/routes/urls.ts';
import { listPages } from './lib/html.ts';
import { record } from './registry.ts';
import { checkDist } from './seo-rules.ts';
import type { KnownDefect } from './seo-rules.ts';

// Exit code 1 means "findings"; a usage error is 2.
function usageError(message: string): never {
  console.error(`seo-check: ${message}`);
  process.exit(2);
}

function readJson(option: string, file: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return usageError(`cannot read ${option} file ${file}: ${(error as Error).message.split('\n')[0]}`);
  }
}

const options: Record<string, string | boolean> = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === '--production') options.production = true;
  else if (['--dist', '--scope', '--known'].includes(arg) && i + 1 < argv.length) {
    options[arg.slice(2)] = argv[++i];
  } else {
    usageError(`unknown or incomplete argument: ${arg}`);
  }
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
let scope: Set<string> | undefined;
if (options.scope === 'built') {
  scope = new Set(built.filter((p) => manifestPaths.has(p)));
} else if (typeof options.scope === 'string') {
  const listed = readJson('scope', options.scope);
  if (!Array.isArray(listed) || !listed.every((p) => typeof p === 'string')) {
    usageError(`scope file ${options.scope} must be a JSON array of paths`);
  }
  const unknown = listed.find((p: string) => !knownPaths.has(p));
  if (unknown !== undefined) usageError(`scope entry ${unknown} is not a manifest path`);
  scope = new Set(listed as string[]);
}

let knownDefects: KnownDefect[] = [];
if (typeof options.known === 'string') {
  const listed = readJson('known', options.known);
  const valid = (k: unknown): k is KnownDefect =>
    typeof k === 'object' &&
    k !== null &&
    ['rule', 'path', 'note'].every((key) => typeof (k as Record<string, unknown>)[key] === 'string');
  if (!Array.isArray(listed) || !listed.every(valid)) {
    usageError(`known file ${options.known} must be a JSON array of { rule, path, note }`);
  }
  knownDefects = listed;
}

const findings = checkDist({ distDir, scope, knownDefects, production: options.production === true });
for (const f of findings) console.log(`${f.rule} ${f.path} ${f.detail}${f.known ? ' [known]' : ''}`);
const failing = findings.filter((f) => !f.known);

const recorded = new Set([...built, ...findings.map((f) => f.path).filter((p) => knownPaths.has(p))]);
for (const p of recorded) {
  const rulesOf = (list: typeof findings) => [...new Set(list.filter((f) => f.path === p).map((f) => f.rule))];
  const failed = rulesOf(failing);
  const accepted = rulesOf(findings.filter((f) => f.known));
  if (failed.length > 0) record('seo', p, 'fail', failed.join(', '));
  else if (accepted.length > 0) record('seo', p, 'accepted', accepted.join(', '));
  else record('seo', p, 'pass');
}

if (failing.length > 0) process.exitCode = 1;
