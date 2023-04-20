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

import { RoundOutcome } from '#/clients/atoms.pb';

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
  selectedOutcome: 'RON';
  loser?: number; // id of player
  loserIsDealer: boolean;
  multiRon: number;
  wins: { [key: string]: WinProps };
  riichiBets: number[]; // ids of players
}

export interface AppOutcomeTsumo extends Outcome, WinProps {
  selectedOutcome: 'TSUMO';
  riichiBets: number[]; // ids of players
}

export interface AppOutcomeAbort extends Outcome {
  selectedOutcome: 'ABORT';
  riichiBets: number[]; // ids of players
  deadhands: number[]; // ids of players
}

export interface AppOutcomeDraw extends Outcome {
  selectedOutcome: 'DRAW';
  riichiBets: number[]; // ids of players
  tempai: number[]; // ids of players
  deadhands: number[]; // ids of players
}

export interface AppOutcomeNagashi extends Outcome {
  selectedOutcome: 'NAGASHI';
  riichiBets: number[]; // ids of players
  tempai: number[]; // ids of players
  deadhands: number[]; // ids of players
  nagashi: number[]; // ids of players
}

export interface AppOutcomeChombo extends Outcome {
  selectedOutcome: 'CHOMBO';
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
