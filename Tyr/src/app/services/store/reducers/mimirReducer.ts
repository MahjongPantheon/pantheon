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
  GET_LAST_RESULTS_FAIL,
  GET_LAST_RESULTS_INIT,
  GET_LAST_RESULTS_SUCCESS,
  GET_LAST_ROUND_FAIL,
  GET_LAST_ROUND_INIT,
  GET_LAST_ROUND_SUCCESS,
  RANDOMIZE_NEWGAME_PLAYERS,
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
  UPDATE_CURRENT_GAMES_SUCCESS
} from "../actions/interfaces";
import {IAppState} from "../interfaces";
import {makeYakuGraph} from "../../../primitives/yaku-compat";
import {RemoteError} from "../../remoteError";
import {modifyArray} from "./util";
import {defaultPlayer} from "../selectors/screenNewGameSelectors";
import {rand} from "../../../helpers/rand";

export function mimirReducer(
  state = initialState,
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
      // TODO
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
      // TODO
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
      // TODO
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
      // TODO: metrika
      //this.metrika.track(MetrikaService.LOAD_ERROR, { type: 'screen-confirmation', code: e.code, request: reqType });
      error = (action.payload.code === 403
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
        lastRoundOverview: null,
        lastRoundOverviewError: null
      };
    case GET_LAST_ROUND_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false
        },
        lastRoundOverview: action.payload,
        lastRoundOverviewError: null
      };
    case GET_LAST_ROUND_FAIL:
      // TODO: i18n!!!1111
      error = this.i18n._t('Error occured. Try again.');
      if (!action.payload) {
        error = this.i18n._t("Latest hand wasn't found");
      } else if (action.payload instanceof RemoteError) {
        // TODO
        // this.metrika.track(MetrikaService.LOAD_ERROR, { type: 'screen-last-round', request: 'getLastRound' });
        if (action.payload.code === 403) {
          error = this.i18n._t("Authentication failed");
        } else {
          error = this.i18n._t('Unexpected server error');
        }
      }

      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false
        },
        lastRoundOverview: null,
        lastRoundOverviewError: {
          details: action.payload,
          message: error
        }
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
      // TODO
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
  }
}
