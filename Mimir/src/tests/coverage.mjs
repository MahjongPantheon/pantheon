import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs';

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

const toolingStatus = run('node', ['--test', 'src/tests/coverageTools.test.mjs']);
if (toolingStatus !== 0) process.exit(toolingStatus);

// Each run starts fresh so previous requests cannot inflate coverage.
rmSync('coverage', { recursive: true, force: true });
const testStatus = run('pnpm', [
  'exec',
  'vitest',
  'run',
  '--coverage',
  '--coverage.provider=v8',
  '--coverage.reporter=json',
  '--coverage.reportsDirectory=coverage/vitest',
]);

// Produce coverage even when assertions fail, while preserving Vitest's exit status.
mkdirSync('coverage/server', { recursive: true });
const serverStatus = run('node', [
  '--input-type=module',
  '-e',
  "import { mergeServerCoverage } from './src/tests/mergeCoverage.mjs'; await mergeServerCoverage(process.cwd(), ['src', 'cron']);",
]);
if (serverStatus !== 0) {
  process.exit(testStatus !== 0 ? testStatus : serverStatus);
}
const serverCoverage = JSON.parse(readFileSync('coverage/server/coverage-final.json', 'utf8'));
if (Object.keys(serverCoverage).length === 0) {
  throw new Error('No test server coverage was collected');
}

mkdirSync('coverage/combined-input', { recursive: true });
copyFileSync('coverage/vitest/coverage-final.json', 'coverage/combined-input/vitest.json');
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
const thresholdStatus =
  reportStatus === 0
    ? run('pnpm', [
        'exec',
        'nyc',
        'check-coverage',
        '--temp-dir=coverage/combined-input',
        '--branches=85',
        '--lines=85',
        '--functions=85',
        '--statements=85',
      ])
    : 0;
process.exit(testStatus || reportStatus || thresholdStatus);
