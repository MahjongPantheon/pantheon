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

import { I18nService } from '../../services/i18n';
import * as React from 'react';
import { Checkbox, NumberInput, Select, Text, TextInput } from '@mantine/core';
import {
  IconChartHistogram,
  IconCoins,
  IconHourglass,
  IconAffiliateFilled,
  IconNumbers,
  IconUsers,
  IconUserX,
} from '@tabler/icons-react';
import { FormHandle } from './types';
import { authCtx, PrivilegesLevel } from '../../hooks/auth';
import { useContext } from 'react';
import { PlatformType } from 'tsclients/proto/atoms.pb';

type OnlineSettingsProps = {
  form: FormHandle;
  i18n: I18nService;
};

export const OnlineSettings: React.FC<OnlineSettingsProps> = ({ form, i18n }) => {
  const { privilegesLevel } = useContext(authCtx);
  return (
    <>
      <Text>
        {i18n._t(
          'Please note: you should set up the rating accordingly to tournament settings in game platform, otherwise expect errors on replay submit!'
        )}
      </Text>
      {privilegesLevel === PrivilegesLevel.SUPERADMIN && (
        <Select
          icon={<IconAffiliateFilled size='1rem' />}
          label={i18n._t('Event platform')}
          description={i18n._t('External gaming platform for the tournament')}
          data={[
            {
              value: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
              label: i18n._t('Not selected'),
            },
            {
              value: PlatformType.PLATFORM_TYPE_TENHOUNET,
              label: 'Tenhou.net',
            },
            {
              value: PlatformType.PLATFORM_TYPE_MAHJONGSOUL,
              label: 'MahjongSoul',
            },
          ]}
          {...form.getInputProps('event.platformId')}
        />
      )}
      <TextInput
        withAsterisk
        icon={<IconUsers size='1rem' />}
        label={i18n._t('Lobby ID')}
        {...form.getInputProps('event.lobbyId')}
      />
      <Checkbox
        label={i18n._t('Team tournament')}
        {...form.getInputProps('event.isTeam', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Allow adding of replays manually')}
        description={i18n._t(
          'If checked, any player participating in event will be able to add new replays through user interface. Disable this if you have any external tool which adds replays automatically.'
        )}
        {...form.getInputProps('event.allowManualAddReplay', { type: 'checkbox' })}
      />
      <NumberInput
        {...form.getInputProps('ruleset.gameExpirationTime')}
        icon={<IconHourglass size='1rem' />}
        label={i18n._t('Game expiration time (in hours)')}
        description={i18n._t(
          'Interval of time when played online game is still considered valid and can be added to the rating. Set to 0 to disable expiration.'
        )}
        defaultValue={24}
        min={0}
      />
      <NumberInput
        {...form.getInputProps('ruleset.chipsValue')}
        icon={<IconCoins size='1rem' />}
        label={i18n._t('Chips value')}
        description={i18n._t(
          'Amount of points given for each chip. Chips should be set up in tournament settings in Tenhou.net. Set to 0 to disable chips.'
        )}
        defaultValue={2000}
        step={100}
        min={0}
      />
      <NumberInput
        {...form.getInputProps('event.seriesLength')}
        icon={<IconChartHistogram size='1rem' />}
        label={i18n._t('Series length')}
        description={i18n._t(
          'Count of session in game series. Set to 0 to disable series functionality.'
        )}
        defaultValue={0}
        step={5}
        min={0}
      />
      <NumberInput
        {...form.getInputProps('event.minGames')}
        icon={<IconNumbers size='1rem' />}
        label={i18n._t('Minimal games count')}
        description={i18n._t(
          'Minimal count of games the player should play to get into the rating table.'
        )}
        defaultValue={0}
        step={5}
        min={0}
      />
      <NumberInput
        icon={<IconUserX size='1rem' />}
        {...form.getInputProps('ruleset.replacementPlayerFixedPoints')}
        label={i18n._t('Fixed score applied to replacement player')}
        description={i18n._t(
          'Fixed amount of result score applied for each replacement player regardless of session results.'
        )}
        defaultValue={-15000}
        max={0}
      />
      <NumberInput
        icon={<IconUserX size='1rem' />}
        {...form.getInputProps('ruleset.replacementPlayerOverrideUma')}
        label={i18n._t('Fixed uma for replacement player')}
        description={i18n._t(
          'Fixed amount of rank penalty applied for each replacement player regardless of session results.'
        )}
        defaultValue={-15000}
        max={0}
      />
    </>
  );
};
