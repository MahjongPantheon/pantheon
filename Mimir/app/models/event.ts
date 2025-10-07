import { createRuleset } from 'rulesets/ruleset';
import { Context } from '../context';
import {
  EventsGetEventsByIdPayload,
  EventsGetEventsByIdResponse,
  EventsGetEventsPayload,
  EventsGetEventsResponse,
  PlayersGetMyEventsResponse,
} from 'tsclients/proto/mimir.pb';
import {
  EventType,
  GameConfig,
  GenericEventPayload,
  PlatformType,
  TournamentGamesStatus,
} from 'tsclients/proto/atoms.pb';

export async function getEvents(
  eventsGetEventsPayload: EventsGetEventsPayload,
  context: Context
): Promise<EventsGetEventsResponse> {
  let qb = context.db
    .selectFrom('event')
    .leftJoin('session', 'session.event_id', 'event.id')
    .select([
      'event.id',
      'event.title',
      'event.description',
      'event.is_online',
      'event.sync_start',
      'event.finished',
      'event.is_prescripted',
      'event.is_team',
      'event.is_listed',
      'event.hide_results',
      'event.hide_achievements',
      'event.min_games_count',
      'event.series_length',
      'event.ruleset_config',
      'event.online_platform',
      ({ fn }) => fn.count('session.id').as('sessioncnt'),
    ]);
  let qbcount = context.db.selectFrom('event').select(({ fn }) => fn.count('id').as('count'));
  if (eventsGetEventsPayload.filter) {
    qb = qb.where('title', 'ilike', `%${eventsGetEventsPayload.filter}%`);
    qbcount = qbcount.where('title', 'ilike', `%${eventsGetEventsPayload.filter}%`);
  }
  if (eventsGetEventsPayload.filterUnlisted) {
    qb = qb.where('is_listed', '=', 1);
    qbcount = qbcount.where('is_listed', '=', 1);
  }
  qb = qb
    .groupBy('event.id')
    .orderBy('id', 'desc')
    .limit(Math.min(eventsGetEventsPayload.limit, 100))
    .offset(eventsGetEventsPayload.offset);

  const counts = await qbcount.execute();
  const data = await qb.execute();
  return {
    events: data.map((e) => {
      const ruleset = createRuleset('custom', e.ruleset_config);
      return {
        id: e.id,
        title: e.title,
        description: e.description,
        isRatingShown: !e.hide_results,
        tournamentStarted: !e.is_online && !!e.sync_start && Number(e.sessioncnt) > 0,
        type: e.is_online
          ? EventType.EVENT_TYPE_ONLINE
          : e.sync_start
            ? EventType.EVENT_TYPE_TOURNAMENT
            : EventType.EVENT_TYPE_LOCAL,
        hasSeries: e.series_length > 0,
        achievementsShown: !e.hide_achievements,
        platformId:
          e.online_platform === 'TENHOU'
            ? PlatformType.PLATFORM_TYPE_TENHOUNET
            : e.online_platform === 'MAJSOUL'
              ? PlatformType.PLATFORM_TYPE_MAHJONGSOUL
              : PlatformType.PLATFORM_TYPE_UNSPECIFIED,
        finished: !!e.finished,
        isPrescripted: !!e.is_prescripted,
        isTeam: !!e.is_team,
        isListed: !!e.is_listed,
        minGamesCount: e.min_games_count,
        sessions: Number(e.sessioncnt),
        withYakitori: ruleset.rules.withYakitori,
        withChips: ruleset.rules.chipsValue > 0,
      };
    }),
    total: Number(counts[0].count),
  };
}

