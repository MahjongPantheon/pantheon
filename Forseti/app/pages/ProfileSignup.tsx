import * as React from 'react';
import { useForm } from '@mantine/form';
import { useI18n } from '#/hooks/i18n';
import zxcvbn from 'zxcvbn';
import { Button, Checkbox, Container, Group, PasswordInput, Space, TextInput } from '@mantine/core';
import { IconLock, IconLogin } from '@tabler/icons-react';
import { Link } from 'wouter';
import { useCallback } from 'react';
import { useApi } from '#/hooks/api';

export const ProfileSignup: React.FC = () => {
  const i18n = useI18n();
  const api = useApi();
  const form = useForm({
    initialValues: {
      email: '',
      title: '',
      password: '',
      termsOfService: false,
    },

    validate: {
      email: (value: string) =>
        /^\S+@\S+$/.test(value.trim().toLowerCase()) ? null : i18n._t('Invalid email'),
      title: (value: string) => (value.trim().toLowerCase() ? null : i18n._t('Invalid title')),
      password: (value: string) =>
        zxcvbn(value).score > 3
          ? null
          : i18n._t('Your password is too weak. Please enter stronger password.'),
    },
  });

  const submitForm = useCallback(
    (values: { email: string; title: string; password: string }) => {
      api
        .requestRegistration(
          values.email.trim().toLowerCase(),
          values.title.trim().toLowerCase(),
          values.password.trim()
        )
        .then((resp) => {
          storage.setPersonId(resp.personId);
          storage.setAuthToken(resp.authToken);
          api.setCredentials(resp.personId, resp.authToken);
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
            placeholder={i18n._t('Enter your e-mail address')}
            {...form.getInputProps('email')}
          />
          <Space h='md' />
          <TextInput
            icon={<IconLogin size='1rem' />}
            placeholder={i18n._t('How do we call you?')}
            {...form.getInputProps('title')}
          />
          <Space h='md' />
          <PasswordInput
            placeholder={i18n._t('Enter your password')}
            icon={<IconLock size='1rem' />}
            {...form.getInputProps('password')}
          />
          <Space h='md' />
          <Checkbox
            mt='md'
            label='I agree to sell my privacy'
            {...form.getInputProps('termsOfService', { type: 'checkbox' })}
          />
          <Group position='right' mt='md'>
            <Link to='/profile/login'>
              <Button variant='outline'>{i18n._t('Already registered?')}</Button>
            </Link>
            <Button type='submit'>{i18n._t('Register new account')}</Button>
          </Group>
        </Container>
      </form>
    </>
  );
};
