import {IAppState} from '#/store/interfaces';
import {Dispatch} from 'redux';
import {I18nService} from '#/services/i18n';

export interface IComponentProps {
  state: IAppState;
  dispatch: Dispatch;
}
