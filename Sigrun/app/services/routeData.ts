import { matchRoute } from 'wouter';
import { parse } from 'regexparam';
import type { PersonEx } from 'tsclients/proto/atoms.pb';
import { routes } from '../routes';
import { fullList } from '../helpers/achievements';
import type { ApiService } from './api';

export async function loadAuthData(
  api: ApiService,
  personId: number | null
): Promise<[boolean, boolean, PersonEx | null, number[]]> {
  if (!personId) return [false, false, null, []];
  const [auth, admin, info, events] = await Promise.allSettled([
    api.quickAuthorize(),
    api.getSuperadminFlag(personId),
    api.getPersonalInfo(personId),
    api.getOwnedEventIds(personId),
  ]);
  return [
    auth.status === 'fulfilled' ? auth.value : false,
    admin.status === 'fulfilled' ? admin.value : false,
    info.status === 'fulfilled' ? info.value : null,
    events.status === 'fulfilled' ? events.value : [],
  ];
}

export async function preloadRouteData(
  url: string,
  api: ApiService,
  personId: number | null,
  signal: AbortSignal
) {
  const data: Record<string, unknown> = {};
  const load = async <T>(key: string, fetch: () => Promise<T>) => {
    try {
      signal.throwIfAborted();
      const value = await fetch();
      data[key] = value;
      return value;
    } catch (error) {
      data[key + '__err'] = error;
      return undefined;
    }
  };
  const pending: Promise<unknown>[] = [];
  const auth = () => load('Global_auth_' + (personId ?? ''), () => loadAuthData(api, personId));
  let pathname = new URL(url, 'http://sigrun').pathname;
  try {
    pathname = decodeURI(pathname);
  } catch {
    // Match Wouter's fallback for malformed percent escapes.
  }
  for (const route of routes) {
    const [match, params] = matchRoute(parse, route.path, pathname);
    if (!match) continue;
    const p = params as Record<string, string | undefined>;
    const { eventId, playerId, dateFrom, dateTo, sessionHash } = p;
    const from = dateFrom != null ? decodeURIComponent(dateFrom) : undefined;
    const to = dateTo != null ? decodeURIComponent(dateTo) : undefined;
    const eventIds = eventId?.split('.').map((id) => parseInt(id, 10));
    if (eventIds?.length === 1) api.setEventId(eventIds[0]);
    const events = load('EventInfo_event_' + (eventId ?? 'null'), () =>
      eventIds ? api.getEventsById(eventIds) : Promise.resolve(null)
    );
    pending.push(auth(), events);
    const id = parseInt(eventId ?? '', 10);
    switch (route.page) {
      case 'EventList': {
        const page = p.page ?? '1';
        const filter = p.filter ?? '';
        pending.push(
          load(`EventList_events_${page}_${filter}`, () =>
            api.getEvents(20, (parseInt(page, 10) - 1) * 20, filter, true)
          )
        );
        if (page === '1' && filter === '')
          pending.push(load('RecentPublicGames', () => api.getRecentPublicGames()));
        break;
      }
      case 'EventInfo':
        pending.push(
          load('EventInfo_admins_' + eventId, () => api.getEventAdmins(id)),
          load('EventInfo_referees_' + eventId, () => api.getEventReferees(id))
        );
        break;
      case 'RatingTable': {
        const orderBy = (p.orderBy ?? 'rating') as
          | Parameters<ApiService['getRatingTable']>[2]
          | 'team';
        const order = orderBy === 'name' || orderBy === 'avg_place' ? 'asc' : 'desc';
        const filter = p.minGamesSelector ?? 'all';
        pending.push(
          load(
            `RatingTable_event_${eventId}_${order}_${orderBy}_${filter}_f${dateFrom}_t${dateTo}`,
            () =>
              api.getRatingTable(
                eventIds!,
                order,
                orderBy === 'team' ? 'rating' : orderBy,
                filter === 'min',
                from,
                to
              )
          )
        );
        break;
      }
      case 'PlayerStats':
        pending.push(
          load('PlayerStats_player_' + eventId + playerId, () =>
            api.getPlayer(parseInt(playerId!, 10))
          ),
          load(`PlayerStats_playerstats_${eventId}_${playerId}_f${dateFrom}_t${dateTo}`, () =>
            api.getPlayerStat(eventIds!, parseInt(playerId!, 10), from, to)
          )
        );
        break;
      case 'RecentGames': {
        const page = p.page ?? '1';
        pending.push(
          load(`RecentGames_games_${eventId}_${page}`, () =>
            api.getRecentGames(id, 10, (parseInt(page, 10) - 1) * 10)
          )
        );
        break;
      }
      case 'Game':
        pending.push(load('Game_game_' + eventId + sessionHash, () => api.getGame(sessionHash!)));
        break;
      case 'RegisteredPlayers':
        pending.push(
          events.then((list) => {
            const registeredEventId = list?.[0]?.id;
            return load('RegisteredPlayers_event_' + registeredEventId, () =>
              registeredEventId
                ? api
                    .getAllPlayers(registeredEventId)
                    .then((players) => players.toSorted((a, b) => a.title.localeCompare(b.title)))
                : Promise.resolve([])
            );
          })
        );
        break;
      case 'SeriesRating':
        pending.push(
          events.then((list) =>
            load('SeriesRating_games_' + eventId, () =>
              list ? api.getGameSeries(id) : Promise.resolve(null)
            )
          )
        );
        break;
      case 'Timer':
        pending.push(load('TimerState_seating_' + eventId, () => api.getSeating(id)));
        break;
      case 'Achievements':
        pending.push(load('Achievements_' + eventId, () => api.getAchievements(id, fullList)));
        break;
      case 'EventRulesOverview':
      case 'TablesState':
        pending.push(load('RulesOverview_' + eventId, () => api.getGameConfig(id)));
        break;
    }
    break;
  }
  if (pending.length === 0) pending.push(auth());
  await Promise.all(pending);
  signal.throwIfAborted();
  return data;
}
