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

export interface WinItem {
  riichi: string; // comma-separated
  winner_id: number;
  pao_player_id: number;
  han: number;
  fu: number;
  dora: number;
  uradora: number;
  kandora: number;
  kanuradora: number;
  yaku: string; // comma-separated ids
  open_hand: boolean;
}

// rounds

export interface RRoundRon extends WinItem {
  round_index: number;
  honba: number;
  outcome: 'ron';
  loser_id: number;
  multi_ron: null;
}

export interface RRoundMultiRon {
  round_index: number;
  honba: number;
  outcome: 'multiron';
  loser_id: number;
  multi_ron: number; // should equal to wins.length
  wins: WinItem[];
}

export interface RRoundTsumo extends WinItem {
  round_index: number;
  honba: number;
  outcome: 'tsumo';
  multi_ron: null;
}

export interface RRoundDraw {
  round_index: number;
  honba: number;
  outcome: 'draw';
  riichi: string; // comma-separated
  tempai: string; // comma-separated
}

export interface RRoundNagashi {
  round_index: number;
  honba: number;
  outcome: 'nagashi';
  riichi: string; // comma-separated
  tempai: string; // comma-separated
  nagashi: string; // comma-separated
}

export interface RRoundAbort {
  round_index: number;
  honba: number;
  outcome: 'abort';
  riichi: string; // comma-separated
}

export interface RRoundChombo {
  round_index: number;
  honba: number;
  outcome: 'chombo';
  loser_id: number;
}

export type RRound
  = RRoundRon
  | RRoundMultiRon
  | RRoundTsumo
  | RRoundDraw
  | RRoundAbort
  | RRoundChombo
  | RRoundNagashi
  ;

export interface RGameConfig {
  yakuWithPao: number[];
  allowedYaku: number[];
  startPoints: number;
  withKazoe: boolean;
  withKiriageMangan: boolean;
  withAbortives: boolean;
  withNagashiMangan: boolean;
  eventTitle: string;
  withAtamahane: boolean;
  autoSeating: boolean;
  rulesetTitle: string;
  eventStatHost: string;
  tonpuusen: boolean;
  startRating: number;
  riichiGoesToWinner: boolean;
  extraChomboPayments: boolean;
  chomboPenalty: number;
  withKuitan: boolean;
  withButtobi: boolean;
  withMultiYakumans: boolean;
  gameExpirationTime: number;
  withLeadingDealerGameover: boolean;
  redZone: number | null;
  yellowZone: number | null;
  timerPolicy: string | null;
  useTimer: boolean;
  isOnline: boolean;
  isTextlog: boolean;
  syncStart: boolean;
  sortByGames: boolean;
  allowPlayerAppend: boolean;
}

export interface RTimerState {
  started: boolean;
  finished: boolean;
  time_remaining: string;
  waiting_for_timer: boolean;
}

export interface RSessionOverview {
  id: number;
  table_index: number;
  players: {
    id: number,
    display_name: string,
    ident: string
  }[];
  state: {
    dealer: number; // player id
    round: number;
    riichi: number; // on table
    honba: number;
    yellowZoneAlreadyPlayed: boolean;
    scores: { [key: number]: number };
    finished: boolean;
    penalties: { [key: number]: number };
  }
}

export type RAllPlayersInEvent = {
  id: number;
  alias: string;
  display_name: string;
  tenhou_id: string;
}[]

export type RTablesState = {
  status: string;
  hash: string;
  table_index?: number;
  current_round: number;
  scores: { [key: number]: number };
  players: Array<{
    id: number;
    display_name: string;
  }>;
}[]

// for getPlayer
export interface RUserInfo {
  id: number;
  alias: string;
  ident: string;
  display_name: string;
  tenhou_id: string;
}

// for current games info
export interface RPlayerData {
  id: number;
  alias: string;
  ident: string;
  display_name: string;
  score: number;
  rating_delta: number;
}

export type RLastResults = RPlayerData[];

export type RCurrentGames = {
  hashcode: string;
  table_index: number;
  players: RPlayerData[]; // players data
  status: string; // should always be inprogress with current logic
}[];

export interface RRoundPaymentsInfoSingle {
  dealer: number; // player id
  round: number;
  riichi: number; // riichis on table
  riichiIds: string[]; // player ids  TODO: why string??
  outcome: 'ron' | 'tsumo' | 'draw' | 'abort' | 'chombo';
  penaltyFor: number | null;
  honba: number;
  scores: number[];
  paoPlayer: number;
  payments: {
    direct: { [key: string]: number },
    riichi: { [key: string]: number },
    honba: { [key: string]: number }
  };

  winner: number;
  yaku: string;
  han: number;
  fu: number;
  dora: number;
  kandora: number;
  uradora: number;
  kanuradora: number;
}

export interface RRoundPaymentsInfoMulti {
  dealer: number; // player id
  round: number;
  riichi: number; // riichis on table
  riichiIds: string[]; // player ids
  outcome: 'multiron';
  penaltyFor: number | null;
  honba: number;
  scores: number[];
  payments: {
    direct: { [key: string]: number },
    riichi: { [key: string]: number },
    honba: { [key: string]: number }
  };

  winner: number[];
  paoPlayer: number;
  yaku: string[];
  han: number[];
  fu: number[];
  dora: number[];
  kandora: number[];
  uradora: number[];
  kanuradora: number[];
}

export type RRoundPaymentsInfo = RRoundPaymentsInfoSingle | RRoundPaymentsInfoMulti;
