import {
  AppActionTypes,
  GOTO_NEXT_SCREEN,
  GOTO_PREV_SCREEN,
  OPEN_SETTINGS,
  RESET_STATE,
  SHOW_LAST_RESULTS,
  SHOW_GAME_LOG,
  SHOW_OTHER_TABLE,
  SHOW_OTHER_TABLES_LIST,
  START_NEW_GAME,
} from './interfaces';

export function resetState(): AppActionTypes {
  return {
    type: RESET_STATE,
  };
}

export function startNewGame(): AppActionTypes {
  return {
    type: START_NEW_GAME,
  };
}

export function showLastResults(): AppActionTypes {
  return {
    type: SHOW_LAST_RESULTS,
  };
}

export function showGameLog(): AppActionTypes {
  return {
    type: SHOW_GAME_LOG,
  };
}

export function showOtherTablesList(): AppActionTypes {
  return {
    type: SHOW_OTHER_TABLES_LIST,
  };
}

export function showOtherTable(hash: string): AppActionTypes {
  return {
    type: SHOW_OTHER_TABLE,
    payload: {
      hash,
    },
  };
}

export function openSettings(): AppActionTypes {
  return {
    type: OPEN_SETTINGS,
  };
}

export function gotoNextScreen(): AppActionTypes {
  return {
    type: GOTO_NEXT_SCREEN,
  };
}

export function gotoPrevScreen(): AppActionTypes {
  return {
    type: GOTO_PREV_SCREEN,
  };
}
