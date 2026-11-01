import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const repository = fileURLToPath(new URL('../../', import.meta.url));

function run(args, options = {}) {
  const root = mkdtempSync(join(tmpdir(), 'pantheon-shortcuts-'));
  const workspace = join(root, 'workspace');
  // Exercise the real Bash scripts against a disposable checkout skeleton.
  // Environment preparation must never overwrite a developer's ignored files.
  const files = [
    'bin/pantheon',
    'bin/get_arch.sh',
    'bin/lib/tasks.sh',
    'Common/ContainerRuntime/service-tasks.sh',
    'Common/ContainerRuntime/wait-ready.sh',
    'Env/.env.e2e',
    'Database/tasks.sh',
    ...'Tyr Forseti Sigrun Bragi Frey Mimir Hugin Gullveig Meili Hermod Skirnir Fenrir'
      .split(' ')
      .map((service) => `${service}/tasks.sh`),
  ];
  for (const file of files) {
    mkdirSync(join(workspace, file, '..'), { recursive: true });
    writeFileSync(join(workspace, file), readFileSync(join(repository, file)), { mode: 0o755 });
  }
  const blocked = join(root, 'blocked-runners');
  mkdirSync(blocked);
  for (const name of ['make', 'just'])
    writeFileSync(join(blocked, name), '#!/bin/sh\necho Unexpected task runner >&2\nexit 99\n', {
      mode: 0o755,
    });
  const log = join(root, 'commands.jsonl');
  const stub = join(root, 'command.mjs');
  writeFileSync(log, '');
  writeFileSync(
    stub,
    `
import { appendFileSync, existsSync, readFileSync, writeFileSync, writeSync } from 'node:fs';
import { spawn } from 'node:child_process';
const args = process.argv.slice(2);
appendFileSync(process.env.TEST_LOG, JSON.stringify({ args, mode: process.env.PANTHEON_STACK_MODE,
  env: process.env.ENV_FILENAME, tag: process.env.IMAGE_TAG, menu: process.env.COMPOSE_MENU }) + '\\n');
if (process.env.TEST_FAIL && args.join(' ').includes(process.env.TEST_FAIL)) process.exit(23);
if (args[0] === 'runtime' && args[1] === 'image' && args[2] === 'inspect' &&
  JSON.parse(process.env.TEST_MISSING).some(suffix => args.at(-1).endsWith(suffix))) process.exit(1);
if (args[0] === 'runtime' && args[1] === 'inspect') {
  if (args.at(-1) === 'pantheon-reverse-proxy-container') process.exit(1);
  else if (args.join(' ').includes('io.pantheon.mode')) console.log(process.env.TEST_ACTUAL_MODE);
  else {
    const file = process.env.TEST_LOG + '.count';
    const count = existsSync(file) ? Number(readFileSync(file, 'utf8')) : 0;
    if (args.at(-1).startsWith('mimir.')) writeFileSync(file, String(count + 1));
    console.log(process.env.TEST_STATE + ':' + (count < Number(process.env.TEST_PENDING) ? 'unhealthy' : process.env.TEST_HEALTH));
  }
}
if (args[0] === 'compose' && args.includes('ps') && args.includes('-q')) console.log(args.at(-1));
if (args.includes('/var/www/html/Common/ContainerRuntime/startup-status.mjs')) console.log(process.env.TEST_PHASE);
if (args[0] === 'compose' && args.includes('logs')) {
  writeSync(1, 'mimir: installing dependencies\\n');
  writeSync(2, 'mimir: registry retry\\n');
  if (process.env.TEST_NESTED === 'true') spawn(process.execPath, [process.argv[1], 'log-child'], { stdio: 'inherit' });
  process.on('SIGTERM', () => { writeFileSync(process.env.TEST_LOG + '.stopped', ''); process.exit(0); });
  setInterval(() => {}, 1000);
}
if (args[0] === 'log-child') {
  writeFileSync(process.env.TEST_LOG + '.child', String(process.pid));
  process.on('SIGTERM', () => {});
  setInterval(() => {}, 1000);
}
`
  );
  const env = {
    ...process.env,
    PATH: `${blocked}:${process.env.PATH}`,
    CONTAINER_COMMAND: `${process.execPath} ${stub} runtime`,
    PANTHEON_COMPOSE_PROVIDER: `${process.execPath} ${stub} compose`,
    CONTAINER_ARCH: 'arm64',
    ENV_FILENAME: '.env.e2e',
    TEST_LOG: log,
    TEST_FAIL: options.fail ?? '',
    TEST_MISSING: JSON.stringify(options.missing ?? []),
    TEST_STATE: options.state ?? 'running',
    TEST_HEALTH: options.health ?? 'healthy',
    TEST_PHASE: options.phase ?? 'preparing',
    TEST_PENDING: String(options.pending ?? 0),
    TEST_NESTED: String(options.nested ?? false),
    TEST_ACTUAL_MODE: options.actualMode ?? 'source',
    COMPOSE_MENU: 'true',
  };
  delete env.MAKEFLAGS;
  delete env.MFLAGS;
  try {
    const result = spawnSync('bin/pantheon', args, {
      cwd: workspace,
      env,
      encoding: 'utf8',
      input: options.input ?? '',
      timeout: 30000,
    });
    const commands = readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
    let childRunning = false;
    if (existsSync(log + '.child')) {
      const status = spawnSync('ps', ['-p', readFileSync(log + '.child', 'utf8'), '-o', 'stat='], {
        encoding: 'utf8',
      });
      childRunning = status.status === 0 && !status.stdout.trim().startsWith('Z');
    }
    return { ...result, commands, logsStopped: existsSync(log + '.stopped'), childRunning };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
const has = (commands, part) => commands.some(({ args }) => args.join(' ').includes(part));
const index = (commands, part) => commands.findIndex(({ args }) => args.join(' ').includes(part));

test('release builds use all application production stages and build before switching', () => {
  const result = run(['local-prod', 'build', 'my-release']);
  assert.equal(result.status, 0, result.stderr);
  const build = result.commands.find(
    ({ args }) =>
      args.includes('build') && args[0] === 'compose' && args.includes('frey.pantheon.internal')
  );
  assert.ok(build.args.includes('compose.build.yaml'));
  assert.equal(build.args.filter((arg) => arg.endsWith('.pantheon.internal')).length, 13);
  assert.ok(index(result.commands, 'build -t') < result.commands.indexOf(build));
  assert.ok(result.commands.indexOf(build) < index(result.commands, 'up -d'));
  const failed = run(['local-prod', 'build'], { fail: 'compose.build.yaml' });
  assert.notEqual(failed.status, 0);
  assert.ok(!has(failed.commands, 'up -d'));
});

test('local startup never falls back to latest when local images are incomplete', () => {
  const result = run(['local-prod', 'local'], { missing: ['mimir-arm64:local-production'] });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Local image unavailable/);
  assert.ok(!has(result.commands, 'pull'));
  assert.ok(!has(result.commands, 'up -d'));
});

test('registry selection pulls explicitly and preserves one release tag for every operation', () => {
  const result = run(['local-prod', 'registry', 'abc123']);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(index(result.commands, 'pull') < index(result.commands, 'up -d'));
  for (const command of result.commands) {
    assert.equal(command.tag, 'abc123');
    assert.equal(command.mode, 'image');
    assert.equal(command.env, '.env.e2e');
  }
  const failed = run(['local-prod', 'registry', 'abc123'], { fail: 'pull' });
  assert.notEqual(failed.status, 0);
  assert.ok(!has(failed.commands, 'up -d'));
});

test('startup validates and initializes before creating containers, then warms both SSR services', () => {
  const result = run(['prod', 'start', 'abc123']);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(
    index(result.commands, 'config --quiet') <
      index(result.commands, 'run --rm --no-deps dependencies-init')
  );
  assert.ok(
    index(result.commands, 'run --rm --no-deps dependencies-init') < index(result.commands, 'up -d')
  );
  assert.ok(index(result.commands, 'ps --all -q') < index(result.commands, 'curl --fail'));
  const warmups = result.commands.filter(({ args }) => args.join(' ').includes('curl --fail'));
  assert.equal(warmups.length, 2);
  assert.ok(warmups[0].args.includes('sigrun.pantheon.internal'));
  assert.ok(warmups[1].args.includes('bragi.pantheon.internal'));
  assert.match(result.stdout, /installing dependencies/);
  assert.match(result.stderr, /registry retry/);
  assert.equal(result.logsStopped, true);
  for (const fail of ['config --quiet', 'run --rm --no-deps dependencies-init']) {
    const failed = run(['prod', 'start'], { fail });
    assert.notEqual(failed.status, 0);
    assert.ok(!has(failed.commands, 'up -d'));
  }
});

for (const operation of ['start', 'recreate', 'restart', 'update']) {
  test(`${operation} surfaces failed preparation and never warms an unready stack`, () => {
    const result = run(['prod', operation], { health: 'unhealthy', phase: 'failed' });
    assert.notEqual(result.status, 0);
    assert.ok(!has(result.commands, 'curl --fail'));
    assert.equal(result.logsStopped, true);
  });
}

test('restart keeps containers, while recreate adopts selected images', () => {
  const restart = run(['prod', 'restart']);
  assert.equal(restart.status, 0, restart.stderr);
  assert.ok(has(restart.commands, 'restart'));
  assert.ok(!has(restart.commands, 'up -d'));
  for (const options of [{ args: ['prod', 'recreate'] }]) {
    const result = run(options.args, options);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(has(result.commands, '--no-deps --force-recreate'));
  }
});

test('waiter tolerates slow preparation, checks all services and cleans up nested log followers', () => {
  const result = run(['prod', 'start'], { pending: 1, nested: true });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.logsStopped, true);
  assert.equal(result.childRunning, false);
  assert.ok(result.commands.filter(({ args }) => args.includes('ps')).length > 11);
  for (const state of ['exited', 'restarting']) {
    const failed = run(['prod', 'start'], { state });
    assert.notEqual(failed.status, 0);
    assert.equal(failed.logsStopped, true);
  }
});

