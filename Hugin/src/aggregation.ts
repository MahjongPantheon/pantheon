import { sql } from 'kysely';
import type { HuginData } from 'tsclients/proto/hugin.pb.js';
import { DIMENSIONS, type Database } from './schema.js';
import { calendar, moment, timestamp, TIMEZONE } from './time.js';
import { collectEvents, dataKey, emptyData } from './reports.js';

export function previousPeriod(
  kind: 'day' | 'month',
  now: moment.MomentInput = moment(),
  zone = TIMEZONE
) {
  const end = calendar(now, zone).startOf(kind);
  return { from: timestamp(end.clone().subtract(1, kind)), to: timestamp(end) };
}
export function mergeHistograms(values: (string | null)[]): string {
  const result: Record<string, number> = Object.create(null);
  for (const value of values) {
    const counts = value ? (JSON.parse(value) as Record<string, number>) : {};
    for (const [key, count] of Object.entries(counts))
      result[key] = (result[key] ?? 0) + Number(count);
  }
  return Object.keys(result).length ? JSON.stringify(result) : '[]';
}
function columns(data: HuginData) {
  return Object.fromEntries(DIMENSIONS.map((key) => [key, data[dataKey(key)]])) as Record<
    (typeof DIMENSIONS)[number],
    string
  >;
}
const updates = () =>
  Object.fromEntries(
    ['event_count', 'uniq_count', ...DIMENSIONS].map((key) => [key, sql.ref(`excluded.${key}`)])
  );

export async function aggregateDaily(db: Database, now?: moment.MomentInput) {
  const { from, to } = previousPeriod('day', now);
  await db
    .transaction()
    .setIsolationLevel('repeatable read')
    .execute(async (tx) => {
      const data = await collectEvents(tx, from, to);
      if (data.length) {
        await tx
          .insertInto('aggregate_day')
          .values(
            data.map((item) => ({
              day: from,
              site_id: item.siteId,
              event_count: item.eventCount,
              uniq_count: item.uniqCount,
              ...columns(item),
            }))
          )
          .onConflict((oc) => oc.columns(['day', 'site_id']).doUpdateSet(updates()))
          .execute();
      }
      // Delete only older data, after a successful upsert in the same transaction.
      await tx.deleteFrom('event').where('created_at', '<', from).execute();
    });
}
export async function aggregateMonthly(db: Database, now?: moment.MomentInput) {
  const { from, to } = previousPeriod('month', now);
  await db
    .transaction()
    .setIsolationLevel('repeatable read')
    .execute(async (tx) => {
      const days = await tx
        .selectFrom('aggregate_day')
        .selectAll()
        .where('day', '>=', from)
        .where('day', '<', to)
        .execute();
      const groups = new Map<string, typeof days>();
      for (const day of days) {
        const group = groups.get(day.site_id) ?? [];
        group.push(day);
        groups.set(day.site_id, group);
      }
      const data = [...groups].map(([siteId, rows]) => {
        const result = emptyData(siteId, '');
        for (const row of rows) {
          result.eventCount += row.event_count;
          result.uniqCount += row.uniq_count;
        }
        for (const dimension of DIMENSIONS)
          result[dataKey(dimension)] = mergeHistograms(rows.map((row) => row[dimension]));
        return {
          month: calendar(now).startOf('month').subtract(1, 'month').format('YYYY-MM-DD'),
          site_id: siteId,
          event_count: result.eventCount,
          uniq_count: result.uniqCount,
          ...columns(result),
        };
      });
      if (data.length)
        await tx
          .insertInto('aggregate_month')
          .values(data)
          .onConflict((oc) => oc.columns(['month', 'site_id']).doUpdateSet(updates()))
          .execute();
    });
}
export async function cleanupErrors(db: Database, now: moment.MomentInput = moment()) {
  const before = timestamp(calendar(now).startOf('day').subtract(2, 'days'));
  await db.deleteFrom('sys_errors').where('created_at', '<', before).execute();
  await sql`VACUUM sys_errors`.execute(db);
  await sql`VACUUM event`.execute(db);
}
