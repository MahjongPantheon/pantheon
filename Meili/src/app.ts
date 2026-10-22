import { createServer, type IncomingMessage } from 'node:http';
import { getData, type Lookup } from './geoip.js';

class InvalidRequest extends Error {}

async function readPayload(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > 1024 * 1024) {
      request.resume();
      throw new InvalidRequest('Max request size is 1MB');
    }
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new InvalidRequest('Invalid JSON');
  }
}

export function createApp(lookup: Lookup) {
  return createServer(async (request, response) => {
    if (request.method !== 'POST') {
      response.writeHead(405, { Allow: 'POST' }).end();
      return;
    }
    try {
      const payload = await readPayload(request);
      if (
        !payload ||
        typeof payload !== 'object' ||
        !('action' in payload) ||
        typeof payload.action !== 'string'
      ) {
        throw new InvalidRequest('Invalid action');
      }
      const ip = 'ip' in payload ? payload.ip : '';
      if (ip !== null && typeof ip !== 'string') {
        throw new InvalidRequest('Invalid IP address');
      }
      // Nginx overwrites X-Real-IP with the connecting peer, matching PHP REMOTE_ADDR.
      // Never take the client-supplied X-Forwarded-For chain as a trusted address.
      const peer = request.headers['x-real-ip'];
      const address =
        ip !== null && ip !== ''
          ? ip
          : typeof peer === 'string'
            ? peer
            : (request.socket.remoteAddress ?? '');
      const result = getData(payload.action, address, lookup);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(result));
    } catch (error) {
      const invalid = error instanceof InvalidRequest;
      if (!invalid) {
        console.error('GeoIP request failed', error);
      }
      response.writeHead(invalid ? 400 : 500, { 'Content-Type': 'application/json' });
      response.end(
        JSON.stringify({ error: invalid ? error.message : 'Unable to retrieve GeoIP data' })
      );
    }
  });
}
