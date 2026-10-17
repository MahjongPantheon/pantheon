import cron from 'node-cron';
import { jobNames } from './jobs.js';
import { JobScheduler } from './scheduler.js';

const scheduler = new JobScheduler();
const tasks = jobNames.map((name) =>
  cron.schedule(
    '* * * * *',
    async () => {
      try {
        await scheduler.run(name);
      } catch (error) {
        console.error(JSON.stringify({ job: name, status: 'failed', error: String(error) }));
      }
    },
    { name, noOverlap: true }
  )
);

let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  tasks.forEach((task) => task.stop());
  await scheduler.stop();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
