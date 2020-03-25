import { AppOutcome } from "../../interfaces/app";
import {Player, Table, Yaku} from "../../interfaces/common";
import {LGameConfig, LUser} from "../../interfaces/local";
import { RRoundPaymentsInfo, RSessionOverview } from "../../interfaces/remote";
import { AppScreen } from "../../primitives/appstate";
import {Graph} from "../../primitives/graph";

export type AppScreen = 'overview' | 'outcomeSelect' | 'playersSelect' | 'otherTable' | 'otherTablesList'
  | 'yakuSelect' | 'confirmation' | 'newGame' | 'lastResults' | 'lastRound' | 'login' | 'paoSelect' | 'settings' | 'nagashiSelect';

export type LoadingSet = {
  games: boolean;
  overview: boolean;
  otherTables: boolean;
  otherTable: boolean;
  login: boolean;
  players: boolean;
};

export type TimerData = {
  secondsRemaining: number;
  lastUpdateSecondsRemaining: number;
  lastUpdateTimestamp: number;
  waiting: boolean;
};

export interface IAppState {
  currentScreen: AppScreen;
  currentSessionHash: string;
  currentOutcome: AppOutcome;
  currentRound: number;
  currentPlayerDisplayName: string;
  currentPlayerId: number;
  players: [Player, Player, Player, Player]; // e-s-w-n
  mapIdToPlayer: { [key: number]: Player };
  riichiOnTable: number;
  honba: number;
  multironCurrentWinner: number | null;
  isLoggedIn: boolean;
  gameConfig: LGameConfig;
  tableIndex: number;
  yellowZoneAlreadyPlayed;
  otherTablesList: Table[];
  currentOtherTable: RSessionOverview;
  currentOtherTableHash: string | null;
  currentOtherTablePlayers: Player[];
  currentOtherTableLastRound: RRoundPaymentsInfo;
  isIos: boolean;
  loading: LoadingSet;
  timer: TimerData;
  yakuList: Graph<Yaku>;

  allPlayers?: LUser[];
  changesOverview?: RRoundPaymentsInfo; // Confirmation of current round data after dry run
  lastRoundOverview?: RRoundPaymentsInfo; // Data of previous round

  isUniversalWatcher: boolean;
}

export type TimerStorage = {
  timer: number | null;
  setInterval: (callback: () => any, milliseconds: number) => number;
  clearInterval: (handle: number) => void;
}
