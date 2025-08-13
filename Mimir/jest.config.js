module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: ['node_modules/.pnpm/(?!tsclients)'],
  reporters: ['jest-spec-reporter'],
  ...(process.env.DEBUG
    ? {}
    : {
        // globalSetup: './app/tests/setup.ts',
        // globalTeardown: './app/tests/teardown.ts',
      }),
};
