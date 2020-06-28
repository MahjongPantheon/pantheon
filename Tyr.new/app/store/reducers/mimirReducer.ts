import deepclone from 'deep-clone';
import {
  ADD_ROUND_FAIL,
  ADD_ROUND_INIT,
  ADD_ROUND_SUCCESS,
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
  GET_OTHER_TABLE_INIT,
  GET_OTHER_TABLE_SUCCESS,
  GET_OTHER_TABLES_LIST_FAIL,
  GET_OTHER_TABLES_LIST_INIT,
  GET_OTHER_TABLES_LIST_SUCCESS,
  RANDOMIZE_NEWGAME_PLAYERS,
  RESET_REGISTRATION_ERROR,
  SELECT_NEWGAME_PLAYER_KAMICHA,
  SELECT_NEWGAME_PLAYER_SELF,
  SELECT_NEWGAME_PLAYER_SHIMOCHA,
  SELECT_NEWGAME_PLAYER_TOIMEN,
  START_GAME_FAIL,
  START_GAME_INIT,
  START_GAME_SUCCESS,
  TABLE_ROTATE_CLOCKWISE,
  TABLE_ROTATE_COUNTERCLOCKWISE,
  UPDATE_CURRENT_GAMES_FAIL,
  UPDATE_CURRENT_GAMES_INIT,
  UPDATE_CURRENT_GAMES_SUCCESS,
} from '../actions/interfaces';
import {IAppState} from '../interfaces';
import {makeYakuGraph} from '#/primitives/yaku-compat';
import {RemoteError} from '#/services/remoteError';
import {modifyArray} from './util';
import {defaultPlayer} from '../selectors/screenNewGameSelectors';
import {rand} from '#/primitives/rand';
import {initialState} from '../state';
import {Player} from "#/interfaces/common";
import {LUser} from "#/interfaces/local";

