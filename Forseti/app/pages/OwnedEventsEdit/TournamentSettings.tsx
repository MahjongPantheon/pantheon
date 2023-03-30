import { I18nService } from '#/services/i18n';
import * as React from 'react';
import { Checkbox, NumberInput, Radio, Space, Stack } from '@mantine/core';
import { IconClockPlay, IconUserX } from '@tabler/icons-react';
import { FormHandle } from '#/pages/OwnedEventsEdit/types';

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
          <Radio value='none' label={i18n._t('Do not interrupt session until it ends')} />
          <Radio
            value='endAfterHand'
            label={i18n._t('When time is out, finish current hand and interrupt the session')}
          />
          <Radio
            value='oneMoreHand'
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
