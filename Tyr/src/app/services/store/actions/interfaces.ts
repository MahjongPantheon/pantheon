import { getInlineResourcesTransformFactory } from "@angular/compiler-cli/src/transformers/inline_resources";
import { YakuId } from "../../../primitives/yaku";

export const RESET_STATE = 'RESET_STATE';
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
export const REMOVE_YAKU = 'REMOVE_YAKU';

interface ResetStateAction {
  type: typeof RESET_STATE;
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

interface RemoveYakuAction {
  type: typeof REMOVE_YAKU;
  payload: {
    id: YakuId,
    winner?: number
  };
}

export type AppActionTypes = ResetStateAction
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
  ;
