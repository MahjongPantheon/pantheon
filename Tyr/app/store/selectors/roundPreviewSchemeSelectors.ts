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

import { IAppState } from '../interfaces';
import { getSeating } from './commonSelectors';
import { getPaoUsers, getRiichiUsers } from './mimirSelectors';
import { PlayerInSession, RoundOutcome } from '../../clients/proto/atoms.pb';

export type RoundPreviewSchemePurpose = 'overview' | 'other_overview' | 'confirmation';
type Csp = RoundPreviewSchemePurpose; // alias for shorter name

type RoundPaymentInfoShort = {
  round: number;
  currentPlayerId: number;
  players: PlayerInSession[];
  riichiBets: string[];
  penaltyFor?: number;
  paoPlayer?: number;
};

const getRoundOverview = (s: IAppState, purpose: Csp): RoundPaymentInfoShort | undefined => {
  if (!s.currentPlayerId) {
    return;
  }

  switch (purpose) {
    case 'overview':
      if (!s.players) {
        return undefined;
      }
      return {
        round: s.sessionState?.roundIndex ?? 0,
        currentPlayerId: s.currentPlayerId,
        players: s.players,
        riichiBets: [],
        penaltyFor: undefined,
        paoPlayer: undefined,
      };
    case 'confirmation':
      if (!s.currentOutcome || !s.players) {
        return undefined;
      }
      const [pao] = getPaoUsers(s);
      return {
        round: s.sessionState?.roundIndex ?? 0,
        currentPlayerId: s.currentPlayerId,
        players: s.players,
        riichiBets: getRiichiUsers(s).map((p) => p.id.toString()),
        penaltyFor:
          s.currentOutcome.selectedOutcome === RoundOutcome.ROUND_OUTCOME_CHOMBO
            ? s.currentOutcome.loser
            : undefined,
        paoPlayer: pao && pao.id,
      };
    case 'other_overview':
      if (!s.currentOtherTable) {
        return undefined;
      }
      return {
        round: s.currentOtherTable.state.roundIndex,
        currentPlayerId: s.currentOtherTablePlayers[(s.overviewViewShift ?? 0) % 4].id,
        players: s.currentOtherTablePlayers,
        riichiBets: [],
        penaltyFor: undefined,
        paoPlayer: undefined,
      };
  }
};

const getSeatData = (s: IAppState, purpose: Csp) => {
  const overview = getRoundOverview(s, purpose);
  if (!overview) {
    throw new Error('No round overview found');
  }
  return getSeating(
    overview.round,
    s.overviewViewShift ?? 0,
    overview.currentPlayerId,
    overview.players,
    overview.riichiBets,
    overview.penaltyFor,
    overview.paoPlayer
  );
};

export const getSelf = (s: IAppState, p: Csp) => getSeatData(s, p).players[0];
export const getShimocha = (s: IAppState, p: Csp) => getSeatData(s, p).players[1];
export const getToimen = (s: IAppState, p: Csp) => getSeatData(s, p).players[2];
export const getKamicha = (s: IAppState, p: Csp) => getSeatData(s, p).players[3];
export const getSeatSelf = (s: IAppState, p: Csp) => getSeatData(s, p).seating[0];
export const getSeatShimocha = (s: IAppState, p: Csp) => getSeatData(s, p).seating[1];
export const getSeatToimen = (s: IAppState, p: Csp) => getSeatData(s, p).seating[2];
export const getSeatKamicha = (s: IAppState, p: Csp) => getSeatData(s, p).seating[3];
export const getRound = (state: IAppState, p: Csp) => getRoundOverview(state, p)?.round;
