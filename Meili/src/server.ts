import { createApp } from './app.js';
import { loadLookup } from './geoip.js';

const lookup = await loadLookup();
const port = Number(process.env.PORT ?? '4012');
const server = createApp(lookup);
server.listen(port, '127.0.0.1', () => {
  console.log(`Meili listening on port ${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => server.close());
}