export async function getEventsById(
  eventsGetEventsByIdPayload: EventsGetEventsByIdPayload,
  context: Context
): Promise<EventsGetEventsByIdResponse> {
  const data = await context.db
    .selectFrom('event')
    .leftJoin('session', 'session.event_id', 'event.id')
    .select([
      'event.id',
      'event.title',
      'event.description',
      'event.is_online',
      'event.sync_start',
      'event.finished',
      'event.is_prescripted',
      'event.is_team',
      'event.is_listed',
      'event.hide_results',
      'event.hide_achievements',
      'event.min_games_count',
      'event.series_length',
      'event.ruleset_config',
      'event.online_platform',
      ({ fn }) => fn.count('session.id').as('sessioncnt'),
    ])
    .groupBy('event.id')
    .orderBy('event.id', 'desc')
    .where('event.id', 'in', eventsGetEventsByIdPayload.ids)
    .execute();

  return {
    events: data.map((e) => {
      const ruleset = createRuleset('custom', e.ruleset_config);
      return {
        id: e.id,
        title: e.title,
        description: e.description,
        isRatingShown: !e.hide_results,
        tournamentStarted: !e.is_online && !!e.sync_start && Number(e.sessioncnt) > 0,
        type: e.is_online
          ? EventType.EVENT_TYPE_ONLINE
          : e.sync_start
            ? EventType.EVENT_TYPE_TOURNAMENT
            : EventType.EVENT_TYPE_LOCAL,
        hasSeries: e.series_length > 0,
        achievementsShown: !e.hide_achievements,
        platformId:
          e.online_platform === 'TENHOU'
            ? PlatformType.PLATFORM_TYPE_TENHOUNET
            : e.online_platform === 'MAJSOUL'
              ? PlatformType.PLATFORM_TYPE_MAHJONGSOUL
              : PlatformType.PLATFORM_TYPE_UNSPECIFIED,
        finished: !!e.finished,
        isPrescripted: !!e.is_prescripted,
        isTeam: !!e.is_team,
        isListed: !!e.is_listed,
        minGamesCount: e.min_games_count,
        sessions: Number(e.sessioncnt),
        withYakitori: ruleset.rules.withYakitori,
        withChips: ruleset.rules.chipsValue > 0,
      };
    }),
  };
}

export async function getMyEvents(context: Context): Promise<PlayersGetMyEventsResponse> {
  const regs = await context.db
    .selectFrom('event_registered_players')
    .select(['event_id'])
    .where('event_registered_players.player_id', '=', context.personId)
    .execute();
  const events =
    regs.length === 0
      ? []
      : await context.db
          .selectFrom('event')
          .where(
            'id',
            'in',
            regs.map((r) => r.event_id)
          )
          .where('finished', '=', 0)
          .select(['id', 'title', 'is_online', 'description'])
          .execute();
  return {
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description, // TODO md transform
      isOnline: !!e.is_online,
    })),
  };
}

export async function getGameConfig(
  genericEventPayload: GenericEventPayload,
  context: Context
): Promise<GameConfig> {
  const data = await context.db
    .selectFrom('event')
    .select([
      'id',
      'title',
      'description',
      'stat_host',
      'allow_player_append',
      'allow_view_other_tables',
      'auto_seating',
      'game_duration',
      'games_status',
      'hide_results',
      'finished',
      'is_online',
      'is_prescripted',
      'is_team',
      'lobby_id',
      'min_games_count',
      'series_length',
      'sort_by_games',
      'sync_start',
      'sync_end',
      'timezone',
      'use_penalty',
      'use_timer',
      'ruleset_config',
    ])
    .orderBy('event.id', 'desc')
    .where('event.id', '=', genericEventPayload.eventId)
    .execute();

  const ruleset = createRuleset('custom', data[0].ruleset_config);
  return {
    allowPlayerAppend: !!data[0].allow_player_append,
    allowViewOtherTables: !!data[0].allow_view_other_tables,
    autoSeating: !!data[0].auto_seating,
    eventDescription: data[0].description,
    eventStatHost: data[0].stat_host,
    eventTitle: data[0].title,
    gameDuration: data[0].game_duration ?? 0,
    gamesStatus:
      data[0].games_status === 'seating_ready'
        ? TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY
        : data[0].games_status === 'started'
          ? TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_STARTED
          : TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_UNSPECIFIED,
    hideAddReplayButton: !data[0].is_online,
    hideResults: !!data[0].hide_results,
    isFinished: !!data[0].finished,
    isOnline: !!data[0].is_online,
    isPrescripted: !!data[0].is_prescripted,
    isTeam: !!data[0].is_team,
    lobbyId: data[0].lobby_id ?? 0,
    minGamesCount: data[0].min_games_count,
    rulesetConfig: ruleset.rules,
    rulesetTitle: ruleset.title,
    seriesLength: data[0].series_length,
    sortByGames: !!data[0].sort_by_games,
    syncEnd: !!data[0].sync_end,
    syncStart: !!data[0].sync_start,
    timezone: data[0].timezone,
    usePenalty: !!data[0].use_penalty,
    useTimer: !!data[0].use_timer,
  };
}
