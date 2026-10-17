export async function settleJobs<Results extends unknown[]>(jobs: {
  [Index in keyof Results]: () => Promise<Results[Index]>;
}): Promise<Results> {
  const results = await Promise.allSettled(jobs.map(async (job) => job()));
  const failure = results.find((result) => result.status === 'rejected');
  if (failure?.status === 'rejected') {
    throw failure.reason;
  }
  return results.map((result) => (result as PromiseFulfilledResult<unknown>).value) as Results;
}
