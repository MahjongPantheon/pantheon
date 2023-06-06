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
import { AppActionTypes, HISTORY_INIT, GOTO_PREV_SCREEN } from '../actions/interfaces';
import { IAppState } from '../interfaces';

export const history =
  (/* HistoryService ? */) =>
  (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) =>
  (next: Dispatch<AppActionTypes>) =>
  (action: AppActionTypes) => {
    switch (action.type) {
      case HISTORY_INIT:
        if (!mw.getState().historyInitialized) {
          // initial push to make some history to return to
          window.history.pushState({}, '', '/');

          // Register handler
          window.onpopstate = (): any => {
            // Any history pop we do as BACK event!
            mw.dispatch({ type: GOTO_PREV_SCREEN });
            // Then make another dummy history item
            window.history.pushState({}, '');
          };
          next(action);
        }
        break;
      default:
    }

    return next(action);
  };
