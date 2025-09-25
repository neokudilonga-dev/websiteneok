// ESLint flat config for Next.js + TypeScript + React
import js from '@eslint/js';
import next from 'eslint-config-next';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...js(),
  ...next(),
  {
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'react/jsx-key': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
