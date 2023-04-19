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

import { AppScreen, IAppState } from '../interfaces';
import {
  AppActionTypes,
  GO_TO_CURRENT_GAME,
  GOTO_NEXT_SCREEN,
  GOTO_PREV_SCREEN,
  OPEN_SETTINGS,
  RESET_STATE,
  SEARCH_PLAYER,
  SHOW_LAST_RESULTS,
  SHOW_GAME_LOG,
  SHOW_OTHER_TABLE,
  SHOW_OTHER_TABLES_LIST,
  START_NEW_GAME,
  GOTO_EVENT_SELECT,
  GO_TO_DONATE,
} from '../actions/interfaces';
import { winnerHasYakuWithPao } from '../util';
import { AppOutcome } from '#/interfaces/app';

export function screenManageReducer(state: IAppState, action: AppActionTypes): IAppState {
  switch (action.type) {
    case RESET_STATE:
      return {
        ...state,
        currentScreen:
          // Workaround: reset should not exit watching mode
          state.currentScreen === 'otherTable' || state.currentScreen === 'otherTablesList'
            ? state.currentScreen
            : 'overview',
        sessionState: {
          dealer: 0,
          scores: [],
          finished: false,
          penalties: [],
          roundIndex: 1,
          riichiCount: 0,
          honbaCount: 0,
          lastHandStarted: false,
        },
        currentOutcome: undefined,
        players: undefined,
        mapIdToPlayer: {},
        currentSessionHash: '',
        multironCurrentWinner: undefined,
        gameOverviewReady: true,
      };
    case START_NEW_GAME:
      return {
        ...state,
        currentScreen: 'newGame',
        newGameIdsToSet: action.payload,
      };
    case GOTO_EVENT_SELECT:
      return {
        ...state,
        currentScreen: 'eventSelector',
      };
    case GO_TO_CURRENT_GAME:
      return {
        ...state,
        currentScreen: 'currentGame',
      };
    case GO_TO_DONATE:
      return {
        ...state,
        currentScreen: 'donate',
      };
    case SEARCH_PLAYER:
      return {
        ...state,
        currentScreen: 'searchPlayer',
        newGameSelectedPlayerSide: action.payload,
      };
    case SHOW_LAST_RESULTS:
      return {
        ...state,
        currentScreen: 'lastResults',
      };
    case SHOW_GAME_LOG:
      return {
        ...state,
        currentScreen: 'gameLog',
      };
    case SHOW_OTHER_TABLE:
      return {
        ...state,
        currentScreen: 'otherTable',
        currentOtherTableHash: action.payload.hash,
      };
    case SHOW_OTHER_TABLES_LIST:
      return {
        ...state,
        currentScreen: 'otherTablesList',
      };
    case OPEN_SETTINGS:
      return {
        ...state,
        currentScreen: 'settings',
      };
    case GOTO_NEXT_SCREEN:
      if (!state.gameConfig) {
        return state;
      }

      let nextScreen: AppScreen = state.currentScreen;
      switch (state.currentScreen) {
        case 'currentGame':
        case 'overview':
          nextScreen = 'outcomeSelect';
          break;
        case 'outcomeSelect':
          if (state.currentOutcome?.selectedOutcome === 'NAGASHI') {
            nextScreen = 'nagashiSelect';
          } else {
            nextScreen = 'playersSelect';
          }
          break;
        case 'playersSelect':
          switch (state.currentOutcome?.selectedOutcome) {
            case 'RON':
            case 'TSUMO':
              nextScreen = 'handSelect';
              break;
            case 'DRAW':
            case 'ABORT':
            case 'CHOMBO':
            case 'NAGASHI':
              nextScreen = 'confirmation';
              break;
            default:
          }
          break;
        case 'handSelect':
          switch (state.currentOutcome?.selectedOutcome) {
            case 'RON':
            case 'TSUMO':
              if (winnerHasYakuWithPao(state.currentOutcome, state.gameConfig)) {
                nextScreen = 'paoSelect';
              } else {
                nextScreen = 'confirmation';
              }
              break;
            default:
              nextScreen = 'confirmation';
          }
          break;
        case 'paoSelect':
          nextScreen = 'confirmation';
          break;
        case 'nagashiSelect':
          nextScreen = 'playersSelect';
          break;
        case 'lastResults':
        case 'gameLog':
        case 'confirmation':
          nextScreen = 'overview';
          break;
        default:
      }

      if (nextScreen === state.currentScreen) {
        return state;
      }
      return {
        ...state,
        currentScreen: nextScreen,
        showAdditionalTableInfo: false,
      };
    case GOTO_PREV_SCREEN:
      if (!state.gameConfig) {
        if (state.currentScreen === 'settings') {
          return {
            ...state,
            currentScreen: 'eventSelector',
          };
        }
        return state;
      }

      let prevScreen: AppScreen = state.currentScreen;
      let currentOutcome: AppOutcome | undefined = state.currentOutcome;
      switch (state.currentScreen) {
        case 'outcomeSelect':
          prevScreen = 'currentGame';
          currentOutcome = undefined;
          break;
        case 'otherTablesList':
        case 'newGame':
        case 'currentGame':
        case 'eventSelector':
        case 'settings':
        case 'donate':
          if (state.currentEventId) {
            prevScreen = 'overview';
          }
          break;
        case 'searchPlayer':
          prevScreen = 'newGame';
          break;
        case 'gameLog':
          if (state.currentSessionHash) {
            prevScreen = 'currentGame';
          } else {
            prevScreen = 'otherTable';
          }
          break;
        case 'playersSelect':
          if (state.currentOutcome?.selectedOutcome === 'NAGASHI') {
            prevScreen = 'nagashiSelect';
          } else {
            prevScreen = 'outcomeSelect';
            currentOutcome = undefined;
          }
          break;
        case 'handSelect':
          prevScreen = 'playersSelect';
          break;
        case 'confirmation':
          switch (state.currentOutcome?.selectedOutcome) {
            case 'RON':
            case 'TSUMO':
              if (winnerHasYakuWithPao(state.currentOutcome, state.gameConfig)) {
                prevScreen = 'paoSelect';
              } else {
                prevScreen = 'handSelect';
              }
              break;
            case 'DRAW':
            case 'ABORT':
            case 'CHOMBO':
            case 'NAGASHI':
              prevScreen = 'playersSelect';
              break;
            default:
          }
          break;
        case 'paoSelect':
          prevScreen = 'handSelect';
          break;
        case 'nagashiSelect':
          prevScreen = 'outcomeSelect';
          break;
        case 'otherTable':
          prevScreen = 'otherTablesList';
          break;
        default:
      }

      if (prevScreen === state.currentScreen) {
        return state;
      }
      return {
        ...state,
        currentScreen: prevScreen,
        currentOutcome: currentOutcome,
        showAdditionalTableInfo: false,
      };
    default:
      return state;
  }
}
