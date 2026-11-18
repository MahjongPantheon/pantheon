// @vitest-environment node
import { EventEmitter } from 'node:events';
import { expect, it, vi } from 'vitest';
import { createServer, createSsrHandler } from './server.js';
import fs from 'node:fs';

const template =
  '<html><head><!--app-head--></head><body><!--app-html--><!--app-server-data--></body></html>';
const rendered = {
  helmet: '<title>Event</title>',
  styles: '<style>custom</style>',
  appHtml: '<div>Event</div>',
  serverData: '<script>window.initialData={}</script>',
  cookies: { add: { lng: 'en' }, remove: ['old'] },
};
function request() {
  const req = Object.assign(new EventEmitter(), { originalUrl: '/', cookies: {} });
  const res = Object.assign(new EventEmitter(), {
    destroyed: false,
    writableEnded: false,
    status: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    cookie: vi.fn(),
    clearCookie: vi.fn(),
    end: vi.fn(function () {
      this.writableEnded = true;
    }),
  });
  const next = vi.fn();
  return { req, res, next, run: (handler) => handler(req, res, next) };
}
function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

it('bounds active renders and the waiting queue, then admits queued work', async () => {
  const first = deferred();
  const second = deferred();
  const render = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  const handler = createSsrHandler(render, template, {
    SIGRUN_SSR_CONCURRENCY: 1,
    SIGRUN_SSR_QUEUE_SIZE: 1,
  });
  const one = request();
  const two = request();
  const excess = request();
  const pendingOne = one.run(handler);
  const pendingTwo = two.run(handler);
  await excess.run(handler);
  expect(excess.res.status).toHaveBeenCalledWith(503);
  expect(excess.res.set).toHaveBeenCalledWith({ 'Retry-After': '1' });
  expect(render).toHaveBeenCalledTimes(1);
  first.resolve(rendered);
  await pendingOne;
  await vi.waitFor(() => expect(render).toHaveBeenCalledTimes(2));
  second.resolve(rendered);
  await pendingTwo;
  expect(one.res.end).toHaveBeenCalledWith(
    expect.stringContaining('<title>Event</title><style>custom</style></head>')
  );
  expect(one.res.cookie).toHaveBeenCalledWith('lng', 'en', expect.anything());
  expect(one.res.clearCookie).toHaveBeenCalledWith('old', expect.anything());
  expect(one.res.listenerCount('close')).toBe(0);
  expect(one.req.listenerCount('aborted')).toBe(0);
});

it('removes disconnected queued requests and aborts active upstream work', async () => {
  let upstreamSignal;
  const render = vi.fn((_, __, { signal }) => {
    upstreamSignal = signal;
    return new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
  });
  const handler = createSsrHandler(render, template, {
    SIGRUN_SSR_CONCURRENCY: 1,
    SIGRUN_SSR_QUEUE_SIZE: 1,
  });
  const one = request();
  const two = request();
  const pendingOne = one.run(handler);
  const pendingTwo = two.run(handler);
  await vi.waitFor(() => expect(render).toHaveBeenCalledOnce());
  two.res.destroyed = true;
  two.res.emit('close');
  await pendingTwo;
  const three = request();
  const pendingThree = three.run(handler);
  expect(three.res.status).not.toHaveBeenCalledWith(503);
  three.res.destroyed = true;
  three.res.emit('close');
  one.res.destroyed = true;
  one.req.emit('aborted');
  await Promise.all([pendingOne, pendingThree]);
  expect(upstreamSignal.aborted).toBe(true);
  expect(two.res.end).not.toHaveBeenCalled();
});

it('times out queued and active requests without releasing an uncooperative renderer slot early', async () => {
  const work = deferred();
  const render = vi.fn().mockReturnValue(work.promise);
  const handler = createSsrHandler(render, template, {
    SIGRUN_SSR_CONCURRENCY: 1,
    SIGRUN_SSR_QUEUE_SIZE: 1,
    SIGRUN_SSR_TIMEOUT_MS: 20,
  });
  const one = request();
  const two = request();
  await Promise.all([one.run(handler), two.run(handler)]);
  expect(one.res.status).toHaveBeenCalledWith(504);
  expect(two.res.status).toHaveBeenCalledWith(504);
  const three = request();
  await three.run(handler);
  expect(three.res.status).toHaveBeenCalledWith(504);
  expect(render).toHaveBeenCalledOnce();
  work.resolve(rendered);
});

