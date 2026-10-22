import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import { createHash } from 'node:crypto';
import { getData, loadLookup, type Lookup } from './geoip.js';

let lookup: Lookup;
beforeAll(async () => {
  lookup = await loadLookup();
});

// Expected preferences captured from the PHP reader against the checked-in database.
const baseline = [
  {
    ip: '8.8.8.8',
    country: 'US',
    timezone: 'America/Chicago',
  },
  {
    ip: '1.1.1.1',
    country: 'AU',
    timezone: 'Australia/Sydney',
  },
  {
    ip: '81.2.69.142',
    country: 'GB',
    timezone: 'Europe/London',
  },
  {
    ip: '2001:4860:4860::8888',
    country: 'US',
    timezone: 'America/Chicago',
  },
  {
    ip: '127.0.0.1',
    country: '',
    timezone: '',
  },
  {
    ip: '::1',
    country: '',
    timezone: '',
  },
  {
    ip: 'invalid',
    country: '',
    timezone: '',
  },
];

describe('GeoLite database compatibility', () => {
  it.each(baseline)(
    'preserves country and timezone preferences for $ip',
    ({ ip, country, timezone }) => {
      expect(getData('get_countries', ip, lookup)?.preferredByIp).toBe(country);
      expect(getData('get_timezones', ip, lookup)?.preferredByIp).toBe(timezone);
    }
  );

  it('preserves the complete PHP country and timezone lists and their order', () => {
    const countryData = getData('get_countries', '', lookup);
    const timezoneData = getData('get_timezones', '', lookup);
    const countries = countryData && 'countries' in countryData ? countryData.countries : [];
    const timezones = timezoneData && 'timezones' in timezoneData ? timezoneData.timezones : [];
    expect(createHash('sha256').update(JSON.stringify(countries)).digest('hex')).toBe(
      '697387ac68a3bf91eebff4ade40674f5bc8a3828a32c9b1c7eb33b4b55d9459e'
    );
    expect(createHash('sha256').update(JSON.stringify(timezones)).digest('hex')).toBe(
      '8db47d138a8323af69d02a228de373aefc7f19e09bf44bca1014110e1bdb7db4'
    );
  });

  it('normalizes IPv4-mapped IPv6 addresses', () => {
    expect(getData('get_countries', '::ffff:8.8.8.8', lookup)?.preferredByIp).toBe('US');
  });

  it('still lists choices when the database cannot be opened', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const unavailable = await loadLookup('/nonexistent/meili/GeoLite2-City.mmdb');
      const data = getData('get_countries', '8.8.8.8', unavailable);
      expect(data?.preferredByIp).toBe('');
      expect(data?.countries?.length).toBeGreaterThan(200);
      expect(log).toHaveBeenCalledTimes(1);
    } finally {
      log.mockRestore();
    }
  });
});
