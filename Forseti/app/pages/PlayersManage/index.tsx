import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { usePageTitle } from '#/hooks/pageTitle';
import { nprogress } from '@mantine/nprogress';
import { GameConfig, RegisteredPlayer, Event } from '#/clients/atoms.pb';

import { authCtx } from '#/hooks/auth';
import { useApi } from '#/hooks/api';
import { useI18n } from '#/hooks/i18n';
import { ManagementTab } from '#/pages/PlayersManage/ManagementTab';
import { Badge, Tabs } from '@mantine/core';
import {
  IconAlertTriangleFilled,
  IconScript,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-react';
import { LocalIdsTab } from '#/pages/PlayersManage/LocalIdsTab';
import { notifications } from '@mantine/notifications';
import { TeamNamesTab } from '#/pages/PlayersManage/TeamNamesTab';

export const PlayersManage: React.FC<{ params: { id: string } }> = ({ params: { id } }) => {
  const eventId = parseInt(id, 10);
  const api = useApi();
  const i18n = useI18n();
  const { isLoggedIn } = useContext(authCtx);
  const [isLoading, setIsLoading] = useState(true);
  const [localIdsWarn, setLocalIdsWarn] = useState(false);
  const [players, setPlayers] = useState<RegisteredPlayer[]>([]); // user_id -> rule_id; zero means no access rights.
  const [eventAdmins, setEventAdmins] = useState<Record<number, number>>({});
  const [config, setConfig] = useState<GameConfig>();
  const [event, setEvent] = useState<Event>();
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
      api.getEventAdmins(eventId),
    ])
      .then(([conf, [eventData], playersList, admins]) => {
        setEvent(eventData);
        setConfig(conf);
        setPlayers(playersList);
        setLocalIdsWarn(playersList.some((p) => !p.localId));
        setEventAdmins(
          admins.reduce((acc, row) => {
            acc[row.personId] = row.ruleId;
            return acc;
          }, {} as Record<number, number>)
        );
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

  return isLoading ? null : (
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
          eventAdmins={eventAdmins}
          setEventAdmins={setEventAdmins}
          eventId={eventId}
          config={config!}
          event={event!}
        />
      </Tabs.Panel>

      <Tabs.Panel value='prescripted' pt='xs'>
        <LocalIdsTab players={players} eventId={eventId} />
      </Tabs.Panel>

      <Tabs.Panel value='teams' pt='xs'>
        <TeamNamesTab players={players} eventId={eventId} />
      </Tabs.Panel>
    </Tabs>
  );
};
