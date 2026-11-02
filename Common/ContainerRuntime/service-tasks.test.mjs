import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const repository = fileURLToPath(new URL('../../', import.meta.url));
function run(service, action, fail = '') {
  const root = mkdtempSync(join(tmpdir(), 'pantheon-service-tasks-'));
  try {
    for (const directory of [service, 'Common/ContainerRuntime', 'bin'])
      mkdirSync(join(root, directory), { recursive: true });
    for (const file of [`${service}/tasks.sh`, 'Common/ContainerRuntime/service-tasks.sh'])
      writeFileSync(join(root, file), readFileSync(join(repository, file)));
    const log = join(root, 'commands');
    writeFileSync(log, '');
    for (const command of ['pnpm', 'node'])
      writeFileSync(
        join(root, 'bin', command),
        `#!/bin/bash
printf '%s|%s|%s|%s\\n' '${command} '"$*" "\$PWD" "\$\{TEST:-\}" "\$\{TEST_VERBOSE:-\}" >> "$TASK_LOG"
[[ '${command} '"$*" != "$TASK_FAIL" ]]
`,
        { mode: 0o755 }
      );
    const result = spawnSync('bash', [`${service}/tasks.sh`, action], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${root}/bin:${process.env.PATH}`,
        TASK_LOG: log,
        TASK_FAIL: fail,
      },
    });
    return { ...result, commands: readFileSync(log, 'utf8').trim().split('\n') };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('Mimir test seeds and builds in test mode before both test runners', () => {
  const result = run('Mimir', 'test');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    result.commands.map((line) => line.split('|')[0]),
    [
      'pnpm exec mikro-orm schema:drop --run --drop-migrations-table',
      'pnpm exec mikro-orm migration:up',
      'pnpm exec mikro-orm seeder:run --class=TestSeeder',
      'pnpm exec tsx build.ts',
      'node src/tests/production.mjs',
      'node src/tests/coverage.mjs',
    ]
  );
  assert.ok(result.commands.every((line) => line.endsWith('|true|')));
  const failed = run('Mimir', 'test', 'pnpm exec mikro-orm migration:up');
  assert.notEqual(failed.status, 0);
  assert.equal(failed.commands.length, 2);
});

test('service scripts resolve recursive commands from any calling directory', () => {
  const result = run('Frey', 'migrate-frey1');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    result.commands.map((line) => line.split('|')[0]),
    ['pnpm exec tsx app/database/migrate.ts', 'pnpm exec tsx app/database/migrate_from_frey1.ts']
  );
});

test('shared check failures propagate and unknown service tasks fail', () => {
  const failed = run('Frey', 'typecheck', 'pnpm exec tsc --project tsconfig.json --noEmit');
  assert.notEqual(failed.status, 0);
  const unknown = run('Frey', 'typo');
  assert.notEqual(unknown.status, 0);
  assert.match(unknown.stderr, /Unknown task/);
});
