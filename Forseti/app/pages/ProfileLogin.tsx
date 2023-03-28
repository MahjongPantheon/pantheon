import * as React from 'react';
import { usePageTitle } from '#/hooks/pageTitle';
import { Button, Container, Group, TextInput, PasswordInput, Space } from '@mantine/core';
import { IconLogin, IconLock } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { Link, useLocation } from 'wouter';
import { useStorage } from '#/hooks/storage';
import { useApi } from '#/hooks/api';
import { useI18n } from '#/hooks/i18n';
import { useCallback } from 'react';
import { useAuth } from '#/hooks/auth';

export const ProfileLogin: React.FC = () => {
  const storage = useStorage();
  const api = useApi();
  const i18n = useI18n();
  const auth = useAuth();
  usePageTitle(i18n._t('Login to your account'));
  const [, navigate] = useLocation();
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (value: string) =>
        /^\S+@\S+$/.test(value.trim().toLowerCase()) ? null : i18n._t('Invalid email'),
      password: (value: string) => (value.trim() !== '' ? null : i18n._t('Please enter password')),
    },
  });

  const submitForm = useCallback(
    (values: { email: string; password: string }) => {
      api
        .authorize(values.email.trim().toLowerCase(), values.password.trim())
        .then((resp) => {
          storage.setPersonId(resp.personId);
          storage.setAuthToken(resp.authToken);
          api.setCredentials(resp.personId, resp.authToken);
          auth.setIsLoggedIn(true);
          navigate('/');
        })
        .catch(() => {
          form.setFieldError(
            'password',
            i18n._t('Failed to authorize. Please check your email and password.')
          );
        });
    },
    [api]
  );

  return (
    <>
      <form onSubmit={form.onSubmit(submitForm)}>
        <Container size='xs' px='xs'>
          <TextInput
            icon={<IconLogin size='1rem' />}
            placeholder={i18n._t('Your e-mail address')}
            {...form.getInputProps('email')}
          />
          <Space h='md' />
          <PasswordInput
            placeholder={i18n._t('Your password')}
            icon={<IconLock size='1rem' />}
            {...form.getInputProps('password')}
          />
          <Group position='right' mt='md'>
            <Link to='/profile/resetPassword'>
              <Button variant='outline'>{i18n._t('Forgot your password?')}</Button>
            </Link>
            <Button type='submit'>{i18n._t('Proceed with sign in')}</Button>
          </Group>
        </Container>
      </form>
    </>
  );
};
