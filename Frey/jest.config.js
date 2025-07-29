module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  reporters: ['jest-spec-reporter'],
  ...(process.env.DEBUG
    ? {}
    : {
        globalSetup: './app/tests/setup.ts',
        globalTeardown: './app/tests/teardown.ts',
      }),
};
