export async function settleJobs<Results extends unknown[]>(
  jobs: { [Index in keyof Results]: () => Promise<Results[Index]> },
  concurrency = Math.max(jobs.length, 1)
): Promise<Results> {
  if (!Number.isSafeInteger(concurrency) || concurrency < 1) {
    throw new Error('Job concurrency must be a positive integer');
  }
  const results: PromiseSettledResult<unknown>[] = new Array(jobs.length);
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const index = next++;
      try {
        results[index] = { status: 'fulfilled', value: await jobs[index]() };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  }
  // Settle all operations before the caller can roll back its transaction.
  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
  const failure = results.find((result) => result.status === 'rejected');
  if (failure?.status === 'rejected') {
    throw failure.reason;
  }
  return results.map((result) => (result as PromiseFulfilledResult<unknown>).value) as Results;
}
