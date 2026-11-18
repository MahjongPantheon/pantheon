// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
import { routes } from '../routes';
import { preloadRouteData, loadAuthData } from './routeData';
import type { ApiService } from './api';

const api = {
  setEventId: vi.fn(),
  getEvents: vi.fn(),
  getRecentPublicGames: vi.fn(),
  getEventsById: vi.fn(),
  getEventAdmins: vi.fn(),
  getEventReferees: vi.fn(),
  getRatingTable: vi.fn(),
  getAllPlayers: vi.fn(),
  getPlayer: vi.fn(),
  getPlayerStat: vi.fn(),
  getRecentGames: vi.fn(),
  getGame: vi.fn(),
  getGameSeries: vi.fn(),
  getSeating: vi.fn(),
  getAchievements: vi.fn(),
  getGameConfig: vi.fn(),
  quickAuthorize: vi.fn(),
  getSuperadminFlag: vi.fn(),
  getPersonalInfo: vi.fn(),
  getOwnedEventIds: vi.fn(),
};
const service = api as unknown as ApiService;
const signal = () => new AbortController().signal;

beforeEach(() => {
  for (const mock of Object.values(api)) mock.mockReset().mockResolvedValue([]);
  api.getEventsById.mockResolvedValue([{ id: 42, title: 'Event' }]);
});

it.each(routes)('preloads the registered route $path', async ({ path }) => {
  const values: Record<string, string> = {
    eventId: '42',
    playerId: '7',
    filter: 'Club',
    page: '2',
    orderBy: 'rating',
    minGamesSelector: 'min',
    dateFrom: '2026-01-01',
    dateTo: '2026-11-18',
    sessionHash: 'abc',
  };
  const url = path.replace(/:(\w+)/g, (_, name: string) => values[name]);
  const data = await preloadRouteData(url, service, null, signal());
  expect(data.Global_auth_).toEqual([false, false, null, []]);
  expect(Object.keys(data).some((key) => key.endsWith('__err'))).toBe(false);
  expect(Object.keys(data).length).toBeGreaterThan(2);
});

it('handles encoded filters, pagination and query strings the same as the router', async () => {
  const data = await preloadRouteData(
    '/filter/Some%20club/page/3?unused=1',
    service,
    null,
    signal()
  );
  expect(api.getEvents).toHaveBeenCalledWith(20, 40, 'Some club', true);
  expect(data).toHaveProperty('EventList_events_3_Some club');
  expect(api.getRecentPublicGames).not.toHaveBeenCalled();
});

it('preloads date-filtered aggregate ratings with the exact hydration key', async () => {
  const data = await preloadRouteData(
    '/event/42.43/order/avg_place/filter/min/from/2026-01-01/to/2026-11-18',
    service,
    null,
    signal()
  );
  expect(api.getRatingTable).toHaveBeenCalledWith(
    [42, 43],
    'asc',
    'avg_place',
    true,
    '2026-01-01',
    '2026-11-18'
  );
  expect(Object.keys(data)).toContain(
    'RatingTable_event_42.43_asc_avg_place_min_f2026-01-01_t2026-11-18'
  );
  expect(api.setEventId).not.toHaveBeenCalled();
});

it('loads registered players after resolving the event and preserves name sorting', async () => {
  api.getAllPlayers.mockResolvedValue([{ title: 'Zed' }, { title: 'Alice' }]);
  const data = await preloadRouteData('/event/42/playersList', service, null, signal());
  expect(api.getAllPlayers).toHaveBeenCalledWith(42);
  expect(data.RegisteredPlayers_event_42).toEqual([{ title: 'Alice' }, { title: 'Zed' }]);
});

it('preserves recoverable upstream failures and rejects aborted preloads', async () => {
  api.getEvents.mockRejectedValue(new Error('Offline'));
  const data = await preloadRouteData('/', service, null, signal());
  expect(data.EventList_events_1___err).toBeInstanceOf(Error);
  const controller = new AbortController();
  controller.abort();
  await expect(preloadRouteData('/', service, null, controller.signal)).rejects.toMatchObject({
    name: 'AbortError',
  });
});

it('settles each authentication result independently and handles missing routes', async () => {
  api.quickAuthorize.mockRejectedValue(new Error('Offline'));
  api.getSuperadminFlag.mockResolvedValue(true);
  api.getPersonalInfo.mockResolvedValue({ id: 7 });
  api.getOwnedEventIds.mockResolvedValue([42]);
  expect(await loadAuthData(service, 7)).toEqual([false, true, { id: 7 }, [42]]);
  const data = await preloadRouteData('/unknown', service, null, signal());
  expect(Object.keys(data)).toEqual(['Global_auth_']);
  expect(api.getEventsById).not.toHaveBeenCalled();
});

it('preloads authenticated layout data and tolerates each unavailable identity read', async () => {
  api.quickAuthorize.mockResolvedValue(true);
  api.getSuperadminFlag.mockResolvedValue(true);
  api.getPersonalInfo.mockResolvedValue({ id: 7 });
  api.getOwnedEventIds.mockResolvedValue([42]);
  expect((await preloadRouteData('/', service, 7, signal())).Global_auth_7).toEqual([
    true,
    true,
    { id: 7 },
    [42],
  ]);
  api.getSuperadminFlag.mockRejectedValue(new Error('Offline'));
  api.getPersonalInfo.mockRejectedValue(new Error('Offline'));
  api.getOwnedEventIds.mockRejectedValue(new Error('Offline'));
  expect(await loadAuthData(service, 7)).toEqual([true, false, null, []]);
});

it('handles missing event dependencies without requesting players or series', async () => {
  api.getEventsById.mockRejectedValue(new Error('Offline'));
  const players = await preloadRouteData('/event/42/playersList', service, null, signal());
  const series = await preloadRouteData('/event/42/seriesRating', service, null, signal());
  expect(players.RegisteredPlayers_event_undefined).toEqual([]);
  expect(series.SeriesRating_games_42).toBeNull();
  expect(api.getAllPlayers).not.toHaveBeenCalled();
  expect(api.getGameSeries).not.toHaveBeenCalled();
});

it('uses the router fallback for malformed percent escapes', async () => {
  await preloadRouteData('/filter/%E0%A4%A', service, null, signal());
  expect(api.getEvents).toHaveBeenCalledWith(20, 0, '%E0%A4%A', true);
});

it('loads team ratings using individual rating order without changing the hydration key', async () => {
  const data = await preloadRouteData('/event/42/order/team', service, null, signal());
  expect(api.getRatingTable).toHaveBeenCalledWith(
    [42],
    'desc',
    'rating',
    false,
    undefined,
    undefined
  );
  expect(Object.keys(data)).toContain('RatingTable_event_42_desc_team_all_fundefined_tundefined');
});
