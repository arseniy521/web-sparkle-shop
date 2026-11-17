// @vitest-environment node
// Port of old:src/pages/structuredData.test.ts.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(import.meta.dirname, '..');

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
  );

describe('structured data', () => {
  // Owner's decision (2026-11-12): the Google Business rating is not ours to mark up. Google's
  // review-snippet rules require ratings collected on the site itself. Visible text may show it.
  it('carries no aggregateRating on any page', () => {
    const offenders = walk(SRC)
      .filter((file) => /\.(astro|tsx?)$/.test(file) && !/\.test\.tsx?$/.test(file))
      .filter((file) => /aggregateRating|AggregateRating/.test(readFileSync(file, 'utf8')))
      .map((file) => path.relative(SRC, file).split(path.sep).join('/'));
    expect(offenders).toEqual([]);
  });
});
