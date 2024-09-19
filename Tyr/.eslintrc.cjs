/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: ['prettier', 'plugin:storybook/recommended'],
  plugins: ['react', '@typescript-eslint', 'unused-imports'],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
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
    '@typescript-eslint/member-delimiter-style': ['error'],
    '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
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
    '@typescript-eslint/require-array-sort-compare': ['error', { ignoreStringArrays: true }],
    '@typescript-eslint/restrict-plus-operands': ['error'],
    '@typescript-eslint/switch-exhaustiveness-check': ['error'],
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
      { functions: false, classes: false, variables: true },
    ],
    '@typescript-eslint/no-useless-constructor': ['error'],
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': ['error'],
  },
};
