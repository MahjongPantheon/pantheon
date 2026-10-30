import {
  GameConfig,
  PlayerInSession,
  RegisteredPlayer,
  SessionState,
} from 'tsclients/proto/atoms.pb';
import * as a from '../actions/interfaces';
import type { AppActionTypes } from '../actions/interfaces';
import { initialState } from '../state';
import type { IAppState, AppScreen } from '../interfaces';
import { mimirReducer } from './mimirReducer';
import { defaultPlayer } from '../selectors/newGame';

function reduce(type: string, payload?: unknown, state: IAppState = initialState) {
  return mimirReducer(state, { type, payload } as AppActionTypes);
}
const error = { message: 'Unavailable', code: 503 };
const loadingCases = [
  ['LOGIN', 'login'],
  ['GET_USERINFO', 'players'],
  ['UPDATE_CURRENT_GAMES', 'games'],
  ['GET_ALL_PLAYERS', 'players'],
  ['GET_CHANGES_OVERVIEW', 'overview'],
  ['GET_ALL_ROUNDS', 'overview'],
  ['GET_LAST_RESULTS', 'overview'],
  ['START_GAME', 'games'],
  ['GET_OTHER_TABLES_LIST', 'otherTables'],
  ['GET_OTHER_TABLE', 'otherTable'],
  ['ADD_ROUND', 'addRound'],
  ['EVENTS_GET_LIST', 'events'],
  ['GET_PENALTIES', 'penalties'],
] as const;

it.each(loadingCases)(
  'clears the %s loading indicator on failure',
  (prefix: string, field: string) => {
    const started = reduce(a[`${prefix}_INIT` as keyof typeof a], 'hash');
    expect(started.loading[field as keyof typeof started.loading]).toBe(true);
    const failed = reduce(a[`${prefix}_FAIL` as keyof typeof a], error, started);
    expect(failed.loading[field as keyof typeof failed.loading]).toBe(false);
    expect(initialState.loading[field as keyof typeof initialState.loading]).toBe(false);
  }
);

it('records authentication results, resets errors, and loads public profile data', () => {
  expect(reduce(a.LOGIN_SUCCESS, { personId: 7 })).toMatchObject({
    isLoggedIn: true,
    currentPlayerId: 7,
    currentScreen: 'eventSelector',
    loginError: undefined,
  });
  expect(reduce(a.LOGIN_SUCCESS, { personId: 0 }).currentPlayerId).toBeUndefined();
  const failed = reduce(a.LOGIN_FAIL, error);
  expect(failed).toMatchObject({
    isLoggedIn: false,
    currentScreen: 'login',
    loginError: { message: 'Unavailable', details: error },
  });
  expect(reduce(a.RESET_LOGIN_ERROR, undefined, failed).loginError).toBeUndefined();
  expect(
    reduce(a.GET_USERINFO_SUCCESS, { id: 7, title: 'Alice', hasAvatar: true, lastUpdate: 'today' })
  ).toMatchObject({
    currentPlayerId: 7,
    currentPlayerDisplayName: 'Alice',
    currentPlayerHasAvatar: true,
    currentPlayerLastUpdate: 'today',
  });
});

it.each([
  [a.GET_ALL_PLAYERS_SUCCESS, 'allPlayers'],
  [a.GET_CHANGES_OVERVIEW_SUCCESS, 'changesOverview'],
  [a.GET_LAST_RESULTS_SUCCESS, 'lastResults'],
  [a.EVENTS_GET_LIST_SUCCESS, 'eventsList'],
  [a.GET_PENALTIES_SUCCESS, 'penalties'],
] as const)('stores %s response data', (type: string, field: string) => {
  const data = [{ id: 1 }];
  expect(reduce(type, data)[field as keyof IAppState]).toBe(data);
});

it('handles absent rounds separately from transport errors', () => {
  expect(reduce(a.GET_ALL_ROUNDS_SUCCESS, { rounds: [] }).allRoundsOverview).toEqual({
    rounds: [],
  });
  expect(reduce(a.GET_ALL_ROUNDS_SUCCESS, undefined).allRoundsOverviewErrorCode).toBe(404);
  expect(reduce(a.GET_ALL_ROUNDS_FAIL, undefined).allRoundsOverviewErrorCode).toBe(404);
  expect(reduce(a.GET_ALL_ROUNDS_FAIL, error).allRoundsOverviewErrorCode).toBe(503);
});

