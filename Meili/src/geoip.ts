import { isIP } from 'node:net';
import { resolve } from 'node:path';
import { open, type CityResponse } from 'maxmind';
import { countries } from './data/countries.js';
import { timezones } from './data/timezones.js';

export type Lookup = (ip: string) => CityResponse | null;

export async function loadLookup(
  databasePath = resolve('bin/GeoLite2-City.mmdb')
): Promise<Lookup> {
  try {
    // Each worker opens the database once and reuses its reader and lookup cache.
    const reader = await open<CityResponse>(databasePath);
    return (ip) => reader.get(ip);
  } catch (error) {
    // Like the PHP service, missing GeoIP data must not prevent listing choices.
    console.error('Unable to open GeoIP database; IP preferences are unavailable', error);
    return () => null;
  }
}

export function getData(action: string, address: string, lookup: Lookup) {
  // PHP returned JSON null for unsupported actions.
  if (action !== 'get_countries' && action !== 'get_timezones') {
    return null;
  }
  const ip = address.startsWith('::ffff:') ? address.slice(7) : address;
  let record: CityResponse | null = null;
  if (isIP(ip)) {
    record = lookup(ip);
  }
  if (action === 'get_countries') {
    return { countries, preferredByIp: record?.country?.iso_code?.toUpperCase() ?? '' };
  }
  return { timezones, preferredByIp: record?.location?.time_zone ?? '' };
}
