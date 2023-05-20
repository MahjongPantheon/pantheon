import { Anchor, Button, Group, MantineSize, rem } from '@mantine/core';
import { IconChartBar, IconOlympics } from '@tabler/icons-react';
import * as React from 'react';
import { useLocation } from 'wouter';
import { useI18n } from '../hooks/i18n';

export const EventTopNavigation = ({ eventId, size }: { eventId: string; size?: MantineSize }) => {
  size = size ?? 'md';
  const [, navigate] = useLocation();
  const i18n = useI18n();
  return (
    <Group style={{ flex: 1 }}>
      <Anchor
        href={`/event/${eventId}/games`}
        onClick={(e) => {
          navigate(`/event/${eventId}/games`);
          e.preventDefault();
        }}
      >
        <Button
          leftIcon={<IconOlympics size={rem(20)} />}
          size={size}
          variant='light'
          color='grape'
        >
          {i18n._t('Last games')}
        </Button>
      </Anchor>
      <Anchor
        href={`/event/${eventId}/order/rating`}
        onClick={(e) => {
          navigate(`/event/${eventId}/order/rating`);
          e.preventDefault();
        }}
      >
        <Button
          leftIcon={<IconChartBar size={rem(20)} />}
          size={size}
          variant='light'
          color='orange'
        >
          {i18n._t('Rating table')}
        </Button>
      </Anchor>
    </Group>
  );
};
