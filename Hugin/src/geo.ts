import { open, type CityResponse, type CountryResponse } from 'maxmind';
import { isIP } from 'node:net';
import { resolve } from 'node:path';

export type GeoLookup = (address: string) => { country: string; city: string };
export async function loadGeo(): Promise<GeoLookup> {
  try {
    const [cities, countries] = await Promise.all([
      open<CityResponse>(resolve('bin/GeoLite2-City.mmdb')),
      open<CountryResponse>(resolve('bin/GeoLite2-Country.mmdb')),
    ]);
    return (address) => {
      const first = address.split(',')[0].trim();
      const ip = first.startsWith('::ffff:') ? first.slice(7) : first;
      if (!isIP(ip)) return { country: '', city: '' };
      return {
        country: countries.get(ip)?.country?.names?.en ?? '',
        city: cities.get(ip)?.city?.names?.en ?? '',
      };
    };
  } catch {
    console.error('GeoLite databases unavailable; analytics will omit location');
    return () => ({ country: '', city: '' });
  }
}
