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
  GET_GAME_OVERVIEW_SUCCESS,
  GET_GAME_OVERVIEW_FAIL,
  GET_LAST_RESULTS_FAIL,
  GET_LAST_RESULTS_INIT,
  GET_LAST_RESULTS_SUCCESS,
  GET_LAST_ROUND_FAIL,
  GET_LAST_ROUND_INIT,
  GET_LAST_ROUND_SUCCESS,
  RANDOMIZE_NEWGAME_PLAYERS, RESET_REGISTRATION_ERROR,
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
  GET_GAME_OVERVIEW_INIT,
  GET_OTHER_TABLES_LIST_INIT,
  GET_OTHER_TABLES_LIST_SUCCESS,
  GET_OTHER_TABLES_LIST_FAIL, ADD_ROUND_INIT, ADD_ROUND_SUCCESS, ADD_ROUND_FAIL,
} from '../actions/interfaces';
import { IAppState } from '../interfaces';
import { makeYakuGraph } from '../../../primitives/yaku-compat';
import { RemoteError } from '../../remoteError';
import { modifyArray } from './util';
import { defaultPlayer } from '../selectors/screenNewGameSelectors';
import { rand } from '../../../helpers/rand';
import { Player } from '../../../interfaces/common';

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
        loginError: null
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
        loginError: null
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
        loginError: null
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
      // if (!action.payload.games[0]) {
      //   return state; // TODO ##1: some error handling for this case; no games - or game ended just now
      // }

      let mapIdToPlayer = {};
      let players = null;
      if (action.payload.games[0]) {
        players = action.payload.games[0].players;
        for (let p of players) {
          mapIdToPlayer[p.id] = p;
        }
      }

      return {
        ...state,
        // currentScreen: 'overview',
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
          games: false // TODO ##1: what about error?
        }
      };
    case GET_ALL_PLAYERS_INIT:
      // TODO ##1
      // this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-new-game' });
      return {
        ...state,
        loading: {
          ...state.loading,
          players: true
        },
        allPlayers: null,
        allPlayersError: null
      };
    case GET_ALL_PLAYERS_SUCCESS:
      // TODO ##1
      // this.metrika.track(MetrikaService.LOAD_SUCCESS, { type: 'screen-new-game', request: 'getAllPlayers' });
      return {
        ...state,
        loading: {
          ...state.loading,
          players: false
        },
        allPlayers: action.payload,
        allPlayersError: null
      };
    case GET_ALL_PLAYERS_FAIL:
      // TODO ##1
      // this.metrika.track(MetrikaService.LOAD_ERROR, { type: 'screen-new-game', request: 'getAllPlayers', message: e.toString() }));
      return {
        ...state,
        loading: {
          ...state.loading,
          players: false
        },
        allPlayers: null,
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
        changesOverviewError: null
      };
    case GET_CHANGES_OVERVIEW_FAIL:
      // TODO ##1: metrika
      // this.metrika.track(MetrikaService.LOAD_ERROR, { type: 'screen-confirmation', code: e.code, request: reqType });
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false // TODO ##1: what about error?
        },
        changesOverview: null,
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
        lastRoundOverview: null,
        lastRoundOverviewErrorCode: null
      };
    case GET_LAST_ROUND_SUCCESS:
      if (action.payload) {
        return {
          ...state,
          loading: {
            ...state.loading,
            overview: false
          },
          lastRoundOverview: action.payload,
          lastRoundOverviewErrorCode: null
        };
      } else {
        return {
          ...state,
          loading: {
            ...state.loading,
            overview: false
          },
          lastRoundOverview: null,
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
        lastRoundOverview: null,
        lastRoundOverviewErrorCode: code
      };
    case GET_LAST_RESULTS_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: true
        },
        lastResults: null,
        lastResultsError: null
      };
    case GET_LAST_RESULTS_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false
        },
        lastResults: action.payload,
        lastResultsError: null
      };
    case GET_LAST_RESULTS_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false
        },
        lastResults: null,
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
        newGameStartError: null
      };
    case START_GAME_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          games: false
        },
        newGameStartError: null
      };
    case START_GAME_FAIL:
      // TODO ##1
      // this.metrika.track(MetrikaService.LOAD_ERROR, { type: 'screen-new-game', request: 'startGame', message: e.toString() });
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
      const newArr = rand([].concat(state.newGameSelectedUsers));
      return {
        ...state,
        newGameSelectedUsers: newArr
      };
    case SELECT_NEWGAME_PLAYER_SELF:
      player = state.allPlayers.find((p) => p.id === action.payload) || defaultPlayer;
      return {
        ...state,
        newGameSelectedUsers: modifyArray(state.newGameSelectedUsers, 0, player)
      };
    case SELECT_NEWGAME_PLAYER_SHIMOCHA:
      player = state.allPlayers.find((p) => p.id === action.payload) || defaultPlayer;
      return {
        ...state,
        newGameSelectedUsers: modifyArray(state.newGameSelectedUsers, 1, player)
      };
    case SELECT_NEWGAME_PLAYER_TOIMEN:
      player = state.allPlayers.find((p) => p.id === action.payload) || defaultPlayer;
      return {
        ...state,
        newGameSelectedUsers: modifyArray(state.newGameSelectedUsers, 2, player)
      };
    case SELECT_NEWGAME_PLAYER_KAMICHA:
      player = state.allPlayers.find((p) => p.id === action.payload) || defaultPlayer;
      return {
        ...state,
        newGameSelectedUsers: modifyArray(state.newGameSelectedUsers, 3, player)
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
        tableIndex: action.payload.table_index,
        players: [...action.payload.players.map((pl) => {
          return <Player>{
            id: pl.id,
            alias: '',
            displayName: pl.display_name,
            score: action.payload.state.scores[pl.id] || 0,
            penalties: action.payload.state.penalties[pl.id] || 0
          };
        })] as [Player, Player, Player, Player],
        currentRound: action.payload.state.round,
        riichiOnTable: action.payload.state.riichi,
        honba: action.payload.state.honba,
        yellowZoneAlreadyPlayed: action.payload.state.yellowZoneAlreadyPlayed,
        // TODO: action.payload.state.finished & action.payload.state.dealer - for what?
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
        otherTablesListError: null
      };
    case GET_OTHER_TABLES_LIST_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          otherTables: false
        },
        otherTablesList: action.payload,
        otherTablesListError: null
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
    case ADD_ROUND_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          addRound: true
        }
      };
    case ADD_ROUND_SUCCESS:
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
