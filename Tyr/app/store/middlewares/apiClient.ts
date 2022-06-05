import {Dispatch, MiddlewareAPI} from 'redux';
import {
  ADD_ROUND_FAIL,
  ADD_ROUND_INIT,
  ADD_ROUND_SUCCESS,
  AppActionTypes,
  EVENTS_GET_LIST_FAIL,
  EVENTS_GET_LIST_INIT,
  EVENTS_GET_LIST_SUCCESS,
  FORCE_LOGOUT,
  GET_ALL_PLAYERS_FAIL,
  GET_ALL_PLAYERS_INIT,
  GET_ALL_PLAYERS_SUCCESS,
  GET_ALL_ROUNDS_FAIL,
  GET_ALL_ROUNDS_INIT,
  GET_ALL_ROUNDS_SUCCESS,
  GET_CHANGES_OVERVIEW_FAIL,
  GET_CHANGES_OVERVIEW_INIT,
  GET_CHANGES_OVERVIEW_SUCCESS,
  GET_GAME_OVERVIEW_FAIL,
  GET_GAME_OVERVIEW_INIT,
  GET_GAME_OVERVIEW_SUCCESS,
  GET_LAST_RESULTS_FAIL,
  GET_LAST_RESULTS_INIT,
  GET_LAST_RESULTS_SUCCESS,
  GET_OTHER_TABLE_FAIL,
  GET_OTHER_TABLE_INIT,
  GET_OTHER_TABLE_LAST_ROUND_INIT,
  GET_OTHER_TABLE_RELOAD,
  GET_OTHER_TABLE_SUCCESS,
  GET_OTHER_TABLES_LIST_FAIL,
  GET_OTHER_TABLES_LIST_INIT,
  GET_OTHER_TABLES_LIST_RELOAD,
  GET_OTHER_TABLES_LIST_SUCCESS,
  GET_USERINFO_FAIL,
  GET_USERINFO_INIT,
  GET_USERINFO_SUCCESS,
  GO_TO_CURRENT_GAME,
  GOTO_EVENT_SELECT,
  LOGIN_FAIL,
  LOGIN_INIT,
  LOGIN_SUCCESS,
  RESET_STATE,
  SELECT_EVENT,
  SET_CREDENTIALS,
  SET_TIMER,
  START_GAME_FAIL,
  START_GAME_INIT,
  START_GAME_SUCCESS,
  STARTUP_WITH_AUTH,
  UPDATE_CURRENT_GAMES_FAIL,
  UPDATE_CURRENT_GAMES_INIT,
  UPDATE_CURRENT_GAMES_SUCCESS,
} from '../actions/interfaces';
import {RiichiApiService} from '#/services/riichiApi';
import {LCurrentGame, LGameConfig, LTimerState} from '#/interfaces/local';
import {RemoteError} from '#/services/remoteError';
import {IAppState} from '../interfaces';
import {SessionState} from "#/interfaces/remote";

export const apiClient = (api: RiichiApiService) => (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) =>
  (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  let personId: number | undefined = mw.getState().currentPlayerId;
  let eventId: number | undefined = mw.getState().currentEventId;

  switch (action.type) {
    case STARTUP_WITH_AUTH:
      if (!action.payload.token) { // Not logged in
        mw.dispatch({ type: FORCE_LOGOUT });
        return;
      }

      startupWithAuth(
        api, mw.dispatch, next,
        action.payload.personId, action.payload.token,
        eventId, mw.getState().currentSessionHash
      );
      break;
    case EVENTS_GET_LIST_INIT:
      api.getMyEvents()
        .then((events) => mw.dispatch({ type: EVENTS_GET_LIST_SUCCESS, payload: events }))
        .catch((err) => mw.dispatch({ type: EVENTS_GET_LIST_FAIL, payload: err }));
      break;
    case LOGIN_INIT:
      loginWithRetry(action.payload, api, mw.dispatch, next);
      break;
    case SET_CREDENTIALS:
      api.setCredentials(action.payload.personId, action.payload.authToken);
      return next(action);
    case UPDATE_CURRENT_GAMES_INIT:
      if (!personId || !eventId) {
        return;
      }
      updateCurrentGames(api, next, mw.dispatch, personId, eventId);
      break;
    case GET_GAME_OVERVIEW_INIT:
      if (!action.payload || !eventId) {
        mw.dispatch({ type: RESET_STATE });
        return;
      }
      getGameOverview(action.payload, eventId, api, next);
      break;
    case GET_OTHER_TABLES_LIST_INIT:
      if (!eventId) {
        return;
      }
      getOtherTablesList(api, next, eventId);
      break;
    case GET_OTHER_TABLES_LIST_RELOAD:
      if (!eventId) {
        return;
      }
      getOtherTablesListReload(api, next, eventId);
      break;
    case GET_OTHER_TABLE_INIT:
      if (!eventId) {
        return;
      }
      getOtherTable(action.payload, eventId, api, next);
      break;
    case GET_OTHER_TABLE_RELOAD:
      if (!eventId) {
        return;
      }
      getOtherTableReload(mw.getState().currentOtherTableHash || '', eventId, api, next);
      break;
    case GET_OTHER_TABLE_LAST_ROUND_INIT:
      next(action);
      //todo
      break;
    case GET_ALL_ROUNDS_INIT:
      getAllRounds(action.payload, api, next)
      break;
    case GET_CHANGES_OVERVIEW_INIT:
      getChangesOverview(action.payload, api, next);
      break;
    case GET_LAST_RESULTS_INIT:
      if (!personId || !eventId) {
        return;
      }
      getLastResults(api, next, personId, eventId);
      break;
    case GET_ALL_PLAYERS_INIT:
      if (!eventId) {
        return;
      }
      getAllPlayers(api, next, eventId);
      break;
    case START_GAME_INIT:
      if (!eventId) {
        return;
      }
      startGame(action.payload, api, next, mw.dispatch, eventId);
      break;
    case ADD_ROUND_INIT:
      addRound(action.payload, api, next, mw.dispatch);
      break;
    default:
      return next(action);
  }
};

