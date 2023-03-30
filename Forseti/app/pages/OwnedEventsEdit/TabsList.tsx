import * as React from 'react';
import { I18nService } from '#/services/i18n';
import {
  IconAdjustments,
  IconFriends,
  IconListCheck,
  IconNetwork,
  IconTool,
  IconTournament,
} from '@tabler/icons-react';
import { Tabs } from '@mantine/core';

type TabsProps = {
  i18n: I18nService;
  eventType: 'local' | 'tournament' | 'online';
};

export const TabsList: React.FC<TabsProps> = ({ eventType, i18n }) => {
  return (
    <>
      <Tabs.Tab value='basic' icon={<IconTool size='0.8rem' />}>
        {i18n._t('Basic settings')}
      </Tabs.Tab>
      {eventType === 'local' && (
        <Tabs.Tab value='local' icon={<IconFriends size='0.8rem' />}>
          {i18n._t('Local event settings')}
        </Tabs.Tab>
      )}
      {eventType === 'tournament' && (
        <Tabs.Tab value='tournament' icon={<IconTournament size='0.8rem' />}>
          {i18n._t('Tournament settings')}
        </Tabs.Tab>
      )}
      {eventType === 'online' && (
        <Tabs.Tab value='online' icon={<IconNetwork size='0.8rem' />}>
          {i18n._t('Online event settings')}
        </Tabs.Tab>
      )}
      <Tabs.Tab value='ruleset_tuning' icon={<IconAdjustments size='0.8rem' />}>
        {i18n._t('Ruleset tuning')}
      </Tabs.Tab>

      <Tabs.Tab value='yaku_tuning' icon={<IconListCheck size='0.8rem' />}>
        {i18n._t('Yaku settings')}
      </Tabs.Tab>
    </>
  );
};
