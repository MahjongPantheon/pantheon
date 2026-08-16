type ValuesOf<T extends Record<string, () => Promise<any>>> = {
  [K in keyof T]: T[K] extends () => Promise<infer U> ? U : never;
};

type ErrorsOf<T extends Record<string, () => Promise<any>>> = {
  [K in keyof T]: unknown;
};

interface RunWithLimitResult<T extends Record<string, () => Promise<any>>> {
  values: Partial<ValuesOf<T>>;
  errors: Partial<ErrorsOf<T>>;
}

/**
 * Runs a map of named promise-returning functions with a concurrency limit.
 * At most `limit` getters run at the same time. After a getter finishes,
 * that worker waits `timeout` ms before picking up the next getter.
 */
export async function runWithLimit<T extends Record<string, () => Promise<any>>>(
  getters: T,
  limit: number,
  timeout: number = 0
): Promise<RunWithLimitResult<T>> {
  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error('limit must be a positive number');
  }

  const keys = Object.keys(getters) as Array<keyof T>;

  const values: Partial<ValuesOf<T>> = {};
  const errors: Partial<ErrorsOf<T>> = {};

  let nextIndex = 0;

  const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  async function worker(): Promise<void> {
    while (true) {
      const currentIndex = nextIndex++;
      if (currentIndex >= keys.length) {
        return; // nothing left to pick up
      }

      const key = keys[currentIndex];
      const getter = getters[key]; // typed as T[typeof key], not `unknown`

      try {
        const value = await getter();
        values[key] = value as ValuesOf<T>[typeof key];
      } catch (error) {
        errors[key] = error as ErrorsOf<T>[typeof key];
      }

      if (timeout > 0 && nextIndex < keys.length) {
        await delay(timeout);
      }
    }
  }

  const workerCount = Math.min(limit, keys.length);
  const workers = Array.from({ length: workerCount }, () => worker());

  await Promise.all(workers);

  return { values, errors };
}
