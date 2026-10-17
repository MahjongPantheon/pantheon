export const jobNames = ['achievements', 'playerStats', 'metrics'] as const;
export type JobName = (typeof jobNames)[number];

export function isJobName(value: string | undefined): value is JobName {
  return jobNames.some((name) => name === value);
}

export const jobLockNamespace = 1346457172;
const jobLockKeys: Record<JobName, number> = { achievements: 1, playerStats: 2, metrics: 3 };

export function jobLockKey(name: JobName) {
  return jobLockKeys[name];
}
