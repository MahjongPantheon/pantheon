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

import { Dispatch, MiddlewareAPI } from 'redux';
import {
  AppActionTypes,
  GET_ALL_PLAYERS_INIT,
  GET_CHANGES_OVERVIEW_INIT,
  GOTO_NEXT_SCREEN,
  GOTO_PREV_SCREEN,
  INIT_REQUIRED_YAKU,
  INIT_STATE,
  SELECT_MULTIRON_WINNER,
  START_NEW_GAME,
  UPDATE_STATE_SETTINGS,
  ADD_YAKU,
  SET_SELECT_HAND_TAB,
  SHOW_LAST_RESULTS,
  GET_LAST_RESULTS_INIT,
  GET_ALL_PLAYERS_SUCCESS,
  SET_NEWGAME_PLAYERS,
  ADD_ROUND_SUCCESS,
  SHOW_GAME_LOG,
  GET_ALL_ROUNDS_INIT,
  GET_GAME_OVERVIEW_INIT,
} from '../actions/interfaces';
import { AppScreen, IAppState } from '../interfaces';
import { getWinningUsers } from '#/store/selectors/mimirSelectors';
import { YakuId } from '#/primitives/yaku';
import { getFirstWinnerWithPao } from '#/store/selectors/paoSelectors';

export const screenManageMw =
  () =>
  (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) =>
  (next: Dispatch<AppActionTypes>) =>
  (action: AppActionTypes) => {
    let state: IAppState;
    let currentScreen: AppScreen;

    switch (action.type) {
      case GOTO_NEXT_SCREEN:
        if (mw.getState().currentScreen === 'currentGame') {
          const hash = mw.getState().currentSessionHash;
          if (hash) {
            mw.dispatch({ type: GET_GAME_OVERVIEW_INIT, payload: hash });
          }
          next(action);
          break;
        }

        next({ type: GOTO_NEXT_SCREEN });

        state = mw.getState();
        currentScreen = state.currentScreen;

        switch (currentScreen) {
          case 'confirmation':
            mw.dispatch({ type: GET_CHANGES_OVERVIEW_INIT, payload: state });
            break;
          case 'handSelect':
            if (
              state.currentOutcome &&
              ['RON', 'TSUMO'].includes(state.currentOutcome.selectedOutcome)
            ) {
              const currentWinnerId = getWinningUsers(state)[0].id;
              mw.dispatch({ type: SET_SELECT_HAND_TAB, payload: 'yaku' });
              mw.dispatch({ type: SELECT_MULTIRON_WINNER, payload: { winner: currentWinnerId } });
              mw.dispatch({ type: INIT_REQUIRED_YAKU });

              if (state.currentOutcome?.selectedOutcome === 'TSUMO') {
                mw.dispatch({
                  type: ADD_YAKU,
                  payload: { id: YakuId.MENZENTSUMO, winner: currentWinnerId },
                });
              }
            }
            break;
          case 'paoSelect':
            const currentWinnerId = getFirstWinnerWithPao(state);
            if (currentWinnerId) {
              mw.dispatch({ type: SELECT_MULTIRON_WINNER, payload: { winner: currentWinnerId } });
            }
            break;
          default:
        }
        break;
      case GOTO_PREV_SCREEN:
        next(action);

        state = mw.getState();
        currentScreen = state.currentScreen;

        switch (currentScreen) {
          case 'handSelect':
            mw.dispatch({ type: SET_SELECT_HAND_TAB, payload: 'yaku' });
            break;
          case 'paoSelect':
            const currentWinnerId = getFirstWinnerWithPao(state);
            if (currentWinnerId) {
              mw.dispatch({ type: SELECT_MULTIRON_WINNER, payload: { winner: currentWinnerId } });
            }
            break;
          default:
        }
        break;
      case START_NEW_GAME:
        next(action);
        mw.dispatch({ type: GET_ALL_PLAYERS_INIT });
        break;
      case INIT_STATE:
        next(action);
        mw.dispatch({ type: UPDATE_STATE_SETTINGS });
        break;
      case ADD_ROUND_SUCCESS:
        next(action);

        state = mw.getState();
        if (state.currentScreen === 'lastResults') {
          mw.dispatch({ type: GET_LAST_RESULTS_INIT });
        }
        break;
      case SHOW_LAST_RESULTS:
        next(action);
        mw.dispatch({ type: GET_LAST_RESULTS_INIT });
        break;
      case GET_ALL_PLAYERS_SUCCESS:
        next(action);
        mw.dispatch({ type: SET_NEWGAME_PLAYERS });
        break;
      case SHOW_GAME_LOG:
        next(action);
        state = mw.getState();
        const sessionHash = state.currentSessionHash ?? state.currentOtherTableHash;
        if (sessionHash) {
          mw.dispatch({ type: GET_ALL_ROUNDS_INIT, payload: sessionHash });
        }
        break;
      default:
        return next(action);
    }
  };
