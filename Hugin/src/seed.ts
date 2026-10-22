import { createDb } from './db.js';
import { migrate } from './migrations.js';
import { Ingest } from './ingest.js';
import { DIMENSIONS } from './schema.js';
import { calendar, moment, timestamp } from './time.js';

if (process.env.NODE_ENV === 'production')
  throw new Error('Development seed is disabled in production');
const db = createDb();
const ingest = new Ingest(db, () => ({ country: '', city: '' }));
try {
  await migrate(db);
  await Promise.all(
    ['Tyr', 'Forseti', 'Sigrun'].flatMap((s) =>
      Array.from({ length: 24 }, (_, hour) =>
        ingest.track(
          {
            s,
            si: `hugin-demo-${hour % 4}`,
            h: 'example.invalid',
            o: 'Linux',
            d: 'desktop',
            sc: '1920x1080',
            l: 'en',
            t: moment.utc().subtract(hour, 'hours').toISOString(),
            b: 'firefox',
            e: 'page_view',
          },
          ''
        )
      )
    )
  );
  // Keep all three dashboard periods useful without deleting existing analytics.
  const dimensions = Object.fromEntries(DIMENSIONS.map((key) => [key, '{"demo":24}'])) as Record<
    (typeof DIMENSIONS)[number],
    string
  >;
  for (const site_id of ['Tyr', 'Forseti', 'Sigrun']) {
    const counts = { site_id, event_count: 24, uniq_count: 4, ...dimensions };
    await db
      .insertInto('aggregate_day')
      .values(
        Array.from({ length: 28 }, (_, index) => ({
          ...counts,
          day: timestamp(
            calendar()
              .startOf('day')
              .subtract(index + 1, 'days')
          ),
        }))
      )
      .onConflict((oc) => oc.columns(['day', 'site_id']).doNothing())
      .execute();
    await db
      .insertInto('aggregate_month')
      .values(
        Array.from({ length: 12 }, (_, index) => ({
          ...counts,
          month: calendar()
            .startOf('month')
            .subtract(index + 1, 'months')
            .format('YYYY-MM-DD'),
        }))
      )
      .onConflict((oc) => oc.columns(['month', 'site_id']).doNothing())
      .execute();
  }
} finally {
  await ingest.close();
  await db.destroy();
}
