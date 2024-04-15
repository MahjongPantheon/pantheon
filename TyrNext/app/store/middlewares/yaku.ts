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
  ADD_YAKU,
  AppActionTypes,
  REMOVE_YAKU,
  TOGGLE_RIICHI_NOTIFICATION,
} from '../actions/interfaces';
import { YakuId } from '../../helpers/yaku';
import { IAppState } from '../interfaces';
import { RoundOutcome } from '../../clients/proto/atoms.pb';

export const yaku =
  (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) =>
  (next: Dispatch<AppActionTypes>) =>
  (action: AppActionTypes) => {
    switch (action.type) {
      case ADD_YAKU:
      case REMOVE_YAKU:
        if (action.payload.id === YakuId.RIICHI) {
          mw.dispatch({ type: TOGGLE_RIICHI_NOTIFICATION, payload: true });
          return;
        }

        if (action.payload.id === YakuId.DOUBLERIICHI) {
          const outcome = mw.getState().currentOutcome;
          if (
            outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON ||
            outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_TSUMO
          ) {
            if (action.payload.winner && !outcome.riichiBets.includes(action.payload.winner)) {
              mw.dispatch({ type: TOGGLE_RIICHI_NOTIFICATION, payload: true });
              return;
            }
          }
        }

        next(action);
        break;
      default:
        next(action);
    }
  };