function loginWithRetry(data: { email: string, password: string }, api: RiichiApiService, dispatch: Dispatch, next: Dispatch) {
  next({ type: LOGIN_INIT });

  let retriesCount = 0;
  const runWithRetry = () => {
    api.authorize(data.email, data.password)
      .then((auth) => {
        retriesCount = 0;
        dispatch({ type: LOGIN_SUCCESS, payload: auth });
      })
      .catch((e) => {
        retriesCount++;
        if (retriesCount < 5) {
          setTimeout(runWithRetry, 500);
          return;
        }

        retriesCount = 0;
        dispatch({ type: LOGIN_FAIL, payload: e });
      });
  };

  runWithRetry();
}

function getUserinfo(personId: number, api: RiichiApiService, next: Dispatch) {
  next({ type: GET_USERINFO_INIT });
  api.getUserInfo([personId])
    .then((overview) => next({ type: GET_USERINFO_SUCCESS, payload: overview[0] }))
    .catch((error: RemoteError) => next({ type: GET_USERINFO_FAIL, payload: error }));
}

/*
Promise<LUser[]>,
    api.getUserInfo([currentPersonId]),
 */

function updateCurrentGames(api: RiichiApiService, dispatchNext: Dispatch, dispatchToStore: Dispatch, currentPersonId: number, eventId: number) {
  dispatchNext({ type: UPDATE_CURRENT_GAMES_INIT });

  // TODO: make single method? should become faster!
  const promises: [Promise<LCurrentGame[]>,  Promise<LGameConfig>, Promise<LTimerState>] = [
    api.getCurrentGames(currentPersonId, eventId),
    api.getGameConfig(eventId),
    api.getTimerState(eventId)
  ];

  Promise.all(promises).then(([games, gameConfig, timerState]) => {
    dispatchNext({ type: UPDATE_CURRENT_GAMES_SUCCESS, payload: { games, gameConfig, timerState }});
    if (games.length > 0) {
      dispatchToStore({ type: GET_GAME_OVERVIEW_INIT, payload: games[0].hashcode } );
    }
    dispatchToStore({ type: SET_TIMER, payload: {
      waiting: timerState.waitingForTimer,
      secondsRemaining: timerState.timeRemaining,
      autostartSecondsRemaining: timerState.autostartTimer,
      haveAutostart: timerState.haveAutostart,
    }});
  }).catch((e) => {
    if (e.code === 401) { // token has rotten
      dispatchToStore({ type: FORCE_LOGOUT });
    } else {
      dispatchNext({ type: UPDATE_CURRENT_GAMES_FAIL, payload: e });
    }
  });
}

function getGameOverview(currentSessionHash: string, eventId: number, api: RiichiApiService, next: Dispatch) {
  next({ type: GET_GAME_OVERVIEW_INIT });
  api.getGameOverview(currentSessionHash, eventId)
    .then((overview) => next({ type: GET_GAME_OVERVIEW_SUCCESS, payload: overview }))
    .catch((error: RemoteError) => next({ type: GET_GAME_OVERVIEW_FAIL, payload: error }));
}

function getOtherTable(sessionHash: string, eventId: number, api: RiichiApiService, dispatch: Dispatch) {
  dispatch({ type: GET_OTHER_TABLE_INIT, payload: sessionHash });
  api.getGameOverview(sessionHash, eventId)
    .then((table) => dispatch({ type: GET_OTHER_TABLE_SUCCESS, payload: table }))
    .catch((e) => dispatch({ type: GET_OTHER_TABLE_FAIL, payload: e }));
}

function getOtherTableReload(sessionHash: string, eventId: number, api: RiichiApiService, dispatch: Dispatch) {
  dispatch({ type: GET_OTHER_TABLE_RELOAD });
  api.getGameOverview(sessionHash, eventId)
    .then((table) => dispatch({ type: GET_OTHER_TABLE_SUCCESS, payload: table }))
    .catch((e) => dispatch({ type: GET_OTHER_TABLE_FAIL, payload: e }));
}

