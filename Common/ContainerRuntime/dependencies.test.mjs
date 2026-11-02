import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

function prepare(
  service,
  {
    mode = 'production',
    failInstall = false,
    failMigration = false,
    prepareDevelopment = false,
    watch = false,
  } = {}
) {
  const root = mkdtempSync(join(tmpdir(), 'pantheon-dependencies-'));
  try {
    const runtime = join(root, 'Common/ContainerRuntime');
    const ready = join(root, 'ready');
    const failed = join(root, 'failed');
    writeFileSync(ready, 'previous startup');
    const bin = join(root, 'bin');
    mkdirSync(runtime, { recursive: true });
    mkdirSync(bin);
    for (const directory of [service, `${service}-dist`]) {
      mkdirSync(join(root, directory, 'node_modules/.pnpm-store'), { recursive: true });
      mkdirSync(join(root, directory, 'node_modules/.pnpm'), { recursive: true });
      writeFileSync(join(root, directory, 'node_modules/.pnpm/retained'), 'package');
    }
    for (const file of [
      'prepare.sh',
      'install-dependencies.sh',
      'prepare-development.sh',
      'install-development.sh',
    ]) {
      writeFileSync(
        join(runtime, file),
        readFileSync(new URL(file, import.meta.url), 'utf8')
          .replaceAll('/var/www/html', root)
          .replaceAll('/run/pantheon-ready', ready)
          .replaceAll('/run/pantheon-startup-failed', failed)
          .replaceAll('/etc/supervisor.d', join(root, 'supervisor'))
      );
    }
    const log = join(root, 'commands.jsonl');
    writeFileSync(log, '');
    const stub = join(bin, 'command.mjs');
    writeFileSync(
      stub,
      `
import { appendFileSync } from 'node:fs';
const args = process.argv.slice(2);
appendFileSync(process.env.COMMAND_LOG, JSON.stringify({
  args, directory: process.cwd(), ci: process.env.CI, home: process.env.HOME,
  cache: process.env.XDG_CACHE_HOME,
}) + '\\n');
if (args[0] === 'pnpm' && args[1] === 'install') {
  process.stdout.write('pnpm: resolved 100 packages\\n');
  if (process.env.FAIL_INSTALL === 'true') {
    process.stderr.write('pnpm: dependency installation failed\\n');
    process.exit(23);
  }
}
if (process.env.FAIL_MIGRATION === 'true' && args.some(arg => arg === 'migration:up' || arg.endsWith('/migrate.ts') || arg === 'migrate.js' || arg === 'migrate')) process.exit(24);
`
    );
    for (const command of ['chown', 'pnpm', 'node', 'bash']) {
      writeFileSync(
        join(bin, command),
        `#!/bin/sh\nexec '${process.execPath}' '${stub}' ${command} "$@"\n`,
        { mode: 0o755 }
      );
    }
    writeFileSync(join(bin, 'su-exec'), '#!/bin/sh\nshift\nexec "$@"\n', { mode: 0o755 });
    const result = spawnSync('/bin/sh', [join(runtime, 'prepare.sh'), service], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${bin}:${process.env.PATH}`,
        PANTHEON_MODE: mode,
        PANTHEON_PREPARE_DEVELOPMENT: String(prepareDevelopment),
        PANTHEON_DEV_WATCH: String(watch),
        COMMAND_LOG: log,
        FAIL_INSTALL: String(failInstall),
        FAIL_MIGRATION: String(failMigration),
        npm_config_store_dir: join(root, 'dependencies/store'),
      },
    });
    const commands = readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
    const legacyStores = [service, `${service}-dist`].map((directory) =>
      existsSync(join(root, directory, 'node_modules/.pnpm-store'))
    );
    const virtualStores = [service, `${service}-dist`].map((directory) =>
      existsSync(join(root, directory, 'node_modules/.pnpm/retained'))
    );
    return {
      ...result,
      commands,
      root,
      legacyStores,
      virtualStores,
      ready: existsSync(ready),
      failed: existsSync(failed),
      watcher: existsSync(join(root, 'supervisor/development.conf'))
        ? readFileSync(join(root, 'supervisor/development.conf'), 'utf8')
        : '',
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

for (const service of [
  'Frey',
  'Mimir',
  'Hugin',
  'Hermod',
  'Gullveig',
  'Meili',
  'Skirnir',
  'Bragi',
  'Sigrun',
]) {
  test(`${service} installs locked dependencies before production startup`, () => {
    const { status, stdout, stderr, commands, root, ready, failed } = prepare(service);
    assert.equal(status, 0, stderr);
    assert.match(stdout, /pnpm: resolved 100 packages/);
    assert.ok(stdout.includes(`${service}-dist: installing dependencies`));
    assert.ok(stdout.includes(`${service}-dist: dependencies installed`));
    assert.equal(ready, true);
    assert.equal(failed, false);
    const installs = commands.filter(({ args }) => args[0] === 'pnpm' && args[1] === 'install');
    const source = ['Frey', 'Mimir'].includes(service);
    assert.deepEqual(
      installs.map(({ directory }) => directory),
      (source ? [service, `${service}-dist`] : [`${service}-dist`]).map((name) => join(root, name))
    );
    for (const [index, install] of installs.entries()) {
      assert.deepEqual(install.args, [
        'pnpm',
        'install',
        '--frozen-lockfile',
        '--reporter=append-only',
        '--force',
        '--store-dir',
        join(root, 'dependencies/store'),
        source && index === 0 ? '--prod=false' : '--prod',
      ]);
      assert.equal(install.ci, 'true');
      assert.equal(install.home, '/home/user');
      assert.equal(install.cache, join(root, 'dependencies/cache'));
    }
    const configure = commands.findIndex(({ args }) => args[1]?.endsWith('/configure.mjs'));
    assert.ok(configure > commands.indexOf(installs.at(-1)));
    if (['Frey', 'Mimir', 'Hugin'].includes(service)) {
      assert.ok(commands.findIndex(({ args }) => args[1]?.endsWith('/wait-db.mjs')) > configure);
      assert.equal(commands.at(-1).args[0], service === 'Hugin' ? 'node' : 'pnpm');
    }
  });
}

test('install failure stops startup before configuration or database migration', () => {
  const { status, stdout, stderr, commands, legacyStores, ready, failed } = prepare('Mimir', {
    failInstall: true,
  });
  assert.equal(status, 23);
  assert.match(stderr, /pnpm: dependency installation failed/);
  assert.ok(!stdout.includes('dependencies installed'));
  assert.equal(ready, false);
  assert.equal(failed, true);
  assert.deepEqual(legacyStores, [true, true]);
  assert.equal(
    commands.some(({ args }) => args[0] === 'node' || args[1] === 'exec'),
    false
  );
});

test('successful installation removes old package caches while retaining installed packages', () => {
  const { status, legacyStores, virtualStores } = prepare('Frey');
  assert.equal(status, 0);
  assert.deepEqual(legacyStores, [false, false]);
  assert.deepEqual(virtualStores, [true, true]);
});

for (const service of ['Frey', 'Mimir', 'Hugin']) {
  test(`${service} never reports ready after a failed migration`, () => {
    const { status, ready, failed } = prepare(service, { failMigration: true });
    assert.equal(status, 24);
    assert.equal(ready, false);
    assert.equal(failed, true);
  });
}

for (const service of ['Tyr', 'Forseti']) {
  test(`${service} serves static bundles without a dependency install`, () => {
    const { status, commands } = prepare(service);
    assert.equal(status, 0);
    assert.equal(
      commands.some(({ args }) => args[0] === 'pnpm'),
      false
    );
    assert.equal(commands.length, 1);
  });
}

test('development startup leaves dependency installation and migrations to development commands', () => {
  const { status, commands } = prepare('Mimir', { mode: 'development' });
  assert.equal(status, 0);
  assert.deepEqual(commands, []);
});

test('managed development installs locked source dependencies and migrates before starting its watcher', () => {
  const result = prepare('Frey', { mode: 'development', prepareDevelopment: true, watch: true });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.ready, true);
  const installs = result.commands.filter(
    ({ args }) => args[0] === 'pnpm' && args[1] === 'install'
  );
  assert.equal(installs.length, 1);
  assert.ok(installs[0].args.includes('--frozen-lockfile'));
  assert.ok(installs[0].args.includes('--prod=false'));
  assert.ok(installs[0].args.includes('--prefer-offline'));
  assert.ok(!installs[0].args.includes('--force'));
  assert.equal(installs[0].cache, join(result.root, 'dependencies/store/cache'));
  const refresh = result.commands.findIndex(({ args }) =>
    args[1]?.endsWith('/refresh-development-client.mjs')
  );
  assert.ok(refresh >= 0 && refresh < result.commands.indexOf(installs[0]));
  assert.equal(
    installs[0].args[installs[0].args.indexOf('--store-dir') + 1],
    join(result.root, 'dependencies/store')
  );
  const migration = result.commands.findIndex(({ args }) =>
    args.includes('app/database/migrate.ts')
  );
  assert.ok(migration > result.commands.indexOf(installs[0]));
  assert.match(result.watcher, /command = su-exec user bash .*\/Frey\/tasks.sh dev/);
  assert.match(result.watcher, /stopasgroup = true/);
  assert.match(result.watcher, /killasgroup = true/);
  assert.match(result.watcher, /stdout_logfile = \/dev\/stdout/);
});

for (const failure of ['failInstall', 'failMigration']) {
  test(`development never launches watchers after ${failure}`, () => {
    const result = prepare('Frey', {
      mode: 'development',
      prepareDevelopment: true,
      watch: true,
      [failure]: true,
    });
    assert.notEqual(result.status, 0);
    assert.equal(result.ready, false);
    assert.equal(result.failed, true);
    assert.equal(result.watcher, '');
  });
}

test('source tooling prepares dependencies and migrations without launching development watchers', () => {
  const result = prepare('Hugin', { mode: 'development', prepareDevelopment: true });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.ready, true);
  assert.equal(result.watcher, '');
  assert.ok(result.commands.some(({ args }) => args.includes('src/migrate.ts')));
});
