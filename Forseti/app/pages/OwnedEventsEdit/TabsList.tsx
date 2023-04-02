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
import { FormHandle } from '#/pages/OwnedEventsEdit/types';

type TabsProps = {
  i18n: I18nService;
  form: FormHandle;
};

export const TabsList: React.FC<TabsProps> = ({ form, i18n }) => {
  return (
    <>
      <Tabs.Tab value='basic' icon={<IconTool size='0.8rem' />}>
        {i18n._t('Basic settings')}
      </Tabs.Tab>
      {form.getTransformedValues().event.type === 'LOCAL' && (
        <Tabs.Tab value='LOCAL' icon={<IconFriends size='0.8rem' />}>
          {i18n._t('Local event settings')}
        </Tabs.Tab>
      )}
      {form.getTransformedValues().event.type === 'TOURNAMENT' && (
        <Tabs.Tab value='TOURNAMENT' icon={<IconTournament size='0.8rem' />}>
          {i18n._t('Tournament settings')}
        </Tabs.Tab>
      )}
      {form.getTransformedValues().event.type === 'ONLINE' && (
        <Tabs.Tab value='ONLINE' icon={<IconNetwork size='0.8rem' />}>
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
