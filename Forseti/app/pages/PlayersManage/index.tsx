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
import { GameConfig, RegisteredPlayer, Event } from '../../clients/proto/atoms.pb';

import { authCtx } from '../../hooks/auth';
import { useApi } from '../../hooks/api';
import { useI18n } from '../../hooks/i18n';
import { ManagementTab } from './ManagementTab';
import { Badge, Container, LoadingOverlay, Tabs } from '@mantine/core';
import {
  IconAlertTriangleFilled,
  IconScript,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-react';
import { LocalIdsTab } from './LocalIdsTab';
import { notifications } from '@mantine/notifications';
import { TeamNamesTab } from './TeamNamesTab';
import { Redirect } from 'wouter';
import { useStorage } from '../../hooks/storage';

export const PlayersManage: React.FC<{ params: { id: string } }> = ({ params: { id } }) => {
  const eventId = parseInt(id, 10);
  const api = useApi();
  const i18n = useI18n();
  const storage = useStorage();
  const { isLoggedIn } = useContext(authCtx);
  const [isLoading, setIsLoading] = useState(true);
  const [localIdsWarn, setLocalIdsWarn] = useState(false);
  const [players, setPlayers] = useState<RegisteredPlayer[]>([]); // user_id -> rule_id; zero means no access rights.
  const [config, setConfig] = useState<GameConfig>();
  const [event, setEvent] = useState<Event>();
  api.setEventId(eventId);
  usePageTitle(i18n._t('Manage players in event'));

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    nprogress.reset();
    nprogress.start();
    setIsLoading(true);

    Promise.all([
      api.getGameConfig(eventId),
      api.getEventsById([eventId]),
      api.getAllPlayers(eventId),
    ])
      .then(([conf, [eventData], playersList]) => {
        setEvent(eventData);
        setConfig(conf);
        setPlayers(playersList.sort((a, b) => a.title.localeCompare(b.title)));
        setLocalIdsWarn(playersList.some((p) => !p.localId));
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

  if (!storage.getPersonId()) {
    return <Redirect to='/profile/login' />;
  }

  return (
    <Container>
      <LoadingOverlay visible={isLoading} overlayOpacity={1} />
      <Tabs defaultValue='management' keepMounted={false}>
        <Tabs.List position='left'>
          <Tabs.Tab
            value='management'
            icon={<IconUserCircle size='0.8rem' />}
            rightSection={
              <Badge sx={{ pointerEvents: 'none' }} variant='filled' size='md' p={4}>
                {players.length}
              </Badge>
            }
          >
            {i18n._t('Players')}
          </Tabs.Tab>
          <Tabs.Tab
            value='prescripted'
            disabled={!config?.isPrescripted}
            title={i18n._t(
              'Setup local identifiers of players to be used in predefined event script'
            )}
            icon={<IconScript size='0.8rem' />}
            rightSection={
              config?.isPrescripted && localIdsWarn ? (
                <IconAlertTriangleFilled size='1.2rem' style={{ color: 'red' }} />
              ) : null
            }
          >
            {i18n._t('Local IDs')}
          </Tabs.Tab>
          <Tabs.Tab
            disabled={!config?.isTeam}
            title={i18n._t('Setup team name for each player (for team events)')}
            value='teams'
            icon={<IconUsers size='0.8rem' />}
          >
            {i18n._t('Team names')}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='management' pt='xs'>
          <ManagementTab
            players={players}
            setPlayers={setPlayers}
            eventId={eventId}
            config={config}
            event={event}
          />
        </Tabs.Panel>

        <Tabs.Panel value='prescripted' pt='xs'>
          <LocalIdsTab players={players} eventId={eventId} />
        </Tabs.Panel>

        <Tabs.Panel value='teams' pt='xs'>
          <TeamNamesTab players={players} eventId={eventId} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};
