import * as React from "react";
import './page-enter-pin.css'
import {IComponentProps} from '#/components/IComponentProps';
import {EnterPinScreenView} from '#/components/screens/login/EnterPinScreenView';
import {CONFIRM_REGISTRATION_INIT} from '#/store/actions/interfaces';
import {useCallback} from 'react';

export const EnterPinScreen: React.FC<IComponentProps> = (props) => {
  const {dispatch} = props;

  const onSubmit = useCallback((pin: string) => {
    if (pin.length > 0) {
      dispatch({ type: CONFIRM_REGISTRATION_INIT, payload: pin });
    }
  }, [dispatch]);

  return <EnterPinScreenView onSubmit={onSubmit} />
}
