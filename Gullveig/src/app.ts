import { timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage } from 'node:http';
import { InvalidAvatar, uploadAvatar } from './avatars.js';

const MAX_BODY_SIZE = 1024 * 1024;

async function readPayload(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_SIZE) {
      request.resume();
      throw new InvalidAvatar('Max request size is 1MB');
    }
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new InvalidAvatar('Invalid JSON');
  }
}

export function createApp(
  storagePath = '/var/storage',
  uploadSecret = process.env.INTERNAL_QUERY_SECRET ?? ''
) {
  return createServer(async (request, response) => {
    if (request.method !== 'POST') {
      response.writeHead(405, { Allow: 'POST' }).end();
      return;
    }
    const supplied = request.headers['x-internal-query-secret'];
    if (
      !uploadSecret ||
      typeof supplied !== 'string' ||
      Buffer.byteLength(supplied) !== Buffer.byteLength(uploadSecret) ||
      !timingSafeEqual(Buffer.from(supplied), Buffer.from(uploadSecret))
    ) {
      request.resume();
      response.writeHead(403, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Upload authorization required' }));
      return;
    }
    try {
      await uploadAvatar(await readPayload(request), storagePath);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ ok: true }));
    } catch (error) {
      const invalid = error instanceof InvalidAvatar;
      if (!invalid) {
        console.error('Avatar upload failed', error);
      }
      response.writeHead(invalid ? 400 : 500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: invalid ? error.message : 'Unable to store avatar' }));
    }
  });
}
