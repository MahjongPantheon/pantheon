import { createDb } from './db.js';
import { createApp } from './app.js';
import { loadGeo } from './geo.js';
import { Ingest } from './ingest.js';
import { createMetrics } from './metrics.js';

const db = createDb();
const metrics = await createMetrics();
const ingest = new Ingest(db, await loadGeo());
const server = createApp(db, ingest, metrics);
const port = Number(process.env.PORT ?? '4008');
server.listen(port, '127.0.0.1', () => console.log(`Hugin listening on port ${port}`));
let closing = false;
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    if (closing) return;
    closing = true;
    const stopped = new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await ingest.close();
    await stopped;
    await Promise.all([metrics.close(), db.destroy()]);
  });
}
