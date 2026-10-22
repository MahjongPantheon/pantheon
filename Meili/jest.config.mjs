export default {
  transform: { '^.+\\.(t|j)sx?$': '@swc/jest' },
  moduleNameMapper: { '(.+)\\.js': '$1' },
  extensionsToTreatAsEsm: ['.ts'],
  reporters: ['jest-spec-reporter'],
  testMatch: ['<rootDir>/src/**/*.test.ts'],
};
