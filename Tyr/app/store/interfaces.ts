import { AppOutcome } from '#/interfaces/app';
import {Player, Table, Yaku} from '#/interfaces/common';
import {LEventsList, LGameConfig, LSessionOverview, LUser, LUserWithScore} from '#/interfaces/local';
import {RRoundOverviewInfo, RRoundPaymentsInfo} from '#/interfaces/remote';
import {Graph} from '#/primitives/graph';
import {RemoteError} from '#/services/remoteError';

export type AppScreen =
  'eventSelector' | 'overview' | 'currentGame' |
  'outcomeSelect' | 'playersSelect' | 'otherTable' |
  'otherTablesList' | 'handSelect' | 'confirmation' |
  'newGame' | 'searchPlayer' | 'lastResults' |
  'gameLog' | 'login' | 'paoSelect' | 'settings' |
  'nagashiSelect';

export type LoadingSet = {
  games: boolean;
  overview: boolean;
  otherTables: boolean;
  otherTable: boolean;
  login: boolean;
  players: boolean;
  addRound: boolean;
  events: boolean;
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

export type Features = {
  wsClient: boolean;
};

export interface IAppState {
  features: Features;
  currentScreen: AppScreen;
  currentSessionHash?: string;
  currentOutcome?: AppOutcome;
  currentRound: number;
  currentPlayerDisplayName?: string;
  currentPlayerId?: number;
  currentEventId?: number;
  players?: [Player, Player, Player, Player]; // e-s-w-n
  mapIdToPlayer: { [key: number]: Player };
  riichiOnTable: number;
  honba: number;
  multironCurrentWinner?: number;
  isLoggedIn: boolean;
  gameConfig?: LGameConfig;
  tableIndex?: number;
  yellowZoneAlreadyPlayed: boolean;
  currentOtherTableIndex: number;
  currentOtherTableHash?: string;
  currentOtherTablePlayers: Player[];
  isIos: boolean;
  loading: LoadingSet;
  timer?: TimerData;
  yakuList?: Graph<Yaku>;

  allPlayers?: LUser[];
  allPlayersError?: ErrorState;

  // Confirmation / changes overview after dry run
  changesOverview?: RRoundPaymentsInfo;
  changesOverviewError?: ErrorState;

  // View log of current table
  allRoundsOverview?: RRoundOverviewInfo[];
  allRoundsOverviewErrorCode?: number;

  // Previous game results
  lastResults?: LUserWithScore[];
  lastResultsError?: ErrorState;

  newGameIdsToSet?: number[];
  newGameSelectedUsers?: LUser[];
  newGameSelectedPlayerSide?: '東' | '南' | '西' | '北';
  newGameStartError?: ErrorState;

  otherTablesList: Table[];
  otherTablesListError?: ErrorState;

  currentOtherTable?: LSessionOverview;
  otherTableError?: ErrorState;

  overviewDiffBy?: number;
  overviewViewShift?: number;

  currentSelectHandTab?: 'yaku' | 'total'

  showAdditionalTableInfo: boolean;

  updateCurrentGamesError?: ErrorState;
  getUserinfoError?: ErrorState;

  isUniversalWatcher: boolean;
  settings: {
    currentLang: string;
    currentTheme: string;
  }

  loginError?: ErrorState;

  gameOverviewReady: boolean;

  eventsList: LEventsList;
  eventsListError?: RemoteError;

  historyInitialized: boolean;
}

export type TimerStorage = {
  timer?: number;
  setInterval: (callback: () => any, milliseconds: number) => number;
  clearInterval: (handle: number) => void;
}
