import { createDb } from './db.js';
import { aggregateDaily, aggregateMonthly, cleanupErrors } from './aggregation.js';
import { createMetrics } from './metrics.js';

const db = createDb();
try {
  switch (process.argv[2]) {
    case 'aggregate_daily':
      await aggregateDaily(db);
      break;
    case 'aggregate_monthly':
      await aggregateMonthly(db);
      break;
    case 'cleanup_errors':
      await cleanupErrors(db);
      break;
    case 'send_stats': {
      const count = await db
        .selectFrom('sys_errors')
        .select((eb) => eb.fn.countAll<string>().as('count'))
        .executeTakeFirstOrThrow();
      const metrics = await createMetrics();
      try {
        await metrics.update([{ m: 'sys_errors', v: Number(count.count), s: 'hugin' }]);
      } finally {
        await metrics.close();
      }
      break;
    }
    default:
      throw new Error('Unknown Hugin maintenance job');
  }
} finally {
  await db.destroy();
}
