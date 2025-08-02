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

import { YakuId } from '../../helpers/yaku';
import { RemoteError } from '../../services/remoteError';
import { IAppState } from '../interfaces';
import { AuthAuthorizeResponse } from 'tsclients/proto/frey.pb';
import {
  GameConfig,
  MyEvent,
  Penalty,
  PersonEx,
  RegisteredPlayer,
  RoundOutcome,
  RoundState,
  SessionHistoryResult,
  TableState,
} from 'tsclients/proto/atoms.pb';
import {
  CurrentSession,
  GamesAddRoundResponse,
  GamesGetSessionOverviewResponse,
} from 'tsclients/proto/mimir.pb';

export const INIT_STATE = 'INIT_STATE';
export const RESET_STATE = 'RESET_STATE';
export const STARTUP_WITH_AUTH = 'STARTUP_WITH_AUTH';
export const START_NEW_GAME = 'START_NEW_GAME';
export const GO_TO_CURRENT_GAME = 'GO_TO_CURRENT_GAME';
export const GO_TO_DONATE = 'GO_TO_DONATE';
export const GO_TO_PENALTIES = 'GO_TO_PENALTIES';
export const GOTO_EVENT_SELECT = 'GOTO_EVENT_SELECT';
export const SEARCH_PLAYER = 'SEARCH_PLAYER';
export const SHOW_LAST_RESULTS = 'SHOW_LAST_RESULTS';
export const SHOW_GAME_LOG = 'SHOW_GAME_LOG';
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
export const SELECT_PAO = 'SELECT_PAO';
export const TOGGLE_DEADHAND = 'TOGGLE_DEADHAND';
export const TOGGLE_NAGASHI = 'TOGGLE_NAGASHI';
export const LOGIN_INIT = 'LOGIN_INIT';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const RESET_LOGIN_ERROR = 'RESET_LOGIN_ERROR';
export const SET_CREDENTIALS = 'SET_CREDENTIALS';
export const UPDATE_CURRENT_GAMES_INIT = 'UPDATE_CURRENT_GAMES_INIT';
export const UPDATE_CURRENT_GAMES_SUCCESS = 'UPDATE_CURRENT_GAMES_SUCCESS';
export const UPDATE_CURRENT_GAMES_FAIL = 'UPDATE_CURRENT_GAMES_FAIL';
export const GET_GAME_OVERVIEW_INIT = 'GET_GAME_OVERVIEW_INIT';
export const GET_GAME_OVERVIEW_SUCCESS = 'GET_GAME_OVERVIEW_SUCCESS';
export const GET_GAME_OVERVIEW_FAIL = 'GET_GAME_OVERVIEW_FAIL';
export const GET_USERINFO_INIT = 'GET_USERINFO_INIT';
export const GET_USERINFO_SUCCESS = 'GET_USERINFO_SUCCESS';
export const GET_USERINFO_FAIL = 'GET_USERINFO_FAIL';
export const FORCE_LOGOUT = 'FORCE_LOGOUT';
export const GET_OTHER_TABLES_LIST_INIT = 'GET_OTHER_TABLES_LIST_INIT';
export const GET_OTHER_TABLES_LIST_RELOAD = 'GET_OTHER_TABLES_LIST_RELOAD';
export const GET_OTHER_TABLES_LIST_SUCCESS = 'GET_OTHER_TABLES_LIST_SUCCESS';
export const GET_OTHER_TABLES_LIST_FAIL = 'GET_OTHER_TABLES_LIST_FAIL';
export const GET_OTHER_TABLE_INIT = 'GET_OTHER_TABLE_INIT';
export const GET_OTHER_TABLE_RELOAD = 'GET_OTHER_TABLE_RELOAD';
export const GET_OTHER_TABLE_SUCCESS = 'GET_OTHER_TABLE_SUCCESS';
export const GET_OTHER_TABLE_FAIL = 'GET_OTHER_TABLE_FAIL';
export const GET_ALL_ROUNDS_INIT = 'GET_ALL_ROUNDS_INIT';
export const GET_ALL_ROUNDS_SUCCESS = 'GET_ALL_ROUNDS_SUCCESS';
export const GET_ALL_ROUNDS_FAIL = 'GET_ALL_ROUNDS_FAIL';
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
export const EVENTS_GET_LIST_INIT = 'EVENTS_GET_LIST_INIT';
export const EVENTS_GET_LIST_SUCCESS = 'EVENTS_GET_LIST_SUCCESS';
export const EVENTS_GET_LIST_FAIL = 'EVENTS_GET_LIST_FAIL';
export const SELECT_EVENT = 'SELECT_EVENT';
export const INIT_BLANK_OUTCOME = 'INIT_BLANK_OUTCOME';
export const RANDOMIZE_NEWGAME_PLAYERS = 'RANDOMIZE_NEWGAME_PLAYERS';
export const CLEAR_NEWGAME_PLAYERS = 'CLEAR_NEWGAME_PLAYERS';
export const SET_NEWGAME_PLAYERS = 'SET_NEWGAME_PLAYERS';
export const SELECT_NEWGAME_PLAYER_EAST = 'SELECT_NEWGAME_PLAYER_EAST';
export const SELECT_NEWGAME_PLAYER_SOUTH = 'SELECT_NEWGAME_PLAYER_SOUTH';
export const SELECT_NEWGAME_PLAYER_WEST = 'SELECT_NEWGAME_PLAYER_WEST';
export const SELECT_NEWGAME_PLAYER_NORTH = 'SELECT_NEWGAME_PLAYER_NORTH';
export const TOGGLE_OVERVIEW_DIFFBY = 'TOGGLE_OVERVIEW_DIFFBY';
export const TOGGLE_ADDITIONAL_TABLE_INFO = 'TOGGLE_ADDITIONAL_TABLE_INFO';
export const TABLE_ROTATE_COUNTERCLOCKWISE = 'TABLE_ROTATE_COUNTERCLOCKWISE';
export const TABLE_ROTATE_CLOCKWISE = 'TABLE_ROTATE_CLOCKWISE';
export const SETTINGS_SAVE_THEME = 'SETTINGS_SAVE_THEME';
export const SETTINGS_SAVE_LANG = 'SETTINGS_SAVE_LANG';
export const SETTINGS_SAVE_SINGLE_DEVICE_MODE = 'SETTINGS_SAVE_SINGLE_DEVICE_MODE';
export const UPDATE_STATE_SETTINGS = 'UPDATE_STATE_SETTINGS';
export const SET_STATE_SETTINGS = 'SET_STATE_SETTINGS';
export const TRACK_ARBITRARY_EVENT = 'TRACK_ARBITRARY_EVENT';
export const TRACK_SCREEN_ENTER = 'TRACK_SCREEN_ENTER';
export const HISTORY_INIT = 'HISTORY_INIT';
export const CALL_REFEREE = 'CALL_REFEREE';
export const TOGGLE_RIICHI_NOTIFICATION = 'TOGGLE_RIICHI_NOTIFICATION';
export const GET_PENALTIES_INIT = 'GET_PENALTIES_INIT';
export const GET_PENALTIES_SUCCESS = 'GET_PENALTIES_SUCCESS';
export const GET_PENALTIES_FAIL = 'GET_PENALTIES_FAIL';

