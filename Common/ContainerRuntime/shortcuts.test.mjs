import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const repository = fileURLToPath(new URL('../../', import.meta.url));

function run(target, { failure = '', overrides = [] } = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'pantheon-shortcuts-'));
  const log = join(directory, 'commands.jsonl');
  const stub = join(directory, 'command.mjs');
  writeFileSync(log, '');
  writeFileSync(
    stub,
    `#!/usr/bin/env node
import { appendFileSync } from 'node:fs';
const args = process.argv.slice(2);
appendFileSync(process.env.SHORTCUT_LOG, JSON.stringify({
  args,
  env: process.env.ENV_FILENAME,
  tag: process.env.IMAGE_TAG,
  workers: process.env.PANTHEON_PRODUCTION_WORKERS,
}) + '\\n');
if (process.env.SHORTCUT_FAILURE && args.join(' ').includes(process.env.SHORTCUT_FAILURE)) process.exit(23);
`,
    { mode: 0o755 }
  );
  try {
    const executable = `${process.execPath} -- ${stub}`;
    const result = spawnSync(
      'make',
      [
        target,
        `MAKE=${executable} make`,
        `CONTAINER_COMMAND=${executable} container`,
        `PROD_COMPOSE_COMMAND=${executable} compose`,
        'CONTAINER_ARCH=arm64',
        ...overrides,
      ],
      {
        cwd: repository,
        encoding: 'utf8',
        env: { ...process.env, SHORTCUT_LOG: log, SHORTCUT_FAILURE: failure },
      }
    );
    const commands = readFileSync(log, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    return { ...result, commands };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('local builds tag all thirteen service images and stop at a failed build', () => {
  const result = run('prod_local_build', { overrides: ['PROD_LOCAL_TAG=custom-test'] });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.commands[0].args, ['make', 'container_base']);
  const builds = result.commands.slice(1);
  assert.equal(builds.length, 13);
  for (const { args } of builds) {
    assert.deepEqual(args.slice(0, 2), ['container', 'build']);
    assert.ok(args[args.indexOf('-t') + 1].endsWith('-arm64:custom-test'));
  }
  const applications = builds.filter(({ args }) => args.includes('-f'));
  assert.equal(applications.length, 11);
  for (const { args } of applications) {
    assert.equal(args.at(-1), '.');
    assert.ok(args.includes('CONTAINER_ARCH=arm64'));
  }
  assert.equal(builds.at(-2).args.at(-1), 'Database');
  assert.equal(builds.at(-1).args.at(-1), 'Redis');
  const failed = run('prod_local_build', { failure: 'Forseti/Dockerfile' });
  assert.notEqual(failed.status, 0);
  assert.equal(failed.commands.length, 3);
});

test('local startup validates settings before stopping the stack and starts the proxy last', () => {
  const result = run('prod_local_start', {
    overrides: ['PROD_LOCAL_TAG=custom-test', 'PROD_LOCAL_ENV=.env.custom-test'],
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.commands.filter(({ args }) => args[0] === 'container').length, 13);
  assert.deepEqual(
    result.commands.filter(({ args }) => args[0] !== 'container').map(({ args }) => args),
    [
      ['compose', '--env-file', 'Env/.env.custom-test', 'config', '--quiet'],
      ['make', 'build_reverse_proxy'],
      ['make', 'pantheon_stop'],
      ['compose', '--env-file', 'Env/.env.custom-test', 'up', '-d', '--no-build'],
      ['make', 'reverse_proxy_start'],
    ]
  );
  for (const command of result.commands.filter(({ args }) => args[0] === 'compose')) {
    assert.equal(command.env, '.env.custom-test');
    assert.equal(command.tag, 'custom-test');
  }
  const failed = run('prod_local_start', { failure: 'config --quiet' });
  assert.notEqual(failed.status, 0);
  assert.equal(failed.commands.length, 1);
  const missing = run('prod_local_start', { failure: 'pantheon-mimir-arm64' });
  assert.notEqual(missing.status, 0);
  assert.ok(!missing.commands.some(({ args }) => args[0] === 'make'));
});

test('combined build and startup run sequentially and preserve build failures', () => {
  const result = run('prod_local');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    result.commands.map(({ args }) => args),
    [
      ['make', 'prod_local_build'],
      ['make', 'prod_local_start'],
    ]
  );
  const failed = run('prod_local', { failure: 'prod_local_build' });
  assert.notEqual(failed.status, 0);
  assert.equal(failed.commands.length, 1);
});

test('returning to development stops the old stack and disables production workers', () => {
  const result = run('dev_local');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    result.commands.map(({ args }) => args),
    [
      ['make', 'pantheon_stop'],
      ['make', 'dev'],
    ]
  );
  assert.equal(result.commands[1].workers, 'false');
  const failed = run('dev_local', { failure: 'pantheon_stop' });
  assert.notEqual(failed.status, 0);
  assert.equal(failed.commands.length, 1);
});
