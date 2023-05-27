import * as React from 'react';
import {
  IconAdjustments,
  IconFriends,
  IconListCheck,
  IconNetwork,
  IconTournament,
} from '@tabler/icons-react';
import { Tabs } from '@mantine/core';
import { I18nService } from '../../services/i18n';
import { EventType } from '../../clients/proto/atoms.pb';

type TabsProps = {
  i18n: I18nService;
  eventType: EventType;
};

export const TabsList: React.FC<TabsProps> = ({ eventType, i18n }) => {
  return (
    <>
      {eventType === EventType.EVENT_TYPE_LOCAL && (
        <Tabs.Tab value={EventType.EVENT_TYPE_LOCAL} icon={<IconFriends size='0.8rem' />}>
          {i18n._t('Local event settings')}
        </Tabs.Tab>
      )}
      {eventType === EventType.EVENT_TYPE_TOURNAMENT && (
        <Tabs.Tab value={EventType.EVENT_TYPE_TOURNAMENT} icon={<IconTournament size='0.8rem' />}>
          {i18n._t('Tournament settings')}
        </Tabs.Tab>
      )}
      {eventType === EventType.EVENT_TYPE_ONLINE && (
        <Tabs.Tab value={EventType.EVENT_TYPE_ONLINE} icon={<IconNetwork size='0.8rem' />}>
          {i18n._t('Online event settings')}
        </Tabs.Tab>
      )}
      <Tabs.Tab value='ruleset_tuning' icon={<IconAdjustments size='0.8rem' />}>
        {i18n._t('Ruleset details')}
      </Tabs.Tab>
      <Tabs.Tab value='yaku_tuning' icon={<IconListCheck size='0.8rem' />}>
        {i18n._t('Yaku settings')}
      </Tabs.Tab>
    </>
  );
};
