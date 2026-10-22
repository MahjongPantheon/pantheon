import { createClient } from 'redis';

export const METRICS_KEY = 'hugin:node:gauges';
export type Metric = { m: string; v: number; s: string };
export function parseMetrics(input: unknown): Metric[] {
  if (
    !Array.isArray(input) ||
    input.some(
      (item) =>
        !item ||
        typeof item !== 'object' ||
        typeof item.m !== 'string' ||
        !/^[a-zA-Z_:][a-zA-Z0-9_:]*$/.test(item.m) ||
        typeof item.v !== 'number' ||
        !Number.isFinite(item.v) ||
        typeof item.s !== 'string'
    )
  )
    throw new Error('Invalid metrics payload');
  return input;
}
export function renderMetrics(values: Record<string, string>): string {
  const families = new Map<string, Metric[]>();
  for (const value of Object.values(values)) {
    const metric = JSON.parse(value) as Metric;
    const group = families.get(metric.m) ?? [];
    group.push(metric);
    families.set(metric.m, group);
  }
  const escape = (value: string) =>
    value.replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll('"', '\\"');
  return [...families]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, samples]) => {
      const prefix = `pantheon_${name}`;
      return (
        `# HELP ${prefix} \n# TYPE ${prefix} gauge\n` +
        samples
          .sort((a, b) => a.s.localeCompare(b.s))
          .map((item) => `${prefix}{service="${escape(item.s)}"} ${item.v}\n`)
          .join('')
      );
    })
    .join('');
}
export function redisOptions(env: NodeJS.ProcessEnv = process.env) {
  return {
    socket: {
      host: env.HUGIN_REDIS_HOST ?? env.REDIS_HOST ?? 'redis.pantheon.internal',
      port: Number(env.HUGIN_REDIS_PORT ?? '6379'),
    },
    username: env.HUGIN_REDIS_USER ?? 'redis',
    password: env.HUGIN_REDIS_PASSWORD ?? 'redispass',
  };
}
export async function createMetrics() {
  const client = createClient(redisOptions());
  client.on('error', () => console.error('Hugin metrics Redis connection error'));
  await client.connect();
  return {
    async update(input: unknown) {
      const metrics = parseMetrics(input);
      if (metrics.length)
        await client.hSet(
          METRICS_KEY,
          Object.fromEntries(
            metrics.map((item) => [JSON.stringify([item.m, item.s]), JSON.stringify(item)])
          )
        );
    },
    async render() {
      return renderMetrics(await client.hGetAll(METRICS_KEY));
    },
    async close() {
      await client.quit();
    },
  };
}
export type Metrics = Awaited<ReturnType<typeof createMetrics>>;
