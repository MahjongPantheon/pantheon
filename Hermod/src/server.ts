import { createApp } from './app.js';

const key = process.env.MAIL_ACTION_KEY;
const actionKey = key === undefined || key === '' || key === '0' ? 'CHANGE_ME' : key;
const server = createApp({ actionKey });
const port = Number(process.env.PORT ?? '4007');
server.listen(port, '127.0.0.1', () => {
  console.log(`Hermod listening on port ${port}`);
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => server.close());
}
