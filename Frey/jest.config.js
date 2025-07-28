module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  ...(process.env.DEBUG
    ? {}
    : {
        globalSetup: './app/tests/setup.ts',
        globalTeardown: './app/tests/teardown.ts',
      }),
};
