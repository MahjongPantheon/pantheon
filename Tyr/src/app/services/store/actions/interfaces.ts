import { YakuId } from '../../../primitives/yaku';
import { RemoteError } from '../../remoteError';
import {
  LCurrentGame,
  LGameConfig,
  LSessionOverview,
  LTimerState,
  LUser,
  LUserWithScore
} from '../../../interfaces/local';
import {
  RRoundPaymentsInfo,
  RRoundPaymentsInfoMulti,
  RRoundPaymentsInfoSingle,
  SessionState
} from '../../../interfaces/remote';
import {Table,  Outcome} from '../../../interfaces/common';
import {IAppState} from '../interfaces';

export const INIT_STATE = 'INIT_STATE';
export const RESET_STATE = 'RESET_STATE';
export const STARTUP_WITH_AUTH = 'STARTUP_WITH_AUTH';
export const START_NEW_GAME = 'START_NEW_GAME';
export const SHOW_LAST_RESULTS = 'SHOW_LAST_RESULTS';
export const SHOW_LAST_ROUND = 'SHOW_LAST_ROUND';
export const SHOW_OTHER_TABLES_LIST = 'SHOW_OTHER_TABLES_LIST';
export const SHOW_OTHER_TABLE = 'SHOW_OTHER_TABLE';
export const OPEN_SETTINGS = 'OPEN_SETTINGS';
export const GOTO_NEXT_SCREEN = 'GOTO_NEXT_SCREEN';
export const GOTO_PREV_SCREEN = 'GOTO_PREV_SCREEN';
export const SET_DORA_COUNT = 'SET_DORA_COUNT';
export const SET_FU_COUNT = 'SET_FU_COUNT';
export const ADD_YAKU = 'ADD_YAKU';
export const INIT_REQUIRED_YAKU = 'INIT_REQUIRED_YAKU';
export const REMOVE_YAKU = 'REMOVE_YAKU';
export const TOGGLE_RIICHI = 'TOGGLE_RIICHI';
export const TOGGLE_WINNER = 'TOGGLE_WINNER';
export const TOGGLE_LOSER = 'TOGGLE_LOSER';
export const TOGGLE_PAO = 'TOGGLE_PAO';
export const TOGGLE_DEADHAND = 'TOGGLE_DEADHAND';
export const TOGGLE_NAGASHI = 'TOGGLE_NAGASHI';
export const CONFIRM_REGISTRATION_INIT = 'CONFIRM_REGISTRATION_INIT';
export const CONFIRM_REGISTRATION_SUCCESS = 'CONFIRM_REGISTRATION_SUCCESS';
export const CONFIRM_REGISTRATION_FAIL = 'CONFIRM_REGISTRATION_FAIL';
export const RESET_REGISTRATION_ERROR = 'RESET_REGISTRATION_ERROR';
export const SET_CREDENTIALS = 'SET_CREDENTIALS';
export const UPDATE_CURRENT_GAMES_INIT = 'UPDATE_CURRENT_GAMES_INIT';
export const UPDATE_CURRENT_GAMES_SUCCESS = 'UPDATE_CURRENT_GAMES_SUCCESS';
export const UPDATE_CURRENT_GAMES_FAIL = 'UPDATE_CURRENT_GAMES_FAIL';
export const GET_GAME_OVERVIEW_INIT = 'GET_GAME_OVERVIEW_INIT';
export const GET_GAME_OVERVIEW_SUCCESS = 'GET_GAME_OVERVIEW_SUCCESS';
export const GET_GAME_OVERVIEW_FAIL = 'GET_GAME_OVERVIEW_FAIL';
export const FORCE_LOGOUT = 'FORCE_LOGOUT';
export const GET_OTHER_TABLES_LIST_INIT = 'GET_OTHER_TABLES_LIST_INIT';
export const GET_OTHER_TABLES_LIST_RELOAD = 'GET_OTHER_TABLES_LIST_RELOAD';
export const GET_OTHER_TABLES_LIST_SUCCESS = 'GET_OTHER_TABLES_LIST_SUCCESS';
export const GET_OTHER_TABLES_LIST_FAIL = 'GET_OTHER_TABLES_LIST_FAIL';
export const GET_OTHER_TABLE_INIT = 'GET_OTHER_TABLE_INIT';
export const GET_OTHER_TABLE_RELOAD = 'GET_OTHER_TABLE_RELOAD';
export const GET_OTHER_TABLE_SUCCESS = 'GET_OTHER_TABLE_SUCCESS';
export const GET_OTHER_TABLE_FAIL = 'GET_OTHER_TABLE_FAIL';
export const GET_OTHER_TABLE_LAST_ROUND_INIT = 'GET_OTHER_TABLE_LAST_ROUND_INIT';
export const GET_OTHER_TABLE_LAST_ROUND_SUCCESS = 'GET_OTHER_TABLE_LAST_ROUND_SUCCESS';
export const GET_OTHER_TABLE_LAST_ROUND_FAIL = 'GET_OTHER_TABLE_LAST_ROUND_FAIL';
export const GET_LAST_ROUND_INIT = 'GET_LAST_ROUND_INIT';
export const GET_LAST_ROUND_SUCCESS = 'GET_LAST_ROUND_SUCCESS';
export const GET_LAST_ROUND_FAIL = 'GET_LAST_ROUND_FAIL';
export const SET_TIMER = 'SET_TIMER';
export const UPDATE_TIMER_DATA = 'UPDATE_TIMER_DATA';
export const GET_CHANGES_OVERVIEW_INIT = 'GET_CHANGES_OVERVIEW_INIT';
export const GET_CHANGES_OVERVIEW_SUCCESS = 'GET_CHANGES_OVERVIEW_SUCCESS';
export const GET_CHANGES_OVERVIEW_FAIL = 'GET_CHANGES_OVERVIEW_FAIL';
export const GET_LAST_RESULTS_INIT = 'GET_LAST_RESULTS_INIT';
export const GET_LAST_RESULTS_SUCCESS = 'GET_LAST_RESULTS_SUCCESS';
export const GET_LAST_RESULTS_FAIL = 'GET_LAST_RESULTS_FAIL';
export const GET_ALL_PLAYERS_INIT = 'GET_ALL_PLAYERS_INIT';
export const GET_ALL_PLAYERS_SUCCESS = 'GET_ALL_PLAYERS_SUCCESS';
export const GET_ALL_PLAYERS_FAIL = 'GET_ALL_PLAYERS_FAIL';
export const START_GAME_INIT = 'START_GAME_INIT';
export const START_GAME_SUCCESS = 'START_GAME_SUCCESS';
export const START_GAME_FAIL = 'START_GAME_FAIL';
export const ADD_ROUND_INIT = 'ADD_GAME_INIT';
export const ADD_ROUND_SUCCESS = 'ADD_GAME_SUCCESS';
export const ADD_ROUND_FAIL = 'ADD_GAME_FAIL';
export const INIT_BLANK_OUTCOME = 'INIT_BLANK_OUTCOME';
export const SELECT_MULTIRON_WINNER = 'SELECT_MULTIRON_WINNER';
export const RANDOMIZE_NEWGAME_PLAYERS = 'RANDOMIZE_NEWGAME_PLAYERS';
export const SELECT_NEWGAME_PLAYER_SELF = 'SELECT_NEWGAME_PLAYER_SELF';
export const SELECT_NEWGAME_PLAYER_SHIMOCHA = 'SELECT_NEWGAME_PLAYER_SHIMOCHA';
export const SELECT_NEWGAME_PLAYER_TOIMEN = 'SELECT_NEWGAME_PLAYER_TOIMEN';
export const SELECT_NEWGAME_PLAYER_KAMICHA = 'SELECT_NEWGAME_PLAYER_KAMICHA';
export const TOGGLE_OVERVIEW_DIFFBY = 'TOGGLE_OVERVIEW_DIFFBY';
export const TABLE_ROTATE_COUNTERCLOCKWISE = 'TABLE_ROTATE_COUNTERCLOCKWISE';
export const TABLE_ROTATE_CLOCKWISE = 'TABLE_ROTATE_CLOCKWISE';
export const SETTINGS_SAVE_THEME = 'SETTINGS_SAVE_THEME';
export const SETTINGS_SAVE_LANG = 'SETTINGS_SAVE_LANG';
export const UPDATE_STATE_SETTINGS = 'UPDATE_STATE_SETTINGS';
export const TRACK_ARBITRARY_EVENT = 'TRACK_ARBITRARY_EVENT';
export const TRACK_SCREEN_ENTER = 'TRACK_SCREEN_ENTER';

