import react from 'eslint-plugin-react';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import unusedImports from 'eslint-plugin-unused-imports';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
  },
  ...compat.extends('prettier', 'plugin:storybook/recommended'),
  {
    plugins: {
      react,
      '@typescript-eslint': typescriptEslint,
      'unused-imports': unusedImports,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',

      parserOptions: {
        project: 'tsconfig.json',

        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      'react/jsx-filename-extension': [
        1,
        {
          extensions: ['.tsx'],
        },
      ],

      'react/jsx-props-no-spreading': 'off',
      'react/require-default-props': 'off',
      'react/no-array-index-key': 'off',
      'react/jsx-key': 'error',
      'unused-imports/no-unused-imports': 'error',
      'array-callback-return': ['error'],
      'getter-return': ['error'],
      'no-async-promise-executor': ['error'],
      'no-class-assign': ['error'],
      'no-cond-assign': ['error'],
      'no-constant-binary-expression': ['error'],
      'no-constant-condition': ['error'],
      'no-constructor-return': ['error'],
      'no-debugger': ['error'],
      'no-dupe-args': ['error'],
      'no-dupe-class-members': ['error'],
      'no-dupe-else-if': ['error'],
      'no-dupe-keys': ['error'],
      'no-duplicate-case': ['error'],
      'no-duplicate-imports': ['error'],
      'no-empty-pattern': ['error'],
      'no-ex-assign': ['error'],
      'no-fallthrough': ['error'],
      'no-func-assign': ['error'],
      'no-import-assign': ['error'],
      'no-inner-declarations': ['error'],
      'no-invalid-regexp': ['error'],
      'no-irregular-whitespace': ['error'],
      'no-obj-calls': ['error'],
      'no-promise-executor-return': ['error'],
      'no-self-assign': ['error'],
      'no-self-compare': ['error'],
      'no-setter-return': ['error'],
      'no-template-curly-in-string': ['error'],
      'no-unexpected-multiline': ['error'],
      'no-unmodified-loop-condition': ['error'],
      'no-unreachable': ['error'],
      'no-unreachable-loop': ['error'],
      'no-unsafe-finally': ['error'],
      'no-unsafe-negation': ['error'],
      'no-unsafe-optional-chaining': ['error'],
      'no-unused-private-class-members': ['error'],
      'require-atomic-updates': ['error'],
      'use-isnan': ['error'],
      'valid-typeof': ['error'],
      'no-eval': ['error'],
      'no-implied-eval': ['error'],
      'no-multi-assign': ['error'],
      'no-useless-return': ['error'],
      'prefer-const': ['error'],
      '@typescript-eslint/await-thenable': 'error',

      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],

      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreArrowShorthand: true,
        },
      ],

      '@typescript-eslint/no-extra-non-null-assertion': ['error'],
      '@typescript-eslint/no-extraneous-class': ['error'],
      '@typescript-eslint/no-inferrable-types': ['error'],
      '@typescript-eslint/no-invalid-void-type': ['error'],
      '@typescript-eslint/no-misused-new': ['error'],
      '@typescript-eslint/no-unnecessary-type-arguments': ['error'],
      '@typescript-eslint/no-unnecessary-type-assertion': ['error'],
      '@typescript-eslint/no-unnecessary-type-constraint': ['error'],
      '@typescript-eslint/no-var-requires': ['error'],
      '@typescript-eslint/prefer-for-of': ['error'],
      '@typescript-eslint/prefer-includes': ['error'],
      '@typescript-eslint/prefer-nullish-coalescing': ['error'],
      '@typescript-eslint/prefer-readonly': ['error'],
      '@typescript-eslint/prefer-string-starts-ends-with': ['error'],
      '@typescript-eslint/prefer-ts-expect-error': ['error'],

      '@typescript-eslint/require-array-sort-compare': [
        'error',
        {
          ignoreStringArrays: true,
        },
      ],

      '@typescript-eslint/restrict-plus-operands': ['error'],
      '@typescript-eslint/switch-exhaustiveness-check': 'off',
      '@typescript-eslint/no-invalid-this': ['error'],
      '@typescript-eslint/no-shadow': ['error'],
      '@typescript-eslint/no-unused-expressions': ['error'],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: false,
          classes: false,
          variables: true,
        },
      ],

      '@typescript-eslint/no-useless-constructor': ['error'],
      '@typescript-eslint/no-non-null-asserted-nullish-coalescing': ['error'],
    },
  },
  {
    ignores: [
      'eslint.config.mjs',
      'proto.config.mjs',
      '**/node_modules/',
      '**/typings.d.ts',
      '**/*.spec.ts',
      '.storybook/main.ts',
      '.storybook/preview.ts',
      'app/helpers/memoize.ts',
      'dist/',
      'dev-dist/',
      'vite.config.ts',
      'vitest.config.ts',
    ],
  },
];
