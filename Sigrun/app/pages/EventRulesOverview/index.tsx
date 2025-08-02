/*  Sigrun: rating tables and statistics frontend
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
import { Alert, Container, Divider, Space, Stack, Tabs } from '@mantine/core';
import { useApi } from '../../hooks/api';
import { useI18n } from '../../hooks/i18n';
import { EventType } from 'tsclients/proto/atoms.pb';
import { useEvent } from '../../hooks/useEvent';
import { useIsomorphicState } from '../../hooks/useIsomorphicState';
import { TabsList } from './TabsList';
import { OnlineSettings } from './OnlineSettings';
import { LocalSettings } from './LocalSettings';
import { TournamentSettings } from './TournamentSettings';
import { RulesetSettings } from './RulesetSettings';
import { YakuSettings } from './YakuSettings';
import { EventTypeIcon } from '../../components/EventTypeIcon';
import { Meta } from '../../components/Meta';

export const EventRulesOverview: React.FC<{ params: { eventId: string } }> = ({
  params: { eventId },
}) => {
  const api = useApi();
  const i18n = useI18n();
  const events = useEvent(eventId);
  const [ruleset] = useIsomorphicState(
    null,
    'RulesOverview_' + eventId,
    () => api.getGameConfig(parseInt(eventId, 10)),
    [eventId]
  );

  if (!events || !ruleset) {
    return null;
  }

  if ((events?.length ?? 0) > 1) {
    return (
      <Container>
        <Alert color='red'>
          {i18n._t('Ruleset details page is not available for aggregated events')}
        </Alert>
      </Container>
    );
  }

  const event = events[0];
  return (
    <>
      <Container>
        <Meta
          title={`${events?.[0].title} - ${i18n._t('Rules overview')} - Sigrun`}
          description={i18n._t('Rules overview for the event "%1" provided by Mahjong Pantheon', [
            events?.[0].title,
          ])}
        />
        <h2 style={{ display: 'flex', gap: '20px' }}>
          {events?.[0] && <EventTypeIcon event={events[0]} />}
          {events?.[0]?.title} - {i18n._t('Rules overview')}
        </h2>
        <Divider size='xs' />
        <Space h='md' />
        <Tabs defaultValue='ruleset_tuning'>
          <Tabs.List justify='flex-start'>
            <TabsList i18n={i18n} eventType={event.type} />
          </Tabs.List>
          <Tabs.Panel value='ruleset_tuning' pt='xs'>
            <RulesetSettings config={ruleset} i18n={i18n} />
          </Tabs.Panel>
          <Tabs.Panel value={event.type ?? EventType.EVENT_TYPE_LOCAL} pt='xs'>
            <Stack>
              {event.type === EventType.EVENT_TYPE_ONLINE && (
                <OnlineSettings config={ruleset} i18n={i18n} />
              )}
              {event.type === EventType.EVENT_TYPE_LOCAL && (
                <LocalSettings config={ruleset} i18n={i18n} />
              )}
              {event.type === EventType.EVENT_TYPE_TOURNAMENT && (
                <TournamentSettings config={ruleset} i18n={i18n} />
              )}
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value='yaku_tuning' pt='xs'>
            <YakuSettings config={ruleset} i18n={i18n} />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </>
  );
};
