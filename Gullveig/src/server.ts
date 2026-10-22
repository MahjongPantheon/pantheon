import { createApp } from './app.js';

const port = Number(process.env.PORT ?? '4009');
const server = createApp();
server.listen(port, '127.0.0.1', () => {
  console.log(`Gullveig listening on port ${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => server.close());
}
