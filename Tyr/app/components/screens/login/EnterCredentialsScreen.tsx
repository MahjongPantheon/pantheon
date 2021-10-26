import * as React from "react";
import './page-enter-credentials.css'
import {IComponentProps} from '#/components/IComponentProps';
import {EnterCredentialsView} from '#/components/screens/login/EnterCredentialsView';
import {LOGIN_INIT} from '#/store/actions/interfaces';
import {useCallback} from 'react';
import {environment} from "#config";

export const EnterCredentialsScreen: React.FC<IComponentProps> = (props) => {
  const {dispatch} = props;

  const onSubmit = useCallback((email: string, password: string) => {
    if (email.length > 0 && password.length > 0) {
      dispatch({ type: LOGIN_INIT, payload: { email, password } });
    }
  }, [dispatch]);

  return <EnterCredentialsView onSubmit={onSubmit} signupLink={environment.guiUrl + 'signup'} />
}