interface InitStateAction {
  type: typeof INIT_STATE;
}

interface ResetStateAction {
  type: typeof RESET_STATE;
}

interface StartupWithAuthAction {
  type: typeof STARTUP_WITH_AUTH;
  payload: string;
}

interface StartNewGameAction {
  type: typeof START_NEW_GAME;
}

interface ShowLastResultsAction {
  type: typeof SHOW_LAST_RESULTS;
}

interface ShowLastRoundAction {
  type: typeof SHOW_LAST_ROUND;
}

interface ShowOtherTablesListAction {
  type: typeof SHOW_OTHER_TABLES_LIST;
}

interface ShowOtherTableAction {
  type: typeof SHOW_OTHER_TABLE;
  payload: {
    hash: string;
  }
}

interface OpenSettingsAction {
  type: typeof OPEN_SETTINGS;
}

interface GotoNextScreenAction {
  type: typeof GOTO_NEXT_SCREEN;
}

interface GotoPrevScreenAction {
  type: typeof GOTO_PREV_SCREEN;
}

interface SetDoraCountAction {
  type: typeof SET_DORA_COUNT;
  payload: {
    count: number,
    winner?: number
  };
}

interface SetFuCountAction {
  type: typeof SET_FU_COUNT;
  payload: {
    count: number,
    winner?: number
  };
}