test('failed warmup is propagated before success, including the second SSR service', () => {
  for (const service of ['sigrun', 'bragi']) {
    const result = run(['prod', 'start'], { fail: `Host: ${service}.pantheon.internal` });
    assert.notEqual(result.status, 0);
    if (service === 'sigrun') assert.ok(!has(result.commands, 'Host: bragi.pantheon.internal'));
  }
});

test('development starts watchers through Compose and detached startup waits for readiness', () => {
  const result = run(['dev', '--detach']);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(has(result.commands, 'up -d --build'));
  assert.ok(result.commands.every(({ args }) => !args.includes('compose.image.yaml')));
  assert.ok(!has(result.commands, 'killall'));
  assert.ok(!has(result.commands, 'curl --fail'));
  assert.ok(result.commands.some(({ args }) => args.includes('compose.local.yaml')));
});

test('attached development disables the interactive Compose shortcut menu', () => {
  const result = run(['dev']);
  assert.equal(result.status, 0, result.stderr);
  const startup = result.commands.find(({ args }) =>
    args.join(' ').includes('up --build --abort-on-container-failure')
  );
  assert.ok(startup);
  assert.equal(startup.menu, 'false');
});

test('source compilation is rejected against an image stack', () => {
  const result = run(['source-prod', 'compile'], { actualMode: 'image' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /requires source mode/);
  assert.ok(!has(result.commands, 'tasks.sh build'));
});

test('source compilation builds every application before recreating production workers', () => {
  const result = run(['source-prod', 'compile']);
  assert.equal(result.status, 0, result.stderr);
  const builds = result.commands.filter(({ args }) => args.join(' ').includes('tasks.sh build'));
  const prebuilts = result.commands.filter(({ args }) =>
    args.join(' ').includes('tasks.sh prebuild')
  );
  assert.equal(builds.length, 11);
  assert.equal(prebuilts.length, 11);
  const installs = result.commands.filter(({ args }) =>
    args.includes('/var/www/html/Common/ContainerRuntime/install-development.sh')
  );
  assert.equal(installs.length, 11);
  assert.ok(result.commands.indexOf(installs.at(-1)) < result.commands.indexOf(builds[0]));
  assert.ok(result.commands.indexOf(prebuilts.at(-1)) < index(result.commands, 'up -d'));
  assert.ok(result.commands.every(({ mode }) => mode === 'source'));
  const failed = run(['source-prod', 'compile'], { fail: 'tasks.sh build' });
  assert.notEqual(failed.status, 0);
  assert.ok(!has(failed.commands, 'up -d'));
  const installFailed = run(['source-prod', 'compile'], { fail: 'install-development.sh' });
  assert.notEqual(installFailed.status, 0);
  assert.ok(!has(installFailed.commands, 'tasks.sh build'));
});

test('stop includes the managed local proxy and optional tools while retaining volumes', () => {
  const result = run(['stop']);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(has(result.commands, 'compose.local.yaml'));
  assert.ok(has(result.commands, 'down --remove-orphans'));
  assert.ok(!has(result.commands, '--volumes'));
});

test('missing-container and command failures propagate through Bash tasks', () => {
  const result = run(['task', 'Frey', 'typecheck'], { fail: 'exec -T' });
  assert.notEqual(result.status, 0);
  assert.ok(has(result.commands, 'exec -T --workdir /var/www/html/Frey frey.pantheon.internal'));
});

test('lint runs every check after failure and records the failing container output', () => {
  const result = run(['lint', 'Frey', 'Mimir'], { fail: '/Frey/tasks.sh oxlint' });
  assert.notEqual(result.status, 0);
  for (const name of ['Frey', 'Mimir']) {
    for (const action of ['oxlint', 'oxfmt', 'typecheck'])
      assert.ok(has(result.commands, `/${name}/tasks.sh ${action}`));
  }
  assert.match(result.stderr, /Failed: frey_oxlint/);
});

test('unit orchestration continues after a failed suite and verbose selects the owning task', () => {
  const result = run(['test', '--verbose', 'Frey', 'Mimir'], {
    fail: '/Frey/tasks.sh test-verbose',
  });
  assert.notEqual(result.status, 0);
  assert.ok(has(result.commands, '/Mimir/tasks.sh test-verbose'));
  const all = run(['test']);
  assert.equal(all.status, 0, all.stderr);
  assert.equal(all.commands.filter(({ args }) => args.at(-1) === 'test').length, 10);
});

test('check runs tests after failed lint and rejects unknown services before execution', () => {
  const result = run(['check', 'Frey'], { fail: 'tasks.sh oxlint' });
  assert.notEqual(result.status, 0);
  assert.ok(has(result.commands, '/Frey/tasks.sh test'));
  const unknown = run(['lint', 'typo']);
  assert.notEqual(unknown.status, 0);
  assert.equal(unknown.commands.length, 0);
});

test('seed confirms before bootstrap and passes confirmation without changing NODE_ENV', () => {
  const denied = run(['seed'], { fail: 'tasks.sh confirm-seed' });
  assert.notEqual(denied.status, 0);
  assert.ok(!has(denied.commands, 'bootstrap-admin'));
  const accepted = run(['seed', 'tournament']);
  assert.equal(accepted.status, 0, accepted.stderr);
  assert.ok(index(accepted.commands, 'confirm-seed') < index(accepted.commands, 'bootstrap-admin'));
  assert.ok(
    has(
      accepted.commands,
      'SEED_CONFIRMED=1 su-exec user bash /var/www/html/Mimir/tasks.sh seed-tournament'
    )
  );
  assert.ok(!has(accepted.commands, 'NODE_ENV='));
});

test('destructive maintenance and imports require confirmation before any container operation', () => {
  for (const args of [
    ['maintenance', 'reset'],
    ['db', 'import'],
    ['backup', 'restore', 'abc123'],
  ]) {
    const denied = run(args, { input: 'n\n' });
    assert.notEqual(denied.status, 0);
    assert.equal(denied.commands.length, 0);
  }
});

test('database helpers run the owning Bash script even with older storage images', () => {
  const result = run(['db', 'export', '/tmp/export.tar.gz']);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(has(result.commands, 'db.pantheon.internal bash -s -- export'));
  assert.ok(
    has(
      result.commands,
      'cp db.pantheon.internal:/var/lib/postgresql/export.tar.gz /tmp/export.tar.gz'
    )
  );
});
