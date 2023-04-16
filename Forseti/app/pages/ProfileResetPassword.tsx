import * as React from 'react';
import { usePageTitle } from '#/hooks/pageTitle';
import { Button, Container, Group, TextInput, Alert } from '@mantine/core';
import { IconLogin, IconCheck } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useApi } from '#/hooks/api';
import { useI18n } from '#/hooks/i18n';
import { useCallback, useState } from 'react';
import { I18nService } from '#/services/i18n';
import { environment } from '#config';

export const ProfileResetPassword: React.FC = () => {
  const api = useApi();
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
          if (resp.resetToken && !environment.production) {
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
        <Container size='xs' px='xs'>
          <TextInput
            icon={<IconLogin size='1rem' />}
            placeholder={i18n._t('Your e-mail address')}
            {...form.getInputProps('email')}
          />
          <Group position='right' mt='md'>
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
