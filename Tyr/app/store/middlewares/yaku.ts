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
  SET_YAKU_ADVICE,
  RESOLVE_YAKU_ADVICE,
} from '../actions/interfaces';
import { getWindYaku, windYaku } from '../../helpers/yakuhai';
import { getYakuAdvice } from '../../helpers/yakuValues';
import { getSelectedYaku } from '../selectors/yaku';
import { YakuId } from '../../helpers/yaku';
import { IAppState } from '../interfaces';
import { RoundOutcome } from 'tsclients/proto/atoms.pb';

export const yaku =
  (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) =>
  (next: Dispatch<AppActionTypes>) =>
  (action: AppActionTypes) => {
    if (action.type === RESOLVE_YAKU_ADVICE) {
      const advice = mw.getState().yakuAdvice;
      // Ignore duplicate clicks or callbacks from a dialog that has been replaced.
      if (!advice || advice !== action.payload.advice) return;
      mw.dispatch({ type: SET_YAKU_ADVICE, payload: undefined });
      mw.dispatch({
        type: action.payload.approve ? ADD_YAKU : REMOVE_YAKU,
        payload: {
          id: action.payload.approve ? advice.expectedYaku : advice.lastYaku,
          winner: advice.winner,
        },
      });
      return;
    }
    const before = mw.getState();
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
    const after = mw.getState();
    if (action.type === SET_YAKU_ADVICE) return;
    if (
      after.yakuAdvice &&
      (before.currentOutcome !== after.currentOutcome ||
        before.currentScreen !== after.currentScreen)
    ) {
      mw.dispatch({ type: SET_YAKU_ADVICE, payload: undefined });
    }
    if (action.type !== ADD_YAKU) return;
    const outcome = after.currentOutcome;
    if (
      outcome?.selectedOutcome !== RoundOutcome.ROUND_OUTCOME_TSUMO &&
      outcome?.selectedOutcome !== RoundOutcome.ROUND_OUTCOME_RON
    )
      return;
    const winner =
      action.payload.winner ??
      (outcome.selectedOutcome === RoundOutcome.ROUND_OUTCOME_TSUMO ? outcome.winner : undefined);
    if (!winner) return;
    const selected = getSelectedYaku(after)[winner];
    if (
      !selected?.includes(action.payload.id) ||
      getSelectedYaku(before)[winner]?.includes(action.payload.id)
    )
      return;
    const playerIndex = after.players?.findIndex((player) => player.id === winner) ?? -1;
    // Four yakuhai han imply four triplets only when the two winds differ.
    // A double wind and two dragons contain just three triplets in either entry mode.
    const distinctWinds =
      playerIndex >= 0 &&
      outcome.roundIndex > 0 &&
      !windYaku.some((pair) => getWindYaku(pair[0], outcome.roundIndex, playerIndex)?.length === 2);
    const advice = getYakuAdvice(selected, outcome.selectedOutcome, distinctWinds);
    if (advice)
      mw.dispatch({
        type: SET_YAKU_ADVICE,
        payload: {
          winner,
          lastYaku: action.payload.id,
          expectedYaku: advice === 'suuankou' ? YakuId.SUUANKOU : YakuId.SANANKOU,
        },
      });
  };
