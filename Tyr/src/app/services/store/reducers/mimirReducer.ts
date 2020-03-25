import {initialState} from "../state";
import {
  AppActionTypes,
  CONFIRM_REGISTRATION_FAIL,
  CONFIRM_REGISTRATION_INIT,
  CONFIRM_REGISTRATION_SUCCESS,
  GET_ALL_PLAYERS_FAIL,
  GET_ALL_PLAYERS_INIT,
  GET_ALL_PLAYERS_SUCCESS,
  GET_CHANGES_OVERVIEW_FAIL,
  GET_CHANGES_OVERVIEW_INIT,
  GET_CHANGES_OVERVIEW_SUCCESS,
  GET_LAST_ROUND_FAIL,
  GET_LAST_ROUND_INIT,
  GET_LAST_ROUND_SUCCESS,
  UPDATE_CURRENT_GAMES_FAIL,
  UPDATE_CURRENT_GAMES_INIT,
  UPDATE_CURRENT_GAMES_SUCCESS
} from "../actions/interfaces";
import {IAppState} from "../interfaces";
import {makeYakuGraph} from "../../../primitives/yaku-compat";

export function mimirReducer(
  state = initialState,
  action: AppActionTypes
): IAppState {
  switch (action.type) {
    case CONFIRM_REGISTRATION_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          login: true
        }
      };
    case CONFIRM_REGISTRATION_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          login: false
        },
        isLoggedIn: true,
        currentScreen: 'overview'
      };
    case CONFIRM_REGISTRATION_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          login: false
        },
        isLoggedIn: false,
        currentScreen: 'login' // TODO: what about error?
      };
    case UPDATE_CURRENT_GAMES_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          games: true
        }
      };
    case UPDATE_CURRENT_GAMES_SUCCESS:
      if (!action.payload.games[0]) {
        return state; // TODO: some error handling for this case; no games - or game ended just now
      }

      let players = action.payload.games[0].players;
      let mapIdToPlayer = {};
      for (let p of players) {
        mapIdToPlayer[p.id] = p;
      }

      return {
        ...state,
        currentScreen: 'overview', // TODO check this
        gameConfig: action.payload.gameConfig,
        currentPlayerId: action.payload.playerInfo.id,
        currentPlayerDisplayName: action.payload.playerInfo.displayName,
        currentSessionHash: action.payload.games[0] && action.payload.games[0].hashcode,
        players,
        mapIdToPlayer,
        yakuList: makeYakuGraph(action.payload.gameConfig.withMultiYakumans),
        timer: {
          ...state.timer,
          secondsRemaining: action.payload.timerState.timeRemaining || 0,
          lastUpdateSecondsRemaining: action.payload.timerState.timeRemaining || 0,
          lastUpdateTimestamp: Math.round((new Date()).getTime() / 1000),
          waiting: action.payload.timerState.waitingForTimer
        },
        loading: {
          ...state.loading,
          games: false
        }
      };
    case UPDATE_CURRENT_GAMES_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          games: false // TODO: what about error?
        }
      };
    case GET_ALL_PLAYERS_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          players: true
        }
      };
    case GET_ALL_PLAYERS_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          players: false
        },
        allPlayers: action.payload
      };
    case GET_ALL_PLAYERS_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          players: false // TODO: what about error?
        }
      };
    case GET_CHANGES_OVERVIEW_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: true
        }
      };
    case GET_CHANGES_OVERVIEW_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false
        },
        changesOverview: action.payload,
        changesOverviewError: null
      };
    case GET_CHANGES_OVERVIEW_FAIL:
      // TODO: metrika
      //this.metrika.track(MetrikaService.LOAD_ERROR, { type: 'screen-confirmation', code: e.code, request: reqType });
      let error = (action.payload.code === 403
        ? this.i18n._t("Authentication failed")
        : this.i18n._t('Failed to add round. Was this hand already added by someone else?')
      );
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false // TODO: what about error?
        },
        changesOverview: null,
        changesOverviewError: {
          message: error,
          details: action.payload
        }
      };
    case GET_LAST_ROUND_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: true
        },
        changesOverviewError: null,
        changesOverview: null
      };
    case GET_LAST_ROUND_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false
        },
        lastRoundOverview: action.payload
      };
    case GET_LAST_ROUND_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false // TODO: what about error?
        }
      };
  }
}