interface AddYakuAction {
  type: typeof ADD_YAKU;
  payload: {
    id: YakuId,
    winner?: number
  };
}

interface InitRequiredYakuAction {
  type: typeof INIT_REQUIRED_YAKU;
}

interface RemoveYakuAction {
  type: typeof REMOVE_YAKU;
  payload: {
    id: YakuId,
    winner?: number
  };
}

interface ToggleRiichiAction {
  type: typeof TOGGLE_RIICHI;
  payload: number;
}

interface ToggleWinnerAction {
  type: typeof TOGGLE_WINNER;
  payload: number;
}

interface ToggleLoserAction {
  type: typeof TOGGLE_LOSER;
  payload: number;
}

interface TogglePaoAction {
  type: typeof TOGGLE_PAO;
  payload: {
    id: number,
    yakuWithPao: YakuId[]
  };
}

interface ToggleDeadhandAction {
  type: typeof TOGGLE_DEADHAND;
  payload: number;
}

interface ToggleNagashiAction {
  type: typeof TOGGLE_NAGASHI;
  payload: number;
}

interface ConfirmRegistrationActionInit {
  type: typeof CONFIRM_REGISTRATION_INIT;
  payload: string;
}
interface ConfirmRegistrationActionSuccess {
  type: typeof CONFIRM_REGISTRATION_SUCCESS;
  payload: string;
}
interface ConfirmRegistrationActionFail {
  type: typeof CONFIRM_REGISTRATION_FAIL;
  payload: RemoteError;
}
interface ResetRegistrationErrorAction {
  type: typeof RESET_REGISTRATION_ERROR;
}
interface SetCredentialsAction {
  type: typeof SET_CREDENTIALS;
  payload: string;
}
interface UpdateCurrentGamesActionInit {
  type: typeof UPDATE_CURRENT_GAMES_INIT;
}
interface UpdateCurrentGamesActionSuccess {
  type: typeof UPDATE_CURRENT_GAMES_SUCCESS;
  payload: {
    games: LCurrentGame[];
    playerInfo: LUser;
    gameConfig: LGameConfig;
    timerState: LTimerState;
  }
}
interface UpdateCurrentGamesActionFail {
  type: typeof UPDATE_CURRENT_GAMES_FAIL;
  payload: RemoteError;
}
interface GetGameOverviewActionInit {
  type: typeof GET_GAME_OVERVIEW_INIT;
  payload: string;
}
interface GetGameOverviewActionSuccess {
  type: typeof GET_GAME_OVERVIEW_SUCCESS;
  payload: LSessionOverview;
}
interface GetGameOverviewActionFail {
  type: typeof GET_GAME_OVERVIEW_FAIL;
  payload: RemoteError;
}
interface ForceLogoutAction {
  type: typeof FORCE_LOGOUT;
}
interface GetOtherTablesListActionInit {
  type: typeof GET_OTHER_TABLES_LIST_INIT;
}
interface GetOtherTablesListActionReload {
  type: typeof GET_OTHER_TABLES_LIST_RELOAD;
}
interface GetOtherTablesListActionSuccess {
  type: typeof GET_OTHER_TABLES_LIST_SUCCESS;
  payload: Table[];
}
interface GetOtherTablesListActionFail {
  type: typeof GET_OTHER_TABLES_LIST_FAIL;
  payload: RemoteError;
}
interface GetOtherTableActionInit {
  type: typeof GET_OTHER_TABLE_INIT;
  payload: string;
}
interface GetOtherTableActionReload {
  type: typeof GET_OTHER_TABLE_RELOAD;
}
interface GetOtherTableActionSuccess {
  type: typeof GET_OTHER_TABLE_SUCCESS;
  payload: LSessionOverview;
}
interface GetOtherTableActionFail {
  type: typeof GET_OTHER_TABLE_FAIL;
  payload: RemoteError;
}
interface GetOtherTableLastRoundActionInit {
  type: typeof GET_OTHER_TABLE_LAST_ROUND_INIT;
  payload: string;
}
interface GetOtherTableLastRoundActionSuccess {
  type: typeof GET_OTHER_TABLE_LAST_ROUND_SUCCESS;
  payload: RRoundPaymentsInfoSingle | RRoundPaymentsInfoMulti;
}
interface GetOtherTableLastRoundActionFail {
  type: typeof GET_OTHER_TABLE_LAST_ROUND_FAIL;
  payload: RemoteError;
}
interface GetLastRoundActionInit {
  type: typeof GET_LAST_ROUND_INIT;
  payload: string;
}
interface GetLastRoundActionSuccess {
  type: typeof GET_LAST_ROUND_SUCCESS;
  payload: RRoundPaymentsInfoSingle | RRoundPaymentsInfoMulti;
}
interface GetLastRoundActionFail {
  type: typeof GET_LAST_ROUND_FAIL;
  payload: RemoteError;
}
interface SetTimerAction {
  type: typeof SET_TIMER;
  payload: {
    waiting: boolean;
    secondsRemaining: number;
  }
}
interface UpdateTimerDataAction {
  type: typeof UPDATE_TIMER_DATA;
  payload: {
    waiting: boolean;
    secondsRemaining: number;
    lastUpdateTimestamp?: number;
  }
}