function getOtherTablesList(api: RiichiApiService, dispatch: Dispatch, eventId: number) {
  dispatch({ type: GET_OTHER_TABLES_LIST_INIT });
  api.getTablesState(eventId)
    .then((tables) => dispatch({ type: GET_OTHER_TABLES_LIST_SUCCESS, payload: tables }))
    .catch((e) => dispatch({ type: GET_OTHER_TABLES_LIST_FAIL, payload: e }));
}

function getOtherTablesListReload(api: RiichiApiService, dispatch: Dispatch, eventId: number) {
  dispatch({ type: GET_OTHER_TABLES_LIST_RELOAD });
  api.getTablesState(eventId)
    .then((tables) => dispatch({ type: GET_OTHER_TABLES_LIST_SUCCESS, payload: tables }))
    .catch((e) => dispatch({ type: GET_OTHER_TABLES_LIST_FAIL, payload: e }));
}

function getAllRounds(sessionHash: string, api: RiichiApiService, dispatch: Dispatch) {
  dispatch({ type: GET_ALL_ROUNDS_INIT });
  api.getAllRounds(sessionHash)
    .then((paymentsInfo) => dispatch({ type: GET_ALL_ROUNDS_SUCCESS, payload: paymentsInfo }))
    .catch((e) => dispatch({ type: GET_ALL_ROUNDS_FAIL, payload: e }));
}

function getChangesOverview(state: IAppState, api: RiichiApiService, dispatch: Dispatch) {
  dispatch({ type: GET_CHANGES_OVERVIEW_INIT });
  api.getChangesOverview(state)
    .then((overview) => dispatch({ type: GET_CHANGES_OVERVIEW_SUCCESS, payload: overview }))
    .catch((e) => dispatch({ type: GET_CHANGES_OVERVIEW_FAIL, payload: e }));
}

function addRound(state: IAppState, api: RiichiApiService, dispatch: Dispatch, dispatchToStore: Dispatch) {
  dispatch({ type: ADD_ROUND_INIT });
  api.addRound(state)
    .then((data) => {
      if (!data) {
        dispatch({ type: ADD_ROUND_FAIL, payload: { code: 500, message: 'Server error occurred while saving the game' } });
      }
      dispatch({ type: ADD_ROUND_SUCCESS, payload: data });
      if (!(data as SessionState)._isFinished) {
        dispatchToStore({type: GET_GAME_OVERVIEW_INIT, payload: state.currentSessionHash});
      }
    }).catch((e) => dispatch({ type: ADD_ROUND_FAIL, payload: e }));
}

function getLastResults(api: RiichiApiService, dispatch: Dispatch, currentPersonId: number, eventId: number) {
  dispatch({ type: GET_LAST_RESULTS_INIT });
  api.getLastResults(currentPersonId, eventId)
    .then((results) => dispatch({ type: GET_LAST_RESULTS_SUCCESS, payload: results }))
    .catch((e) => dispatch({ type: GET_LAST_RESULTS_FAIL, payload: e }));
}

function getAllPlayers(api: RiichiApiService, dispatch: Dispatch, eventId: number) {
  dispatch({ type: GET_ALL_PLAYERS_INIT });
  api.getAllPlayers(eventId)
    .then((results) => dispatch({ type: GET_ALL_PLAYERS_SUCCESS, payload: results }))
    .catch((e) => dispatch({ type: GET_ALL_PLAYERS_FAIL, payload: e }));
}

function startGame(playerIds: number[], api: RiichiApiService, dispatch: Dispatch, dispatchToStore: Dispatch, eventId: number) {
  dispatch({ type: START_GAME_INIT });
  api.startGame(eventId, playerIds)
    .then((results) => {
      dispatchToStore({ type: START_GAME_SUCCESS, payload: results });
      dispatchToStore({ type: RESET_STATE });
      dispatchToStore({ type: SELECT_EVENT, payload: eventId });
      dispatchToStore({ type: UPDATE_CURRENT_GAMES_INIT });
      dispatchToStore({ type: GO_TO_CURRENT_GAME });
    })
    .catch((e) => dispatch({ type: START_GAME_FAIL, payload: e }));
}

function startupWithAuth(
  api: RiichiApiService,
  dispatchToStore: Dispatch<AppActionTypes>,
  dispatchNext: Dispatch<AppActionTypes>,
  personId: number,
  token: string,
  eventId?: number,
  sessionHash?: string
) {
  api.setCredentials(personId, token);
  api.quickAuthorize().then((isAuthorized) => {
    dispatchToStore({
      type: SET_CREDENTIALS,
      payload: {authToken: token, personId: personId}
    });
    getUserinfo(personId, api, dispatchNext);
    if (!eventId) {
      dispatchToStore({type: GOTO_EVENT_SELECT});
    } else {
      dispatchToStore({ type: SELECT_EVENT, payload: eventId });
      updateCurrentGames(api, dispatchNext, dispatchToStore, personId, eventId);
      if (sessionHash) {
        dispatchToStore({type: GET_GAME_OVERVIEW_INIT, payload: sessionHash});
      }
    }
  }).catch(() => {
    dispatchToStore({ type: FORCE_LOGOUT });
  });
}
