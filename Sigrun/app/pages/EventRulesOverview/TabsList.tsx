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
import {
  IconAdjustments,
  IconFriends,
  IconListCheck,
  IconNetwork,
  IconTournament,
} from '@tabler/icons-react';
import { Tabs } from '@mantine/core';
import { I18nService } from '../../services/i18n';
import { EventType } from 'tsclients/proto/atoms.pb';

type TabsProps = {
  i18n: I18nService;
  eventType: EventType;
};

export const TabsList: React.FC<TabsProps> = ({ eventType, i18n }) => {
  return (
    <>
      <Tabs.Tab value='ruleset_tuning' leftSection={<IconAdjustments size='0.8rem' />}>
        {i18n._t('Ruleset details')}
      </Tabs.Tab>
      {eventType === EventType.EVENT_TYPE_LOCAL && (
        <Tabs.Tab value={EventType.EVENT_TYPE_LOCAL} leftSection={<IconFriends size='0.8rem' />}>
          {i18n._t('Local event settings')}
        </Tabs.Tab>
      )}
      {eventType === EventType.EVENT_TYPE_TOURNAMENT && (
        <Tabs.Tab
          value={EventType.EVENT_TYPE_TOURNAMENT}
          leftSection={<IconTournament size='0.8rem' />}
        >
          {i18n._t('Tournament settings')}
        </Tabs.Tab>
      )}
      {eventType === EventType.EVENT_TYPE_ONLINE && (
        <Tabs.Tab value={EventType.EVENT_TYPE_ONLINE} leftSection={<IconNetwork size='0.8rem' />}>
          {i18n._t('Online event settings')}
        </Tabs.Tab>
      )}
      <Tabs.Tab value='yaku_tuning' leftSection={<IconListCheck size='0.8rem' />}>
        {i18n._t('Yaku settings')}
      </Tabs.Tab>
    </>
  );
};
