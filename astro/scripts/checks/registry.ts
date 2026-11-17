import fs from 'node:fs';
import path from 'node:path';
import { NOT_FOUND_PATH, redirects } from '../../src/routes/manifest.ts';
import { allPageEntries } from '../../src/routes/urls.ts';

export type CheckId = 'content' | 'visual-phone' | 'visual-desktop' | 'seo' | 'e2e' | 'lighthouse';
export type Status = 'pass' | 'fail' | 'accepted' | 'skipped';

const CHECK_IDS: readonly CheckId[] = [
  'content',
  'visual-phone',
  'visual-desktop',
  'seo',
  'e2e',
  'lighthouse',
];

interface Registry {
  generatedAt: string;
  pages: Record<string, Partial<Record<CheckId, { status: Status; detail?: string }>>>;
}

// NIUS_CHECKS_DIR lets tests keep their results out of the real registry.
const registryFile = () => path.join(process.env.NIUS_CHECKS_DIR ?? '.checks', 'registry.json');

function readRegistry(): Registry {
  const file = registryFile();
  if (!fs.existsSync(file)) return { generatedAt: '', pages: {} };
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Registry;
}

function writeRegistry(registry: Registry): void {
  registry.generatedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(registryFile()), { recursive: true });
  fs.writeFileSync(registryFile(), `${JSON.stringify(registry, null, 2)}\n`);
}

export function record(check: CheckId, pagePath: string, status: Status, detail?: string): void {
  const registry = readRegistry();
  const page = (registry.pages[pagePath] ??= {});
  page[check] = detail === undefined ? { status } : { status, detail };
  writeRegistry(registry);
}

/**
 * Removes the results of the given checks from every row (a row left empty goes too). A complete
 * run of a check calls it before it records, so no row keeps a result of an earlier run.
 */
export function clear(...checks: CheckId[]): void {
  if (!fs.existsSync(registryFile())) return;
  const registry = readRegistry();
  for (const [pagePath, page] of Object.entries(registry.pages)) {
    for (const check of checks) delete page[check];
    if (Object.keys(page).length === 0) delete registry.pages[pagePath];
  }
  writeRegistry(registry);
}

// The row tests/visual/form.spec.ts writes.
const ORDER_FORM_ROW = 'order-form';

export interface RowGroups {
  pages: string[];
  redirects: string[];
  notFound: string[];
  orderForm: string[];
  other: string[];
}

/** Sorts registry rows by what they are: manifest pages, redirect sources, the 404 page, the order form. */
export function groupRows(paths: readonly string[]): RowGroups {
  const pagePaths = new Set(allPageEntries().map((e) => e.path));
  const redirectSources = new Set(redirects.map((r) => r.from));
  const groups: RowGroups = { pages: [], redirects: [], notFound: [], orderForm: [], other: [] };
  for (const p of [...paths].sort()) {
    if (pagePaths.has(p)) groups.pages.push(p);
    else if (redirectSources.has(p)) groups.redirects.push(p);
    else if (p === NOT_FOUND_PATH) groups.notFound.push(p);
    else if (p === ORDER_FORM_ROW) groups.orderForm.push(p);
    else groups.other.push(p);
  }
  return groups;
}

export function renderReport(): string {
  const { pages } = readRegistry();
  const table = (first: string, checks: readonly CheckId[], rows: string[]) => [
    `| ${first} | ${checks.join(' | ')} |`,
    `| ${[first, ...checks].map(() => '---').join(' | ')} |`,
    ...rows.map((p) => `| ${p} | ${checks.map((c) => pages[p][c]?.status ?? '-').join(' | ')} |`),
  ];
  const groups = groupRows(Object.keys(pages));
  // Only the seo check looks at a redirect source.
  const sections: Array<[string, string[]]> = [
    ['Pages', table('page', CHECK_IDS, groups.pages)],
    ['Redirects', table('redirect', ['seo'], groups.redirects)],
    ['404 page', table('page', CHECK_IDS, groups.notFound)],
    ['Order form', table('page', CHECK_IDS, groups.orderForm)],
  ];
  // Nothing is hidden: a row of no group is printed too.
  if (groups.other.length > 0) sections.push(['Other', table('page', CHECK_IDS, groups.other)]);
  return sections.map(([heading, lines]) => [`## ${heading}`, '', ...lines].join('\n')).join('\n\n');
}

if (import.meta.main) console.log(renderReport());
