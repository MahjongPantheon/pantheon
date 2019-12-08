import { AppOutcome } from "../../interfaces/app";
import { Player, Table } from "../../interfaces/common";
import { LGameConfig } from "../../interfaces/local";
import { RRoundPaymentsInfo, RSessionOverview } from "../../interfaces/remote";
import { AppScreen } from "../../primitives/appstate";

export type AppScreen = 'overview' | 'outcomeSelect' | 'playersSelect' | 'otherTable' | 'otherTablesList'
  | 'yakuSelect' | 'confirmation' | 'newGame' | 'lastResults' | 'lastRound' | 'login' | 'paoSelect' | 'settings' | 'nagashiSelect';

export type LoadingSet = {
  games: boolean,
  overview: boolean,
  otherTables: boolean,
  otherTable: boolean,
  login: boolean,
};

export interface IAppState {
  currentScreen: AppScreen;
  currentSessionHash: string;
  currentOutcome: AppOutcome;
  currentRound: number;
  currentPlayerDisplayName: string;
  currentPlayerId;
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
}