interface InitStateAction {
  type: typeof INIT_STATE;
}

interface ResetStateAction {
  type: typeof RESET_STATE;
}

interface StartupWithAuthAction {
  type: typeof STARTUP_WITH_AUTH;
  payload: {
    token: string;
    personId: number;
    sessionId: string; // analytics session id, not gaming session!
  };
}

interface StartNewGameAction {
  type: typeof START_NEW_GAME;
  payload?: number[];
}

interface GoToCurrentGameAction {
  type: typeof GO_TO_CURRENT_GAME;
}

interface GoToDonateAction {
  type: typeof GO_TO_DONATE;
}

interface GoToPenaltiesAction {
  type: typeof GO_TO_PENALTIES;
}

interface GoToEventSelectAction {
  type: typeof GOTO_EVENT_SELECT;
}

interface SearchPlayerAction {
  type: typeof SEARCH_PLAYER;
  payload: IAppState['newGameSelectedPlayerSide'];
}

interface ShowLastResultsAction {
  type: typeof SHOW_LAST_RESULTS;
}

interface ShowGameLogAction {
  type: typeof SHOW_GAME_LOG;
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
    count: number;
    winner?: number;
  };
}

interface SetFuCountAction {
  type: typeof SET_FU_COUNT;
  payload: {
    count: number;
    winner?: number;
  };
}

interface AddYakuAction {
  type: typeof ADD_YAKU;
  payload: {
    id: YakuId;
    winner?: number;
  };
}

interface InitRequiredYakuAction {
  type: typeof INIT_REQUIRED_YAKU;
}

