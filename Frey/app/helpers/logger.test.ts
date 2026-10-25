import { Writable } from 'node:stream';
import { setImmediate } from 'node:timers/promises';
import { createLogger } from './logger';

it('logs request lifecycle events and exceptions on the supported Node runtime', async () => {
  const entries: string[] = [];
  const destination = new Writable({
    write(chunk, _encoding, callback) {
      entries.push(chunk.toString());
      callback();
    },
  });
  const logger = createLogger(destination);
  const error = new Error('request failed');

  logger.info({ method: 'Authorize' }, 'Request received');
  logger.info({ method: 'Authorize' }, 'Response sent');
  logger.error({ method: 'Authorize', err: error }, 'Request errored');
  logger.error({ origin: 'uncaughtException', err: error }, 'Uncaught exception');
  // The previous logger crashed in a next-tick callback while formatting these messages.
  await setImmediate();

  expect(entries.map((entry) => JSON.parse(entry))).toEqual([
    expect.objectContaining({ method: 'Authorize', msg: 'Request received' }),
    expect.objectContaining({ method: 'Authorize', msg: 'Response sent' }),
    expect.objectContaining({
      method: 'Authorize',
      msg: 'Request errored',
      err: expect.objectContaining({ message: 'request failed', stack: error.stack }),
    }),
    expect.objectContaining({
      origin: 'uncaughtException',
      msg: 'Uncaught exception',
      err: expect.objectContaining({ message: 'request failed', stack: error.stack }),
    }),
  ]);
});
