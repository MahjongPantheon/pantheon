// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
import { EventsGetEventsResponse } from 'tsclients/proto/mimir.pb';
import { ApiService } from './api';
import * as Mimir from 'tsclients/proto/mimir.pb';
import * as Frey from 'tsclients/proto/frey.pb';
import { GenericEventPayload, GenericSessionPayload } from 'tsclients/proto/atoms.pb';

// Browser telemetry is separate from the server's RPC transport.
vi.mock('./analytics', () => ({ Analytics: { LOAD_STARTED: 'load_started' } }));

const cases: Array<{
  rpc: string;
  call: (api: ApiService) => Promise<unknown>;
  decode: (bytes: Uint8Array) => unknown;
  expected: Record<string, unknown>;
}> = [
  {
    rpc: 'GetGameConfig',
    call: (api) => api.getGameConfig(42),
    decode: GenericEventPayload.decode,
    expected: { eventId: 42 },
  },
  {
    rpc: 'GetAllRegisteredPlayers',
    call: (api) => api.getAllPlayers(42),
    decode: Mimir.EventsGetAllRegisteredPlayersPayload.decode,
    expected: { eventIds: [42] },
  },
  {
    rpc: 'GetRatingTable',
    call: (api) => api.getRatingTable([42, 43], 'asc', 'name', true, 'from', 'to'),
    decode: Mimir.EventsGetRatingTablePayload.decode,
    expected: {
      eventIdList: [42, 43],
      order: 'asc',
      orderBy: 'name',
      onlyMinGames: true,
      dateFrom: 'from',
      dateTo: 'to',
    },
  },
  {
    rpc: 'AddOnlineReplay',
    call: (api) => api.addOnlineGame(42, 'replay'),
    decode: Mimir.GamesAddOnlineReplayPayload.decode,
    expected: { eventId: 42, link: 'replay' },
  },
  {
    rpc: 'GetEvents',
    call: (api) => api.getEvents(20, 40, 'club', true),
    decode: Mimir.EventsGetEventsPayload.decode,
    expected: { limit: 20, offset: 40, filter: 'club', filterUnlisted: true },
  },
  {
    rpc: 'GetEventsById',
    call: (api) => api.getEventsById([42, 43]),
    decode: Mimir.EventsGetEventsByIdPayload.decode,
    expected: { ids: [42, 43] },
  },
  {
    rpc: 'GetRecentPublicGames',
    call: (api) => api.getRecentPublicGames(),
    decode: Mimir.EventsGetRecentPublicGamesPayload.decode,
    expected: {},
  },
  {
    rpc: 'GetLastGames',
    call: (api) => api.getRecentGames(42, 10, 20),
    decode: Mimir.EventsGetLastGamesPayload.decode,
    expected: { eventIdList: [42], limit: 10, offset: 20, order: 'desc', orderBy: 'id' },
  },
  {
    rpc: 'GetGame',
    call: (api) => api.getGame('hash'),
    decode: GenericSessionPayload.decode,
    expected: { sessionHash: 'hash' },
  },
  {
    rpc: 'GetGamesSeries',
    call: (api) => api.getGameSeries(42),
    decode: GenericEventPayload.decode,
    expected: { eventId: 42 },
  },
  {
    rpc: 'GetPlayerStats',
    call: (api) => api.getPlayerStat([42], 7, 'from', 'to'),
    decode: Mimir.PlayersGetPlayerStatsPayload.decode,
    expected: { eventIdList: [42], playerId: 7, dateFrom: 'from', dateTo: 'to' },
  },
  {
    rpc: 'GetTimerState',
    call: (api) => api.getTimerState(42),
    decode: GenericEventPayload.decode,
    expected: { eventId: 42 },
  },
  {
    rpc: 'GetCurrentSeating',
    call: (api) => api.getSeating(42),
    decode: GenericEventPayload.decode,
    expected: { eventId: 42 },
  },
  {
    rpc: 'GetPlayer',
    call: (api) => api.getPlayer(7),
    decode: Mimir.PlayersGetPlayerPayload.decode,
    expected: { id: 7 },
  },
  {
    rpc: 'GetAchievements',
    call: (api) => api.getAchievements(42, ['bestHand']),
    decode: Mimir.EventsGetAchievementsPayload.decode,
    expected: { eventId: 42, achievementsList: ['bestHand'] },
  },
  {
    rpc: 'GetTablesState',
    call: (api) => api.getTablesState(42),
    decode: Mimir.EventsGetTablesStatePayload.decode,
    expected: { eventId: 42, omitLastRound: true },
  },
  {
    rpc: 'GetEventAdmins',
    call: (api) => api.getEventAdmins(42),
    decode: Frey.AccessGetEventAdminsPayload.decode,
    expected: { eventId: 42 },
  },
  {
    rpc: 'GetEventReferees',
    call: (api) => api.getEventReferees(42),
    decode: Frey.AccessGetEventRefereesPayload.decode,
    expected: { eventId: 42 },
  },
  {
    rpc: 'GetPersonalInfo',
    call: (api) => api.getPersonalInfo(7),
    decode: Frey.PersonsGetPersonalInfoPayload.decode,
    expected: { ids: [7] },
  },
  {
    rpc: 'GetOwnedEventIds',
    call: (api) => api.getOwnedEventIds(7),
    decode: Frey.AccessGetOwnedEventIdsPayload.decode,
    expected: { personId: 7 },
  },
  {
    rpc: 'GetSuperadminFlag',
    call: (api) => api.getSuperadminFlag(7),
    decode: Frey.AccessGetSuperadminFlagPayload.decode,
    expected: { personId: 7 },
  },
  {
    rpc: 'QuickAuthorize',
    call: (api) => api.quickAuthorize(),
    decode: Frey.AuthQuickAuthorizePayload.decode,
    expected: { personId: 7, authToken: 'token' },
  },
  {
    rpc: 'Authorize',
    call: (api) => api.authorize('person@example.test', 'password'),
    decode: Frey.AuthAuthorizePayload.decode,
    expected: { email: 'person@example.test', password: 'password' },
  },
];

