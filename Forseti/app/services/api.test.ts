import { ApiService } from './api';

// These tests exercise Meili HTTP responses; no Twirp transport is involved.
vi.mock('tsclients/proto/mimir.pb', () => ({}));
vi.mock('tsclients/proto/frey.pb', () => ({}));
vi.mock('tsclients/proto/hugin.pb', () => ({}));

afterEach(() => vi.unstubAllGlobals());

describe.each(['getCountries', 'getTimezones'] as const)('%s HTTP handling', (method) => {
  it('rejects an HTTP error without consuming its body as successful data', async () => {
    const json = vi.fn().mockResolvedValue({ error: 'Unavailable' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503, json }));
    await expect(new ApiService()[method]()).rejects.toThrow('HTTP 503');
    expect(json).not.toHaveBeenCalled();
  });

  it('preserves successful response data', async () => {
    const data =
      method === 'getCountries'
        ? { countries: [{ code: 'DE', name: 'Germany' }], preferredByIp: 'DE' }
        : { timezones: ['Europe/Berlin'], preferredById: 'Europe/Berlin' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => data }));
    await expect(new ApiService()[method]()).resolves.toEqual(data);
  });
});
