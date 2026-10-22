const { spawnSync } = require('node:child_process');
const { copyFileSync, mkdirSync, readFileSync, rmSync } = require('node:fs');

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) {
    throw result.error;
  }
  if (result.signal) {
    throw new Error(`${command} terminated by ${result.signal}`);
  }
  return result.status ?? 1;
}

// Each run starts fresh so previous requests cannot inflate coverage.
rmSync('coverage', { recursive: true, force: true });
const testStatus = run('pnpm', [
  'exec',
  'jest',
  '--runInBand',
  '--coverage',
  '--coverageProvider=v8',
  '--coverageReporters=json',
  '--coverageDirectory=coverage/jest',
]);

// Produce coverage even when assertions fail, while preserving Jest's exit status.
const serverStatus = run('pnpm', [
  'exec',
  'c8',
  'report',
  '--temp-directory=coverage/jest/server-v8',
  '--reports-dir=coverage/server',
  '--reporter=json',
  '--include=app/**',
  '--include=cron/**',
  '--exclude=app/tests/**',
]);
if (serverStatus !== 0) {
  process.exit(testStatus !== 0 ? testStatus : serverStatus);
}
const serverCoverage = JSON.parse(readFileSync('coverage/server/coverage-final.json', 'utf8'));
if (Object.keys(serverCoverage).length === 0) {
  throw new Error('No test server coverage was collected');
}

mkdirSync('coverage/combined-input', { recursive: true });
copyFileSync('coverage/jest/coverage-final.json', 'coverage/combined-input/jest.json');
copyFileSync('coverage/server/coverage-final.json', 'coverage/combined-input/server.json');
const reportStatus = run('pnpm', [
  'exec',
  'nyc',
  'report',
  '--temp-dir=coverage/combined-input',
  '--report-dir=coverage',
  '--reporter=text',
  '--reporter=html',
  '--reporter=lcov',
  '--reporter=json',
  '--reporter=json-summary',
]);
process.exit(testStatus !== 0 ? testStatus : reportStatus);
