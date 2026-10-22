import { sql, type Selectable } from 'kysely';
import type { HuginData } from 'tsclients/proto/hugin.pb.js';
import { DIMENSIONS, type Dimension, type Database, type Aggregate } from './schema.js';
import { calendar, moment, timestamp, TIMEZONE } from './time.js';

export const dataKey = (dimension: Dimension) =>
  dimension === 'event_type' ? 'eventType' : dimension;
export function emptyData(siteId: string, datetime: string): HuginData {
  return {
    siteId,
    datetime,
    eventCount: 0,
    uniqCount: 0,
    country: '[]',
    city: '[]',
    browser: '[]',
    os: '[]',
    device: '[]',
    screen: '[]',
    language: '[]',
    eventType: '[]',
    hostname: '',
  };
}

// PostgreSQL performs counting/grouping; raw event rows and metadata never leave the DB.
export async function collectEvents(
  db: Database,
  from: string,
  to?: string,
  hourly = false
): Promise<HuginData[]> {
  const bucket = hourly
    ? sql`to_char(created_at AT TIME ZONE 'UTC' AT TIME ZONE ${TIMEZONE}, 'HH24')`
    : sql`''`;
  const period = sql`WITH period AS (SELECT site_id, session_id, ${bucket} AS bucket, ${sql.join(DIMENSIONS.map((key) => sql.ref(key)))} FROM event WHERE created_at ${hourly ? sql`>` : sql`>=`} ${from} ${to ? sql`AND created_at < ${to}` : sql``})`;
  const totals = await sql<{
    site_id: string;
    bucket: string;
    events: string;
    uniqs: string;
  }>`${period} SELECT site_id, bucket, count(*) AS events, count(DISTINCT session_id) AS uniqs FROM period GROUP BY site_id, bucket ORDER BY site_id, bucket`.execute(
    db
  );
  const counts = await sql<{
    site_id: string;
    bucket: string;
    key: Dimension;
    value: string;
    count: string;
  }>`${period} SELECT site_id, bucket, dim.key, dim.value, count(*) AS count FROM period CROSS JOIN LATERAL jsonb_each_text(jsonb_build_object(${sql.join(DIMENSIONS.map((key) => sql`${key}::text, coalesce(${sql.ref(key)}, '')`))})) AS dim GROUP BY site_id, bucket, dim.key, dim.value`.execute(
    db
  );
  const groups = new Map<string, HuginData>();
  const histograms = new Map<string, Partial<Record<Dimension, Record<string, number>>>>();
  const groupKey = (site: string, hour: string) => JSON.stringify([site, hour]);
  for (const row of totals.rows) {
    groups.set(groupKey(row.site_id, row.bucket), {
      ...emptyData(row.site_id, row.bucket),
      eventCount: Number(row.events),
      uniqCount: Number(row.uniqs),
    });
  }
  for (const row of counts.rows) {
    if (hourly && (!row.value || row.value === '0' || row.key === 'hostname')) continue;
    const key = groupKey(row.site_id, row.bucket);
    const group = histograms.get(key) ?? {};
    const values = group[row.key] ?? (Object.create(null) as Record<string, number>);
    values[row.value] = Number(row.count);
    group[row.key] = values;
    histograms.set(key, group);
  }
  for (const [key, group] of histograms) {
    const data = groups.get(key);
    if (!data) continue;
    for (const dimension of DIMENSIONS) {
      if (group[dimension]) data[dataKey(dimension)] = JSON.stringify(group[dimension]);
    }
  }
  return [...groups.values()];
}

export function aggregateData(
  row: Selectable<Aggregate> & { day?: string; month?: string }
): HuginData {
  const data = emptyData(
    row.site_id,
    row.day ? calendar(moment.utc(row.day)).format('DD') : moment.utc(row.month).format('MM')
  );
  data.eventCount = row.event_count;
  data.uniqCount = row.uniq_count;
  for (const dimension of DIMENSIONS) data[dataKey(dimension)] = row[dimension] ?? '';
  return data;
}

export function reports(db: Database) {
  return {
    async GetLastDay() {
      return {
        data: await collectEvents(db, timestamp(moment().subtract(24, 'hours')), undefined, true),
      };
    },
    async GetLastMonth() {
      return {
        data: (
          await db
            .selectFrom('aggregate_day')
            .selectAll()
            .where('day', '>', timestamp(calendar().subtract(30, 'days')))
            .execute()
        ).map(aggregateData),
      };
    },
    async GetLastYear() {
      return {
        data: (
          await db
            .selectFrom('aggregate_month')
            .selectAll()
            .where('month', '>', timestamp(calendar().subtract(372, 'days')))
            .execute()
        ).map(aggregateData),
      };
    },
  };
}
