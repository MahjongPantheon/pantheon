/*
 * Tyr - Allows online game recording in japanese (riichi) mahjong sessions
 * Copyright (C) 2016 Oleg Klimenko aka ctizen <me@ctizen.net>
 *
 * This file is part of Tyr.
 *
 * Tyr is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tyr is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tyr.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Outcome as OutcomeType } from './common';
import { YakuId } from '../primitives/yaku';

export interface Outcome {
  selectedOutcome: OutcomeType;
  roundIndex: number;
}

export interface WinProps {
  winner: number;
  han: number;
  fu: number;
  possibleFu: number[];
  yaku: YakuId[];
  dora: number;
  openHand: boolean;
}

export interface AppOutcomeRon extends Outcome, WinProps {
  selectedOutcome: 'ron';
  loser: number;
  riichiBets: number[]; // ids of players
}

export interface AppOutcomeMultiRon extends Outcome {
  selectedOutcome: 'multiron';
  loser: number;
  multiRon: number;
  wins: { [key: number]: WinProps };
  riichiBets: number[]; // ids of players
}

export interface AppOutcomeTsumo extends Outcome, WinProps {
  selectedOutcome: 'tsumo';
  riichiBets: number[]; // ids of players
}

export interface AppOutcomeAbort extends Outcome {
  selectedOutcome: 'abort';
  riichiBets: number[]; // ids of players
  deadhands: number[]; // ids of players
}

export interface AppOutcomeDraw extends Outcome {
  selectedOutcome: 'draw';
  riichiBets: number[]; // ids of players
  tempai: number[]; // ids of players
  deadhands: number[]; // ids of players 
}

export interface AppOutcomeChombo extends Outcome {
  selectedOutcome: 'chombo';
  loser: number;
}

export type AppOutcome
  = AppOutcomeRon
  | AppOutcomeTsumo
  | AppOutcomeMultiRon
  | AppOutcomeDraw
  | AppOutcomeAbort
  | AppOutcomeChombo
  ;


