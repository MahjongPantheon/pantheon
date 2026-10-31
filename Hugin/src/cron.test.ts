import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'hugin-cron-'));
  mkdirSync(join(root, 'Hugin/cron'), { recursive: true });
  mkdirSync(join(root, 'Hugin-dist'));
  mkdirSync(join(root, 'tools'));
  copyFileSync(new URL('../cron/run.sh', import.meta.url), join(root, 'Hugin/cron/run.sh'));
  for (const command of ['pnpm', 'node']) {
    writeFileSync(
      join(root, 'tools', command),
      '#!/bin/sh\nprintf "%s\\n" "$PWD" "$0" "$@"\nexit "$CRON_TEST_EXIT"\n',
      { mode: 0o755 }
    );
  }
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

function run(mode: string, exitCode = '0') {
  return spawnSync('/bin/sh', [join(root, 'Hugin/cron/run.sh'), 'send_stats'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${join(root, 'tools')}:${process.env.PATH}`,
      PANTHEON_MODE: mode,
      CRON_TEST_EXIT: exitCode,
    },
  });
}

it.each(['development', ''])(
  'runs cron from sources without a production build in mode %j',
  (mode) => {
    const result = run(mode);
    expect(result.status).toBe(0);
    expect(result.stdout.trim().split('\n')).toEqual([
      join(root, 'Hugin'),
      join(root, 'tools/pnpm'),
      'exec',
      'tsx',
      'src/jobs.ts',
      'send_stats',
    ]);
  }
);

it('runs compiled cron jobs in production', () => {
  const result = run('production');
  expect(result.status).toBe(0);
  expect(result.stdout.trim().split('\n')).toEqual([
    join(root, 'Hugin-dist'),
    join(root, 'tools/node'),
    'jobs.js',
    'send_stats',
  ]);
});

it('preserves a failing job exit status', () => {
  expect(run('development', '23').status).toBe(23);
  expect(run('production', '23').status).toBe(23);
});
