import { settleJobs } from './settleJobs.js';
import { vi } from 'vitest';

it('bounds concurrency while preserving order and settling later work after a failure', async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let started = 0;
  let active = 0;
  let peak = 0;
  let finished = 0;
  const failure = new Error('First job failed');
  const execution = settleJobs(
    Array.from({ length: 7 }, (_, index) => async () => {
      started++;
      peak = Math.max(peak, ++active);
      await pending;
      active--;
      finished++;
      if (index === 0) throw failure;
      return index;
    }),
    2
  );
  const rejected = expect(execution).rejects.toBe(failure);
  try {
    expect(started).toBe(2);
    expect(finished).toBe(0);
  } finally {
    release();
    await rejected;
  }
  expect(peak).toBe(2);
  expect(finished).toBe(7);
});

it.each([0, -1, 1.5, NaN, Infinity])(
  'rejects invalid concurrency %s before starting jobs',
  async (limit) => {
    const job = vi.fn(async () => 1);
    await expect(settleJobs([job], limit)).rejects.toThrow('positive integer');
    expect(job).not.toHaveBeenCalled();
  }
);

it('handles an empty queue and preserves ordered results with a concurrency limit', async () => {
  expect(await settleJobs([], 2)).toEqual([]);
  expect(await settleJobs([async () => 1, async () => 'second', async () => 3], 1)).toEqual([
    1,
    'second',
    3,
  ]);
});

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