interface RemoveYakuAction {
  type: typeof REMOVE_YAKU;
  payload: {
    id: YakuId;
    winner?: number;
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

interface SelectPaoAction {
  type: typeof SELECT_PAO;
  payload: {
    paoId: number;
    winnerId: number;
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

interface LoginActionInit {
  type: typeof LOGIN_INIT;
  payload: {
    email: string;
    password: string;
    sessionId: string;
  };
}
interface LoginActionSuccess {
  type: typeof LOGIN_SUCCESS;
  payload: AuthAuthorizeResponse;
}
interface LoginActionFail {
  type: typeof LOGIN_FAIL;
  payload: RemoteError;
}
interface ResetLoginErrorAction {
  type: typeof RESET_LOGIN_ERROR;
}
interface SetCredentialsAction {
  type: typeof SET_CREDENTIALS;
  payload: {
    authToken: string;
    personId: number;
    sessionId: string;
  };
}
interface UpdateCurrentGamesActionInit {
  type: typeof UPDATE_CURRENT_GAMES_INIT;
}
interface UpdateCurrentGamesActionSuccess {
  type: typeof UPDATE_CURRENT_GAMES_SUCCESS;
  payload: {
    games: CurrentSession[];
    gameConfig: GameConfig;
  };
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
  payload: GamesGetSessionOverviewResponse;
}
interface GetGameOverviewActionFail {
  type: typeof GET_GAME_OVERVIEW_FAIL;
  payload: RemoteError;
}
interface GetUserinfoActionInit {
  type: typeof GET_USERINFO_INIT;
  payload: number;
}
interface GetUserinfoActionSuccess {
  type: typeof GET_USERINFO_SUCCESS;
  payload: PersonEx;
}
interface GetUserinfoActionFail {
  type: typeof GET_USERINFO_FAIL;
  payload: RemoteError;
}
export interface ForceLogoutAction {
  type: typeof FORCE_LOGOUT;
  payload: RemoteError | undefined;
}
interface GetOtherTablesListActionInit {
  type: typeof GET_OTHER_TABLES_LIST_INIT;
}
interface GetOtherTablesListActionReload {
  type: typeof GET_OTHER_TABLES_LIST_RELOAD;
}
interface GetOtherTablesListActionSuccess {
  type: typeof GET_OTHER_TABLES_LIST_SUCCESS;
  payload: TableState[];
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
  payload: GamesGetSessionOverviewResponse;
}
interface GetOtherTableActionFail {
  type: typeof GET_OTHER_TABLE_FAIL;
  payload: RemoteError;
}
interface GetAllRoundsActionInit {
  type: typeof GET_ALL_ROUNDS_INIT;
  payload: string;
}
interface GetAllRoundsActionSuccess {
  type: typeof GET_ALL_ROUNDS_SUCCESS;
  payload: RoundState[];
}
interface GetAllRoundsActionFail {
  type: typeof GET_ALL_ROUNDS_FAIL;
  payload: RemoteError;
}
interface SetTimerAction {
  type: typeof SET_TIMER;
  payload: {
    waiting: boolean;
    secondsRemaining: number;
    autostartSecondsRemaining: number;
    haveAutostart: boolean;
  };
}
interface UpdateTimerDataAction {
  type: typeof UPDATE_TIMER_DATA;
  payload: {
    waiting: boolean;
    secondsRemaining?: number;
    lastUpdateTimestamp?: number;
    autostartSecondsRemaining?: number;
    autostartLastUpdateTimestamp?: number;
  };
}

interface GetChangesOverviewActionInit {
  type: typeof GET_CHANGES_OVERVIEW_INIT;
  payload: IAppState;
}

interface GetChangesOverviewActionSuccess {
  type: typeof GET_CHANGES_OVERVIEW_SUCCESS;
  payload: RoundState;
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
  payload: SessionHistoryResult[];
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
  payload: RegisteredPlayer[];
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
  payload: GamesAddRoundResponse;
}

interface AddRoundActionFail {
  type: typeof ADD_ROUND_FAIL;
  payload: RemoteError;
}

interface EventsGetListActionInit {
  type: typeof EVENTS_GET_LIST_INIT;
}

export interface EventsGetListActionSuccess {
  type: typeof EVENTS_GET_LIST_SUCCESS;
  payload: MyEvent[];
}

interface EventsGetListActionFail {
  type: typeof EVENTS_GET_LIST_FAIL;
  payload: RemoteError;
}

interface SelectEventAction {
  type: typeof SELECT_EVENT;
  payload: number;
}

interface InitBlankOutcomeAction {
  type: typeof INIT_BLANK_OUTCOME;
  payload: RoundOutcome;
}

interface RandomizeNewgamePlayersAction {
  type: typeof RANDOMIZE_NEWGAME_PLAYERS;
}

interface ClearNewgamePlayersAction {
  type: typeof CLEAR_NEWGAME_PLAYERS;
}

interface SetNewgamePlayersAction {
  type: typeof SET_NEWGAME_PLAYERS;
}

interface SelectNewgameEastAction {
  type: typeof SELECT_NEWGAME_PLAYER_EAST;
  payload: number;
}

interface SelectNewgameSouthAction {
  type: typeof SELECT_NEWGAME_PLAYER_SOUTH;
  payload: number;
}

interface SelectNewgameWestAction {
  type: typeof SELECT_NEWGAME_PLAYER_WEST;
  payload: number;
}

interface SelectNewgameNorthAction {
  type: typeof SELECT_NEWGAME_PLAYER_NORTH;
  payload: number;
}

interface ToggleOverviewDiffbyAction {
  type: typeof TOGGLE_OVERVIEW_DIFFBY;
  payload: number;
}

interface ToggleAdditionalTableInfoAction {
  type: typeof TOGGLE_ADDITIONAL_TABLE_INFO;
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

interface SettingsSaveSingleDeviceMode {
  type: typeof SETTINGS_SAVE_SINGLE_DEVICE_MODE;
  payload: boolean;
}

interface UpdateStateSettingsAction {
  type: typeof UPDATE_STATE_SETTINGS;
}

interface SetStateSettingsAction {
  type: typeof SET_STATE_SETTINGS;
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

interface HistoryInitAction {
  type: typeof HISTORY_INIT;
}

interface CallRefereeAction {
  type: typeof CALL_REFEREE;
}

interface ToggleRiichiNotificationAction {
  type: typeof TOGGLE_RIICHI_NOTIFICATION;
  payload: boolean;
}

interface GetPenaltiesInit {
  type: typeof GET_PENALTIES_INIT;
}

interface GetPenaltiesSuccess {
  type: typeof GET_PENALTIES_SUCCESS;
  payload: Penalty[];
}

interface GetPenaltiesFail {
  type: typeof GET_PENALTIES_FAIL;
  payload: RemoteError;
}

export type AppActionTypes =
  | InitStateAction
  | ResetStateAction
  | StartupWithAuthAction
  | StartNewGameAction
  | GoToCurrentGameAction
  | GoToEventSelectAction
  | GoToDonateAction
  | GoToPenaltiesAction
  | SearchPlayerAction
  | ShowLastResultsAction
  | ShowGameLogAction
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
  | SelectPaoAction
  | ToggleDeadhandAction
  | ToggleNagashiAction
  | LoginActionSuccess
  | ResetLoginErrorAction
  | UpdateCurrentGamesActionSuccess
  | GetGameOverviewActionSuccess
  | LoginActionFail
  | UpdateCurrentGamesActionFail
  | GetGameOverviewActionFail
  | SetCredentialsAction
  | ForceLogoutAction
  | GetOtherTableActionSuccess
  | GetOtherTableActionFail
  | GetOtherTablesListActionSuccess
  | GetOtherTablesListActionFail
  | GetAllRoundsActionInit
  | GetAllRoundsActionSuccess
  | GetAllRoundsActionFail
  | GetUserinfoActionInit
  | GetUserinfoActionSuccess
  | GetUserinfoActionFail
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
  | LoginActionInit
  | UpdateCurrentGamesActionInit
  | GetGameOverviewActionInit
  | GetOtherTableActionInit
  | GetOtherTableActionReload
  | GetOtherTablesListActionInit
  | GetOtherTablesListActionReload
  | GetChangesOverviewActionInit
  | GetLastResultsActionInit
  | GetAllPlayersActionInit
  | StartGameActionInit
  | AddRoundActionInit
  | AddRoundActionSuccess
  | AddRoundActionFail
  | InitBlankOutcomeAction
  | RandomizeNewgamePlayersAction
  | ClearNewgamePlayersAction
  | SelectNewgameNorthAction
  | SetNewgamePlayersAction
  | SelectNewgameEastAction
  | SelectNewgameSouthAction
  | SelectNewgameWestAction
  | ToggleOverviewDiffbyAction
  | ToggleAdditionalTableInfoAction
  | TableRotateClockwiseAction
  | TableRotateCounterclockwiseAction
  | SettingsSaveLangAction
  | SettingsSaveSingleDeviceMode
  | SettingsSaveThemeAction
  | UpdateStateSettingsAction
  | SetStateSettingsAction
  | TrackArbitraryEventAction
  | TrackScreenEnterAction
  | EventsGetListActionInit
  | EventsGetListActionSuccess
  | EventsGetListActionFail
  | SelectEventAction
  | HistoryInitAction
  | CallRefereeAction
  | GetPenaltiesInit
  | GetPenaltiesSuccess
  | GetPenaltiesFail
  | ToggleRiichiNotificationAction;