export function mimirReducer(
  state: IAppState,
  action: AppActionTypes
): IAppState {
  let error;
  let player;
  switch (action.type) {
    case CONFIRM_REGISTRATION_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          login: true
        },
        loginError: undefined
      };
    case CONFIRM_REGISTRATION_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          login: false
        },
        isLoggedIn: true,
        currentScreen: 'overview',
        loginError: undefined
      };
    case CONFIRM_REGISTRATION_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          login: false
        },
        isLoggedIn: false,
        currentScreen: 'login',
        loginError: { details: action.payload, message: action.payload.message }
      };
    case RESET_REGISTRATION_ERROR:
      return {
        ...state,
        loginError: undefined
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
        state = {
          ...state,
          currentScreen: ['otherTablesList', 'otherTable', 'lastResults'].includes(state.currentScreen)
            ? state.currentScreen
            : 'overview'
        };
      }

      let mapIdToPlayer: { [key: string]: Player } = {};
      let players = null;
      if (action.payload.games[0]) {
        players = action.payload.games[0].players;
        for (let p of players) {
          mapIdToPlayer[p.id.toString()] = p;
        }
      }

      return {
        ...state,
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
          games: false
        },
        updateCurrentGamesError: { // Stored for conformity, but is not displayed anywhere now.
          details: action.payload,
          message: action.payload.message
        }
      };
    case GET_ALL_PLAYERS_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          players: true
        },
        allPlayers: undefined,
        allPlayersError: undefined
      };
    case GET_ALL_PLAYERS_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          players: false
        },
        allPlayers: action.payload,
        allPlayersError: undefined
      };
    case GET_ALL_PLAYERS_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          players: false
        },
        allPlayers: undefined,
        allPlayersError: { details: action.payload, message: action.payload.message }
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
        changesOverviewError: undefined
      };
    case GET_CHANGES_OVERVIEW_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false
        },
        changesOverview: undefined,
        changesOverviewError: {
          message: action.payload.message,
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
        lastRoundOverview: undefined,
        lastRoundOverviewErrorCode: undefined
      };
    case GET_LAST_ROUND_SUCCESS:
      if (action.payload) { // check for success: in some cases we can get 404 for this request
        return {
          ...state,
          loading: {
            ...state.loading,
            overview: false
          },
          lastRoundOverview: action.payload,
          lastRoundOverviewErrorCode: undefined
        };
      } else {
        return {
          ...state,
          loading: {
            ...state.loading,
            overview: false
          },
          lastRoundOverview: undefined,
          lastRoundOverviewErrorCode: 404
        };
      }
    case GET_LAST_ROUND_FAIL:
      let code = 418;
      if (!action.payload) {
        error = 404;
      } else if (action.payload instanceof RemoteError) {
        error = action.payload.code;
      }

      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false
        },
        lastRoundOverview: undefined,
        lastRoundOverviewErrorCode: code
      };
    case GET_LAST_RESULTS_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: true
        },
        lastResults: undefined,
        lastResultsError: undefined
      };
    case GET_LAST_RESULTS_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false
        },
        lastResults: action.payload,
        lastResultsError: undefined
      };
    case GET_LAST_RESULTS_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false
        },
        lastResults: undefined,
        lastResultsError: {
          details: action.payload,
          message: action.payload.message
        }
      };
    case START_GAME_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          games: true
        },
        newGameStartError: undefined
      };
    case START_GAME_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          games: false
        },
        newGameStartError: undefined
      };
    case START_GAME_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          games: false
        },
        newGameStartError: {
          details: action.payload,
          message: action.payload.message
        }
      };
    case RANDOMIZE_NEWGAME_PLAYERS:
      const newArr = rand((<LUser[]>[]).concat(state.newGameSelectedUsers || []));
      return {
        ...state,
        newGameSelectedUsers: newArr
      };
    case SELECT_NEWGAME_PLAYER_SELF:
      player = state.allPlayers?.find((p) => p.id === action.payload) || defaultPlayer;
      return {
        ...state,
        newGameSelectedUsers: modifyArray(state.newGameSelectedUsers || [], 0, player)
      };
    case SELECT_NEWGAME_PLAYER_SHIMOCHA:
      player = state.allPlayers?.find((p) => p.id === action.payload) || defaultPlayer;
      return {
        ...state,
        newGameSelectedUsers: modifyArray(state.newGameSelectedUsers || [], 1, player)
      };
    case SELECT_NEWGAME_PLAYER_TOIMEN:
      player = state.allPlayers?.find((p) => p.id === action.payload) || defaultPlayer;
      return {
        ...state,
        newGameSelectedUsers: modifyArray(state.newGameSelectedUsers || [], 2, player)
      };
    case SELECT_NEWGAME_PLAYER_KAMICHA:
      player = state.allPlayers?.find((p) => p.id === action.payload) || defaultPlayer;
      return {
        ...state,
        newGameSelectedUsers: modifyArray(state.newGameSelectedUsers || [], 3, player)
      };
    case TABLE_ROTATE_CLOCKWISE:
      return {
        ...state,
        overviewViewShift: ((state.overviewViewShift || 0) + 3) % 4
      };
    case TABLE_ROTATE_COUNTERCLOCKWISE:
      return {
        ...state,
        overviewViewShift: ((state.overviewViewShift || 0) + 1) % 4
      };
    case GET_GAME_OVERVIEW_INIT:
      return {
        ...state,
        gameOverviewReady: false
      };
    case GET_GAME_OVERVIEW_SUCCESS:
      return {
        ...state,
        gameOverviewReady: true,
        ...(action.payload)
      };
    case GET_GAME_OVERVIEW_FAIL:
      return {
        ...state,
        currentScreen: 'login'
      };
    case GET_OTHER_TABLES_LIST_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          otherTables: true
        },
        otherTablesListError: undefined
      };
    case GET_OTHER_TABLES_LIST_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          otherTables: false
        },
        otherTablesList: action.payload,
        otherTablesListError: undefined
      };
    case GET_OTHER_TABLES_LIST_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          otherTables: false
        },
        otherTablesListError: {
          message: action.payload.message,
          details: action.payload
        }
      };
    case GET_OTHER_TABLE_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          otherTable: true
        },
        currentOtherTable: undefined,
        currentOtherTableHash: action.payload,
        currentOtherTableIndex: 0,
        lastRoundOverview: undefined,
        currentOtherTablePlayers: [],
        otherTableError: undefined
      };
    case GET_OTHER_TABLE_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          otherTable: false
        },
        currentOtherTable: action.payload,
        currentOtherTableIndex: action.payload.tableIndex,
        // currentOtherTableLastRound: action.payload, // TODO wat
        currentOtherTablePlayers: action.payload.players,
        otherTableError: undefined
      };
    case GET_OTHER_TABLE_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          otherTable: false
        },
        currentOtherTable: undefined,
        currentOtherTableHash: null,
        currentOtherTableIndex: 0,
        lastRoundOverview: undefined,
        currentOtherTablePlayers: [],
        otherTableError: {
          message: action.payload.message,
          details: action.payload
        }
      };
    case ADD_ROUND_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          addRound: true
        }
      };
    case ADD_ROUND_SUCCESS:
      if (action.payload._isFinished) {
        const cleanState = deepclone(initialState);
        cleanState.gameConfig = state.gameConfig;
        return {
          ...cleanState,
          currentScreen: 'lastResults',
          gameConfig: state.gameConfig,
          currentPlayerDisplayName: state.currentPlayerDisplayName,
          currentPlayerId: state.currentPlayerId,
          isLoggedIn: state.isLoggedIn,
          isIos: state.isIos,
          yakuList: state.yakuList,
          isUniversalWatcher: state.isUniversalWatcher,
          settings: state.settings
        };
      }
      return {
        ...state,
        loading: {
          ...state.loading,
          addRound: false
        },
        currentScreen: 'overview'
      };
    case ADD_ROUND_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          addRound: false
        },
        changesOverviewError: {
          details: action.payload,
          message: action.payload.message
        }
      };
    default:
      return state;
  }
}
