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

import * as React from 'react';
import { NumberInput } from '../../components/NumberInput';
import { createRef, useState } from 'react';
import { useApi } from '../../hooks/api';
import { useI18n } from '../../hooks/i18n';
import { useForm } from '@mantine/form';
import { Text, Button, Select, Space, TextInput, Group } from '@mantine/core';
import {
  IconAlertOctagon,
  IconCircleCheck,
  IconDeviceFloppy,
  IconSignature,
  IconUserExclamation,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Redirect } from 'wouter';
import { useStorage } from '../../hooks/storage';
import { GameConfig } from 'tsclients/proto/atoms.pb';
import { CommonReasons } from './CommonReasons';

type PenaltyFormProps = {
  playersList: Array<{ value: string; label: string }>;
  eventConfig: null | GameConfig;
  eventId?: string;
  onSuccess: () => void;
};

export const PenaltyForm: React.FC<PenaltyFormProps> = ({
  playersList,
  eventConfig,
  eventId,
  onSuccess,
}) => {
  const api = useApi();
  const i18n = useI18n();
  const storage = useStorage();
  const formRef: React.RefObject<HTMLFormElement | null> = createRef();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm({
    initialValues: {
      player: null as string | null,
      amount: 0,
      reason: '',
    },

    validate: {
      player: (value: string | null) =>
        Number(value) > 0 ? null : i18n._t('Please select player'),
      reason: (value: string) =>
        value.trim() !== '' ? null : i18n._t('A reason for penalty is mandatory'),
    },
  });

  const submitForm = (vals: { player: string | null; amount: number; reason: string }) => {
    if (!eventId) {
      return;
    }
    setIsSaving(true);
    setIsSaved(false);

    api
      .addPenalty(parseInt(eventId, 10), Number(vals.player), vals.amount, vals.reason)
      .then((r) => {
        if (r) {
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 5000);
          form.reset();
        } else {
          throw new Error(i18n._t('Failed to apply penalty: server error or network unreachable'));
        }
      })
      .catch((err: Error) => {
        notifications.show({
          title: i18n._t('Error has occurred'),
          message: err.message,
          color: 'red',
        });
      })
      .finally(() => {
        setIsSaving(false);
        onSuccess();
      });
  };

  if (!storage.getPersonId()) {
    return <Redirect to='/profile/login' />;
  }

  return (
    <form ref={formRef} onSubmit={form.onSubmit(submitForm)}>
      <Text style={{ fontWeight: 'bold' }}>{i18n._t('Add a penalty')}</Text>
      <Select
        data-testid='forseti-penalty-player'
        withAsterisk
        leftSection={<IconUserExclamation size='1rem' />}
        label={i18n._t('Select player')}
        searchable
        description={i18n._t('This is a player to be penalized')}
        data={playersList}
        {...form.getInputProps('player')}
      />
      <Space h='lg' />
      <NumberInput
        data-testid='forseti-penalty-amount'
        {...form.getInputProps('amount')}
        leftSection={<IconAlertOctagon size='1rem' />}
        label={i18n._t('Penalty amount')}
        description={i18n._t(
          'The penalty applies to the rating table in this event by subtracting the suggested amount of points from player rating. If the amount is zero, the penalty is treated as a notice.'
        )}
        defaultValue={0}
        step={eventConfig?.rulesetConfig.penaltyStep}
        min={eventConfig?.rulesetConfig.minPenalty}
        max={eventConfig?.rulesetConfig.maxPenalty}
      />
      <Space h='lg' />
      <Group style={{ alignItems: 'flex-end' }}>
        <TextInput
          data-testid='forseti-penalty-reason'
          style={{ flex: 1 }}
          withAsterisk
          leftSection={<IconSignature size='1rem' />}
          label={i18n._t('Penalty reason')}
          {...form.getInputProps('reason')}
        />
        <CommonReasons
          buttonStyles={{ marginBottom: '5px' }}
          color='grape'
          title={i18n._t('Common reasons for penalties')}
          onConfirm={(reason) => {
            form.setFieldValue('reason', reason);
          }}
        />
      </Group>
      <Space h='lg' />
      <Group justify='flex-end'>
        <Button
          data-testid='forseti-penalty-submit'
          type='submit'
          style={{ alignSelf: 'flex-end' }}
          title={isSaved ? i18n._t('Penalty applied!') : i18n._t('Apply penalty')}
          loading={isSaving || isSaved}
          rightSection={isSaved ? <IconCircleCheck /> : <IconDeviceFloppy />}
        >
          {isSaved ? i18n._t('Penalty applied!') : i18n._t('Apply penalty')}
        </Button>
      </Group>
    </form>
  );
};
