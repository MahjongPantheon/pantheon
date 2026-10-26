import { useContext } from 'react';
import { Dispatch } from 'redux';
import { IAppState } from '../../../store/interfaces';
import { AppActionTypes, RESOLVE_YAKU_ADVICE } from '../../../store/actions/interfaces';
import { YakuId } from '../../../helpers/yaku';
import { i18n } from '../../i18n';
import { ModalDialog } from '../ModalDialog/ModalDialog';

export const YakuAdviceDialog = ({
  advice,
  dispatch,
}: {
  advice: NonNullable<IAppState['yakuAdvice']>;
  dispatch: Dispatch<AppActionTypes>;
}) => {
  const loc = useContext(i18n);
  const resolve = (approve: boolean) =>
    dispatch({ type: RESOLVE_YAKU_ADVICE, payload: { approve, advice } });
  return (
    <ModalDialog
      testIdPrefix='tyr-yaku-advice-dialog'
      onClose={() => resolve(false)}
      actionPrimary={() => resolve(true)}
      actionPrimaryLabel={loc._t('OK')}
      actionSecondary={() => resolve(false)}
      actionSecondaryLabel={loc._t('Cancel')}
    >
      {advice.expectedYaku === YakuId.SUUANKOU
        ? loc._t('Toitoi in a closed hand won by tsumo is Suuankou. Select Suuankou instead?')
        : loc._t('This combination requires Sanankou. Select Sanankou as well?')}
    </ModalDialog>
  );
};
