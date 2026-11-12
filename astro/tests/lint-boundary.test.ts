import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const eslint = new ESLint({ overrideConfigFile: 'eslint.config.js' });

describe('React boundary', () => {
  it('rejects React outside src/islands', async () => {
    const [r] = await eslint.lintText("import { useState } from 'react';\nexport const x = useState;\n", { filePath: 'src/scripts/bad.ts' });
    expect(r.messages.some(m => m.ruleId === 'no-restricted-imports')).toBe(true);
  });
  it('rejects a static import of the island from a script', async () => {
    const [r] = await eslint.lintText("import '../islands/order-form/mount';\n", { filePath: 'src/scripts/bad.ts' });
    expect(r.messages.some(m => m.ruleId === 'no-restricted-imports')).toBe(true);
  });
  it('rejects .tsx outside src/islands', async () => {
    const [r] = await eslint.lintText('export const A = () => null;\n', { filePath: 'src/components/Bad.tsx' });
    expect(r.messages.some(m => m.ruleId === 'no-restricted-syntax')).toBe(true);
  });
  it('allows React inside src/islands', async () => {
    const [r] = await eslint.lintText("import { useState } from 'react';\nexport const x = useState;\n", { filePath: 'src/islands/order-form/ok.ts' });
    expect(r.errorCount).toBe(0);
  });
});
