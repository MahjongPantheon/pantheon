import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

it.each([false, true])('selects the correct cron entry point (production=%s)', (production) => {
  const directory = mkdtempSync(join(tmpdir(), 'mimir-cron-'));
  try {
    const source = join(directory, 'Mimir');
    const dist = join(directory, 'Mimir-dist');
    const runtime = join(directory, 'Common/ContainerRuntime');
    const bin = join(directory, 'bin');
    for (const path of [source, dist, runtime, bin]) mkdirSync(path, { recursive: true });
    copyFileSync(new URL('../tasks.sh', import.meta.url), join(source, 'tasks.sh'));
    copyFileSync(
      new URL('../../Common/ContainerRuntime/service-tasks.sh', import.meta.url),
      join(runtime, 'service-tasks.sh')
    );
    writeFileSync(join(bin, 'node'), '#!/bin/sh\nprintf "%s\\n" "$PWD" "$*"\n', { mode: 0o755 });
    const output = execFileSync('bash', [join(source, 'tasks.sh'), 'cron'], {
      cwd: directory,
      env: {
        ...process.env,
        PATH: `${bin}:${process.env.PATH}`,
        PANTHEON_PRODUCTION_WORKERS: String(production),
      },
      encoding: 'utf8',
    });
    expect(output.trim().split('\n')).toEqual(
      production ? [dist, 'cron.js'] : [source, '--import tsx cron/cron.ts']
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
