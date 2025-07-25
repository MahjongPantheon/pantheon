module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  globalSetup: './app/tests/setup.ts',
  globalTeardown: './app/tests/teardown.ts',
};
