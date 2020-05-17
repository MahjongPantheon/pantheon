import { AppOutcome } from '../../interfaces/app';
import {Player, Table, Yaku} from '../../interfaces/common';
import {LGameConfig, LUser, LUserWithScore} from '../../interfaces/local';
import { RRoundPaymentsInfo, RSessionOverview } from '../../interfaces/remote';
import {Graph} from '../../primitives/graph';
import {RemoteError} from '../remoteError';

export type AppScreen = 'overview' | 'outcomeSelect' | 'playersSelect' | 'otherTable' | 'otherTablesList'
  | 'yakuSelect' | 'confirmation' | 'newGame' | 'lastResults' | 'lastRound' | 'login' | 'paoSelect' | 'settings' | 'nagashiSelect';

export type LoadingSet = {
  games: boolean;
  overview: boolean;
  otherTables: boolean;
  otherTable: boolean;
  login: boolean;
  players: boolean;
  addRound: boolean;
};

export type TimerData = {
  secondsRemaining: number;
  lastUpdateSecondsRemaining: number;
  lastUpdateTimestamp: number;
  waiting: boolean;
};

export type ErrorState = {
  details: RemoteError;
  message: string;
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
  currentOtherTable: RSessionOverview;
  currentOtherTableIndex: number;
  currentOtherTableHash: string | null;
  currentOtherTablePlayers: Player[];
  currentOtherTableLastRound: RRoundPaymentsInfo;
  isIos: boolean;
  loading: LoadingSet;
  timer: TimerData;
  yakuList: Graph<Yaku>;

  allPlayers?: LUser[];
  allPlayersError?: ErrorState;

  // Confirmation / changes overview after dry run
  changesOverview?: RRoundPaymentsInfo;
  changesOverviewError?: ErrorState;

  // View last round of current table
  lastRoundOverview?: RRoundPaymentsInfo;
  lastRoundOverviewErrorCode?: number;

  // Previous game results
  lastResults?: LUserWithScore[];
  lastResultsError?: ErrorState;

  newGameSelectedUsers?: LUser[];
  newGameStartError?: ErrorState;

  otherTablesList: Table[];
  otherTablesListError?: ErrorState;

  overviewDiffBy?: 'self' | 'shimocha' | 'toimen' | 'kamicha';
  overviewViewShift?: number;

  updateCurrentGamesError?: ErrorState;

  isUniversalWatcher: boolean;
  settings: {
    currentLang: string;
    currentTheme: string;
  }

  loginError?: ErrorState;

  gameOverviewReady: boolean;
}

export type TimerStorage = {
  timer: number | null;
  setInterval: (callback: () => any, milliseconds: number) => number;
  clearInterval: (handle: number) => void;
}
