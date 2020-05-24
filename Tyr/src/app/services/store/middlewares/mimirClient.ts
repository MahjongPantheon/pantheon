import {Dispatch, Store as ReduxStore} from 'redux';
import {
  ADD_ROUND_FAIL,
  ADD_ROUND_INIT,
  ADD_ROUND_SUCCESS,
  AppActionTypes,
  CONFIRM_REGISTRATION_FAIL,
  CONFIRM_REGISTRATION_INIT,
  CONFIRM_REGISTRATION_SUCCESS,
  FORCE_LOGOUT,
  GET_ALL_PLAYERS_FAIL,
  GET_ALL_PLAYERS_INIT,
  GET_ALL_PLAYERS_SUCCESS,
  GET_CHANGES_OVERVIEW_FAIL,
  GET_CHANGES_OVERVIEW_INIT,
  GET_CHANGES_OVERVIEW_SUCCESS,
  GET_GAME_OVERVIEW_FAIL,
  GET_GAME_OVERVIEW_INIT,
  GET_GAME_OVERVIEW_SUCCESS,
  GET_LAST_RESULTS_FAIL,
  GET_LAST_RESULTS_INIT,
  GET_LAST_RESULTS_SUCCESS,
  GET_LAST_ROUND_FAIL,
  GET_LAST_ROUND_INIT,
  GET_LAST_ROUND_SUCCESS,
  GET_OTHER_TABLE_FAIL,
  GET_OTHER_TABLE_INIT, GET_OTHER_TABLE_LAST_ROUND_INIT, GET_OTHER_TABLE_RELOAD,
  GET_OTHER_TABLE_SUCCESS,
  GET_OTHER_TABLES_LIST_FAIL,
  GET_OTHER_TABLES_LIST_INIT, GET_OTHER_TABLES_LIST_RELOAD,
  GET_OTHER_TABLES_LIST_SUCCESS,
  RESET_STATE,
  SET_CREDENTIALS, SET_TIMER,
  START_GAME_FAIL,
  START_GAME_INIT,
  START_GAME_SUCCESS,
  UPDATE_CURRENT_GAMES_FAIL,
  UPDATE_CURRENT_GAMES_INIT,
  UPDATE_CURRENT_GAMES_SUCCESS
} from '../actions/interfaces';
import {RiichiApiService} from '../../riichiApi';
import {LCurrentGame, LGameConfig, LTimerState, LUser} from '../../../interfaces/local';
import {RemoteError} from '../../remoteError';
import {IAppState} from '../interfaces';

export const mimirClient = (api: RiichiApiService) => (store: ReduxStore) =>
  (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
    case CONFIRM_REGISTRATION_INIT:
      loginWithRetry(action.payload, api, store.dispatch, next);
      break;
    case SET_CREDENTIALS:
      api.setCredentials(action.payload);
      break;
    case UPDATE_CURRENT_GAMES_INIT:
      updateCurrentGames(api, next, store.dispatch);
      break;
    case GET_GAME_OVERVIEW_INIT:
      if (!action.payload) {
        store.dispatch({ type: RESET_STATE });
        return;
      }
      getGameOverview(action.payload, api, next);
      break;
    case GET_OTHER_TABLES_LIST_INIT:
      getOtherTablesList(api, next);
      break;
    case GET_OTHER_TABLES_LIST_RELOAD:
      getOtherTablesListReload(api, next);
      break;
    case GET_OTHER_TABLE_INIT:
      getOtherTable(action.payload, api, next);
      break;
    case GET_OTHER_TABLE_RELOAD:
      getOtherTableReload(store.getState().currentOtherTableHash, api, next);
      break;
    case GET_OTHER_TABLE_LAST_ROUND_INIT:
    case GET_LAST_ROUND_INIT:
      getLastRound(action.payload, api, next);
      break;
    case GET_CHANGES_OVERVIEW_INIT:
      getChangesOverview(action.payload, api, next);
      break;
    case GET_LAST_RESULTS_INIT:
      getLastResults(api, next);
      break;
    case GET_ALL_PLAYERS_INIT:
      getAllPlayers(api, next);
      break;
    case START_GAME_INIT:
      startGame(action.payload, api, next, store.dispatch);
      break;
    case ADD_ROUND_INIT:
      addRound(action.payload, api, next, store.dispatch);
      break;
    default:
      return next(action);
  }
};

function loginWithRetry(pin: string, api: RiichiApiService, dispatch: Dispatch, next: Dispatch) {
  next({ type: CONFIRM_REGISTRATION_INIT });
  // this.metrika.track(MetrikaService.LOAD_STARTED, { type: 'screen-login', request: 'confirmRegistration' });

  let retriesCount = 0;
  const runWithRetry = () => {
    api.confirmRegistration(pin)
      .then((authToken: string) => {
        retriesCount = 0;
        dispatch({ type: CONFIRM_REGISTRATION_SUCCESS, payload: authToken });
        // this.metrika.track(MetrikaService.LOAD_SUCCESS, {
        //   type: 'screen-login',
        //   request: 'confirmRegistration'
        // });
      })
      .catch((e) => {
        retriesCount++;
        if (retriesCount < 5) {
          setTimeout(runWithRetry, 500);
          return;
        }

        retriesCount = 0;
        dispatch({ type: CONFIRM_REGISTRATION_FAIL, payload: e });
        // this.metrika.track(MetrikaService.LOAD_ERROR, {
        //   type: 'screen-login',
        //   request: 'confirmRegistration',
        //   message: e.toString()
        // });
      });
  };

  runWithRetry();
}

