import * as React from 'react';
import { Button, Checkbox, Container, Group, Space, TextInput } from '@mantine/core';
import { IconUserCode } from '@tabler/icons-react';
import { Redirect } from 'wouter';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { useCallback, useEffect } from 'react';
import { usePageTitle } from '../hooks/pageTitle';
import { useForm } from '@mantine/form';
import { useStorage } from '../hooks/storage';
import { notifications } from '@mantine/notifications';

export const ProfileNotifications: React.FC<{ params: { id?: string } }> = ({ params: { id } }) => {
  const api = useApi();
  const storage = useStorage();
  api.setEventId(0);
  const i18n = useI18n();
  const personId = storage.getPersonId();
  usePageTitle(i18n._t('Notifications settings'));

  const form = useForm({
    initialValues: {
      id: id ?? '',
      notifications: {
        // Should match defaults described in Common/Notifications.php
        // const SessionSeatingReady = 'sr';
        // const SessionStartingSoon = 'ss';
        // const HandHasBeenRecorded = 'h';
        // const ClubSessionEnded = 'ce';
        // const TournamentSessionEnded = 'te';
        sr: 1,
        ss: 1,
        h: 0,
        ce: 0,
        te: 0,
      } as Record<string, number>,
    },

    validate: {
      id: (value: string) =>
        value.trim() !== '' && value.trim().match(/\d+/)
          ? null
          : i18n._t('Please enter you telegram ID'),
    },
  });

  useEffect(() => {
    if (!personId) {
      return;
    }
    api.getNotificationsSettings(personId).then((resp) => {
      form.setValues({
        id: resp.id,
        notifications: resp.notifications,
      });
    });
  }, []);

  const submitForm = useCallback(
    (values: { id: string; notifications: Record<string, number> }) => {
      if (!personId) {
        return;
      }
      api
        .setNotificationsSettings(personId, values.id.trim(), values.notifications)
        .then((success) => {
          if (!success) {
            throw new Error();
          }
          notifications.show({
            title: i18n._t('Success'),
            message: i18n._t('Your notifications settings saved successfully'),
            color: 'green',
          });
        })
        .catch(() => {
          form.setFieldError('id', i18n._t('Failed to set notifications settings.'));
        });
    },
    [api]
  );

  if (!personId) {
    return <Redirect to='/profile/manage' />;
  }

  return (
    <form onSubmit={form.onSubmit(submitForm)}>
      <Container>
        <TextInput
          label={i18n._t('Your telegram ID')}
          icon={<IconUserCode size='1rem' />}
          placeholder={i18n._t('Your telegram ID')}
          {...form.getInputProps('id')}
        />
        <Space h='md' />
        <Checkbox
          label={i18n._t('Notify when seating for tournament sessions is ready')}
          {...form.getInputProps('notifications.sr', { type: 'checkbox' })}
        />
        <Space h='md' />
        <Checkbox
          label={i18n._t('Notify when next tournament session is about to start (except online)')}
          {...form.getInputProps('notifications.ss', { type: 'checkbox' })}
        />
        <Space h='md' />
        <Checkbox
          label={i18n._t('Notify when session in tournament has ended (except online)')}
          {...form.getInputProps('notifications.te', { type: 'checkbox' })}
        />
        <Space h='md' />
        <Checkbox
          label={i18n._t('Notify when a hand has been recorded')}
          {...form.getInputProps('notifications.h', { type: 'checkbox' })}
        />
        <Space h='md' />
        <Checkbox
          label={i18n._t('Notify when session in club event has ended')}
          {...form.getInputProps('notifications.ce', { type: 'checkbox' })}
        />
        <Space h='md' />
        <Group position='right' mt='md'>
          <Button type='submit'>{i18n._t('Update notifications settings')}</Button>
        </Group>
      </Container>
    </form>
  );
};
