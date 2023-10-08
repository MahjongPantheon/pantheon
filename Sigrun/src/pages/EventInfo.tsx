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
import { Anchor, Container, Divider, Group, Space, Text } from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { useRemarkSync } from 'react-remark';
import { useEvent } from '../hooks/useEvent';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { useLocation } from 'wouter';
import { Fragment } from 'react';
import { Meta } from '../components/Meta';
import { Helmet } from 'react-helmet-async';

export const EventInfo: React.FC<{ params: { eventId: string } }> = ({ params: { eventId } }) => {
  const events = useEvent(eventId);
  const api = useApi();
  const i18n = useI18n();
  const [, navigate] = useLocation();
  const [admins] = useIsomorphicState(
    [],
    'EventInfo_admins_' + eventId,
    () => api.getEventAdmins(parseInt(eventId, 10)),
    [eventId]
  );
  if (!events) {
    return null;
  }

  return (
    <Container>
      <Meta
        title={
          events?.length === 1
            ? `${events?.[0].title} - Sigrun`
            : (events?.length ?? 0) > 1
            ? `${i18n._t('Aggregated event')} - Sigrun`
            : `Sigrun`
        }
        description={i18n._t('Description of the event "%1" provided by Mahjong Pantheon', [
          events?.[0].title,
        ])}
      />
      <Helmet>{}</Helmet>
      {events?.map((event, eid) => {
        return (
          <Fragment key={`ev_${eid}`}>
            <h2 style={{ display: 'flex', gap: '20px' }}>
              {event && <EventTypeIcon event={event} />}
              {event?.title}
            </h2>
            <Divider size='xs' />
            <Space h='md' />
            {useRemarkSync(event?.description)}
            <Space h='md' />
            <Divider size='xs' />
            <Space h='md' />
          </Fragment>
        );
      })}
      {events?.length === 1 && (
        <Group style={{ fontSize: 'small' }}>
          <Text c='dimmed'>{i18n._t('Event administrators: ')}</Text>
          {admins?.map((admin, idx) => (
            <Group key={`adm_${idx}`}>
              <PlayerAvatar
                size='xs'
                p={{
                  title: admin.personName,
                  id: admin.personId,
                  hasAvatar: admin.hasAvatar,
                  lastUpdate: admin.lastUpdate,
                }}
              />
              <Anchor
                href={`/event/${eventId}/player/${admin.personId}`}
                onClick={(e) => {
                  navigate(`/event/${eventId}/player/${admin.personId}`);
                  e.preventDefault();
                }}
              >
                {admin.personName}
              </Anchor>
            </Group>
          ))}
        </Group>
      )}
    </Container>
  );
};
