import { isJobName } from './jobs.js';
import { runWorker } from './runner.js';
import type { Options } from '@mikro-orm/postgresql';

export async function workerMain(config: Options) {
  const name = process.argv[2];
  try {
    if (!isJobName(name)) {
      throw new Error(`Unknown cron job: ${name}`);
    }
    await runWorker(name, config);
    process.exit(0);
  } catch (error) {
    console.error(JSON.stringify({ job: name, status: 'failed', error: String(error) }));
    process.exit(1);
  }
}
