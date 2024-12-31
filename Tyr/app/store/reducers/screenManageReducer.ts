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
  CONGRATS_SHOW,
  GO_TO_CURRENT_GAME,
  GO_TO_DONATE,
  GO_TO_PENALTIES,
  GOTO_EVENT_SELECT,
  GOTO_NEXT_SCREEN,
  GOTO_PREV_SCREEN,
  OPEN_SETTINGS,
  RESET_STATE,
  SEARCH_PLAYER,
  SHOW_GAME_LOG,
  SHOW_LAST_RESULTS,
  START_NEW_GAME,
} from '../actions/interfaces';
import { AppOutcome } from '../../helpers/interfaces';
import { RoundOutcome } from '../../clients/proto/atoms.pb';

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
          roundIndex: 1,
          riichiCount: 0,
          honbaCount: 0,
          lastHandStarted: false,
          chombo: [],
        },
        currentOutcome: undefined,
        players: undefined,
        mapIdToPlayer: {},
        currentSessionHash: '',
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
    case GO_TO_PENALTIES:
      return {
        ...state,
        currentScreen: 'penalties',
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
    case OPEN_SETTINGS:
      return {
        ...state,
        currentScreen: 'settings',
      };
    case CONGRATS_SHOW:
      return {
        ...state,
        currentScreen: 'congrats',
      };
    case GOTO_NEXT_SCREEN:
      if (!state.gameConfig) {
        return state;
      }

      let nextScreen: AppScreen = state.currentScreen;
      switch (state.currentScreen) {
        case 'currentGame':
        case 'overview':
          if (state.currentOutcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_NAGASHI) {
            nextScreen = 'nagashiSelect';
          } else {
            nextScreen = 'playersSelect';
          }
          break;
        case 'playersSelect':
          switch (state.currentOutcome?.selectedOutcome) {
            case RoundOutcome.ROUND_OUTCOME_RON:
            case RoundOutcome.ROUND_OUTCOME_TSUMO:
              nextScreen = 'handSelect';
              break;
            case RoundOutcome.ROUND_OUTCOME_DRAW:
            case RoundOutcome.ROUND_OUTCOME_ABORT:
            case RoundOutcome.ROUND_OUTCOME_CHOMBO:
            case RoundOutcome.ROUND_OUTCOME_NAGASHI:
              nextScreen = 'confirmation';
              break;
            default:
          }
          break;
        case 'handSelect':
          switch (state.currentOutcome?.selectedOutcome) {
            case RoundOutcome.ROUND_OUTCOME_RON:
            case RoundOutcome.ROUND_OUTCOME_TSUMO:
              nextScreen = 'confirmation';
              break;
            default:
              nextScreen = 'confirmation';
          }
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
        case 'otherTablesList':
        case 'newGame':
        case 'currentGame':
        case 'eventSelector':
        case 'settings':
        case 'donate':
        case 'congrats':
        case 'penalties':
          if (state.currentEventId) {
            prevScreen = 'overview';
          }
          break;
        case 'searchPlayer':
          prevScreen = 'newGame';
          break;
        case 'gameLog':
          if (state.currentOtherTableHash) {
            prevScreen = 'otherTable';
          } else {
            prevScreen = 'currentGame';
          }
          break;
        case 'playersSelect':
          if (state.currentOutcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_NAGASHI) {
            prevScreen = 'nagashiSelect';
          } else {
            prevScreen = 'currentGame';
            currentOutcome = undefined;
          }
          break;
        case 'handSelect':
          prevScreen = 'playersSelect';
          break;
        case 'confirmation':
          switch (state.currentOutcome?.selectedOutcome) {
            case RoundOutcome.ROUND_OUTCOME_RON:
            case RoundOutcome.ROUND_OUTCOME_TSUMO:
              prevScreen = 'handSelect';
              break;
            case RoundOutcome.ROUND_OUTCOME_DRAW:
            case RoundOutcome.ROUND_OUTCOME_ABORT:
            case RoundOutcome.ROUND_OUTCOME_CHOMBO:
            case RoundOutcome.ROUND_OUTCOME_NAGASHI:
              prevScreen = 'playersSelect';
              break;
            default:
          }
          break;
        case 'nagashiSelect':
          prevScreen = 'currentGame';
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
