import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['app/**/*.test.ts', 'cron/**/*.test.ts'],
    fileParallelism: false,
    server: { deps: { inline: ['tsclients'] } },
    globalSetup: process.env.DEBUG ? [] : ['./app/tests/globalSetup.ts'],
    coverage: {
      provider: 'v8',
      reportOnFailure: true,
      reporter: ['text', 'json', 'json-summary'],
    },
  },
});
