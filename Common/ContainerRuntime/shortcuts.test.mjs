import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const repository = fileURLToPath(new URL('../../', import.meta.url));

function run(
  target,
  {
    failure = '',
    overrides = [],
    pending = 0,
    startupFailed = false,
    health = 'healthy',
    regression = false,
    state = 'running',
    nestedLogs = false,
    missingImages = [],
  } = {}
) {
  const directory = mkdtempSync(join(tmpdir(), 'pantheon-shortcuts-'));
  const log = join(directory, 'commands.jsonl');
  const stub = join(directory, 'command.mjs');
  writeFileSync(log, '');
  writeFileSync(
    stub,
    `#!/usr/bin/env node
import { appendFileSync, existsSync, readFileSync, writeFileSync, writeSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
const args = process.argv.slice(2);
if (args[0] === 'make' && (args[1] === '_prod_local_start' || args.includes('PROD_LOCAL_TAG=latest'))) {
  const result = spawnSync('make', args.slice(1), { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
appendFileSync(process.env.SHORTCUT_LOG, JSON.stringify({
  args,
  env: process.env.ENV_FILENAME,
  tag: process.env.IMAGE_TAG,
  workers: process.env.PANTHEON_PRODUCTION_WORKERS,
}) + '\\n');
if (process.env.SHORTCUT_FAILURE && args.join(' ').includes(process.env.SHORTCUT_FAILURE)) process.exit(23);
if (args[0] === 'container' && args[1] === 'image' && args[2] === 'inspect' &&
    JSON.parse(process.env.SHORTCUT_MISSING_IMAGES).some((image) => args.at(-1).endsWith(image))) process.exit(1);
if (args[0] === 'log-plugin') {
  // Model a plugin that inherits the terminal and does not handle SIGTERM.
  process.on('SIGTERM', () => {});
  writeFileSync(process.env.SHORTCUT_LOG + '.plugin-pid', String(process.pid));
  setInterval(() => {}, 1000);
}
if (args[0] === 'compose' && args.includes('logs')) {
  if (process.env.SHORTCUT_NESTED_LOGS === 'true') {
    spawn(process.execPath, [process.argv[1], 'log-plugin'], { stdio: 'inherit' });
  }
  // Flush the mock output before the readiness waiter can stop the follower.
  writeSync(1, 'mimir: pnpm resolved 100 packages\\n');
  writeSync(2, 'mimir: pnpm registry retry\\n');
  setInterval(() => {}, 1000);
  process.on('SIGTERM', () => {
    writeFileSync(process.env.SHORTCUT_LOG + '.logs-stopped', 'stopped');
    process.exit(0);
  });
}
if (args[0] === 'compose' && args.includes('ps') && args.includes('-q')) console.log(args.at(-1));
if (args[0] === 'container' && args[1] === 'inspect') {
  let health = 'healthy';
  if (args.at(-1).startsWith('mimir.')) {
    const countFile = process.env.SHORTCUT_LOG + '.pending';
    const count = existsSync(countFile) ? Number(readFileSync(countFile, 'utf8')) : 0;
    writeFileSync(countFile, String(count + 1));
    health = count < Number(process.env.SHORTCUT_PENDING) ? 'unhealthy' : process.env.SHORTCUT_HEALTH;
  }
  if (process.env.SHORTCUT_REGRESSION === 'true' && args.at(-1).startsWith('tyr.')) {
    const countFile = process.env.SHORTCUT_LOG + '.tyr';
    const count = existsSync(countFile) ? Number(readFileSync(countFile, 'utf8')) : 0;
    writeFileSync(countFile, String(count + 1));
    health = count === 1 ? 'unhealthy' : 'healthy';
  }
  console.log((args.at(-1).startsWith('mimir.') ? process.env.SHORTCUT_STATE : 'running') + ':' + health);
}
if (args.includes('/var/www/html/Common/ContainerRuntime/startup-status.mjs')) console.log(process.env.SHORTCUT_STARTUP_FAILED === 'true' ? 'failed' : 'ready');
if (args.includes('/run/pantheon-startup-failed') && process.env.SHORTCUT_STARTUP_FAILED !== 'true') process.exit(1);
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
        timeout: 120000,
        env: {
          ...process.env,
          SHORTCUT_LOG: log,
          SHORTCUT_FAILURE: failure,
          SHORTCUT_PENDING: String(pending),
          SHORTCUT_STARTUP_FAILED: String(startupFailed),
          SHORTCUT_HEALTH: health,
          SHORTCUT_REGRESSION: String(regression),
          SHORTCUT_STATE: state,
          SHORTCUT_NESTED_LOGS: String(nestedLogs),
          SHORTCUT_MISSING_IMAGES: JSON.stringify(missingImages),
        },
      }
    );
    const commands = readFileSync(log, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    const pluginFile = `${log}.plugin-pid`;
    let pluginRunning = false;
    if (existsSync(pluginFile)) {
      const pid = Number(readFileSync(pluginFile, 'utf8'));
      const status = spawnSync('ps', ['-p', String(pid), '-o', 'stat='], { encoding: 'utf8' });
      pluginRunning = status.status === 0 && !status.stdout.trim().startsWith('Z');
    }
    return {
      ...result,
      commands,
      logsStopped: existsSync(join(directory, 'commands.jsonl.logs-stopped')),
      pluginRunning,
    };
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
  assert.equal(
    result.commands.filter(({ args }) => args[0] === 'container' && args[1] === 'image').length,
    13
  );
  assert.deepEqual(
    result.commands
      .filter(({ args }) => args[0] !== 'container' && !args.includes('logs'))
      .map(({ args }) => args),
    [
      ['compose', '--env-file', 'Env/.env.custom-test', 'config', '--quiet'],
      ['make', 'build_reverse_proxy'],
      [
        'compose',
        '--env-file',
        'Env/.env.custom-test',
        'run',
        '--rm',
        '--no-deps',
        'dependencies-init',
      ],
      ['make', 'pantheon_stop'],
      ['compose', '--env-file', 'Env/.env.custom-test', 'up', '-d', '--no-build'],
      ...'tyr forseti sigrun bragi frey mimir hugin gullveig meili hermod skirnir'
        .split(' ')
        .map((service) => [
          'compose',
          '--env-file',
          'Env/.env.custom-test',
          'ps',
          '--all',
          '-q',
          `${service}.pantheon.internal`,
        ]),
      ['make', 'reverse_proxy_start'],
    ]
  );
  const follower = result.commands.find(({ args }) => args.includes('logs'));
  assert.deepEqual(follower.args.slice(0, 6), [
    'compose',
    '--env-file',
    'Env/.env.custom-test',
    'logs',
    '--follow',
    '--tail=100',
  ]);
  assert.equal(follower.args.length, 17);
  assert.match(result.stdout, /mimir: pnpm resolved 100 packages/, result.stderr);
  assert.match(result.stderr, /mimir: pnpm registry retry/);
  assert.equal(result.logsStopped, true);
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
  const initFailed = run('prod_local_start', { failure: 'run --rm --no-deps dependencies-init' });
  assert.notEqual(initFailed.status, 0);
  assert.ok(!initFailed.commands.some(({ args }) => args.includes('pantheon_stop')));
  const notReady = run('prod_local_start', {
    health: 'unhealthy',
    startupFailed: true,
  });
  assert.notEqual(notReady.status, 0);
  assert.match(notReady.stderr, /dependency installation, migration or supervised service failed/);
  assert.equal(notReady.logsStopped, true);
  assert.ok(!notReady.commands.some(({ args }) => args.includes('reverse_proxy_start')));
});

test('local startup falls back to a complete latest stack and pulls missing GHCR images', () => {
  const result = run('prod_local_start', {
    missingImages: ['mimir-arm64:local-production', 'frey-arm64:latest'],
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /using GHCR images tagged latest/);
  const pulls = result.commands.filter(({ args }) => args[1] === 'pull');
  assert.deepEqual(pulls.map(({ args }) => args.at(-1)), [
    'ghcr.io/mahjongpantheon/pantheon-frey-arm64:latest',
  ]);
  const latestInspections = result.commands.filter(
    ({ args }) => args[1] === 'image' && args.at(-1).endsWith(':latest')
  );
  assert.equal(latestInspections.length, 13);
  for (const command of result.commands.filter(
    ({ args }) => args[0] === 'compose' && !args.includes('config')
  )) {
    assert.equal(command.tag, 'latest');
    assert.equal(command.env, '.env.e2e');
  }
  assert.ok(
    result.commands.indexOf(pulls[0]) <
      result.commands.findIndex(({ args }) => args.includes('pantheon_stop'))
  );
  const failed = run('prod_local_start', {
    missingImages: ['mimir-arm64:local-production', 'frey-arm64:latest'],
    failure: 'pull',
  });
  assert.notEqual(failed.status, 0);
  assert.match(failed.stderr, /Production image unavailable/);
  assert.ok(!failed.commands.some(({ args }) => args[0] === 'make'));
});

test('explicit registry tags pull missing images without falling back to another tag', () => {
  for (const tag of ['latest', 'custom-test']) {
    const result = run('prod_local_start', {
      overrides: [`PROD_LOCAL_TAG=${tag}`],
      missingImages: [`redis-arm64:${tag}`],
    });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(
      result.commands.filter(({ args }) => args[1] === 'pull').map(({ args }) => args.at(-1)),
      [`ghcr.io/mahjongpantheon/pantheon-redis-arm64:${tag}`]
    );
    for (const command of result.commands.filter(({ args }) => args[0] === 'compose')) {
      assert.equal(command.tag, tag);
    }
  }
});

test('local startup follows container health through a slow install without a startup deadline', () => {
  const result = run('prod_local_start', { pending: 2 });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.commands.filter(
      ({ args }) => args[1] === 'inspect' && args.at(-1) === 'mimir.pantheon.internal'
    ).length,
    3
  );
  assert.ok(result.commands.some(({ args }) => args.includes('reverse_proxy_start')));
  const oldImage = run('prod_local_start', { health: 'missing' });
  assert.notEqual(oldImage.status, 0);
  assert.match(oldImage.stderr, /image has no production healthcheck/);
});

test('local startup returns with containers detached even when the log viewer spawns a plugin', () => {
  const result = run('prod_local_start', { nestedLogs: true });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.logsStopped, true);
  assert.equal(result.pluginRunning, false);
  assert.ok(result.commands.some(({ args }) => args[0] === 'log-plugin'));
  assert.ok(result.commands.some(({ args }) => args.includes('reverse_proxy_start')));
  assert.match(result.stdout, /containers remain running in the background/);
  const started = result.commands.findIndex(({ args }) => args.includes('up'));
  assert.ok(started >= 0);
  assert.ok(
    !result.commands
      .slice(started + 1)
      .some(({ args }) =>
        args.some((arg) => ['down', 'stop', 'kill', 'pantheon_stop'].includes(arg))
      )
  );
});

test('startup rechecks earlier healthy applications until every application is ready', () => {
  const result = run('prod_local_start', { pending: 1, regression: true });
  assert.equal(result.status, 0, result.stderr);
  for (const service of ['tyr', 'mimir']) {
    assert.equal(
      result.commands.filter(
        ({ args }) => args[1] === 'inspect' && args.at(-1) === `${service}.pantheon.internal`
      ).length,
      3
    );
  }
  const exited = run('prod_local_start', { state: 'exited' });
  assert.notEqual(exited.status, 0);
  assert.match(exited.stderr, /container startup failed/);
  assert.equal(exited.logsStopped, true);
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

for (const target of ['prod_start', 'prod_restart']) {
  test(`${target} initializes shared volume subdirectories before creating application containers`, () => {
    const result = run(target);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(result.commands[0].args, [
      'compose',
      '--env-file',
      'Env/.env.production',
      'run',
      '--rm',
      '--no-deps',
      'dependencies-init',
    ]);
    assert.ok(result.commands[1].args.includes('up'));
    const failed = run(target, { failure: 'run --rm --no-deps dependencies-init' });
    assert.notEqual(failed.status, 0);
    assert.equal(failed.commands.length, 1);
  });
}

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
