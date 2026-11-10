import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['dist', 'public', '.baseline', '.checks', '.preview', 'release-dist', '.astro'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  {
    files: ['src/**/*.{ts,astro}'],
    ignores: ['src/islands/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            'react',
            'react-dom',
            '@tanstack/react-query',
            'lucide-react',
            'sonner',
            '@react-oauth/google',
          ],
          patterns: [
            'react/*',
            'react-dom/*',
            '@radix-ui/*',
            'react-phone-number-input*',
            '**/islands/**',
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.tsx'],
    ignores: ['src/islands/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program',
          message: '.tsx files are allowed only in src/islands',
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
  {
    files: ['src/islands/**'],
    ...reactHooks.configs.flat.recommended,
  },
];
