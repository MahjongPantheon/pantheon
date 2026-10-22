import type { Generated, Kysely } from 'kysely';

export const DIMENSIONS = [
  'country',
  'city',
  'browser',
  'os',
  'device',
  'screen',
  'language',
  'event_type',
  'hostname',
] as const;
export type Dimension = (typeof DIMENSIONS)[number];
export type Dimensions = Record<Dimension, string | null>;
export interface EventTable extends Dimensions {
  id: Generated<string>;
  site_id: string;
  session_id: string;
  created_at: string;
  event_id: number | null;
  event_meta: string | null;
}
export interface Aggregate extends Dimensions {
  id: Generated<number>;
  event_count: number;
  uniq_count: number;
  site_id: string;
}
export interface Schema {
  event: EventTable;
  sys_errors: { id: Generated<string>; source: string; created_at: string; error: string };
  aggregate_day: Aggregate & { day: string };
  aggregate_month: Aggregate & { month: string };
}
export type Database = Kysely<Schema>;
