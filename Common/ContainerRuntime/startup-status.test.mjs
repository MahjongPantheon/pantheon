import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { startupStatus, supervisorStatus } from './startup-status.mjs';

test('startup distinguishes dependency preparation, running services and permanent failures', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantheon-startup-'));
  const readyPath = join(root, 'ready');
  const failedPath = join(root, 'failed');
  try {
    const options = {
      readyPath,
      failedPath,
      supervisor: () => {
        throw new Error('not started');
      },
    };
    assert.equal(startupStatus('Mimir', options), 'preparing');
    writeFileSync(readyPath, '');
    for (const phase of ['starting', 'ready', 'failed']) {
      assert.equal(startupStatus('Mimir', { ...options, supervisor: () => phase }), phase);
    }
    writeFileSync(failedPath, '23');
    assert.equal(startupStatus('Mimir', options), 'failed');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('Supervisor readiness requires every program, including crons, to be running', () => {
  const running =
    'nginx RUNNING pid 1\nmimir:mimir_1 RUNNING pid 2\nmimir:mimir_cron RUNNING pid 3\n';
  assert.equal(
    supervisorStatus('Mimir', () => running),
    'ready'
  );
  for (const state of ['STARTING', 'BACKOFF', 'EXITED']) {
    assert.equal(
      supervisorStatus('Mimir', () =>
        running.replace('mimir:mimir_cron RUNNING', `mimir:mimir_cron ${state}`)
      ),
      'starting'
    );
  }
  for (const state of ['FATAL', 'STOPPED']) {
    assert.equal(
      supervisorStatus('Mimir', () => {
        throw { stdout: running.replace('mimir:mimir_cron RUNNING', `mimir:mimir_cron ${state}`) };
      }),
      'failed'
    );
  }
  assert.equal(
    supervisorStatus('Mimir', () => {
      throw new Error('connection refused');
    }),
    'starting'
  );
  assert.equal(
    supervisorStatus('Tyr', () => {
      throw new Error('no supervisor');
    }),
    'ready'
  );
});

test('production worker logs are visible and non-mail services do not launch missing rsyslogd', () => {
  for (const service of ['Mimir', 'Frey', 'Sigrun', 'Bragi', 'Skirnir', 'Gullveig', 'Meili']) {
    const source = readFileSync(
      new URL(`../../${service}/supervisord.conf`, import.meta.url),
      'utf8'
    );
    assert.ok(!source.includes('[program:rsyslog]'), service);
    for (const block of source.split(/(?=^\[)/m).filter((part) => part.startsWith('[program:'))) {
      assert.match(block, /stdout_logfile\s*= \/dev\/stdout/, service);
      assert.match(block, /stderr_logfile\s*= \/dev\/stderr/, service);
      assert.match(block, /stdout_logfile_maxbytes = 0/, service);
      assert.match(block, /stderr_logfile_maxbytes = 0/, service);
    }
  }
});

test('development ignores intentionally disabled production workers while requiring its watcher and cron', () => {
  const previousMode = process.env.PANTHEON_MODE;
  const previousWorkers = process.env.PANTHEON_PRODUCTION_WORKERS;
  try {
    process.env.PANTHEON_MODE = 'development';
    process.env.PANTHEON_PRODUCTION_WORKERS = 'false';
    const output =
      'nginx RUNNING pid 1\nmimir:mimir_1 STOPPED\nmimir:mimir_cron RUNNING pid 2\ndevelopment RUNNING pid 3\n';
    assert.equal(
      supervisorStatus('Mimir', () => output),
      'ready'
    );
    assert.equal(
      supervisorStatus('Mimir', () => output.replace('development RUNNING', 'development FATAL')),
      'failed'
    );
    assert.equal(
      supervisorStatus('Mimir', () => output.replace('mimir_cron RUNNING', 'mimir_cron STOPPED')),
      'failed'
    );
  } finally {
    if (previousMode === undefined) delete process.env.PANTHEON_MODE;
    else process.env.PANTHEON_MODE = previousMode;
    if (previousWorkers === undefined) delete process.env.PANTHEON_PRODUCTION_WORKERS;
    else process.env.PANTHEON_PRODUCTION_WORKERS = previousWorkers;
  }
});
