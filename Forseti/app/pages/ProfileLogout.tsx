/*  Forseti: personal area & event control panel
 *  Copyright (C) 2023  o.klimenko aka ctizen
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
import { usePageTitle } from '../hooks/pageTitle';
import { Redirect } from 'wouter';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { useStorage } from '../hooks/storage';
import { authCtx } from '../hooks/auth';
import { useContext } from 'react';

export const ProfileLogout: React.FC = () => {
  const api = useApi();
  const storage = useStorage();
  const { setIsLoggedIn } = useContext(authCtx);
  const i18n = useI18n();
  usePageTitle(i18n._t('Logout'));
  storage.deleteAuthToken().deletePersonId().deleteEventId();
  api.setCredentials(0, '');
  api.setEventId(0);
  setIsLoggedIn(false);
  return <Redirect to='/' />;
};
