import * as React from 'react';
import { Checkbox, Container, Space, TextInput } from '@mantine/core';
import { IconCircleCheck, IconDeviceFloppy, IconUserCode } from '@tabler/icons-react';
import { Redirect } from 'wouter';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { createRef, useCallback, useEffect, useState } from 'react';
import { usePageTitle } from '../hooks/pageTitle';
import { useForm } from '@mantine/form';
import { useStorage } from '../hooks/storage';
import { TopActionButton } from '../components/TopActionButton';

export const ProfileNotifications: React.FC<{ params: { id?: string } }> = ({ params: { id } }) => {
  const api = useApi();
  const storage = useStorage();
  api.setEventId(0);
  const i18n = useI18n();
  const personId = storage.getPersonId();
  const formRef: React.RefObject<HTMLFormElement> = createRef();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  usePageTitle(i18n._t('Notifications settings'));

  const form = useForm({
    initialValues: {
      id: id ? id : '',
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
      setIsLoading(false);
      form.setValues({
        id: resp.id ? resp.id : id ?? '',
        notifications: resp.notifications,
      });
    });
  }, []);

  const submitForm = useCallback(
    (values: { id: string; notifications: Record<string, number> }) => {
      if (!personId) {
        return;
      }
      setIsSaving(true);
      api
        .setNotificationsSettings(personId, values.id.trim(), values.notifications)
        .then((success) => {
          setIsSaving(false);
          if (!success) {
            throw new Error();
          }
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 5000);
        })
        .catch(() => {
          setIsSaving(false);
          form.setFieldError('id', i18n._t('Failed to set notifications settings.'));
        });
    },
    [api]
  );

  if (!personId) {
    return <Redirect to='/profile/manage' />;
  }

  if (!import.meta.env.VITE_BOT_NICKNAME) {
    return (
      <Container>
        {i18n._t(
          'Notifications from Pantheon are supported via Telegram. Please configure your Telegram bot to use the service (see README).'
        )}
      </Container>
    );
  }

  return (
    <form ref={formRef} onSubmit={form.onSubmit(submitForm)}>
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
        <Space h='xl' />
        {form.getTransformedValues().id === '' && (
          <>
            {i18n._t(
              'Notifications from Pantheon are supported via Telegram. Please use the following link to register with Telegram bot: '
            )}
            <br />
            <a href={`https://t.me/${import.meta.env.VITE_BOT_NICKNAME}`} target='_blank'>
              {i18n._t('Open Pantheon bot')}
            </a>
          </>
        )}
        <TopActionButton
          title={isSaved ? i18n._t('Settings saved!') : i18n._t('Update settings')}
          loading={isSaving || isLoading || isSaved}
          icon={isSaved ? <IconCircleCheck /> : <IconDeviceFloppy />}
          onClick={() => {
            formRef.current?.requestSubmit();
          }}
        />
      </Container>
    </form>
  );
};