it.each(cases)(
  'encodes $rpc through the request-local transport',
  async ({ call, rpc, decode, expected }) => {
    const upstream = vi.fn(async () => new Response(new ArrayBuffer(0)));
    vi.stubGlobal('fetch', upstream);
    const api = new ApiService('http://frey', 'http://mimir');
    api.setCredentials(7, 'token');
    api.setEventId(42);
    api.setAnalytics({ track: vi.fn() } as never);
    await call(api);
    const [url, request] = vi.mocked(fetch).mock.calls[0];
    expect(url).toMatch(new RegExp('/' + rpc + '$'));
    expect(decode(request!.body as Uint8Array)).toMatchObject(expected);
    expect(new Headers(request!.headers).get('X-Current-Person-Id')).toBe('7');
  }
);

it('avoids invalid identity lookups and keeps the achievement fallback', async () => {
  const api = new ApiService('http://frey', 'http://mimir');
  await expect(api.getPersonalInfo()).rejects.toBeUndefined();
  await expect(api.getOwnedEventIds()).rejects.toBeUndefined();
  expect(await api.getSuperadminFlag()).toBe(false);
  await expect(api.quickAuthorize()).rejects.toBeUndefined();
  api.setCredentials(0, '');
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')));
  expect(await api.getAchievements(42, [])).toMatchObject({
    achievements: [],
    players: [],
    lastUpdate: expect.any(String),
  });
});

afterEach(() => vi.unstubAllGlobals());

it('keeps credentials and headers separate across clients and simultaneous calls', async () => {
  const calls: Headers[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_, options) => {
      calls.push(options.headers);
      return new Response(
        new Uint8Array(EventsGetEventsResponse.encode({ events: [], total: 0 })).buffer
      );
    })
  );
  const first = new ApiService('http://frey', 'http://mimir');
  const second = new ApiService('http://frey', 'http://mimir');
  first.setCredentials(1, 'first');
  first.setEventId(42);
  second.setCredentials(2, 'second');
  second.setEventId(43);
  await Promise.all([
    first.getEvents(20, 0, '', true),
    second.getEvents(20, 0, '', true),
    first.getEvents(20, 20, '', true),
  ]);
  expect(calls.map((headers) => headers.get('X-Auth-Token'))).toEqual(['first', 'second', 'first']);
  expect(calls.map((headers) => headers.get('X-Current-Event-Id'))).toEqual(['42', '43', '42']);
  expect(calls[0]).not.toBe(calls[2]);
});

it('passes request cancellation through the RPC transport', async () => {
  const controller = new AbortController();
  vi.stubGlobal(
    'fetch',
    vi.fn(
      (_, options) =>
        new Promise((resolve, reject) => {
          options.signal.addEventListener('abort', () => reject(options.signal.reason), {
            once: true,
          });
        })
    )
  );
  const api = new ApiService('http://frey', 'http://mimir', controller.signal);
  api.setCredentials(0, '');
  const pending = api.getEvents(20, 0, '', true);
  controller.abort();
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(fetch).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ signal: controller.signal })
  );
});
