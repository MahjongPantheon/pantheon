import assert from 'node:assert/strict';
import { execFile, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { test } from 'node:test';

const execute = promisify(execFile);

for (const mode of ['development', 'production']) {
  test(`Hugin database readiness uses dependencies installed in ${mode} mode`, () => {
    const root = mkdtempSync(join(tmpdir(), 'pantheon-wait-db-'));
    try {
      // Deliberately omit the other directory's dependencies, as on fresh CI.
      const directory = mode === 'production' ? 'Hugin-dist' : 'Hugin';
      const pg = join(root, directory, 'node_modules/pg');
      mkdirSync(pg, { recursive: true });
      writeFileSync(
        join(pg, 'index.js'),
        `
exports.Client = class {
  async connect() { console.log('connected'); }
  async query(sql) { if (sql !== 'select 1') throw new Error(sql); }
  async end() { console.log('closed'); }
};
`
      );
      const script = join(root, 'wait-db.mjs');
      writeFileSync(
        script,
        readFileSync(new URL('wait-db.mjs', import.meta.url), 'utf8').replaceAll(
          '/var/www/html',
          root
        )
      );
      const result = spawnSync(process.execPath, [script, 'Hugin'], {
        encoding: 'utf8',
        env: { ...process.env, PANTHEON_MODE: mode },
      });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stdout, 'connected\nclosed\n');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
}

test(
  'shared dependency slots bound concurrent installers and release after failure',
  { timeout: 15000 },
  async () => {
    const root = mkdtempSync(join(tmpdir(), 'pantheon-install-slots-'));
    try {
      const helper = fileURLToPath(new URL('install-slot.sh', import.meta.url));
      const log = join(root, 'events');
      const results = await Promise.allSettled(
        Array.from({ length: 6 }, (_, index) =>
          execute(
            '/bin/sh',
            [
              '-c',
              '. "$1"; wait_install_slot "$2"; printf "start\\n" >> "$3"; sleep 0.1; printf "end\\n" >> "$3"; exit "$4"',
              'installer',
              helper,
              root,
              log,
              index === 0 ? '23' : '0',
            ],
            { timeout: 10000 }
          )
        )
      );
      assert.equal(results[0].status, 'rejected');
      assert.equal(results[0].reason.code, 23);
      for (const result of results.slice(1)) assert.equal(result.status, 'fulfilled');
      let active = 0;
      let maximum = 0;
      const events = readFileSync(log, 'utf8').trim().split('\n');
      assert.equal(events.length, 12);
      for (const event of events) {
        active += event === 'start' ? 1 : -1;
        maximum = Math.max(maximum, active);
        assert.ok(active >= 0 && active <= 2, events.join(','));
      }
      assert.equal(maximum, 2);
      assert.equal(active, 0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
);
