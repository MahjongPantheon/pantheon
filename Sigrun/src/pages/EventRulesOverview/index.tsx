import * as React from 'react';
import { Alert, Container, Divider, Space, Stack, Tabs } from '@mantine/core';
import { useApi } from '../../hooks/api';
import { useI18n } from '../../hooks/i18n';
import { EventType } from '../../clients/proto/atoms.pb';
import { useEvent } from '../../hooks/useEvent';
import { useIsomorphicState } from '../../hooks/useIsomorphicState';
import { TabsList } from './TabsList';
import { OnlineSettings } from './OnlineSettings';
import { LocalSettings } from './LocalSettings';
import { TournamentSettings } from './TournamentSettings';
import { RulesetSettings } from './RulesetSettings';
import { YakuSettings } from './YakuSettings';
import { Helmet } from 'react-helmet';
import { EventTypeIcon } from '../../components/EventTypeIcon';

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
        <Helmet>
          <title>
            {events?.[0].title} - {i18n._t('Rules overview')} - Sigrun
          </title>
        </Helmet>
        <h2 style={{ display: 'flex', gap: '20px' }}>
          {events?.[0] && <EventTypeIcon event={events[0]} />}
          {events?.[0]?.title} - {i18n._t('Rules overview')}
        </h2>
        <Divider size='xs' />
        <Space h='md' />
        <Tabs defaultValue={event.type ?? EventType.EVENT_TYPE_LOCAL}>
          <Tabs.List position='left'>
            <TabsList i18n={i18n} eventType={event.type} />
          </Tabs.List>
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
          <Tabs.Panel value='ruleset_tuning' pt='xs'>
            <RulesetSettings config={ruleset} i18n={i18n} />
          </Tabs.Panel>
          <Tabs.Panel value='yaku_tuning' pt='xs'>
            <YakuSettings config={ruleset} i18n={i18n} />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </>
  );
};
