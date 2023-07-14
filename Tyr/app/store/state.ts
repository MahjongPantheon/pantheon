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

import {
  AppOutcome,
  AppOutcomeRon,
  AppOutcomeTsumo,
  AppOutcomeDraw,
  AppOutcomeAbort,
  AppOutcomeChombo,
  AppOutcomeNagashi,
} from '../interfaces/app';
import { getFixedFu } from '../primitives/yaku-values';
import { IAppState } from './interfaces';
import { defaultPlayer } from './selectors/screenNewGameSelectors';
import { RoundOutcome } from '../clients/proto/atoms.pb';

export const initialState: IAppState = {
  currentOtherTableIndex: 0,
  settings: { currentLang: 'en', currentTheme: 'day', singleDeviceMode: false },
  timer: undefined,
  yakuList: undefined,

  currentScreen: 'overview',
  currentSessionHash: undefined,
  currentOutcome: undefined,
  sessionState: {
    dealer: 0,
    scores: [],
    finished: false,
    penalties: [],
    roundIndex: 1,
    riichiCount: 0,
    honbaCount: 0,
    lastHandStarted: false,
  },

  currentPlayerDisplayName: undefined,
  currentPlayerHasAvatar: false,
  currentPlayerLastUpdate: '',
  currentPlayerId: undefined,
  players: undefined, // e-s-w-n,
  mapIdToPlayer: {},
  multironCurrentWinner: undefined,
  isLoggedIn: false,
  gameConfig: undefined,
  tableIndex: undefined,
  otherTablesList: [],
  currentOtherTable: undefined,
  currentOtherTableHash: undefined,
  currentOtherTablePlayers: [],
  isIos: false,
  showAdditionalTableInfo: false,
  currentSelectHandTab: undefined,

  // preloaders flags
  loading: {
    games: false,
    overview: false,
    otherTables: false,
    otherTable: false,
    login: false,
    players: false,
    addRound: false,
    events: false,
  },

  eventsList: [],

  newGameSelectedUsers: [defaultPlayer, defaultPlayer, defaultPlayer, defaultPlayer],
  gameOverviewReady: false,

  historyInitialized: false,
};

export function initBlankOutcome(round: number, outcome: RoundOutcome): AppOutcome {
  let out: AppOutcome;
  switch (outcome) {
    case RoundOutcome.ROUND_OUTCOME_RON:
    case RoundOutcome.ROUND_OUTCOME_MULTIRON:
      const outcomeMultiRon: AppOutcomeRon = {
        selectedOutcome: RoundOutcome.ROUND_OUTCOME_RON,
        roundIndex: round,
        loser: undefined,
        loserIsDealer: false,
        multiRon: 0,
        riichiBets: [],
        wins: {},
      };
      out = outcomeMultiRon;
      break;
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      const outcomeTsumo: AppOutcomeTsumo = {
        selectedOutcome: RoundOutcome.ROUND_OUTCOME_TSUMO,
        roundIndex: round,
        winner: undefined,
        winnerIsDealer: false,
        han: 0,
        fu: 30,
        possibleFu: getFixedFu([], RoundOutcome.ROUND_OUTCOME_TSUMO),
        yaku: '', // empty string is ok for empty yaku list
        riichiBets: [],
        dora: 0,
        openHand: false,
      };
      out = outcomeTsumo;
      break;
    case RoundOutcome.ROUND_OUTCOME_DRAW:
      const outcomeDraw: AppOutcomeDraw = {
        selectedOutcome: RoundOutcome.ROUND_OUTCOME_DRAW,
        roundIndex: round,
        riichiBets: [],
        tempai: [],
        deadhands: [],
      };
      out = outcomeDraw;
      break;
    case RoundOutcome.ROUND_OUTCOME_NAGASHI:
      const outcomeNagashi: AppOutcomeNagashi = {
        selectedOutcome: RoundOutcome.ROUND_OUTCOME_NAGASHI,
        roundIndex: round,
        riichiBets: [],
        tempai: [],
        deadhands: [],
        nagashi: [],
      };
      out = outcomeNagashi;
      break;
    case RoundOutcome.ROUND_OUTCOME_ABORT:
      const outcomeAbort: AppOutcomeAbort = {
        selectedOutcome: RoundOutcome.ROUND_OUTCOME_ABORT,
        roundIndex: round,
        riichiBets: [],
        deadhands: [],
      };
      out = outcomeAbort;
      break;
    case RoundOutcome.ROUND_OUTCOME_CHOMBO:
      const outcomeChombo: AppOutcomeChombo = {
        selectedOutcome: RoundOutcome.ROUND_OUTCOME_CHOMBO,
        roundIndex: round,
        loser: undefined,
        loserIsDealer: false,
      };
      out = outcomeChombo;
      break;
    default:
      throw new Error('Unspecified outcome');
  }

  return out;
}
