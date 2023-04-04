import { RoundOutcome } from '#/clients/atoms.pb';

export interface IRoundOverviewBase {
  outcome: RoundOutcome;
  riichiOnTable: number; // riichis on table
  honbaOnTable: number;
  riichiPlayers: string[];
}

export interface IRoundOverviewRon extends IRoundOverviewBase {
  outcome: 'RON';
  loser: string;
  winner: string;
  paoPlayer?: string;
  yakuList: string[];
  han: number;
  fu?: number;
  dora?: number;
}

export interface IRoundOverviewMultiRon extends IRoundOverviewBase {
  outcome: 'MULTIRON';
  loser: string;
  winnerList: string[];
  paoPlayerList: (string | undefined)[];
  yakuList: string[][];
  hanList: number[];
  fuList: (number | undefined)[];
  doraList: (number | undefined)[];
}

export interface IRoundOverviewTsumo extends IRoundOverviewBase {
  outcome: 'TSUMO';
  winner: string;
  paoPlayer?: string;
  yakuList: string[];
  han: number;
  fu?: number;
  dora?: number;
}

export interface IRoundOverviewDraw extends IRoundOverviewBase {
  outcome: 'DRAW';
  tempai: string[];
}

export interface IRoundOverviewAbort extends IRoundOverviewBase {
  outcome: 'ABORT';
}

export interface IRoundOverviewChombo extends IRoundOverviewBase {
  outcome: 'CHOMBO';
  penaltyFor: string;
}

export interface IRoundOverviewNagashi extends IRoundOverviewBase {
  outcome: 'NAGASHI';
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
