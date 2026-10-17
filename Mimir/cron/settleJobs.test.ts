import { settleJobs } from './settleJobs.js';

it('waits for every started operation before reporting failure', async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let finished = false;
  let written = false;
  const error = new Error('Failed operation');
  const execution = settleJobs([
    async () => {
      throw error;
    },
    async () => {
      await pending;
      written = true;
    },
  ]).catch((failure) => {
    finished = true;
    return failure;
  });
  await Promise.resolve();
  await Promise.resolve();
  expect(finished).toBe(false);
  release();
  expect(await execution).toBe(error);
  expect(written).toBe(true);
});

it('settles asynchronous work even when another operation throws synchronously', async () => {
  let finished = false;
  await expect(
    settleJobs([
      () => {
        throw new Error('Invalid job arguments');
      },
      async () => {
        await Promise.resolve();
        finished = true;
      },
    ])
  ).rejects.toThrow('Invalid job arguments');
  expect(finished).toBe(true);
});

it('preserves result order for successful operations', async () => {
  expect(await settleJobs([async () => 1, async () => 'second'])).toEqual([1, 'second']);
});
