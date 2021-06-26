import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {EnterPinScreen} from '#/components/screens/login/EnterPinScreen';
import {Preloader} from '#/components/general/preloader/Preloader';
import {LoginErrorScreen} from '#/components/screens/login/LoginErrorScreen';

export const LoginScreen: React.FC<IComponentProps> = (props) => {
  const {state} = props;

  if (state.loading.login) {
    return <Preloader />
  }

  if (state.loginError) {
    return <LoginErrorScreen {...props} />
  }

  return <EnterPinScreen {...props} />
}
