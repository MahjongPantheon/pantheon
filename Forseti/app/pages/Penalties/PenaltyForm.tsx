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
import { createRef, useState } from 'react';
import { useApi } from '../../hooks/api';
import { useI18n } from '../../hooks/i18n';
import { useForm } from '@mantine/form';
import { Text, Button, NumberInput, Select, Space, TextInput, Group } from '@mantine/core';
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
import { GameConfig } from '../../clients/proto/atoms.pb';
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
  const formRef: React.RefObject<HTMLFormElement> = createRef();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm({
    initialValues: {
      player: 0,
      amount: 0,
      reason: '',
    },

    validate: {
      player: (value: number) => (value > 0 ? null : i18n._t('Please select player')),
      amount: (value: number) => (value > 0 ? null : i18n._t('Please select penalty amount')),
      reason: (value: string) =>
        value.trim() !== '' ? null : i18n._t('A reason for penalty is mandatory'),
    },
  });

  const submitForm = (vals: { player: number; amount: number; reason: string }) => {
    if (!eventId) {
      return;
    }
    setIsSaving(true);
    setIsSaved(false);

    api
      .addPenalty(parseInt(eventId, 10), vals.player, vals.amount, vals.reason)
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
        withAsterisk
        icon={<IconUserExclamation size='1rem' />}
        label={i18n._t('Select player')}
        searchable
        description={i18n._t('This is a player to be penalized')}
        data={playersList}
        {...form.getInputProps('player')}
      />
      <Space h='lg' />
      <NumberInput
        withAsterisk
        {...form.getInputProps('amount')}
        icon={<IconAlertOctagon size='1rem' />}
        label={i18n._t('Penalty amount')}
        description={i18n._t(
          'The penalty applies to the rating table in this event by subtracting the suggested amount of points from player rating'
        )}
        defaultValue={eventConfig?.rulesetConfig.minPenalty}
        step={eventConfig?.rulesetConfig.penaltyStep}
        min={eventConfig?.rulesetConfig.minPenalty}
        max={eventConfig?.rulesetConfig.maxPenalty}
      />
      <Space h='lg' />
      <Group style={{ alignItems: 'flex-end' }}>
        <TextInput
          style={{ flex: 1 }}
          withAsterisk
          icon={<IconSignature size='1rem' />}
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
      <Group position='right'>
        <Button
          type='submit'
          style={{ alignSelf: 'flex-end' }}
          title={isSaved ? i18n._t('Penalty applied!') : i18n._t('Apply penalty')}
          loading={isSaving || isSaved}
          rightIcon={isSaved ? <IconCircleCheck /> : <IconDeviceFloppy />}
        >
          {isSaved ? i18n._t('Penalty applied!') : i18n._t('Apply penalty')}
        </Button>
      </Group>
    </form>
  );
};
