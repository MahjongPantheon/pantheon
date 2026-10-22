export default {
  transform: { '^.+\\.(t|j)sx?$': '@swc/jest' },
  moduleNameMapper: { '(.+)\\.js': '$1' },
  extensionsToTreatAsEsm: ['.ts'],
  reporters: ['jest-spec-reporter'],
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageReporters: ['text', 'json-summary'],
  testMatch: ['<rootDir>/src/**/*.test.ts'],
};
