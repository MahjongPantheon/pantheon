import { Dispatch, Store as ReduxStore } from 'redux';
import { ADD_YAKU, AppActionTypes, REMOVE_YAKU } from '../actions/interfaces';
import { I18nService } from '#/services/i18n';
import { YakuId } from '#/primitives/yaku';
import { IAppState } from '../interfaces';

export const yaku = (i18n: I18nService) => (store: ReduxStore<IAppState>) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
    case ADD_YAKU:
    case REMOVE_YAKU:
      if (action.payload.id === YakuId.RIICHI) {
        alert(i18n._t('If you want to select a riichi, return back and press riichi button for the winner'));
        return;
      }

      if (action.payload.id === YakuId.DOUBLERIICHI) {
        const outcome = store.getState().currentOutcome;
        if (outcome.selectedOutcome === 'ron' || outcome.selectedOutcome === 'tsumo' || outcome.selectedOutcome === 'multiron') {
          if (action.payload.winner && outcome.riichiBets.indexOf(action.payload.winner) === -1) {
            alert(i18n._t('If you want to select a riichi, return back and press riichi button for the winner'));
            return;
          }
        }
      }

      next(action);
      break;
    default:
      next(action);
  }
};
