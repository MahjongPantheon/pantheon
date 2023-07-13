/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import deepclone from 'deep-clone';
import {
  ADD_ROUND_FAIL,
  ADD_ROUND_INIT,
  ADD_ROUND_SUCCESS,
  AppActionTypes,
  CLEAR_NEWGAME_PLAYERS,
  EVENTS_GET_LIST_FAIL,
  EVENTS_GET_LIST_INIT,
  EVENTS_GET_LIST_SUCCESS,
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
  GET_OTHER_TABLE_SUCCESS,
  GET_OTHER_TABLES_LIST_FAIL,
  GET_OTHER_TABLES_LIST_INIT,
  GET_OTHER_TABLES_LIST_SUCCESS,
  GET_USERINFO_FAIL,
  GET_USERINFO_INIT,
  GET_USERINFO_SUCCESS,
  HISTORY_INIT,
  LOGIN_FAIL,
  LOGIN_INIT,
  LOGIN_SUCCESS,
  RANDOMIZE_NEWGAME_PLAYERS,
  RESET_LOGIN_ERROR,
  SELECT_EVENT,
  SELECT_NEWGAME_PLAYER_EAST,
  SELECT_NEWGAME_PLAYER_NORTH,
  SELECT_NEWGAME_PLAYER_SOUTH,
  SELECT_NEWGAME_PLAYER_WEST,
  SET_NEWGAME_PLAYERS,
  START_GAME_FAIL,
  START_GAME_INIT,
  START_GAME_SUCCESS,
  TABLE_ROTATE_CLOCKWISE,
  TABLE_ROTATE_COUNTERCLOCKWISE,
  UPDATE_CURRENT_GAMES_FAIL,
  UPDATE_CURRENT_GAMES_INIT,
  UPDATE_CURRENT_GAMES_SUCCESS,
} from '../actions/interfaces';
import { IAppState } from '../interfaces';
import { makeYakuGraph } from '../../primitives/yaku-compat';
import { modifyArray } from './util';
import { defaultPlayer } from '../selectors/screenNewGameSelectors';
import { rand } from '../../primitives/rand';
import { initialState } from '../state';
import { PlayerInSession, RegisteredPlayer } from '../../clients/proto/atoms.pb';

