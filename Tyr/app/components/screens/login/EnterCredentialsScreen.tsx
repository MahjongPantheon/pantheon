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

import * as React from 'react';
import './page-enter-credentials.css';
import { IComponentProps } from '../../IComponentProps';
import { EnterCredentialsView } from './EnterCredentialsView';
import { LOGIN_INIT } from '../../../store/actions/interfaces';
import { useCallback } from 'react';

export const EnterCredentialsScreen: React.FC<IComponentProps> = (props) => {
  const { dispatch } = props;

  const onSubmit = useCallback(
    (email: string, password: string) => {
      if (email.length > 0 && password.length > 0) {
        dispatch({ type: LOGIN_INIT, payload: { email: email.toLowerCase(), password } });
      }
    },
    [dispatch]
  );

  return (
    <EnterCredentialsView
      onSubmit={onSubmit}
      signupLink={`${import.meta.env.VITE_FORSETI_URL}/profile/signup`}
      recoveryLink={`${import.meta.env.VITE_FORSETI_URL}/profile/resetPassword`}
    />
  );
};