function updateCurrentGames(api: RiichiApiService, dispatchNext: Dispatch, dispatchToStore: Dispatch) {
  dispatchNext({ type: UPDATE_CURRENT_GAMES_INIT });

  // TODO: make single method? should become faster!
  const promises: [Promise<LCurrentGame[]>, Promise<LUser>, Promise<LGameConfig>, Promise<LTimerState>] = [
    api.getCurrentGames(),
    api.getUserInfo(),
    api.getGameConfig(),
    api.getTimerState()
  ];

  Promise.all(promises).then(([games, playerInfo, gameConfig, timerState]) => {
    dispatchNext({ type: UPDATE_CURRENT_GAMES_SUCCESS, payload: { games, playerInfo, gameConfig, timerState }});
    if (games.length > 0) {
      dispatchToStore({ type: GET_GAME_OVERVIEW_INIT, payload: games[0].hashcode } );
    }
    dispatchToStore({ type: SET_TIMER, payload: {
      waiting: timerState.waitingForTimer,
      secondsRemaining: timerState.timeRemaining
    }});
  }).catch((e) => {
    if (e.code === 401) { // token has rotten
      dispatchToStore({ type: FORCE_LOGOUT });
    } else {
      dispatchNext({ type: UPDATE_CURRENT_GAMES_FAIL, payload: e });
    }
  });
}

function getGameOverview(currentSessionHash: string, api: RiichiApiService, next: Dispatch) {
  next({ type: GET_GAME_OVERVIEW_INIT });
  api.getGameOverview(currentSessionHash)
    .then((overview) => next({ type: GET_GAME_OVERVIEW_SUCCESS, payload: overview }))
    .catch((error: RemoteError) => next({ type: GET_GAME_OVERVIEW_FAIL, payload: error }));
}

function getOtherTable(sessionHash: string, api: RiichiApiService, dispatch: Dispatch) {
  dispatch({ type: GET_OTHER_TABLE_INIT, payload: sessionHash });
  api.getGameOverview(sessionHash)
    .then((table) => dispatch({ type: GET_OTHER_TABLE_SUCCESS, payload: table }))
    .catch((e) => dispatch({ type: GET_OTHER_TABLE_FAIL, payload: e }));
}

function getOtherTableReload(sessionHash: string, api: RiichiApiService, dispatch: Dispatch) {
  dispatch({ type: GET_OTHER_TABLE_RELOAD });
  api.getGameOverview(sessionHash)
    .then((table) => dispatch({ type: GET_OTHER_TABLE_SUCCESS, payload: table }))
    .catch((e) => dispatch({ type: GET_OTHER_TABLE_FAIL, payload: e }));
}

function getOtherTablesList(api: RiichiApiService, dispatch: Dispatch) {
  dispatch({ type: GET_OTHER_TABLES_LIST_INIT });
  api.getTablesState()
    .then((tables) => dispatch({ type: GET_OTHER_TABLES_LIST_SUCCESS, payload: tables }))
    .catch((e) => dispatch({ type: GET_OTHER_TABLES_LIST_FAIL, payload: e }));
}

function getOtherTablesListReload(api: RiichiApiService, dispatch: Dispatch) {
  dispatch({ type: GET_OTHER_TABLES_LIST_RELOAD });
  api.getTablesState()
    .then((tables) => dispatch({ type: GET_OTHER_TABLES_LIST_SUCCESS, payload: tables }))
    .catch((e) => dispatch({ type: GET_OTHER_TABLES_LIST_FAIL, payload: e }));
}

function getLastRound(sessionHash: string, api: RiichiApiService, dispatch: Dispatch) {
  dispatch({ type: GET_LAST_ROUND_INIT });
  api.getLastRound(sessionHash)
    .then((paymentsInfo) => dispatch({ type: GET_LAST_ROUND_SUCCESS, payload: paymentsInfo }))
    .catch((e) => dispatch({ type: GET_LAST_ROUND_FAIL, payload: e }));
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
      dispatchToStore({ type: GET_GAME_OVERVIEW_INIT, payload: state.currentSessionHash });
    }).catch((e) => dispatch({ type: ADD_ROUND_FAIL, payload: e }));
}

function getLastResults(api: RiichiApiService, dispatch: Dispatch) {
  dispatch({ type: GET_LAST_RESULTS_INIT });
  api.getLastResults()
    .then((results) => dispatch({ type: GET_LAST_RESULTS_SUCCESS, payload: results }))
    .catch((e) => dispatch({ type: GET_LAST_RESULTS_FAIL, payload: e }));
}

function getAllPlayers(api: RiichiApiService, dispatch: Dispatch) {
  dispatch({ type: GET_ALL_PLAYERS_INIT });
  api.getAllPlayers()
    .then((results) => dispatch({ type: GET_ALL_PLAYERS_SUCCESS, payload: results }))
    .catch((e) => dispatch({ type: GET_ALL_PLAYERS_FAIL, payload: e }));
}

function startGame(playerIds: number[], api: RiichiApiService, dispatch: Dispatch, dispatchToStore: Dispatch) {
  dispatch({ type: START_GAME_INIT });
  api.startGame(playerIds)
    .then((results) => {
      dispatchToStore({ type: START_GAME_SUCCESS, payload: results });
      dispatchToStore({ type: RESET_STATE });
      dispatchToStore({ type: UPDATE_CURRENT_GAMES_INIT });
    })
    .catch((e) => dispatch({ type: START_GAME_FAIL, payload: e }));
}
