import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['**/dist/**', '**/coverage/**', '**/playwright-report/**', '**/test-results/**', '**/.pages-dist/**'],
  },
  js.configs.recommended,
  {
    files: ['scripts/**/*.mjs', '*.config.mjs', 'eslint.config.mjs'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: false,
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLButtonElement: 'readonly',
        Node: 'readonly',
        KeyboardEvent: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        structuredClone: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-prototype-builtins': 'off',
      'no-cond-assign': 'off',
      'no-useless-escape': 'off',
      'no-unreachable': 'off',
      'no-case-declarations': 'off',
      'no-empty': 'off',
    },
  },
  prettier,
];
