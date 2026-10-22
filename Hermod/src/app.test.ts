import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from './app.js';
import { type Mail, HTML_LABEL, TEXT_LABEL } from './mail.js';
import { body, encoded, htmlText, plainText } from './tests/fixture.js';

let server: ReturnType<typeof createApp>;
let directory: string;
let url: string;
let cachePath: string;
let submitted: Mail[] = [];
let failSubmission = false;
beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), 'hermod-http-'));
  cachePath = join(directory, 'last-mail');
  server = createApp({
    actionKey: 'test-key',
    lastMailPath: cachePath,
    submit: async (mail) => {
      if (failSubmission) {
        throw new Error('sendmail failed');
      }
      submitted.push(mail);
    },
  });
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Missing test server address');
  }
  url = `http://127.0.0.1:${address.port}`;
});
beforeEach(async () => {
  submitted = [];
  failSubmission = false;
  await rm(cachePath, { force: true });
});
afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await rm(directory, { recursive: true, force: true });
});
function post(fields: Record<string, string>) {
  return fetch(url, { method: 'POST', body: new URLSearchParams(fields) });
}

describe('Hermod HTTP compatibility', () => {
  it('accepts Frey’s form-encoded request and returns the empty success body', async () => {
    const response = await post({ actionkey: 'test-key', data: encoded });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('');
    expect(submitted).toHaveLength(1);
    expect(submitted[0].body).toBe(body);
    expect(await readFile(cachePath, 'utf8')).toBe(body);
  });

  it.each(['', 'wrong'])('preserves the authentication error for key %s', async (actionkey) => {
    const response = await post({ actionkey, data: encoded });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('Action key check failed');
    expect(submitted).toHaveLength(0);
  });

  it('requires authentication for dumps too', async () => {
    const response = await post({ dump: 'true' });
    expect(await response.text()).toBe('Action key check failed');
  });

  it('preserves Fenrir’s dump form and CLI output format', async () => {
    await post({ actionkey: 'test-key', data: encoded });
    const response = await post({ actionkey: 'test-key', dump: 'true' });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(TEXT_LABEL + plainText + HTML_LABEL + htmlText);
    expect(submitted).toHaveLength(1);
  });

  it('returns an empty dump before any mail has been sent', async () => {
    const response = await post({ actionkey: 'test-key', dump: 'true' });
    expect(await response.text()).toBe('');
  });

  it('does not treat dump=0 as a dump request', async () => {
    const response = await post({ actionkey: 'test-key', dump: '0', data: encoded });
    expect(response.status).toBe(200);
    expect(submitted).toHaveLength(1);
  });

  it('rejects malformed mail without sending it', async () => {
    const response = await post({ actionkey: 'test-key', data: 'not-json' });
    expect(response.status).toBe(400);
    expect(submitted).toHaveLength(0);
  });

  it('returns an error and retains the previous mail if submission fails', async () => {
    await post({ actionkey: 'test-key', data: encoded });
    failSubmission = true;
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const response = await post({ actionkey: 'test-key', data: encoded });
      expect(response.status).toBe(500);
      expect(await readFile(cachePath, 'utf8')).toBe(body);
    } finally {
      log.mockRestore();
    }
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
