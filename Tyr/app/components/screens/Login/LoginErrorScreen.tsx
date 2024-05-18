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
import { useCallback } from 'react';
import { RESET_LOGIN_ERROR } from '../../../store/actions/interfaces';
import { env } from '../../../helpers/env';
import { LoginError } from '../../pages/Login/LoginError';

export const LoginErrorScreen = (props: IComponentProps) => {
  const { dispatch } = props;

  const onOkClick = useCallback(() => {
    dispatch({ type: RESET_LOGIN_ERROR });
  }, [dispatch]);

  return (
    <LoginError onOkClick={onOkClick} recoveryLink={`${env.urls.forseti}/profile/resetPassword`} />
  );
};
