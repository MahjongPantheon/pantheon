import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    fileParallelism: false,
    coverage: {
      enabled: true,
      provider: 'v8',
      reportOnFailure: true,
      reporter: ['text', 'json', 'json-summary'],
    },
  },
});
