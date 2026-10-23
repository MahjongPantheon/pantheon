// @vitest-environment node
import { createServer } from 'node:http';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createGameApi } from './game-api.js';

const sessionHash = '750cd6015c59aed57ebd9260d03fb80adb3b83f7';
const servers = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise((resolve) => {
          server.close(resolve);
        })
    )
  );
});

async function request(backend, path = `/api/game/${sessionHash}`, options) {
  const handler = createGameApi({ VITE_MIMIR_URL_SSR: 'http://mimir.test/' }, backend);
  const server = createServer((req, res) => {
    void handler(req, res, () => {
      res.end('page');
    });
  });
  servers.push(server);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  return fetch(`http://127.0.0.1:${server.address().port}${path}`, options);
}

function fixture(finished = false) {
  const overview = {
    id: 123,
    nextRoundToken: 'secret',
    eventId: 19,
    players: [{ id: 1, title: 'Alice', score: 32000, email: 'private@example.com' }],
    state: { scores: [{ playerId: 1, score: 32000 }], finished },
    timerState: { started: true, timeRemaining: 120 },
  };
  const game = {
    sessionHash,
    players: [{ id: 1, title: 'Alice', phone: 'private' }],
    rounds: [{ draw: { roundIndex: 1, tempai: [1] } }],
    ...(finished
      ? { date: '2026-10-24 12:00:00', finalResults: [{ playerId: 1, score: 32000, place: 1 }] }
      : {}),
  };
  const backend = vi.fn().mockResolvedValueOnce(Response.json(overview));
  backend.mockResolvedValueOnce(Response.json({ game }));
  return { overview, game, backend };
}

describe('public game JSON endpoint', () => {
  test.each([false, true])('returns scores and game details (finished=%s)', async (finished) => {
    const { backend, game } = fixture(finished);
    const response = await request(backend, `/api/game/${sessionHash}?poll=1`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('cache-control')).toBe('no-store');
    const body = await response.json();
    expect(body).toMatchObject({
      sessionHash,
      eventId: 19,
      players: [{ id: 1, title: 'Alice', score: 32000 }],
      state: { finished, scores: [{ playerId: 1, score: 32000 }] },
      game: { sessionHash, rounds: game.rounds, finalResults: game.finalResults ?? [] },
    });
    expect(body).not.toHaveProperty('id');
    expect(body).not.toHaveProperty('nextRoundToken');
    expect(JSON.stringify(body)).not.toMatch(/secret|private/);
    expect(backend.mock.calls.map(([url]) => url)).toEqual([
      'http://mimir.test/v2/common.Mimir/GetSessionOverview',
      'http://mimir.test/v2/common.Mimir/GetGame',
    ]);
    expect(backend.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionHash }),
    });
  });

  test('restores protobuf defaults omitted in JSON', async () => {
    const { overview, backend } = fixture();
    delete overview.state.finished;
    backend.mockReset().mockResolvedValueOnce(Response.json(overview));
    backend.mockResolvedValueOnce(Response.json({ game: { sessionHash } }));
    const body = await (await request(backend)).json();
    expect(body.state).toMatchObject({ finished: false, honbaCount: 0, riichiCount: 0 });
    expect(body.game.rounds).toEqual([]);
  });

  test.each(['/api/game', '/api/game/', '/api/game/nope', `/api/game/${sessionHash}/extra`])(
    'rejects malformed hash: %s',
    async (path) => {
      const backend = vi.fn();
      const response = await request(backend, path);
      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe('invalid_argument');
      expect(backend).not.toHaveBeenCalled();
    }
  );

  test('returns JSON for unsupported methods', async () => {
    const backend = vi.fn();
    const response = await request(backend, undefined, { method: 'POST' });
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET');
    expect((await response.json()).error.code).toBe('method_not_allowed');
    expect(backend).not.toHaveBeenCalled();
  });

  test('maps an unknown session to 404', async () => {
    const backend = vi
      .fn()
      .mockResolvedValue(Response.json({ code: 'not_found' }, { status: 404 }));
    const response = await request(backend);
    expect(response.status).toBe(404);
    expect((await response.json()).error.code).toBe('not_found');
    expect(backend).toHaveBeenCalledTimes(1);
  });

  test.each([
    () => Promise.reject(new Error('private connection details')),
    () => Promise.reject(Object.assign(new Error('timeout'), { name: 'TimeoutError' })),
    () => Promise.resolve(Response.json({ code: 'internal', meta: 'private' }, { status: 500 })),
    () => Promise.resolve(new Response('not JSON')),
    () => Promise.resolve(Response.json({})),
  ])('hides backend failure details', async (backend) => {
    const response = await request(backend);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: { code: 'unavailable', message: 'Game data is temporarily unavailable.' },
    });
  });

  test('handles GetGame failure after a successful overview', async () => {
    const { overview } = fixture();
    const backend = vi.fn().mockResolvedValueOnce(Response.json(overview));
    backend.mockResolvedValueOnce(Response.json({ code: 'internal' }, { status: 500 }));
    const response = await request(backend);
    expect(response.status).toBe(502);
    expect((await response.json()).error.code).toBe('unavailable');
  });

  test('leaves page routes to the existing server', async () => {
    const backend = vi.fn();
    const response = await request(backend, `/event/19/game/${sessionHash}`);
    expect(await response.text()).toBe('page');
    expect(backend).not.toHaveBeenCalled();
  });
});
