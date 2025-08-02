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
import { useContext, useEffect, useState } from 'react';
import { usePageTitle } from '../../hooks/pageTitle';
import { nprogress } from '@mantine/nprogress';

import { authCtx, PrivilegesLevel } from '../../hooks/auth';
import { useApi } from '../../hooks/api';
import { useI18n } from '../../hooks/i18n';
import { ManagementTab } from './ManagementTab';
import { Container, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Redirect } from 'wouter';
import { useStorage } from '../../hooks/storage';
import { EventAdmin, EventReferee } from 'tsclients/proto/atoms.pb';

export const PrivilegesManage: React.FC<{ params: { id: string } }> = ({ params: { id } }) => {
  const eventId = parseInt(id, 10);
  const api = useApi();
  const i18n = useI18n();
  const storage = useStorage();
  const { isLoggedIn, privilegesLevel } = useContext(authCtx);
  const [isLoading, setIsLoading] = useState(true);
  const [eventAdmins, setEventAdmins] = useState<EventAdmin[]>([]);
  const [eventReferees, setEventReferees] = useState<EventReferee[]>([]);
  api.setEventId(eventId);
  usePageTitle(i18n._t('Manage privileges in event'));

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    nprogress.reset();
    nprogress.start();
    setIsLoading(true);

    Promise.all([api.getEventAdmins(eventId), api.getEventReferees(eventId)])
      .then(([admins, referees]) => {
        setEventAdmins(admins);
        setEventReferees(referees);
      })
      .catch((err: Error) => {
        notifications.show({
          title: i18n._t('Error has occurred'),
          message: err.message,
          color: 'red',
        });
      })
      .finally(() => {
        setIsLoading(false);
        nprogress.complete();
      });
  }, [isLoggedIn]);

  if (!isLoading && !storage.getPersonId()) {
    return <Redirect to='/profile/login' />;
  }

  if (!isLoading && privilegesLevel < PrivilegesLevel.ADMIN) {
    return <Redirect to='/profile/manage' />;
  }

  return (
    !isLoading && (
      <Container>
        <LoadingOverlay visible={isLoading} overlayOpacity={1} />
        <ManagementTab
          eventAdmins={eventAdmins}
          setEventAdmins={setEventAdmins}
          eventReferees={eventReferees}
          setEventReferees={setEventReferees}
          eventId={eventId}
        />
      </Container>
    )
  );
};