it.each(['currentGame', 'otherTable', 'otherTablesList', 'lastResults'] as const)(
  'clears a missing active game while preserving spectator screen %s',
  (screen: AppScreen) => {
    const state = { ...initialState, currentScreen: screen };
    const result = reduce(
      a.UPDATE_CURRENT_GAMES_SUCCESS,
      { games: [], gameConfig: GameConfig.initialize({}) },
      state
    );
    expect(result.currentScreen).toBe(screen === 'currentGame' ? 'overview' : screen);
    expect(result.players).toBeUndefined();
    expect(result.mapIdToPlayer).toEqual({});
    expect(result.nextRoundToken).toBeUndefined();
    expect(result.timer).toMatchObject({ secondsRemaining: 0, waiting: false });
  }
);

it('indexes active game players and invalidates a previous round token', () => {
  const players = [1, 2, 3, 4].map((id) => PlayerInSession.initialize({ id }));
  const result = reduce(
    a.UPDATE_CURRENT_GAMES_SUCCESS,
    { games: [{ sessionHash: 'game', players }], gameConfig: GameConfig.initialize({}) },
    { ...initialState, nextRoundToken: 'stale' }
  );
  expect(result.currentSessionHash).toBe('game');
  expect(result.players).toBe(players);
  expect(result.mapIdToPlayer).toEqual(Object.fromEntries(players.map((p) => [p.id, p])));
  expect(result.nextRoundToken).toBeUndefined();
});

it('loads a session overview and clears optional tokens from old responses', () => {
  const overview = {
    eventId: 7,
    tableIndex: 2,
    players: [],
    state: SessionState.initialize({}),
    nextRoundToken: 'fresh',
  };
  expect(reduce(a.GET_GAME_OVERVIEW_SUCCESS, overview)).toMatchObject({
    gameOverviewReady: true,
    currentEventId: 7,
    tableIndex: 2,
    nextRoundToken: 'fresh',
    sessionState: overview.state,
  });
  expect(
    reduce(a.GET_GAME_OVERVIEW_SUCCESS, { ...overview, nextRoundToken: null }).nextRoundToken
  ).toBeUndefined();
  expect(reduce(a.GET_GAME_OVERVIEW_INIT).gameOverviewReady).toBe(false);
  expect(reduce(a.GET_GAME_OVERVIEW_FAIL, error).currentScreen).toBe('login');
});

it('excludes the current table and opens another table with its players', () => {
  const other = { sessionHash: 'other', tableIndex: 2, players: [] };
  const state = { ...initialState, currentSessionHash: 'own' };
  const list = reduce(a.GET_OTHER_TABLES_LIST_SUCCESS, [{ sessionHash: 'own' }, other], state);
  expect(list).toMatchObject({ otherTablesList: [other], currentScreen: 'otherTablesList' });
  expect(reduce(a.GET_OTHER_TABLE_SUCCESS, other)).toMatchObject({
    currentOtherTable: other,
    currentOtherTableIndex: 2,
    currentOtherTablePlayers: [],
    currentScreen: 'otherTable',
  });
});

it('retains identity and preferences when a finished game resets session data', () => {
  const state = {
    ...initialState,
    currentEventId: 7,
    currentPlayerId: 42,
    isLoggedIn: true,
    nextRoundToken: 'old',
  };
  const result = reduce(a.ADD_ROUND_SUCCESS, { isFinished: true }, state);
  expect(result).toMatchObject({
    currentScreen: 'lastResults',
    currentPlayerId: 42,
    currentEventId: 7,
    isLoggedIn: true,
    currentOutcome: undefined,
  });
  expect(result.nextRoundToken).toBeUndefined();
  expect(result.settings).toEqual(state.settings);
  expect(reduce(a.ADD_ROUND_SUCCESS, { isFinished: false }, state)).toMatchObject({
    currentScreen: 'currentGame',
    currentOutcome: undefined,
    nextRoundToken: undefined,
  });
  expect(reduce(a.START_GAME_SUCCESS).newGameStartError).toBeUndefined();
});

