
export interface IRoundOverviewBase {
  riichiOnTable: number; // riichis on table
  honbaOnTable: number;
  riichiPlayers: string[];
}

export interface IRoundOverviewRon extends IRoundOverviewBase {
  outcome: 'ron'
  loser: string;
  winner: string;
  paoPlayer?: string;
  yakuList: string[];
  han: number;
  fu?: number;
  dora?: number;
}

export interface IRoundOverviewMultiRon extends IRoundOverviewBase {
  outcome: 'multiron'
  loser: string;
  winner: string[];
  paoPlayer: (string | undefined)[];
  yakuList: string[][];
  han: number[];
  fu: (number | undefined)[];
  dora: (number | undefined)[];
}

export interface IRoundOverviewTsumo extends IRoundOverviewBase {
  outcome: 'tsumo'
  winner: string;
  paoPlayer?: string;
  yakuList: string[];
  han: number;
  fu?: number;
  dora?: number;
}

export interface IRoundOverviewDraw extends IRoundOverviewBase {
  outcome: 'draw'
  tempai: string[]
}

export interface IRoundOverviewAbort extends IRoundOverviewBase {
  outcome: 'abort'
}

export interface IRoundOverviewChombo extends IRoundOverviewBase {
  outcome: 'chombo'
}

export interface IRoundOverviewNagashi extends IRoundOverviewBase {
  outcome: 'nagashi'
  tempai: string[]
}

export type IRoundInfo =
  | IRoundOverviewRon
  | IRoundOverviewMultiRon
  | IRoundOverviewTsumo
  | IRoundOverviewDraw
  | IRoundOverviewAbort
  | IRoundOverviewChombo
  | IRoundOverviewNagashi
