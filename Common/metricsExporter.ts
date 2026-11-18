import { AsyncResource } from 'node:async_hooks';

type Metric = { m: string; v: number; s: string };
type PendingMetric = { url: string; metric: Metric };

const MAX_PENDING = 128;
const MAX_BATCH = 64;
const FLUSH_DELAY_MS = 100;
const TIMEOUT_MS = 1000;
const MAX_RESPONSE_BYTES = 16 * 1024;

// Create once at server startup, outside any request's AsyncLocalStorage context.
export function createMetricsExporter() {
  const scope = new AsyncResource('PantheonMetricsExporter');
  const pending = new Map<string, PendingMetric>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let busy = false;

  async function send(url: string, batch: Metric[]) {
    const controller = new AbortController();
    const deadline = setTimeout(() => controller.abort(), TIMEOUT_MS);
    deadline.unref();
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    try {
      const response = await fetch(url, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
        signal: controller.signal,
        redirect: 'error',
      });
      // Drain small acknowledgements (including error responses) for connection reuse.
      // Discard chunks rather than buffering an arbitrary response in memory.
      reader = response.body?.getReader();
      if (reader) {
        let size = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > MAX_RESPONSE_BYTES) {
            await reader.cancel();
            break;
          }
        }
      }
    } catch {
      // Telemetry is best effort: never retry or retain failed batches.
      controller.abort();
    } finally {
      reader?.releaseLock();
      clearTimeout(deadline);
    }
  }

  function schedule() {
    if (!busy && !timer && pending.size) {
      timer = setTimeout(() => void drain(), FLUSH_DELAY_MS);
      timer.unref();
    }
  }

  async function drain() {
    timer = undefined;
    const url = pending.values().next().value?.url;
    if (!url) return;
    busy = true;
    const batch: Metric[] = [];
    for (const [key, item] of pending) {
      if (item.url !== url) continue;
      batch.push(item.metric);
      pending.delete(key);
      if (batch.length === MAX_BATCH) break;
    }
    // Keep the slot until fetch AND body cleanup settle, even after aborting.
    await send(url, batch);
    busy = false;
    schedule();
  }

  return {
    record(url: string, metric: Metric): boolean {
      // Bound both entry count and string sizes, even for unexpected request URLs.
      if (
        url.length > 2048 ||
        metric.m.length > 256 ||
        !/^[a-zA-Z_:][a-zA-Z0-9_:]*$/.test(metric.m) ||
        metric.s.length > 64 ||
        !Number.isFinite(metric.v)
      )
        return false;
      const key = JSON.stringify([url, metric.m, metric.s]);
      if (!pending.has(key) && pending.size >= MAX_PENDING) return false;
      // Hugin stores gauges: only the latest pending sample for each key is needed.
      // Copy scalars so the queue never retains a caller's objects or request context.
      pending.set(key, { url, metric: { m: metric.m, v: metric.v, s: metric.s } });
      scope.runInAsyncScope(schedule);
      return true;
    },
  };
}
