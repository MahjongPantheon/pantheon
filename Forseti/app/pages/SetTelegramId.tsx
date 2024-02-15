import * as React from 'react';
import { Button, Container, Group, TextInput } from '@mantine/core';
import { IconUserCode } from '@tabler/icons-react';
import { Redirect } from 'wouter';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { useCallback, useEffect, useState } from 'react';
import { usePageTitle } from '../hooks/pageTitle';
import { useForm } from '@mantine/form';
import { useStorage } from '../hooks/storage';
import { notifications } from '@mantine/notifications';

export const ProfileSetTelegramId: React.FC<{ params: { id: string } }> = ({ params: { id } }) => {
  const api = useApi();
  const storage = useStorage();
  api.setEventId(0);
  const i18n = useI18n();
  const personId = storage.getPersonId();
  const [currentId, setCurrentId] = useState(BigInt(id ?? '0'));
  usePageTitle(i18n._t('Set up your Telegram connection'));

  useEffect(() => {
    if (!personId) {
      return;
    }
    api.getTelegramId(personId).then((resp) => {
      setCurrentId(resp);
    });
  }, []);

  const form = useForm({
    initialValues: {
      id: currentId.toString(),
    },

    validate: {
      id: (value: string) =>
        value.trim() !== '' && parseInt(value.trim(), 10)
          ? null
          : i18n._t('Please enter you telegram ID'),
    },
  });

  const submitForm = useCallback(
    (values: { id: string }) => {
      if (!personId) {
        return;
      }
      api
        .setTelegramId(personId, BigInt(values.id.trim()))
        .then((success) => {
          if (!success) {
            throw new Error();
          }
          notifications.show({
            title: i18n._t('Success'),
            message: i18n._t('Your telegram ID has been set successfully'),
            color: 'green',
          });
        })
        .catch(() => {
          form.setFieldError(
            'id',
            i18n._t('Failed to set telegram ID. Check if it is entered properly.')
          );
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
          icon={<IconUserCode size='1rem' />}
          placeholder={i18n._t('Your telegram ID')}
          {...form.getInputProps('id')}
        />
        <Group position='right' mt='md'>
          <Button type='submit'>{i18n._t('Set telegram ID')}</Button>
        </Group>
      </Container>
    </form>
  );
};
