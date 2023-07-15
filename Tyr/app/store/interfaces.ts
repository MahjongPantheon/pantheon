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

import { AppOutcome } from '../interfaces/app';
import { Yaku } from '../interfaces/common';
import { Graph } from '../primitives/graph';
import { RemoteError } from '../services/remoteError';
import {
  GameConfig,
  MyEvent,
  PlayerInSession,
  RegisteredPlayer,
  RoundState,
  SessionHistoryResult,
  SessionState,
  TableState,
} from '../clients/proto/atoms.pb';
import { GamesGetSessionOverviewResponse } from '../clients/proto/mimir.pb';

export type AppScreen =
  | 'eventSelector'
  | 'overview'
  | 'currentGame'
  | 'outcomeSelect'
  | 'playersSelect'
  | 'otherTable'
  | 'otherTablesList'
  | 'handSelect'
  | 'confirmation'
  | 'newGame'
  | 'searchPlayer'
  | 'lastResults'
  | 'gameLog'
  | 'login'
  | 'paoSelect'
  | 'settings'
  | 'nagashiSelect'
  | 'donate';

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
  autostartSecondsRemaining: number;
  autostartLastUpdateSecondsRemaining: number;
  autostartLastUpdateTimestamp: number;
};

export type ErrorState = {
  details: RemoteError;
  message: string;
};

export interface IAppState {
  currentScreen: AppScreen;
  currentSessionHash?: string;
  currentOutcome?: AppOutcome;
  currentPlayerDisplayName?: string;
  currentPlayerHasAvatar?: boolean;
  currentPlayerLastUpdate: string;
  currentPlayerId?: number;
  currentEventId?: number;
  players?: PlayerInSession[]; // e-s-w-n
  mapIdToPlayer: { [key: number]: PlayerInSession };
  multironCurrentWinner?: number;
  isLoggedIn: boolean;
  gameConfig?: GameConfig;
  sessionState?: SessionState;
  tableIndex?: number | null;
  currentOtherTableIndex?: number | null;
  currentOtherTableHash?: string;
  currentOtherTablePlayers: PlayerInSession[];
  isIos: boolean;
  loading: LoadingSet;
  timer?: TimerData;
  yakuList?: Graph<Yaku>;

  allPlayers?: RegisteredPlayer[];
  allPlayersError?: ErrorState;

  // Confirmation / changes overview after dry run
  changesOverview?: RoundState;
  changesOverviewError?: ErrorState;

  // View log of current table
  allRoundsOverview?: RoundState[];
  allRoundsOverviewErrorCode?: number;

  // Previous game results
  lastResults?: SessionHistoryResult[];
  lastResultsError?: ErrorState;

  newGameIdsToSet?: number[];
  newGameSelectedUsers?: RegisteredPlayer[];
  newGameSelectedPlayerSide?: '東' | '南' | '西' | '北';
  newGameStartError?: ErrorState;

  otherTablesList: TableState[];
  otherTablesListError?: ErrorState;

  currentOtherTable?: GamesGetSessionOverviewResponse;
  otherTableError?: ErrorState;

  overviewDiffBy?: number;
  overviewViewShift?: number;

  currentSelectHandTab?: 'yaku' | 'total';

  showAdditionalTableInfo: boolean;

  updateCurrentGamesError?: ErrorState;
  getUserinfoError?: ErrorState;

  settings: {
    currentLang: string;
    currentTheme: string;
    singleDeviceMode: boolean;
  };

  loginError?: ErrorState;

  gameOverviewReady: boolean;

  eventsList: MyEvent[];
  eventsListError?: RemoteError;

  historyInitialized: boolean;
}

export type TimerStorage = {
  timer?: number;
  autostartTimer?: number;
  setInterval: (callback: () => any, milliseconds: number) => number;
  clearInterval: (handle: number) => void;
};
