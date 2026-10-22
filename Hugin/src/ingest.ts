import type { Insertable } from 'kysely';
import { BatchWriter } from './batch.js';
import type { Database, EventTable, Schema } from './schema.js';
import type { GeoLookup } from './geo.js';
import { moment, timestamp } from './time.js';

export function analyticsRow(
  payload: unknown,
  address: string,
  lookup: GeoLookup
): Insertable<EventTable> | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, unknown>;
  const fields = ['s', 'si', 'h', 'o', 'd', 'sc', 'l', 't', 'b'] as const;
  if (
    fields.some(
      (key) =>
        typeof data[key] !== 'string' || !data[key] || (key !== 't' && data[key].length > 255)
    )
  )
    return null;
  const date = moment.utc(data.t as string, [moment.ISO_8601, 'YYYY-MM-DD HH:mm:ss'], true);
  if (!date.isValid()) return null;
  const eventType = data.e ? String(data.e) : 'page_view';
  if (eventType.length > 255) return null;
  const location = lookup(address);
  return {
    site_id: data.s as string,
    session_id: data.si as string,
    hostname: data.h as string,
    os: data.o as string,
    device: data.d as string,
    screen: data.sc as string,
    language: data.l as string,
    created_at: timestamp(date),
    event_type: eventType,
    event_meta: JSON.stringify(data.m ?? ''),
    event_id: null,
    browser: data.b as string,
    country: location.country,
    city: location.city,
  };
}

export class Ingest {
  private readonly events: BatchWriter<Insertable<EventTable>>;
  private readonly errors: BatchWriter<Insertable<Schema['sys_errors']>>;
  constructor(
    db: Database,
    private readonly geo: GeoLookup
  ) {
    this.events = new BatchWriter((rows) => db.insertInto('event').values(rows).execute());
    this.errors = new BatchWriter((rows) => db.insertInto('sys_errors').values(rows).execute());
  }
  async track(payload: unknown, address: string): Promise<string> {
    if (
      payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      'source' in payload &&
      typeof payload.error === 'string' &&
      typeof payload.source === 'string' &&
      payload.error &&
      /(Tyr|Forseti|Sigrun|Mimir|Frey) \[(twirp|common)\]/i.test(payload.source)
    ) {
      if (payload.source.length > 255) return 'malformed payload';
      await this.errors.enqueue({
        source: payload.source,
        error: payload.error,
        created_at: timestamp(),
      });
      return 'ok';
    }
    const row = analyticsRow(payload, address, this.geo);
    if (!row) return 'malformed payload';
    // Raw IPs never enter the database or Redis. Acknowledge only committed batches.
    await this.events.enqueue(row);
    return 'ok';
  }
  async close() {
    await Promise.all([this.events.close(), this.errors.close()]);
  }
}