export function mimirReducer(state: IAppState, action: AppActionTypes): IAppState {
  let player;
  switch (action.type) {
    case LOGIN_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          login: true,
        },
        loginError: undefined,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          login: false,
        },
        currentPlayerId: action.payload.personId || undefined,
        isLoggedIn: true,
        currentScreen: 'eventSelector',
        loginError: undefined,
      };
    case LOGIN_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          login: false,
        },
        isLoggedIn: false,
        currentScreen: 'login',
        loginError: { details: action.payload, message: action.payload.message },
      };
    case RESET_LOGIN_ERROR:
      return {
        ...state,
        currentScreen: 'login', //todo remove
        loginError: undefined,
      };
    case GET_USERINFO_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          players: true,
        },
      };
    case GET_USERINFO_SUCCESS:
      return {
        ...state,
        currentPlayerId: action.payload.id,
        currentPlayerDisplayName: action.payload.title,
        currentPlayerHasAvatar: action.payload.hasAvatar,
        loading: {
          ...state.loading,
          players: false,
        },
      };
    case GET_USERINFO_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          players: false,
        },
        getUserinfoError: {
          // Stored for conformity, but is not displayed anywhere now.
          details: action.payload,
          message: action.payload.message,
        },
      };
    case UPDATE_CURRENT_GAMES_INIT:
      return {
        ...state,
        currentOtherTable: undefined,
        currentOtherTablePlayers: [],
        currentOtherTableHash: undefined,
        currentOtherTableIndex: 0,
        loading: {
          ...state.loading,
          games: true,
        },
      };
    case UPDATE_CURRENT_GAMES_SUCCESS: {
      if (!action.payload.games[0]) {
        state = {
          ...state,
          currentScreen: ['otherTablesList', 'otherTable', 'lastResults'].includes(
            state.currentScreen
          )
            ? state.currentScreen
            : 'overview',
        };
      }

      const mapIdToPlayer: { [key: string]: PlayerInSession } = {};
      let players = undefined;
      if (action.payload.games[0]) {
        players = action.payload.games[0].players;
        for (const p of players) {
          mapIdToPlayer[p.id.toString()] = p;
        }
      }

      return {
        ...state,
        gameConfig: action.payload.gameConfig,
        currentSessionHash: action.payload.games[0] && action.payload.games[0].sessionHash,
        players,
        mapIdToPlayer,
        yakuList: makeYakuGraph(action.payload.gameConfig.rulesetConfig.withMultiYakumans),
        timer: {
          ...state.timer,
          secondsRemaining: action.payload.timerState.timeRemaining || 0,
          lastUpdateSecondsRemaining: action.payload.timerState.timeRemaining || 0,
          lastUpdateTimestamp: Math.round(new Date().getTime() / 1000),
          waiting: action.payload.timerState.waitingForTimer,
          // TODO: fix in https://github.com/MahjongPantheon/pantheon/issues/282
          autostartSecondsRemaining: 0, // action.payload.timerState.autostartTimer || 0,
          autostartLastUpdateSecondsRemaining: 0, // action.payload.timerState.autostartTimer || 0,
          autostartLastUpdateTimestamp: Math.round(new Date().getTime() / 1000),
        },
        loading: {
          ...state.loading,
          games: false,
        },
      };
    }
    case UPDATE_CURRENT_GAMES_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          games: false,
        },
        updateCurrentGamesError: {
          // Stored for conformity, but is not displayed anywhere now.
          details: action.payload,
          message: action.payload.message,
        },
      };
    case GET_ALL_PLAYERS_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          players: true,
        },
        allPlayers: undefined,
        allPlayersError: undefined,
      };
    case GET_ALL_PLAYERS_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          players: false,
        },
        allPlayers: action.payload,
        allPlayersError: undefined,
      };
    case GET_ALL_PLAYERS_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          players: false,
        },
        allPlayers: undefined,
        allPlayersError: { details: action.payload, message: action.payload.message },
      };
    case GET_CHANGES_OVERVIEW_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: true,
        },
      };
    case GET_CHANGES_OVERVIEW_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false,
        },
        changesOverview: action.payload,
        changesOverviewError: undefined,
      };
    case GET_CHANGES_OVERVIEW_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false,
        },
        changesOverview: undefined,
        changesOverviewError: {
          message: action.payload.message,
          details: action.payload,
        },
      };
    case GET_ALL_ROUNDS_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: true,
        },
        allRoundsOverview: undefined,
        allRoundsOverviewErrorCode: undefined,
      };
    case GET_ALL_ROUNDS_SUCCESS:
      if (action.payload) {
        // check for success: in some cases we can get 404 for this request
        return {
          ...state,
          loading: {
            ...state.loading,
            overview: false,
          },
          allRoundsOverview: action.payload,
          allRoundsOverviewErrorCode: undefined,
        };
      } else {
        return {
          ...state,
          loading: {
            ...state.loading,
            overview: false,
          },
          allRoundsOverview: undefined,
          allRoundsOverviewErrorCode: 404,
        };
      }
    case GET_ALL_ROUNDS_FAIL: {
      let code = 418;
      if (!action.payload) {
        code = 404;
      } else {
        code = action.payload.code;
      }

      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false,
        },
        allRoundsOverview: undefined,
        allRoundsOverviewErrorCode: code,
      };
    }
    case GET_LAST_RESULTS_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: true,
        },
        lastResults: undefined,
        lastResultsError: undefined,
      };
    case GET_LAST_RESULTS_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false,
        },
        lastResults: action.payload,
        lastResultsError: undefined,
      };
    case GET_LAST_RESULTS_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          overview: false,
        },
        lastResults: undefined,
        lastResultsError: {
          details: action.payload,
          message: action.payload.message,
        },
      };
    case START_GAME_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          games: true,
        },
        newGameStartError: undefined,
      };
    case START_GAME_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          games: false,
        },
        newGameStartError: undefined,
      };
    case START_GAME_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          games: false,
        },
        newGameStartError: {
          details: action.payload,
          message: action.payload.message,
        },
      };
    case RANDOMIZE_NEWGAME_PLAYERS: {
      const newArr = rand(([] as RegisteredPlayer[]).concat(state.newGameSelectedUsers ?? []));
      return {
        ...state,
        newGameSelectedUsers: newArr,
      };
    }
    case CLEAR_NEWGAME_PLAYERS:
      return {
        ...state,
        newGameSelectedUsers: [defaultPlayer, defaultPlayer, defaultPlayer, defaultPlayer],
        newGameIdsToSet: undefined,
      };
    case SET_NEWGAME_PLAYERS:
      if (!state.newGameIdsToSet) {
        return state;
      }

      const selectedUsers = state.newGameIdsToSet.map((id) => {
        return state.allPlayers?.find((p) => p.id === id) ?? defaultPlayer;
      });

      return {
        ...state,
        newGameSelectedUsers: selectedUsers,
        newGameIdsToSet: undefined,
      };
    case SELECT_NEWGAME_PLAYER_EAST:
      player = state.allPlayers?.find((p) => p.id === action.payload) ?? defaultPlayer;
      return {
        ...state,
        newGameSelectedUsers: modifyArray(state.newGameSelectedUsers ?? [], 0, player),
      };
    case SELECT_NEWGAME_PLAYER_SOUTH:
      player = state.allPlayers?.find((p) => p.id === action.payload) ?? defaultPlayer;
      return {
        ...state,
        newGameSelectedUsers: modifyArray(state.newGameSelectedUsers ?? [], 1, player),
      };
    case SELECT_NEWGAME_PLAYER_WEST:
      player = state.allPlayers?.find((p) => p.id === action.payload) ?? defaultPlayer;
      return {
        ...state,
        newGameSelectedUsers: modifyArray(state.newGameSelectedUsers ?? [], 2, player),
      };
    case SELECT_NEWGAME_PLAYER_NORTH:
      player = state.allPlayers?.find((p) => p.id === action.payload) ?? defaultPlayer;
      return {
        ...state,
        newGameSelectedUsers: modifyArray(state.newGameSelectedUsers ?? [], 3, player),
      };
    case TABLE_ROTATE_CLOCKWISE:
      return {
        ...state,
        overviewViewShift: ((state.overviewViewShift ?? 0) + 1) % 4,
      };
    case TABLE_ROTATE_COUNTERCLOCKWISE:
      return {
        ...state,
        overviewViewShift: ((state.overviewViewShift ?? 0) + 3) % 4,
      };
    case GET_GAME_OVERVIEW_INIT:
      return {
        ...state,
        currentOtherTable: undefined,
        currentOtherTablePlayers: [],
        currentOtherTableHash: undefined,
        currentOtherTableIndex: 0,
        gameOverviewReady: false,
      };
    case GET_GAME_OVERVIEW_SUCCESS:
      return {
        ...state,
        gameOverviewReady: true,
        currentEventId: action.payload.eventId,
        tableIndex: action.payload.tableIndex,
        players: action.payload.players,
        sessionState: action.payload.state,
      };
    case GET_GAME_OVERVIEW_FAIL:
      return {
        ...state,
        currentScreen: 'login',
      };
    case GET_OTHER_TABLES_LIST_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          otherTables: true,
        },
        otherTablesListError: undefined,
      };
    case GET_OTHER_TABLES_LIST_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          otherTables: false,
        },
        otherTablesList: action.payload,
        currentScreen: 'otherTablesList',
        otherTablesListError: undefined,
      };
    case GET_OTHER_TABLES_LIST_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          otherTables: false,
        },
        currentScreen: 'otherTablesList',
        otherTablesListError: {
          message: action.payload.message,
          details: action.payload,
        },
      };
    case GET_OTHER_TABLE_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          otherTable: true,
        },
        currentOtherTable: undefined,
        currentOtherTableHash: action.payload,
        currentOtherTableIndex: 0,
        allRoundsOverview: undefined,
        currentOtherTablePlayers: [],
        otherTableError: undefined,
      };
    case GET_OTHER_TABLE_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          otherTable: false,
        },
        currentScreen: 'otherTable',
        currentOtherTable: action.payload,
        currentOtherTableIndex: action.payload.tableIndex,
        currentOtherTablePlayers: action.payload.players,
        otherTableError: undefined,
      };
    case GET_OTHER_TABLE_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          otherTable: false,
        },
        currentScreen: 'otherTable',
        currentOtherTable: undefined,
        currentOtherTableHash: undefined,
        currentOtherTableIndex: 0,
        allRoundsOverview: undefined,
        currentOtherTablePlayers: [],
        otherTableError: {
          message: action.payload.message,
          details: action.payload,
        },
      };
    case ADD_ROUND_INIT:
      return {
        ...state,
        loading: {
          ...state.loading,
          addRound: true,
        },
      };
    case ADD_ROUND_SUCCESS:
      if (action.payload.isFinished) {
        const cleanState = deepclone(initialState);
        return {
          ...cleanState,
          eventsList: state.eventsList,
          currentEventId: state.currentEventId,
          currentScreen: 'lastResults',
          gameConfig: state.gameConfig,
          currentPlayerDisplayName: state.currentPlayerDisplayName,
          currentPlayerHasAvatar: state.currentPlayerHasAvatar,
          currentPlayerId: state.currentPlayerId,
          isLoggedIn: state.isLoggedIn,
          isIos: state.isIos,
          yakuList: state.yakuList,
          settings: state.settings,
        };
      }
      return {
        ...state,
        loading: {
          ...state.loading,
          addRound: false,
        },
        currentOutcome: undefined,
        currentScreen: 'currentGame',
      };
    case ADD_ROUND_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          addRound: false,
        },
        changesOverviewError: {
          details: action.payload,
          message: action.payload.message,
        },
      };
    case EVENTS_GET_LIST_INIT:
      return {
        ...state,
        eventsListError: undefined,
        loading: {
          ...state.loading,
          events: true,
        },
      };
    case EVENTS_GET_LIST_SUCCESS:
      return {
        ...state,
        loading: {
          ...state.loading,
          events: false,
        },
        currentOutcome: undefined,
        eventsList: action.payload,
      };
    case EVENTS_GET_LIST_FAIL:
      return {
        ...state,
        loading: {
          ...state.loading,
          events: false,
        },
        eventsListError: action.payload,
      };
    case SELECT_EVENT:
      return {
        ...state,
        currentEventId: action.payload,
        currentScreen: 'overview',
      };
    case HISTORY_INIT:
      return {
        ...state,
        historyInitialized: true,
      };
    default:
      return state;
  }
}
