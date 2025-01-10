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
import { Checkbox, NumberInput, Radio, Space, Stack } from '@mantine/core';
import { IconClockPlay, IconUserX } from '@tabler/icons-react';
import { EndingPolicy, GameConfig } from '../../clients/proto/atoms.pb';
import { I18nService } from '../../services/i18n';

type TournamentSettingsProps = {
  config: GameConfig;
  i18n: I18nService;
};

export const TournamentSettings: React.FC<TournamentSettingsProps> = ({ config, i18n }) => {
  return (
    <>
      <NumberInput
        hideControls
        leftSection={<IconClockPlay size='1rem' />}
        label={i18n._t('Session duration in minutes')}
        description={i18n._t(
          'Timer starting value. After time runs out, session ending policy is applied (see below).'
        )}
        value={config.gameDuration}
        onChange={() => {}}
      />
      <Radio.Group
        label={i18n._t('Session ending policy')}
        description={i18n._t('How game sessions should end during the tournament')}
        value={config.rulesetConfig.endingPolicy}
        onChange={() => {}}
      >
        <Space h='md' />
        <Stack gap='xs'>
          <Radio
            value={EndingPolicy.ENDING_POLICY_EP_UNSPECIFIED}
            label={i18n._t('Do not interrupt session until it ends')}
          />
          <Radio
            value={EndingPolicy.ENDING_POLICY_EP_END_AFTER_HAND}
            label={i18n._t('When time is out, finish current hand and interrupt the session')}
          />
          <Radio
            value={EndingPolicy.ENDING_POLICY_EP_ONE_MORE_HAND}
            label={i18n._t(
              'When time is out, finish current hand, play one more, and then interrup the session'
            )}
          />
        </Stack>
        <Space h='md' />
      </Radio.Group>
      <Checkbox label={i18n._t('Team tournament')} checked={config.isTeam} onChange={() => {}} />
      <Checkbox
        label={i18n._t('Seating is defined in advance')}
        description={i18n._t(
          'You should prepare the tournament script yourself. No automated seating functionality is available when this flag is set.'
        )}
        checked={config.isPrescripted}
        onChange={() => {}}
      />
      <NumberInput
        hideControls
        leftSection={<IconUserX size='1rem' />}
        label={i18n._t('Fixed score applied to replacement player')}
        description={i18n._t(
          'Fixed amount of result score applied for each replacement player regardless of session results.'
        )}
        value={config.rulesetConfig.replacementPlayerFixedPoints}
        onChange={() => {}}
      />
      <NumberInput
        hideControls
        leftSection={<IconUserX size='1rem' />}
        label={i18n._t('Fixed uma for replacement player')}
        description={i18n._t(
          'Fixed amount of rank penalty applied for each replacement player regardless of session results.'
        )}
        value={config.rulesetConfig.replacementPlayerOverrideUma}
        onChange={() => {}}
      />
    </>
  );
};
