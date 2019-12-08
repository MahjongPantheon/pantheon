import { IAppState } from "./interfaces";

export const initialState: IAppState = {
  currentScreen: 'overview',
  currentSessionHash: null,
  currentOutcome: null,
  currentRound: 1,
  currentPlayerDisplayName: null,
  currentPlayerId: null,
  players: null, // e-s-w-n,
  mapIdToPlayer: {},
  riichiOnTable: 0,
  honba: 0,
  multironCurrentWinner: null,
  isLoggedIn: false,
  gameConfig: null,
  tableIndex: null,
  yellowZoneAlreadyPlayed: false,
  otherTablesList: [],
  currentOtherTable: null,
  currentOtherTableHash: null,
  currentOtherTablePlayers: [],
  currentOtherTableLastRound: null,
  isIos: false,

  // preloaders flags
  loading: {
    games: true,
    overview: false,
    otherTables: false,
    otherTable: false,
    login: false,
  }
};

