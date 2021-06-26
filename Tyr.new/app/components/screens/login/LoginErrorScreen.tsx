import * as React from "react";
import './page-login-error.css'
import {IComponentProps} from '#/components/IComponentProps';
import {LoginErrorView} from '#/components/screens/login/LoginErrorView';
import {useCallback} from 'react';
import {RESET_REGISTRATION_ERROR} from '#/store/actions/interfaces';

export const LoginErrorScreen: React.FC<IComponentProps> = (props) => {
  const {dispatch} = props;

  const onOkClick = useCallback(() => {
    dispatch({ type: RESET_REGISTRATION_ERROR });
  }, [dispatch])

  return <LoginErrorView onOkClick={onOkClick}/>
}
