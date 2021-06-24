import { Dispatch, MiddlewareAPI } from 'redux';
import {
  AppActionTypes,
  GET_ALL_PLAYERS_INIT,
  GET_CHANGES_OVERVIEW_INIT, GO_TO_CURRENT_GAME,
  GOTO_NEXT_SCREEN, INIT_REQUIRED_YAKU,
  INIT_STATE, SELECT_MULTIRON_WINNER, START_GAME_SUCCESS,
  START_NEW_GAME,
  UPDATE_STATE_SETTINGS,
  ADD_YAKU,
} from '../actions/interfaces';
import {IAppState} from '../interfaces';
import {getWinningUsers} from '#/store/selectors/mimirSelectors';
import {YakuId} from '#/primitives/yaku';

export const screenManageMw = () => (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
    case GOTO_NEXT_SCREEN:
      const previousScreen = mw.getState().currentScreen
      next({ type: GOTO_NEXT_SCREEN });

      const state = mw.getState();
      const currentScreen = state.currentScreen;

      switch (currentScreen) {
        case 'confirmation':
          mw.dispatch({ type: GET_CHANGES_OVERVIEW_INIT, payload: state });
          break;
        case 'yakuSelect':
          if (previousScreen === 'playersSelect' && state.currentOutcome && ['ron', 'tsumo'].includes(state.currentOutcome.selectedOutcome)) {
            const currentWinnerId = getWinningUsers(state)[0].id;
            mw.dispatch({ type: SELECT_MULTIRON_WINNER, payload: { winner: currentWinnerId} });
            mw.dispatch({ type: INIT_REQUIRED_YAKU });

            if (state.currentOutcome?.selectedOutcome === 'tsumo') {
              mw.dispatch({ type: ADD_YAKU, payload: { id: YakuId.MENZENTSUMO, winner: currentWinnerId} });
            }
          }
          break;
        case 'paoSelect':
          if (previousScreen === 'totalHandSelect') {
            const currentWinnerId = getWinningUsers(state)[0].id;
            mw.dispatch({ type: SELECT_MULTIRON_WINNER, payload: { winner: currentWinnerId} });
          }
          break;
      }

      break;
    case START_NEW_GAME:
      next(action)
      mw.dispatch({ type: GET_ALL_PLAYERS_INIT });
      break;
    case INIT_STATE:
      next(action)
      mw.dispatch({ type: UPDATE_STATE_SETTINGS});
      break;
    default:
      return next(action);
  }
};
