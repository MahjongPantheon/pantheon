import {
  AppActionTypes1,
  GOTO_NEXT_SCREEN,
  GOTO_PREV_SCREEN,
  OPEN_SETTINGS,
  RESET_STATE,
  SHOW_LAST_RESULTS,
  SHOW_LAST_ROUND,
  SHOW_OTHER_TABLE,
  SHOW_OTHER_TABLES_LIST,
  START_NEW_GAME
} from './interfaces';

export function resetState(): AppActionTypes1 {
  return {
    type: RESET_STATE
  };
}

export function startNewGame(): AppActionTypes1 {
  return {
    type: START_NEW_GAME
  };
}

export function showLastResults(): AppActionTypes1 {
  return {
    type: SHOW_LAST_RESULTS
  };
}

export function showLastRound(): AppActionTypes1 {
  return {
    type: SHOW_LAST_ROUND
  };
}

export function showOtherTablesList(): AppActionTypes1 {
  return {
    type: SHOW_OTHER_TABLES_LIST
  };
}

export function showOtherTable(hash: string): AppActionTypes1 {
  return {
    type: SHOW_OTHER_TABLE,
    payload: {
      hash
    }
  };
}

export function openSettings(): AppActionTypes1 {
  return {
    type: OPEN_SETTINGS
  };
}

export function gotoNextScreen(): AppActionTypes1 {
  return {
    type: GOTO_NEXT_SCREEN
  };
}

export function gotoPrevScreen(): AppActionTypes1 {
  return {
    type: GOTO_PREV_SCREEN
  };
}
