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
import { Checkbox, NumberInput, Text, TextInput } from '@mantine/core';
import {
  IconChartHistogram,
  IconCoins,
  IconHourglass,
  IconNumbers,
  IconUsers,
  IconUserX,
} from '@tabler/icons-react';
import { Event, GameConfig, PlatformType } from 'tsclients/proto/atoms.pb';
import { I18nService } from '../../services/i18n';

type OnlineSettingsProps = {
  config: GameConfig;
  event: Event;
  i18n: I18nService;
};

export const OnlineSettings: React.FC<OnlineSettingsProps> = ({ config, event, i18n }) => {
  return (
    <>
      <Text>
        {i18n._t(
          'Please note: you should set up the rating accordingly to tournament settings in game platform, otherwise expect errors on replay submit!'
        )}
      </Text>
      <TextInput
        readOnly
        label={i18n._t('Event platform')}
        description={i18n._t('External gaming platform for the tournament')}
        value={
          event.platformId === PlatformType.PLATFORM_TYPE_TENHOUNET
            ? 'Tenhou.net'
            : event.platformId === PlatformType.PLATFORM_TYPE_MAHJONGSOUL
              ? 'MahjongSoul'
              : i18n._t('Not selected')
        }
      />
      <Checkbox readOnly label={i18n._t('Team tournament')} checked={config.isTeam} />
      <Checkbox
        readOnly
        label={i18n._t('Allow adding of replays manually')}
        description={i18n._t(
          'If checked, any player participating in event will be able to add new replays through user interface. Disable this if you have any external tool which adds replays automatically.'
        )}
        checked={event.allowManualAddReplay}
      />
      <TextInput
        leftSection={<IconUsers size='1rem' />}
        label={i18n._t('Lobby ID')}
        value={config.lobbyId}
        readOnly
      />
      <NumberInput
        readOnly
        hideControls
        leftSection={<IconHourglass size='1rem' />}
        label={i18n._t('Game expiration time (in hours)')}
        description={i18n._t(
          'Interval of time when played online game is still considered valid and can be added to the rating. Set to 0 to disable expiration.'
        )}
        value={config.rulesetConfig.gameExpirationTime}
      />
      <NumberInput
        readOnly
        hideControls
        leftSection={<IconCoins size='1rem' />}
        label={i18n._t('Chips value')}
        description={i18n._t(
          'Amount of points given for each chip. Chips should be set up in tournament settings in Tenhou.net. Set to 0 to disable chips.'
        )}
        value={config.rulesetConfig.chipsValue}
      />
      <NumberInput
        readOnly
        hideControls
        leftSection={<IconChartHistogram size='1rem' />}
        label={i18n._t('Series length')}
        description={i18n._t(
          'Count of session in game series. Set to 0 to disable series functionality.'
        )}
        value={config.seriesLength}
      />
      <NumberInput
        readOnly
        hideControls
        leftSection={<IconNumbers size='1rem' />}
        label={i18n._t('Minimal games count')}
        description={i18n._t(
          'Minimal count of games the player should play to get into the rating table.'
        )}
        value={config.minGamesCount}
      />
      <NumberInput
        readOnly
        hideControls
        leftSection={<IconUserX size='1rem' />}
        label={i18n._t('Fixed score applied to replacement player')}
        description={i18n._t(
          'Fixed amount of result score applied for each replacement player regardless of session results.'
        )}
        value={config.rulesetConfig.replacementPlayerFixedPoints}
      />
      <NumberInput
        readOnly
        hideControls
        leftSection={<IconUserX size='1rem' />}
        label={i18n._t('Fixed uma for replacement player')}
        description={i18n._t(
          'Fixed amount of rank penalty applied for each replacement player regardless of session results.'
        )}
        value={config.rulesetConfig.replacementPlayerOverrideUma}
      />
    </>
  );
};