interface GetChangesOverviewActionInit {
  type: typeof GET_CHANGES_OVERVIEW_INIT;
  payload: IAppState;
}

interface GetChangesOverviewActionSuccess {
  type: typeof GET_CHANGES_OVERVIEW_SUCCESS;
  payload: RRoundPaymentsInfo;
}

interface GetChangesOverviewActionFail {
  type: typeof GET_CHANGES_OVERVIEW_FAIL;
  payload: RemoteError;
}

interface GetLastResultsActionInit {
  type: typeof GET_LAST_RESULTS_INIT;
}

interface GetLastResultsActionSuccess {
  type: typeof GET_LAST_RESULTS_SUCCESS;
  payload: LUserWithScore[];
}

interface GetLastResultsActionFail {
  type: typeof GET_LAST_RESULTS_FAIL;
  payload: RemoteError;
}

interface GetAllPlayersActionInit {
  type: typeof GET_ALL_PLAYERS_INIT;
}

interface GetAllPlayersActionSuccess {
  type: typeof GET_ALL_PLAYERS_SUCCESS;
  payload: LUser[];
}

interface GetAllPlayersActionFail {
  type: typeof GET_ALL_PLAYERS_FAIL;
  payload: RemoteError;
}

interface StartGameActionInit {
  type: typeof START_GAME_INIT;
  payload: number[];
}

interface StartGameActionSuccess {
  type: typeof START_GAME_SUCCESS;
  payload: string;
}

interface StartGameActionFail {
  type: typeof START_GAME_FAIL;
  payload: RemoteError;
}

interface AddRoundActionInit {
  type: typeof ADD_ROUND_INIT;
  payload: IAppState;
}

interface AddRoundActionSuccess {
  type: typeof ADD_ROUND_SUCCESS;
  payload: SessionState;
}

interface AddRoundActionFail {
  type: typeof ADD_ROUND_FAIL;
  payload: RemoteError;
}

interface InitBlankOutcomeAction {
  type: typeof INIT_BLANK_OUTCOME;
  payload: Outcome;
}

interface SelectMultironWinnerAction {
  type: typeof SELECT_MULTIRON_WINNER;
  payload: {
    winner: number;
  };
}

interface RandomizeNewgamePlayersAction {
  type: typeof RANDOMIZE_NEWGAME_PLAYERS;
}

interface SelectNewgameSelfAction {
  type: typeof SELECT_NEWGAME_PLAYER_SELF;
  payload: number;
}

