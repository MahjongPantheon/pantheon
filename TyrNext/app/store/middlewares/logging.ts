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
import { AppActionTypes } from '../actions/interfaces';

export const logging =
  (purpose: string) =>
  (_api: MiddlewareAPI) =>
  (next: Dispatch<AppActionTypes>) =>
  (action: AppActionTypes) => {
    if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
      // enable only for devtools users
      console.groupCollapsed(`${purpose}: ${action.type}`);
      console.log('Payload: ', (action as any).payload);
      console.groupEnd();
    }
    return next(action);
  };
