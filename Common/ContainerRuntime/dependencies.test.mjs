import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

function prepare(service, { mode = 'production', failInstall = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'pantheon-dependencies-'));
  try {
    const runtime = join(root, 'Common/ContainerRuntime');
    const bin = join(root, 'bin');
    mkdirSync(runtime, { recursive: true });
    mkdirSync(bin);
    for (const directory of [service, `${service}-dist`]) mkdirSync(join(root, directory));
    for (const file of ['prepare.sh', 'install-dependencies.sh']) {
      writeFileSync(
        join(runtime, file),
        readFileSync(new URL(file, import.meta.url), 'utf8').replaceAll('/var/www/html', root)
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
}) + '\\n');
if (args[0] === 'pnpm' && args[1] === 'install' && process.env.FAIL_INSTALL === 'true') process.exit(23);
`
    );
    for (const command of ['chown', 'pnpm', 'node']) {
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
        COMMAND_LOG: log,
        FAIL_INSTALL: String(failInstall),
      },
    });
    const commands = readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
    return { ...result, commands, root };
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
    const { status, stderr, commands, root } = prepare(service);
    assert.equal(status, 0, stderr);
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
        '--force',
        '--store-dir',
        'node_modules/.pnpm-store',
        source && index === 0 ? '--prod=false' : '--prod',
      ]);
      assert.equal(install.ci, 'true');
      assert.equal(install.home, '/home/user');
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
  const { status, commands } = prepare('Mimir', { failInstall: true });
  assert.equal(status, 23);
  assert.equal(
    commands.some(({ args }) => args[0] === 'node' || args[1] === 'exec'),
    false
  );
});

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
