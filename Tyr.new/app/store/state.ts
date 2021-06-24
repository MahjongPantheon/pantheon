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
  AppOutcomeNagashi
} from '#/interfaces/app';
import { Outcome as OutcomeType } from '#/interfaces/common';
import { getFixedFu } from '#/primitives/yaku-values';
import { IAppState } from './interfaces';
import { defaultPlayer } from './selectors/screenNewGameSelectors';

export const initialState: IAppState = {
  currentOtherTableIndex: 0,
  isUniversalWatcher: false,
  settings: { currentLang: 'en', currentTheme: 'day' },
  timer: undefined,
  yakuList: undefined,

  currentScreen: 'overview',
  currentSessionHash: undefined,
  currentOutcome: undefined,
  currentRound: 1,
  currentPlayerDisplayName: undefined,
  currentPlayerId: undefined,
  players: undefined, // e-s-w-n,
  mapIdToPlayer: {},
  riichiOnTable: 0,
  honba: 0,
  multironCurrentWinner: undefined,
  isLoggedIn: false,
  gameConfig: undefined,
  tableIndex: undefined,
  yellowZoneAlreadyPlayed: false,
  otherTablesList: [],
  currentOtherTable: undefined,
  currentOtherTableHash: undefined,
  currentOtherTablePlayers: [],
  isIos: false,
  showAdditionalTableInfo: false,

  // preloaders flags
  loading: {
    games: false,
    overview: false,
    otherTables: false,
    otherTable: false,
    login: false,
    players: false,
    addRound: false
  },

  newGameSelectedUsers: [defaultPlayer, defaultPlayer, defaultPlayer, defaultPlayer],
  gameOverviewReady: false,
};

export function initBlankOutcome(round: number, outcome: OutcomeType): AppOutcome {
  let out: AppOutcome;
  switch (outcome) {
    case 'ron':
      const outcomeMultiRon: AppOutcomeRon = {
        selectedOutcome: 'ron',
        roundIndex: round,
        loser: undefined,
        loserIsDealer: false,
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
        winner: undefined,
        winnerIsDealer: false,
        han: 0,
        fu: 30,
        possibleFu: getFixedFu([], 'tsumo'),
        yaku: '', // empty string is ok for empty yaku list
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
        tempai: [],
        deadhands: []
      };
      out = outcomeDraw;
      break;
    case 'nagashi':
      const outcomeNagashi: AppOutcomeNagashi = {
        selectedOutcome: 'nagashi',
        roundIndex: round,
        riichiBets: [],
        tempai: [],
        deadhands: [],
        nagashi: []
      };
      out = outcomeNagashi;
      break;
    case 'abort':
      const outcomeAbort: AppOutcomeAbort = {
        selectedOutcome: 'abort',
        roundIndex: round,
        riichiBets: [],
        deadhands: []
      };
      out = outcomeAbort;
      break;
    case 'chombo':
      const outcomeChombo: AppOutcomeChombo = {
        selectedOutcome: 'chombo',
        roundIndex: round,
        loser: undefined,
        loserIsDealer: false
      };
      out = outcomeChombo;
      break;
  }

  return out;
}

