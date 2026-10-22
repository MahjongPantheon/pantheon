import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { createApp } from './app.js';
import { MAX_AVATAR_SIZE } from './avatars.js';

let storage: string;
let server: ReturnType<typeof createApp>;
let url: string;

beforeAll(async () => {
  storage = await mkdtemp(join(tmpdir(), 'gullveig-'));
  server = createApp(storage);
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('No test server address');
  }
  url = `http://127.0.0.1:${address.port}`;
});
afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await rm(storage, { recursive: true, force: true });
});
beforeEach(async () => {
  await rm(join(storage, 'files'), { recursive: true, force: true });
});
afterEach(async () => {
  await rm(join(storage, 'files'), { recursive: true, force: true });
});

async function upload(payload: unknown) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
async function fixture(format: 'jpeg' | 'png' | 'gif') {
  const image = await sharp({
    create: { width: 256, height: 128, channels: 4, background: '#ff0000' },
  })
    .toFormat(format)
    .toBuffer();
  return `data:image/${format};base64,${image.toString('base64')}`;
}

describe('avatar HTTP uploads', () => {
  it.each(['jpeg', 'png', 'gif'] as const)('converts %s to a 128px JPEG', async (format) => {
    const response = await upload({ userId: 42, avatar: await fixture(format) });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    const metadata = await sharp(
      await readFile(join(storage, 'files/avatars/user_42.jpg'))
    ).metadata();
    expect(metadata).toMatchObject({ format: 'jpeg', width: 128, height: 128 });
    expect(await readdir(join(storage, 'files/avatars'))).toEqual(['user_42.jpg']);
  });

  it('crops the center and replaces an existing avatar', async () => {
    const raw = Buffer.alloc(384 * 128 * 3);
    for (let y = 0; y < 128; y++) {
      for (let x = 0; x < 384; x++) {
        raw[(y * 384 + x) * 3 + (x < 128 ? 0 : x < 256 ? 1 : 2)] = 255;
      }
    }
    const image = await sharp(raw, { raw: { width: 384, height: 128, channels: 3 } })
      .png()
      .toBuffer();
    await upload({ userId: 42, avatar: await fixture('png') });
    expect(
      (await upload({ userId: '42', avatar: `data:image/png;base64,${image.toString('base64')}` }))
        .status
    ).toBe(200);
    const pixel = await sharp(join(storage, 'files/avatars/user_42.jpg'))
      .resize(1, 1)
      .raw()
      .toBuffer();
    expect(pixel[0]).toBeLessThan(5);
    expect(pixel[1]).toBeGreaterThan(250);
    expect(pixel[2]).toBeLessThan(5);
  });

  it('supports Frey’s transparent GIF used for depersonalization', async () => {
    const response = await upload({
      userId: 42,
      avatar: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    });
    expect(response.status).toBe(200);
    const pixel = await sharp(join(storage, 'files/avatars/user_42.jpg'))
      .resize(1, 1)
      .raw()
      .toBuffer();
    expect([...pixel]).toEqual([0, 0, 0]);
  });

  it.each([
    null,
    {},
    { userId: '../42', avatar: '' },
    { userId: -1, avatar: '' },
    { userId: 1.5, avatar: '' },
    { userId: 42, avatar: 'data:image/svg+xml;base64,PHN2Zz4=' },
    { userId: 42, avatar: 'data:image/png;base64,aW52YWxpZA==' },
  ])('rejects invalid input %j', async (payload) => {
    const response = await upload(payload);
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('error');
    expect(await readdir(storage)).toEqual([]);
  });

  it('enforces the decoded 512KB limit', async () => {
    const response = await upload({
      userId: 42,
      avatar: `data:image/png;base64,${Buffer.alloc(MAX_AVATAR_SIZE + 1).toString('base64')}`,
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Max file size is 512KB' });
  });

  it('rejects malformed JSON', async () => {
    const response = await fetch(url, { method: 'POST', body: '{' });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid JSON' });
  });

  it('rejects requests larger than 1MB', async () => {
    const response = await fetch(url, { method: 'POST', body: 'x'.repeat(1024 * 1024 + 1) });
    expect(response.status).toBe(400);
  });

  it('does not report success when storage fails', async () => {
    await writeFile(join(storage, 'files'), 'blocked');
    const response = await upload({ userId: 42, avatar: await fixture('png') });
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Unable to store avatar' });
  });

  it('rejects unsupported methods', async () => {
    const response = await fetch(url);
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
  });
});