interface SelectNewgameShimochaAction {
  type: typeof SELECT_NEWGAME_PLAYER_SHIMOCHA;
  payload: number;
}

interface SelectNewgameToimenAction {
  type: typeof SELECT_NEWGAME_PLAYER_TOIMEN;
  payload: number;
}

interface SelectNewgameKamichaAction {
  type: typeof SELECT_NEWGAME_PLAYER_KAMICHA;
  payload: number;
}

interface ToggleOverviewDiffbyAction {
  type: typeof TOGGLE_OVERVIEW_DIFFBY;
  payload: IAppState['overviewDiffBy'];
}

interface TableRotateClockwiseAction {
  type: typeof TABLE_ROTATE_CLOCKWISE;
}

interface TableRotateCounterclockwiseAction {
  type: typeof TABLE_ROTATE_COUNTERCLOCKWISE;
}

interface SettingsSaveThemeAction {
  type: typeof SETTINGS_SAVE_THEME;
  payload: string;
}

interface SettingsSaveLangAction {
  type: typeof SETTINGS_SAVE_LANG;
  payload: string;
}

interface UpdateStateSettingsAction {
  type: typeof UPDATE_STATE_SETTINGS;
  payload: { [key: string]: any } | undefined;
}

interface TrackArbitraryEventAction {
  type: typeof TRACK_ARBITRARY_EVENT;
  payload: [string, { [key: string]: any }];
}

interface TrackScreenEnterAction {
  type: typeof TRACK_SCREEN_ENTER;
  payload: string;
}

export type AppActionTypes =
  | InitStateAction
  | ResetStateAction
  | StartupWithAuthAction
  | StartNewGameAction
  | ShowLastResultsAction
  | ShowLastRoundAction
  | ShowOtherTablesListAction
  | ShowOtherTableAction
  | OpenSettingsAction
  | GotoNextScreenAction
  | GotoPrevScreenAction
  | SetDoraCountAction
  | SetFuCountAction
  | AddYakuAction
  | RemoveYakuAction
  | InitRequiredYakuAction
  | ToggleRiichiAction
  | ToggleWinnerAction
  | ToggleLoserAction
  | TogglePaoAction
  | ToggleDeadhandAction
  | ToggleNagashiAction
  | ConfirmRegistrationActionSuccess
  | ResetRegistrationErrorAction
  | UpdateCurrentGamesActionSuccess
  | GetGameOverviewActionSuccess
  | ConfirmRegistrationActionFail
  | UpdateCurrentGamesActionFail
  | GetGameOverviewActionFail
  | SetCredentialsAction
  | ForceLogoutAction
  | GetOtherTableActionSuccess
  | GetOtherTableActionFail
  | GetOtherTablesListActionSuccess
  | GetOtherTablesListActionFail
  | GetLastRoundActionSuccess
  | GetLastRoundActionFail
  | SetTimerAction
  | UpdateTimerDataAction
  | GetChangesOverviewActionSuccess
  | GetChangesOverviewActionFail
  | GetLastResultsActionSuccess
  | GetLastResultsActionFail
  | GetAllPlayersActionSuccess
  | GetAllPlayersActionFail
  | StartGameActionSuccess
  | StartGameActionFail
  | ConfirmRegistrationActionInit
  | UpdateCurrentGamesActionInit
  | GetGameOverviewActionInit
  | GetOtherTableActionInit
  | GetOtherTableActionReload
  | GetOtherTablesListActionInit
  | GetOtherTablesListActionReload
  | GetOtherTableLastRoundActionInit
  | GetOtherTableLastRoundActionSuccess
  | GetOtherTableLastRoundActionFail
  | GetLastRoundActionInit
  | GetChangesOverviewActionInit
  | GetLastResultsActionInit
  | GetAllPlayersActionInit
  | StartGameActionInit
  | AddRoundActionInit
  | AddRoundActionSuccess
  | AddRoundActionFail
  | InitBlankOutcomeAction
  | SelectMultironWinnerAction
  | RandomizeNewgamePlayersAction
  | SelectNewgameKamichaAction
  | SelectNewgameSelfAction
  | SelectNewgameShimochaAction
  | SelectNewgameToimenAction
  | ToggleOverviewDiffbyAction
  | TableRotateClockwiseAction
  | TableRotateCounterclockwiseAction
  | SettingsSaveLangAction
  | SettingsSaveThemeAction
  | UpdateStateSettingsAction
  | TrackArbitraryEventAction
  | TrackScreenEnterAction
  ;

