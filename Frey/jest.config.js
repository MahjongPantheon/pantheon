module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  reporters: process.env.GITHUB_ACTIONS
    ? [['github-actions', {silent: false}], 'summary']
    : [['default', {summaryThreshold: 10}]],
  ...(process.env.DEBUG
    ? {}
    : {
        globalSetup: './app/tests/setup.ts',
        globalTeardown: './app/tests/teardown.ts',
      }),
};
