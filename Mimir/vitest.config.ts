import { transform } from '@swc/core';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'mimir-test-decorators',
      enforce: 'pre',
      async transform(code, id) {
        if (!id.endsWith('.ts') || id.includes('/node_modules/')) {
          return;
        }
        // Keep legacy decorators local so MikroORM can locate the entity source files.
        return transform(code, {
          filename: id,
          sourceMaps: true,
          jsc: {
            target: 'es2022',
            parser: { syntax: 'typescript', decorators: true },
            transform: { legacyDecorator: true },
          },
          module: { type: 'es6' },
        });
      },
    },
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'cron/**/*.test.ts'],
    fileParallelism: false,
    server: { deps: { inline: ['tsclients'] } },
    globalSetup: process.env.DEBUG ? [] : ['./src/tests/globalSetup.ts'],
    coverage: {
      provider: 'v8',
      reportOnFailure: true,
      reporter: ['text', 'json', 'json-summary'],
    },
  },
});
