import fs from 'node:fs';
import path from 'node:path';

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

export function record(check: CheckId, pagePath: string, status: Status, detail?: string): void {
  const registry = readRegistry();
  const page = (registry.pages[pagePath] ??= {});
  page[check] = detail === undefined ? { status } : { status, detail };
  registry.generatedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(registryFile()), { recursive: true });
  fs.writeFileSync(registryFile(), `${JSON.stringify(registry, null, 2)}\n`);
}

export function renderReport(): string {
  const { pages } = readRegistry();
  const rows = Object.keys(pages)
    .sort()
    .map((p) => `| ${p} | ${CHECK_IDS.map((c) => pages[p][c]?.status ?? '-').join(' | ')} |`);
  return [
    `| page | ${CHECK_IDS.join(' | ')} |`,
    `| --- | ${CHECK_IDS.map(() => '---').join(' | ')} |`,
    ...rows,
  ].join('\n');
}

if (import.meta.main) console.log(renderReport());
