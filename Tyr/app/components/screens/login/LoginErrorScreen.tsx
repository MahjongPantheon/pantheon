import * as React from 'react';
import './page-login-error.css';
import { IComponentProps } from '#/components/IComponentProps';
import { LoginErrorView } from '#/components/screens/login/LoginErrorView';
import { useCallback } from 'react';
import { RESET_LOGIN_ERROR } from '#/store/actions/interfaces';
import { environment } from '#config';

export const LoginErrorScreen: React.FC<IComponentProps> = (props) => {
  const { dispatch } = props;

  const onOkClick = useCallback(() => {
    dispatch({ type: RESET_LOGIN_ERROR });
  }, [dispatch]);

  return (
    <LoginErrorView onOkClick={onOkClick} recoveryLink={environment.guiUrl + 'passwordRecovery'} />
  );
};
