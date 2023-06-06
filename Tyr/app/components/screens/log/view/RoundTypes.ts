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

import { RoundOutcome } from '../../../../clients/proto/atoms.pb';

export interface IRoundOverviewBase {
  outcome: RoundOutcome;
  riichiOnTable: number; // riichis on table
  honbaOnTable: number;
  riichiPlayers: string[];
}

export interface IRoundOverviewRon extends IRoundOverviewBase {
  outcome: typeof RoundOutcome.ROUND_OUTCOME_RON;
  loser: string;
  winner: string;
  paoPlayer?: string;
  yakuList: string[];
  han: number;
  fu?: number;
  dora?: number;
}

export interface IRoundOverviewMultiRon extends IRoundOverviewBase {
  outcome: typeof RoundOutcome.ROUND_OUTCOME_MULTIRON;
  loser: string;
  winnerList: string[];
  paoPlayerList: (string | undefined)[];
  yakuList: string[][];
  hanList: number[];
  fuList: (number | undefined)[];
  doraList: (number | undefined)[];
}

export interface IRoundOverviewTsumo extends IRoundOverviewBase {
  outcome: typeof RoundOutcome.ROUND_OUTCOME_TSUMO;
  winner: string;
  paoPlayer?: string;
  yakuList: string[];
  han: number;
  fu?: number;
  dora?: number;
}

export interface IRoundOverviewDraw extends IRoundOverviewBase {
  outcome: typeof RoundOutcome.ROUND_OUTCOME_DRAW;
  tempai: string[];
}

export interface IRoundOverviewAbort extends IRoundOverviewBase {
  outcome: typeof RoundOutcome.ROUND_OUTCOME_ABORT;
}

export interface IRoundOverviewChombo extends IRoundOverviewBase {
  outcome: typeof RoundOutcome.ROUND_OUTCOME_CHOMBO;
  penaltyFor: string;
}

export interface IRoundOverviewNagashi extends IRoundOverviewBase {
  outcome: typeof RoundOutcome.ROUND_OUTCOME_NAGASHI;
  tempai: string[];
  nagashi: string[];
}

export type IRoundOverviewInfo =
  | IRoundOverviewRon
  | IRoundOverviewMultiRon
  | IRoundOverviewTsumo
  | IRoundOverviewDraw
  | IRoundOverviewAbort
  | IRoundOverviewChombo
  | IRoundOverviewNagashi;
