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

import { EndingPolicy, RoundOutcome } from 'tsclients/proto/atoms.pb';
import { YakuId } from './yaku';
import { I18nService } from '../services/i18n';

export interface Outcome {
  selectedOutcome: RoundOutcome;
  roundIndex: number;
}

export interface WinProps {
  winner?: number; // id of player
  winnerIsDealer: boolean;
  paoPlayerId?: number;
  han: number;
  fu: number;
  possibleFu: number[];
  yaku: string; // packed positional string
  dora: number;
  openHand: boolean;
}

export interface AppOutcomeRon extends Outcome {
  selectedOutcome: typeof RoundOutcome.ROUND_OUTCOME_RON;
  loser?: number; // id of player
  loserIsDealer: boolean;
  multiRon: number;
  wins: { [key: string]: WinProps };
  riichiBets: number[]; // ids of players
}

export interface AppOutcomeTsumo extends Outcome, WinProps {
  selectedOutcome: typeof RoundOutcome.ROUND_OUTCOME_TSUMO;
  riichiBets: number[]; // ids of players
}

export interface AppOutcomeAbort extends Outcome {
  selectedOutcome: typeof RoundOutcome.ROUND_OUTCOME_ABORT;
  riichiBets: number[]; // ids of players
  deadhands: number[]; // ids of players
}

export interface AppOutcomeDraw extends Outcome {
  selectedOutcome: typeof RoundOutcome.ROUND_OUTCOME_DRAW;
  riichiBets: number[]; // ids of players
  tempai: number[]; // ids of players
  deadhands: number[]; // ids of players
}

export interface AppOutcomeNagashi extends Outcome {
  selectedOutcome: typeof RoundOutcome.ROUND_OUTCOME_NAGASHI;
  riichiBets: number[]; // ids of players
  tempai: number[]; // ids of players
  deadhands: number[]; // ids of players
  nagashi: number[]; // ids of players
}

export interface AppOutcomeChombo extends Outcome {
  selectedOutcome: typeof RoundOutcome.ROUND_OUTCOME_CHOMBO;
  loser?: number; // id of player
  loserIsDealer: boolean;
}

export type AppOutcome =
  | AppOutcomeRon
  | AppOutcomeTsumo
  | AppOutcomeDraw
  | AppOutcomeAbort
  | AppOutcomeChombo
  | AppOutcomeNagashi;

export type WinOutcomeProps = Partial<AppOutcomeRon | AppOutcomeTsumo>;
export type LoseOutcomeProps = Partial<AppOutcomeRon | AppOutcomeChombo>;
export type DrawOutcomeProps = Partial<AppOutcomeAbort | AppOutcomeDraw | AppOutcomeNagashi>;

export interface Yaku {
  id: YakuId;
  name: (i18n: I18nService) => string;
  shortName: (i18n: I18nService) => string;
  yakuman: boolean;
  disabled?: boolean;
}

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

export interface IRoundResult {
  scoresDelta: Array<{ playerId: number; score: number }>;
  scores: Array<{ playerId: number; score: number }>;
  round: string;
}

export type YakuItem = {
  name: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
};
export type YakuGroup = YakuItem[];

export type PlayerDescriptor = {
  id?: number;
  playerName?: string;
  hasAvatar?: boolean;
  lastUpdate?: string;
};

export type TableStatus = {
  tableIndex?: number;
  width: number;
  height: number;
  showCallReferee?: boolean;
  onCallRefereeClick?: () => void;
  showRotateButtons?: boolean;
  onCwRotateClick?: () => void;
  onCcwRotateClick?: () => void;
  endingPolicy?: EndingPolicy;

  // from SessionState
  tableStatus: {
    roundIndex: number;
    riichiCount: number;
    honbaCount: number;
    lastHandStarted?: boolean;
  };

  timerState: {
    useTimer?: boolean;
    timerWaiting?: boolean;
    secondsRemaining?: number;
  };
};
