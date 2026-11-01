import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { test } from 'node:test';

for (const fail of [false, true]) {
  test(
    `entrypoint blocks cron and Supervisor until source and dist installs finish (failure=${fail})`,
    { timeout: 20000 },
    async () => {
      const root = mkdtempSync(join(tmpdir(), 'pantheon-entrypoint-'));
      const bin = join(root, 'bin');
      const runtime = join(root, 'Common/ContainerRuntime');
      for (const directory of [bin, runtime, join(root, 'Mimir'), join(root, 'Mimir-dist')])
        mkdirSync(directory, { recursive: true });
      const ready = join(root, 'ready');
      const failed = join(root, 'failed');
      const services = join(root, 'services');
      for (const file of ['prepare.sh', 'install-dependencies.sh']) {
        writeFileSync(
          join(runtime, file),
          readFileSync(new URL(file, import.meta.url), 'utf8')
            .replaceAll('/var/www/html', root)
            .replaceAll('/run/pantheon-ready', ready)
            .replaceAll('/run/pantheon-startup-failed', failed),
          { mode: 0o755 }
        );
      }
      const entrypoint = readFileSync(new URL('../../Mimir/entrypoint.sh', import.meta.url), 'utf8')
        .replace('/etc/profile.d/external.sh', join(root, 'profile'))
        .replace('/prepare-service.sh', join(runtime, 'prepare.sh'));
      writeFileSync(join(root, 'entrypoint.sh'), entrypoint);
      for (const command of ['chown', 'node'])
        writeFileSync(join(bin, command), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
      writeFileSync(join(bin, 'su-exec'), '#!/bin/sh\nshift\nexec "$@"\n', { mode: 0o755 });
      for (const command of ['crond', 'supervisord'])
        writeFileSync(
          join(bin, command),
          `#!/bin/sh\ntest -f '${ready}' || exit 42\necho '${command}' >> '${services}'\n`,
          { mode: 0o755 }
        );
      writeFileSync(
        join(bin, 'pnpm'),
        `#!${process.execPath}
import { existsSync, writeFileSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { setTimeout } from 'node:timers/promises';
if (process.argv[2] === 'install') {
  const name = basename(process.cwd());
  const gate = join(process.env.TEST_ROOT, 'release-' + name);
  writeFileSync(join(process.env.TEST_ROOT, 'install-' + name), '');
  while (!existsSync(gate)) await setTimeout(10);
  if (readFileSync(gate, 'utf8') === 'fail') process.exit(23);
}
`,
        { mode: 0o755 }
      );
      const child = spawn('/bin/sh', [join(root, 'entrypoint.sh')], {
        env: {
          ...process.env,
          PATH: `${bin}:${process.env.PATH}`,
          PANTHEON_MODE: 'production',
          TEST_ROOT: root,
          npm_config_store_dir: join(root, 'store'),
        },
        stdio: ['ignore', 'ignore', 'pipe'],
      });
      const exited = once(child, 'exit');
      const waitFor = async (path) => {
        while (!existsSync(path)) {
          assert.equal(
            child.exitCode,
            null,
            'entrypoint exited before installation reached its gate'
          );
          await setTimeout(10);
        }
      };
      try {
        await waitFor(join(root, 'install-Mimir'));
        assert.equal(existsSync(ready), false);
        assert.equal(existsSync(services), false);
        writeFileSync(join(root, 'release-Mimir'), fail ? 'fail' : 'ok');
        if (!fail) {
          await waitFor(join(root, 'install-Mimir-dist'));
          assert.equal(existsSync(ready), false);
          assert.equal(existsSync(services), false);
          writeFileSync(join(root, 'release-Mimir-dist'), 'ok');
        }
        const [code] = await exited;
        assert.equal(code, fail ? 23 : 0);
        assert.equal(existsSync(ready), !fail);
        assert.equal(existsSync(failed), fail);
        assert.equal(existsSync(services), !fail);
        if (!fail) assert.equal(readFileSync(services, 'utf8'), 'crond\nsupervisord\n');
      } finally {
        if (child.exitCode === null) child.kill('SIGKILL');
        rmSync(root, { recursive: true, force: true });
      }
    }
  );
}
