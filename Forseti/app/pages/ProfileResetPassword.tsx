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
import { usePageTitle } from '../hooks/pageTitle';
import { Button, Container, Group, TextInput, Alert } from '@mantine/core';
import { IconLogin, IconCheck } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { useCallback, useState } from 'react';
import { I18nService } from '../services/i18n';

export const ProfileResetPassword: React.FC = () => {
  const api = useApi();
  api.setEventId(0);
  const i18n = useI18n();
  usePageTitle(i18n._t('Recover password'));
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const form = useForm({
    initialValues: {
      email: '',
    },

    validate: {
      email: (value: string) =>
        /^\S+@\S+$/.test(value.trim().toLowerCase()) ? null : i18n._t('Invalid email'),
    },
  });

  const submitForm = useCallback(
    (values: { email: string }) => {
      setIsLoading(true);
      api
        .requestPasswordRecovery(values.email.trim().toLowerCase())
        .then((resp) => {
          if (resp.resetToken && process.env.NODE_ENV !== 'production') {
            // debug mode; code will not be sent in production mode
            alert('Reset link: ' + resp.resetToken);
          }
          setIsLoading(false);
          setIsSuccess(true);
        })
        .catch(() => {
          form.setFieldError(
            'password',
            i18n._t('Failed to request password reset. Please check your email.')
          );
          setIsLoading(false);
          setIsSuccess(false);
        });
    },
    [api]
  );

  return isSuccess ? (
    <SuccessAlert i18n={i18n} />
  ) : (
    <>
      <form onSubmit={form.onSubmit(submitForm)}>
        <Container>
          <TextInput
            leftSection={<IconLogin size='1rem' />}
            placeholder={i18n._t('Your e-mail address')}
            {...form.getInputProps('email')}
          />
          <Group justify='right' mt='md'>
            <Button disabled={isLoading} type='submit'>
              {i18n._t('Request password reset')}
            </Button>
          </Group>
        </Container>
      </form>
    </>
  );
};

function SuccessAlert({ i18n }: { i18n: I18nService }) {
  return (
    <Alert icon={<IconCheck size='1rem' />} title={i18n._t('Email has been sent')} color='green'>
      {i18n._t(
        'A confirmation link for password recovery has been sent to provided email. Please check your mailbox and follow the link in the message.'
      )}
    </Alert>
  );
}
