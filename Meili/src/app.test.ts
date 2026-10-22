import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { createApp } from './app.js';
import { loadLookup } from './geoip.js';

let server: ReturnType<typeof createApp>;
let url: string;
beforeAll(async () => {
  server = createApp(await loadLookup());
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Missing test server address');
  }
  url = `http://127.0.0.1:${address.port}`;
});
afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function post(payload: unknown, headers: Record<string, string> = {}) {
  // Forseti's fetch sends a string body without an application/json Content-Type.
  return fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
}

describe('Meili HTTP API', () => {
  it('serves Forseti country requests without a JSON Content-Type', async () => {
    const response = await post({ action: 'get_countries', ip: '' });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/json');
    const data = await response.json();
    expect(data.countries[0]).toEqual({ code: 'AF', name: 'Afghanistan' });
    expect(data.preferredByIp).toBe('');
  });

  it('serves timezones with the existing preferredByIp key', async () => {
    const response = await post({ action: 'get_timezones', ip: '81.2.69.142' });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.timezones).toContain('UTC');
    expect(data.preferredByIp).toBe('Europe/London');
  });

  it.each(['', null, undefined])('uses nginx peer information when ip is %s', async (ip) => {
    const response = await post({ action: 'get_countries', ip }, { 'X-Real-IP': '1.1.1.1' });
    expect((await response.json()).preferredByIp).toBe('AU');
  });

  it('gives an explicit IP precedence over nginx peer information', async () => {
    const response = await post(
      { action: 'get_countries', ip: '8.8.8.8' },
      { 'X-Real-IP': '1.1.1.1' }
    );
    expect((await response.json()).preferredByIp).toBe('US');
  });

  it('does not use the forwarded-for chain as a trusted address', async () => {
    const response = await post({ action: 'get_countries' }, { 'X-Forwarded-For': '8.8.8.8' });
    expect((await response.json()).preferredByIp).toBe('');
  });

  it('does not substitute the peer IP for an invalid explicit IP', async () => {
    const response = await post(
      { action: 'get_countries', ip: 'invalid' },
      { 'X-Real-IP': '8.8.8.8' }
    );
    expect((await response.json()).preferredByIp).toBe('');
  });

  it('preserves JSON null for unknown actions', async () => {
    const response = await post({ action: 'unknown', ip: '' });
    expect(response.status).toBe(200);
    expect(await response.json()).toBeNull();
  });

  it.each([null, [], {}, { action: 1 }, { action: 'get_countries', ip: 123 }])(
    'rejects invalid input %j',
    async (payload) => {
      const response = await post(payload);
      expect(response.status).toBe(400);
      expect(await response.json()).toHaveProperty('error');
    }
  );

  it('rejects malformed JSON', async () => {
    const response = await fetch(url, { method: 'POST', body: '{' });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid JSON' });
  });

  it('bounds request size', async () => {
    const response = await fetch(url, { method: 'POST', body: 'x'.repeat(1024 * 1024 + 1) });
    expect(response.status).toBe(400);
  });

  it('rejects unsupported methods', async () => {
    const response = await fetch(url);
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
  });
});
