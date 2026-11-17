// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { mapResults } from './lighthouse-check.ts';

const url = 'http://localhost:1234/a/';
const result = (auditId: string, passed: boolean, level = 'error') => ({ url, auditId, level, passed });

describe('mapResults', () => {
  it('passes a page whose assertions all passed', () => {
    expect(mapResults(['/a/'], [result('categories:seo', true)], 0)).toEqual({ '/a/': { status: 'pass' } });
  });

  it('fails a page with a failed error-level assertion and names the audit', () => {
    const mapped = mapResults(['/a/'], [result('categories:seo', false), result('categories:accessibility', true)], 1);
    expect(mapped['/a/']).toEqual({ status: 'fail', detail: 'categories:seo' });
  });

  it('does not fail a page because of a warning', () => {
    expect(mapResults(['/a/'], [result('categories:performance', false, 'warn')], 0)['/a/'].status).toBe('pass');
  });

  it('fails a page without results when LHCI failed', () => {
    expect(mapResults(['/a/'], [], 1)['/a/']).toEqual({ status: 'fail', detail: 'no assertion results' });
  });

  it('keeps results of other pages apart', () => {
    const other = { url: 'http://localhost:1234/b/', auditId: 'categories:seo', level: 'error', passed: false };
    const mapped = mapResults(['/a/', '/b/'], [result('categories:seo', true), other], 1);
    expect(mapped['/a/'].status).toBe('pass');
    expect(mapped['/b/'].status).toBe('fail');
  });
});
