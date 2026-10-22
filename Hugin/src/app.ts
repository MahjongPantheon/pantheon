import { createServer, type IncomingMessage } from 'node:http';
import { createTwirpServer } from 'twirpscript';
import { createHugin } from 'tsclients/proto/hugin.pb.js';
import { reports } from './reports.js';
import type { Database } from './schema.js';
import type { Ingest } from './ingest.js';
import type { Metrics } from './metrics.js';
import { Busy } from './batch.js';

class InvalidPayload extends Error {}
async function readPayload(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > 1024 * 1024) {
      request.resume();
      throw new InvalidPayload('Max request size is 1MB');
    }
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}
export function createApp(db: Database, ingest: Ingest, metrics: Metrics) {
  const rpc = createTwirpServer([createHugin(reports(db))], { prefix: '/v2', debug: false });
  return createServer(async (request, response) => {
    const path = (request.url ?? '/').split('?')[0];
    try {
      if (path.startsWith('/v2/')) {
        rpc(request, response);
        return;
      }
      if (
        (path === '/metrics' || path === '/metrics/' || path === '/metrics/index.php') &&
        request.method === 'GET'
      ) {
        response.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
        response.end(await metrics.render());
        return;
      }
      if (request.method !== 'POST') {
        response.writeHead(405, { Allow: 'POST' }).end();
        return;
      }
      const payload = await readPayload(request);
      response.setHeader('Content-Type', 'text/plain; charset=utf-8');
      if (path === '/addMetric' || path === '/metrics/add.php') {
        try {
          await metrics.update(payload);
        } catch (error) {
          if (error instanceof Error && error.message === 'Invalid metrics payload')
            throw new InvalidPayload(error.message);
          throw error;
        }
        response.end('ok');
        return;
      }
      const forwarded = request.headers['x-forwarded-for'];
      response.end(
        await ingest.track(
          payload,
          typeof forwarded === 'string' ? forwarded : (request.socket.remoteAddress ?? '')
        )
      );
    } catch (error) {
      const status = error instanceof InvalidPayload ? 400 : error instanceof Busy ? 503 : 500;
      if (status === 500)
        console.error(
          'Hugin request failed',
          error instanceof Error ? error.message : 'Unknown error'
        );
      response
        .writeHead(status)
        .end(status === 500 ? 'Hugin request failed' : (error as Error).message);
    }
  });
}
