import { RRoundPaymentsInfo } from '../../../interfaces/remote';
import { I18nService } from '../../i18n';
import {AppOutcome} from "../../../interfaces/app";

export function getOutcomeName(i18n: I18nService, outcome: AppOutcome['selectedOutcome'], winnersCount = 0, noMultiRon = false) {
  switch (outcome) {
    case 'ron': return i18n._t('Ron');
    case 'tsumo': return i18n._t('Tsumo');
    case 'draw': return i18n._t('Exhaustive draw');
    case 'abort': return i18n._t('Abortive draw');
    case 'chombo': return i18n._t('Chombo');
    case 'nagashi': return i18n._t('Nagashi mangan');
    case 'multiron': return noMultiRon
      ? i18n._t('Ron')
      : (winnersCount === 2
          ? i18n._t('Double ron')
          : i18n._t('Triple ron')
      );
  }
}
