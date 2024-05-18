/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { IComponentProps } from '../../IComponentProps';
import { LOGIN_INIT } from '../../../store/actions/interfaces';
import { useCallback } from 'react';
import { env } from '../../../helpers/env';
import { Login } from '../../pages/Login/Login';

export const EnterCredentialsScreen = (props: IComponentProps) => {
  const { dispatch, state } = props;

  const onSubmit = useCallback(
    (email: string, password: string) => {
      if (email.length > 0 && password.length > 0) {
        dispatch({
          type: LOGIN_INIT,
          payload: { email: email.toLowerCase(), password, sessionId: state.analyticsSession },
        });
      }
    },
    [dispatch]
  );

  return (
    <Login
      onSubmit={onSubmit}
      onSignupClick={() => window.open(`${env.urls.forseti}/profile/signup`)}
      onRecoveryClick={() => window.open(`${env.urls.forseti}/profile/resetPassword`)}
    />
  );
};
