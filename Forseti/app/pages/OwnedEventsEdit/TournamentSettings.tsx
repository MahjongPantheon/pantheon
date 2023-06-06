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
import { Checkbox, NumberInput, Radio, Space, Stack } from '@mantine/core';
import { IconClockPlay, IconUserX } from '@tabler/icons-react';
import { FormHandle } from './types';
import { EndingPolicy } from '../../clients/proto/atoms.pb';

type TournamentSettingsProps = {
  form: FormHandle;
  i18n: I18nService;
};

export const TournamentSettings: React.FC<TournamentSettingsProps> = ({ form, i18n }) => {
  return (
    <>
      <NumberInput
        icon={<IconClockPlay size='1rem' />}
        {...form.getInputProps('event.duration')}
        label={i18n._t('Session duration in minutes')}
        description={i18n._t(
          'Timer starting value. After time runs out, session ending policy is applied (see below).'
        )}
        defaultValue={75}
        step={5}
        min={0}
      />
      <Radio.Group
        label={i18n._t('Session ending policy')}
        description={i18n._t('How game sessions should end during the tournament')}
        {...form.getInputProps('ruleset.endingPolicy')}
      >
        <Space h='md' />
        <Stack spacing='xs'>
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
      <Checkbox
        label={i18n._t('Team tournament')}
        {...form.getInputProps('event.isTeam', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Seating is defined in advance')}
        description={i18n._t(
          'You should prepare the tournament script yourself. No automated seating functionality is available when this flag is set.'
        )}
        {...form.getInputProps('event.isPrescripted', { type: 'checkbox' })}
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