it('sets selected players by saved IDs and substitutes missing registrations', () => {
  const alice = RegisteredPlayer.initialize({ id: 1, title: 'Alice' });
  const state = { ...initialState, allPlayers: [alice], newGameIdsToSet: [1, 99] };
  expect(reduce(a.SET_NEWGAME_PLAYERS, undefined, state)).toMatchObject({
    newGameSelectedUsers: [alice, defaultPlayer],
    newGameIdsToSet: undefined,
  });
  expect(reduce(a.SET_NEWGAME_PLAYERS)).toBe(initialState);
  expect(
    reduce(a.SET_NEWGAME_PLAYERS, undefined, { ...state, allPlayers: undefined })
      .newGameSelectedUsers
  ).toEqual([defaultPlayer, defaultPlayer]);
  expect(reduce(a.CLEAR_NEWGAME_PLAYERS, undefined, state).newGameSelectedUsers).toEqual(
    Array(4).fill(defaultPlayer)
  );
});

it.each([
  a.SELECT_NEWGAME_PLAYER_EAST,
  a.SELECT_NEWGAME_PLAYER_SOUTH,
  a.SELECT_NEWGAME_PLAYER_WEST,
  a.SELECT_NEWGAME_PLAYER_NORTH,
])('selects a registered or placeholder player for %s', (type: string) => {
  const index = [
    a.SELECT_NEWGAME_PLAYER_EAST,
    a.SELECT_NEWGAME_PLAYER_SOUTH,
    a.SELECT_NEWGAME_PLAYER_WEST,
    a.SELECT_NEWGAME_PLAYER_NORTH,
  ].indexOf(type);
  const player = RegisteredPlayer.initialize({ id: 1, title: 'Alice' });
  expect(
    reduce(type, 1, { ...initialState, allPlayers: [player] }).newGameSelectedUsers?.[index]
  ).toBe(player);
  expect(reduce(type, 99).newGameSelectedUsers?.[index]).toBe(defaultPlayer);
  expect(reduce(type, 99, { ...initialState, allPlayers: [] }).newGameSelectedUsers?.[index]).toBe(
    defaultPlayer
  );
});

it('randomizes seats without losing or mutating the selected registrations', () => {
  const players = [1, 2, 3, 4].map((id) => RegisteredPlayer.initialize({ id }));
  const result = reduce(a.RANDOMIZE_NEWGAME_PLAYERS, undefined, {
    ...initialState,
    newGameSelectedUsers: players,
  });
  expect(result.newGameSelectedUsers?.map((p) => p.id).sort()).toEqual([1, 2, 3, 4]);
  expect(players.map((p) => p.id)).toEqual([1, 2, 3, 4]);
  expect(
    reduce(a.RANDOMIZE_NEWGAME_PLAYERS, undefined, {
      ...initialState,
      newGameSelectedUsers: undefined,
    }).newGameSelectedUsers
  ).toEqual([]);
});

it('keeps rotation offsets for the table selectors and selects events without changing unrelated state', () => {
  expect(
    reduce(a.TABLE_ROTATE_CLOCKWISE, undefined, { ...initialState, overviewViewShift: 3 })
      .overviewViewShift
  ).toBe(4);
  expect(
    reduce(a.TABLE_ROTATE_COUNTERCLOCKWISE, undefined, { ...initialState, overviewViewShift: 0 })
      .overviewViewShift
  ).toBe(-1);
  for (const type of [a.TABLE_ROTATE_CLOCKWISE, a.TABLE_ROTATE_COUNTERCLOCKWISE])
    expect(
      reduce(type, undefined, { ...initialState, overviewViewShift: undefined }).overviewViewShift
    ).toBe(type === a.TABLE_ROTATE_CLOCKWISE ? 1 : -1);
  expect(reduce(a.SELECT_EVENT, 7)).toMatchObject({ currentEventId: 7, currentScreen: 'overview' });
  expect(reduce(a.HISTORY_INIT).historyInitialized).toBe(true);
  expect(reduce('unknown')).toBe(initialState);
});
