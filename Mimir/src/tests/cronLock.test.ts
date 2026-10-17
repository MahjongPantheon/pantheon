import { jest } from '@jest/globals';
import { MikroORM } from '@mikro-orm/postgresql';
import config from '../mikro-orm.config.js';
import { Repository } from '../services/Repository.js';
import { withJobLock } from '../../cron/runner.js';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JobScheduler } from '../../cron/scheduler.js';

const orm = await MikroORM.init(config());
afterAll(() => orm.close());

it('excludes another worker of the same type and releases the lock on commit', async () => {
  let release!: () => void;
  let started!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const acquired = new Promise<void>((resolve) => {
    started = resolve;
  });
  const first = withJobLock(Repository.instance({}, orm), 'metrics', async () => {
    started();
    await pending;
    return 1;
  });
  const handler = jest.fn<() => Promise<number>>().mockResolvedValue(2);
  try {
    await acquired;
    expect(await withJobLock(Repository.instance({}, orm), 'metrics', handler)).toEqual({
      status: 'skipped',
      processed: 0,
    });
    expect(handler).not.toHaveBeenCalled();
    expect(await withJobLock(Repository.instance({}, orm), 'achievements', handler)).toEqual({
      status: 'completed',
      processed: 2,
    });
  } finally {
    release();
    await first;
  }
  expect(await withJobLock(Repository.instance({}, orm), 'metrics', handler)).toEqual({
    status: 'completed',
    processed: 2,
  });
});

it('releases the lock after rollback so a later worker can retry', async () => {
  await expect(
    withJobLock(Repository.instance({}, orm), 'metrics', async () => {
      throw new Error('Worker failed');
    })
  ).rejects.toThrow('Worker failed');
  expect(await withJobLock(Repository.instance({}, orm), 'metrics', async () => 1)).toEqual({
    status: 'completed',
    processed: 1,
  });
});

it('starts an isolated worker that skips an already locked job and exits successfully', async () => {
  let output = '';
  const scheduler = new JobScheduler(20_000, 1000, (name) => {
    const child = spawn(
      process.execPath,
      ['--import', 'tsx', fileURLToPath(new URL('../../cron/worker.ts', import.meta.url)), name],
      { env: { ...process.env, TEST: 'true' } }
    );
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    return child;
  });
  try {
    await withJobLock(Repository.instance({}, orm), 'metrics', async () => {
      await scheduler.run('metrics');
      return 0;
    });
    expect(output).toContain('"status":"skipped","processed":0');
  } finally {
    await scheduler.stop();
  }
}, 30_000);
