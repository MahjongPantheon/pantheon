export default {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: ['node_modules/.pnpm/(?!tsclients)'],
  moduleNameMapper: {
    'src/(.*)\\.js': '<rootDir>/src/$1.ts',
    '(.+)\\.js': '$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  reporters: ['jest-spec-reporter'],
  ...(process.env.DEBUG
    ? {}
    : {
        globalSetup: './src/tests/setup.ts',
        globalTeardown: './src/tests/teardown.ts',
      }),
};
