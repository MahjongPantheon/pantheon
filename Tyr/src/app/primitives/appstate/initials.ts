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

import {
  AppOutcome,
  AppOutcomeRon,
  AppOutcomeTsumo,
  AppOutcomeDraw,
  AppOutcomeAbort,
  AppOutcomeChombo,
  AppOutcomeMultiRon
} from '../../interfaces/app';
import { Outcome as OutcomeType } from '../../interfaces/common';
import { getFixedFu } from '../yaku-values';

export function initBlankOutcome(round: number, outcome: OutcomeType): AppOutcome {
  let out: AppOutcome;
  switch (outcome) {
    case 'ron':
      const outcomeRon: AppOutcomeRon = {
        selectedOutcome: 'ron',
        roundIndex: round,
        loser: null,
        winner: null,
        han: 0,
        fu: 30,
        possibleFu: getFixedFu([], 'ron'),
        yaku: [],
        riichiBets: [],
        dora: 0,
        openHand: false
      };
      out = outcomeRon;
      break;
    case 'multiron':
      const outcomeMultiRon: AppOutcomeMultiRon = {
        selectedOutcome: 'multiron',
        roundIndex: round,
        loser: null,
        multiRon: 0,
        riichiBets: [],
        wins: {}
      };
      out = outcomeMultiRon;
      break;
    case 'tsumo':
      const outcomeTsumo: AppOutcomeTsumo = {
        selectedOutcome: 'tsumo',
        roundIndex: round,
        winner: null,
        han: 0,
        fu: 30,
        possibleFu: getFixedFu([], 'tsumo'),
        yaku: [],
        riichiBets: [],
        dora: 0,
        openHand: false
      };
      out = outcomeTsumo;
      break;
    case 'draw':
      const outcomeDraw: AppOutcomeDraw = {
        selectedOutcome: 'draw',
        roundIndex: round,
        riichiBets: [],
        tempai: []
      };
      out = outcomeDraw;
      break;
    case 'abort':
      const outcomeAbort: AppOutcomeAbort = {
        selectedOutcome: 'abort',
        roundIndex: round,
        riichiBets: []
      };
      out = outcomeAbort;
      break;
    case 'chombo':
      const outcomeChombo: AppOutcomeChombo = {
        selectedOutcome: 'chombo',
        roundIndex: round,
        loser: null
      };
      out = outcomeChombo;
      break;
  }

  return out;
}