it('releases capacity after rendering errors and forwards them to Express', async () => {
  const error = new Error('Render failed');
  const render = vi.fn().mockRejectedValueOnce(error).mockResolvedValue(rendered);
  const handler = createSsrHandler(render, template, {
    SIGRUN_SSR_CONCURRENCY: 1,
    SIGRUN_SSR_QUEUE_SIZE: 0,
  });
  const one = request();
  await one.run(handler);
  expect(one.next).toHaveBeenCalledWith(error);
  const two = request();
  await two.run(handler);
  expect(two.res.status).toHaveBeenCalledWith(200);
});

it.each([
  { SIGRUN_SSR_CONCURRENCY: 0 },
  { SIGRUN_SSR_CONCURRENCY: 1.5 },
  { SIGRUN_SSR_QUEUE_SIZE: -1 },
  { SIGRUN_SSR_TIMEOUT_MS: 'invalid' },
])('rejects invalid SSR limits: %j', (env) => {
  expect(() => createSsrHandler(vi.fn(), template, env)).toThrow('Invalid SIGRUN_SSR_');
});

it('preserves legacy redirects and caches the HTML template when creating the production server', async () => {
  const original = fs.readFileSync;
  const read = vi.spyOn(fs, 'readFileSync');
  read.mockImplementation((filename, ...args) =>
    String(filename).endsWith('/dist/client/index.html') ? template : original(filename, ...args)
  );
  const routes = new Map();
  const middleware = [];
  const app = {
    use: (handler) => middleware.push(handler),
    get: (pattern, handler) => routes.set(pattern, handler),
  };
  try {
    expect(await createServer(app, { EXTERNAL_SIGRUN_URL: 'https://ratings.test' })).toBe(app);
    const cases = [
      ['/eid:eventId', '/event/42/info'],
      ['/eid:eventId/add-online', '/event/42/info'],
      ['/eid:eventId/last', '/event/42/games'],
      ['/eid:eventId/last/page/:page', '/event/42/games/page/3'],
      ['/eid:eventId/stat', '/event/42/order/rating'],
      ['/eid:eventId/stat/team', '/event/42/order/team'],
      ['/eid:eventId/user/:playerId', '/event/42/player/7'],
      ['/eid:eventId/game/:gameHash', '/event/42/game/hash'],
      ['/eid:eventId/timer', '/event/42/timer'],
      ['/eid:eventId/achievements', '/event/42/achievements'],
      ['/eid:eventId/achievements/:achievement', '/event/42/achievements'],
    ];
    for (const [pattern, path] of cases) {
      const redirect = vi.fn();
      routes.get(pattern)(
        { params: { eventId: 42, page: 3, playerId: 7, gameHash: 'hash' } },
        { redirect }
      );
      expect(redirect).toHaveBeenCalledWith(301, 'https://ratings.test' + path);
    }
    const send = vi.fn();
    routes.get('/robots.txt')({}, { send });
    expect(send).toHaveBeenCalledWith(expect.stringContaining('User-agent: MJ12bot'));
    const next = vi.fn();
    await middleware[0]({ url: '/event/42/info' }, {}, next);
    expect(next).toHaveBeenCalledOnce();
    expect(
      read.mock.calls.filter(([filename]) => String(filename).endsWith('/dist/client/index.html'))
    ).toHaveLength(1);
  } finally {
    read.mockRestore();
  }
});

it('enforces the elapsed budget even when synchronous rendering delays the timeout callback', async () => {
  let now = 0;
  const clock = vi.spyOn(Date, 'now').mockImplementation(() => now);
  try {
    const render = vi.fn(async () => {
      now = 21;
      return rendered;
    });
    const handler = createSsrHandler(render, template, { SIGRUN_SSR_TIMEOUT_MS: 20 });
    const page = request();
    await page.run(handler);
    expect(page.res.status).toHaveBeenCalledWith(504);
    expect(page.res.end).not.toHaveBeenCalledWith(expect.any(String));
  } finally {
    clock.mockRestore();
  }
});
