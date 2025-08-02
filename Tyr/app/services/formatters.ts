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

import { YakuId } from '../helpers/yaku';
import {
  getLosingUsers,
  getNagashiUsers,
  getPaoUsers,
  getRiichiUsers,
  getWinningUsers,
} from '../store/selectors/mimir';
import { IAppState } from '../store/interfaces';
import { getDora, getFu, getHan } from '../store/selectors/hanFu';
import { getSelectedYaku } from '../store/selectors/yaku';
import {
  AbortResult,
  ChomboResult,
  DrawResult,
  MultironResult,
  MultironWin,
  NagashiResult,
  RonResult,
  Round,
  RoundOutcome,
  TsumoResult,
} from 'tsclients/proto/atoms.pb';
import { AppOutcomeRon } from '../helpers/interfaces';
import { unpack } from '../helpers/yakuCompatibility';

export function formatRoundToTwirp(state: IAppState): Round | undefined {
  switch (state.currentOutcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_RON:
      const wins = Object.keys(state.currentOutcome.wins).map((playerId) => {
        const win = (state.currentOutcome as AppOutcomeRon).wins[playerId];
        const yaku = unpack(win.yaku);
        return {
          winnerId: win.winner,
          paoPlayerId: win.paoPlayerId,
          han: win.han + win.dora,
          fu: getFu(state, win.winner!),
          dora: win.dora,
          uradora: 0, // win.uradora,
          kandora: 0, // win.kandora,
          kanuradora: 0, // win.kanuradora,
          yaku: yaku.filter((y: YakuId) => y > 0),
          openHand: yaku.includes(YakuId.__OPENHAND),
        } as MultironWin;
      });

      if (wins.length > 1) {
        // multiron
        return {
          multiron: {
            roundIndex: state.sessionState?.roundIndex,
            honba: state.sessionState?.honbaCount,
            loserId: getLosingUsers(state)[0].id,
            multiRon: wins.length,
            wins: wins,
            riichiBets: getRiichiUsers(state).map((player) => player.id),
          } as MultironResult,
        };
      }

      // single winner ron
      return {
        ron: {
          roundIndex: state.sessionState?.roundIndex,
          honba: state.sessionState?.honbaCount,
          riichiBets: getRiichiUsers(state).map((player) => player.id),
          loserId: getLosingUsers(state)[0].id,
          multiRon: null,
          ...wins[0],
        } as RonResult,
      };

    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      return {
        tsumo: {
          roundIndex: state.sessionState?.roundIndex,
          honba: state.sessionState?.honbaCount,
          riichiBets: getRiichiUsers(state).map((player) => player.id),
          winnerId: getWinningUsers(state)[0].id,
          paoPlayerId: (getPaoUsers(state)[0] || { id: null }).id,
          han:
            getHan(state, state.currentOutcome.winner!) +
            getDora(state, state.currentOutcome.winner!),
          fu: getFu(state, state.currentOutcome.winner!),
          dora: getDora(state, state.currentOutcome.winner!),
          uradora: 0, // TODO
          kandora: 0, // TODO
          kanuradora: 0, // TODO
          yaku: getSelectedYaku(state)[state.currentOutcome.winner!].filter((y) => y > 0),
          openHand: getSelectedYaku(state)[state.currentOutcome.winner!].includes(
            YakuId.__OPENHAND
          ),
        } as TsumoResult,
      };
    case RoundOutcome.ROUND_OUTCOME_DRAW:
      return {
        draw: {
          roundIndex: state.sessionState?.roundIndex,
          honba: state.sessionState?.honbaCount,
          riichiBets: getRiichiUsers(state).map((player) => player.id),
          tempai: getWinningUsers(state).map((player) => player.id),
        } as DrawResult,
      };
    case RoundOutcome.ROUND_OUTCOME_NAGASHI:
      return {
        nagashi: {
          roundIndex: state.sessionState?.roundIndex,
          honba: state.sessionState?.honbaCount,
          riichiBets: getRiichiUsers(state).map((player) => player.id),
          tempai: getWinningUsers(state).map((player) => player.id),
          nagashi: getNagashiUsers(state).map((player) => player.id),
        } as NagashiResult,
      };
    case RoundOutcome.ROUND_OUTCOME_ABORT:
      return {
        abort: {
          roundIndex: state.sessionState?.roundIndex,
          honba: state.sessionState?.honbaCount,
          riichiBets: getRiichiUsers(state).map((player) => player.id),
        } as AbortResult,
      };
    case RoundOutcome.ROUND_OUTCOME_CHOMBO:
      return {
        chombo: {
          roundIndex: state.sessionState?.roundIndex,
          honba: state.sessionState?.honbaCount,
          loserId: getLosingUsers(state)[0].id,
        } as ChomboResult,
      };
    default:
      return undefined;
  }
}
