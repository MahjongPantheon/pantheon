import {IAppState} from '#/store/interfaces';
import {Dispatch} from 'redux';

export interface IComponentProps {
  state: IAppState;
  dispatch: Dispatch;
}
