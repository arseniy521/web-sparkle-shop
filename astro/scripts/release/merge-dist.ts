// Merges the old site's build and the new site's build for a wave-1 release: the old build
// as it is, plus the listed pages, _astro/ and .nojekyll from the new build. It refuses
// anything doubtful rather than publish a guess.
//   node scripts/release/merge-dist.ts [--old .baseline/dist] [--new dist]
//     [--paths checks/wave1-paths.json] [--out release-dist]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_PATH = /^\/(?:[a-z0-9-]+\/)*$/;

function filesUnder(dir: string, base = dir): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(full, base) : [path.relative(base, full).split(path.sep).join('/')];
  });
}

const isWithin = (child: string, parent: string) => {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
};

// The files sync-public copied from the old public/ into the new build: Astro copies its
// public/ verbatim, so they are every file of the new build except what the build itself
// makes — _astro/, the pages (index.html), 404.html, and CNAME and .nojekyll from finalize-dist.
// The old build copies the same public/, so each must be in it with the same bytes; anything
// else means the two builds come from different states of public/.
const madeByNewBuild = (file: string) =>
  file.startsWith('_astro/') ||
  file === 'index.html' ||
  file.endsWith('/index.html') ||
  ['404.html', 'CNAME', '.nojekyll'].includes(file);

// The reference copy of the old site (.baseline/dist, from npm run baseline) is its build plus
// pages rendered only for comparison, which production does not have (baseline.json extraRoutes).
// Rule: an old folder whose parent is named .baseline is such a reference, and the addresses to
// skip are read from baseline.json next to it; without a readable list the merge is refused.
export function referenceOnlyAddresses(oldDist: string): string[] {
  const parent = path.dirname(path.resolve(oldDist));
  if (path.basename(parent) !== '.baseline') return [];
  const file = path.join(parent, 'baseline.json');
  let extraRoutes: unknown;
  try {
    extraRoutes = (JSON.parse(fs.readFileSync(file, 'utf8')) as { extraRoutes?: unknown }).extraRoutes;
  } catch (error) {
    throw new Error(`${file} cannot be read, so the pages of the reference are unknown: ${(error as Error).message}`);
  }
  if (!Array.isArray(extraRoutes) || !extraRoutes.every((a) => typeof a === 'string')) {
    throw new Error(`${file} has no list of addresses in extraRoutes`);
  }
  return extraRoutes;
}

export function mergeDist(input: {
  oldDist: string;
  newDist: string;
  paths: string[];
  outDir: string;
  // Old addresses not to publish: the reference copy of the old site has pages production lacks.
  skipOld?: string[];
}): void {
  const oldDist = path.resolve(input.oldDist);
  const newDist = path.resolve(input.newDist);
  const outDir = path.resolve(input.outDir);

  for (const source of [oldDist, newDist]) {
    // outDir is emptied first, so it must not hold an input either.
    if (isWithin(outDir, source) || isWithin(source, outDir)) {
      throw new Error(`The output folder ${outDir} overlaps the input ${source}`);
    }
  }
  const skipOld = input.skipOld ?? [];
  for (const address of skipOld) {
    if (!SITE_PATH.test(address) || address === '/') throw new Error(`Address ${address} to skip is not a page folder like /a/b/`);
  }
  for (const address of input.paths) {
    if (!SITE_PATH.test(address)) throw new Error(`Address ${address} is not a site path like /a/b/`);
    if (!fs.existsSync(path.join(newDist, address, 'index.html'))) {
      throw new Error(`Address ${address} is missing in the new build ${newDist}`);
    }
  }
  if (fs.existsSync(path.join(oldDist, '_astro'))) {
    throw new Error(`The old build ${oldDist} contains _astro/, the folder of the new build`);
  }
  for (const file of filesUnder(newDist).filter((f) => !madeByNewBuild(f))) {
    const oldFile = path.join(oldDist, file);
    if (!fs.existsSync(oldFile)) throw new Error(`File ${file} from public/ is in the new build but not in the old one`);
    if (!fs.readFileSync(oldFile).equals(fs.readFileSync(path.join(newDist, file)))) {
      throw new Error(`File ${file} from public/ differs between the old and the new build`);
    }
  }
  // The old build writes CNAME with `echo` (on Windows "www.nius.cz \r\n"), finalize-dist writes
  // "www.nius.cz\n": the old file is kept, but both must name the same host.
  const host = (dir: string) => fs.readFileSync(path.join(dir, 'CNAME'), 'utf8').trim();
  if (host(oldDist) !== host(newDist)) {
    throw new Error(`CNAME names ${host(oldDist)} in the old build and ${host(newDist)} in the new one`);
  }
  // 404.html is not compared: wave 1 keeps the old one, the new one differs by design.

  fs.rmSync(outDir, { recursive: true, force: true });
  const skipped = skipOld.map((address) => path.join(oldDist, address));
  fs.cpSync(oldDist, outDir, { recursive: true, filter: (source) => !skipped.includes(path.join(source, path.sep)) });
  for (const address of input.paths) {
    const target = path.join(outDir, address, 'index.html');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(newDist, address, 'index.html'), target);
  }
  fs.cpSync(path.join(newDist, '_astro'), path.join(outDir, '_astro'), { recursive: true });
  fs.copyFileSync(path.join(newDist, '.nojekyll'), path.join(outDir, '.nojekyll'));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options: Record<string, string> = {
    old: '.baseline/dist',
    new: 'dist',
    paths: 'checks/wave1-paths.json',
    out: 'release-dist',
  };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 2) {
    const name = argv[i].replace(/^--/, '');
    if (!argv[i].startsWith('--') || !(name in options) || argv[i + 1] === undefined) {
      console.error(`merge-dist: unknown or incomplete argument: ${argv[i]}`);
      process.exit(2);
    }
    options[name] = argv[i + 1];
  }
  const paths: unknown = JSON.parse(fs.readFileSync(options.paths, 'utf8'));
  if (!Array.isArray(paths) || !paths.every((p) => typeof p === 'string')) {
    console.error(`merge-dist: ${options.paths} must be a JSON array of addresses`);
    process.exit(2);
  }
  try {
    mergeDist({ oldDist: options.old, newDist: options.new, paths, outDir: options.out, skipOld: referenceOnlyAddresses(options.old) });
  } catch (error) {
    console.error(`merge-dist: ${(error as Error).message}`);
    process.exit(1);
  }
  console.log(`merge-dist: ${options.out} = ${options.old} + ${paths.length} pages, _astro/ and .nojekyll of ${options.new}`);
}
