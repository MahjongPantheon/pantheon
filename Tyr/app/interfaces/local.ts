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

import { Player } from './common';
import { YakuId } from '#/primitives/yaku';

export type LCurrentGame = {
  hashcode: string;
  tableIndex: number;
  players: [Player, Player, Player, Player]; // players data
  status: string; // should always be inprogress with current logic
};

export type LUser = {
  id: number;
  displayName: string;
  tenhouId: string;
}

export type LFreyAuthData = {
  personId: number;
  token: string;
};

export type LUserWithScore = LUser & {
  score: number;
  ratingDelta: number;
  penalties: number;
}

export interface LTimerState {
  started: boolean;
  finished: boolean;
  timeRemaining: number;
  waitingForTimer: boolean;
}

export interface LWinItem {
  winner?: number;
  paoPlayerId?: number;
  han: number;
  fu: number;
  dora: number;
  uradora: number;
  kandora: number;
  kanuradora: number;
  openHand: boolean;
  yaku: YakuId[];
}

export type LEvent = {
  id: number;
  title: string;
  description: string;
}

export type LEventsList = LEvent[];

export interface LSessionOverview {
  currentRound: number;
  riichiOnTable: number;
  honba: number;
  yellowZoneAlreadyPlayed: boolean;
  tableIndex: number;
  players: [LUserWithScore, LUserWithScore, LUserWithScore, LUserWithScore];
}

export interface LGameConfig {
  yakuWithPao: YakuId[];
  allowedYaku: YakuId[];
  startPoints: number;
  withKazoe: boolean;
  withKiriageMangan: boolean;
  withAbortives: boolean;
  withNagashiMangan: boolean;
  eventTitle: string;
  eventStatHost: string;
  withAtamahane: boolean;
  autoSeating: boolean;
  rulesetTitle: string;
  tonpuusen: boolean;
  startRating: number;
  riichiGoesToWinner: boolean;
  extraChomboPayments: boolean;
  chomboPenalty: number;
  withKuitan: boolean;
  withButtobi: boolean;
  withMultiYakumans: boolean;
  gameExpirationTime: number;
  withLeadingDealerGameOver: boolean;
  redZone: number | null;
  yellowZone: number | null;
  timerPolicy: 'redZone' | 'yellowZone' | 'none';
  useTimer: boolean;
  isOnline: boolean;
  isTextlog: boolean;
  syncStart: boolean;
  sortByGames: boolean;
  allowPlayerAppend: boolean;
}
