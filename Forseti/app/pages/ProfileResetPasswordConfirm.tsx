import * as React from 'react';
import { usePageTitle } from '#/hooks/pageTitle';
import {
  Button,
  Group,
  Space,
  Loader,
  Alert,
  Center,
  Container,
  PasswordInput,
} from '@mantine/core';
import { IconCheck, IconAlertCircle, IconLock } from '@tabler/icons-react';
import { Link } from 'wouter';
import { useApi } from '#/hooks/api';
import { useI18n } from '#/hooks/i18n';
import { useCallback, useEffect, useState } from 'react';
import { I18nService } from '#/services/i18n';
import { useForm } from '@mantine/form';
import { ApiService } from '#/services/api';
import { calcPasswordStrength } from '#/helpers/passwordStrength';

export const ProfileResetPasswordConfirm: React.FC<{ params: { code: string } }> = ({
  params: { code },
}) => {
  const api = useApi();
  const i18n = useI18n();
  const [approvalCode, email] = window.atob(code).split('@@@');
  const [tmpCode, setTmpCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  usePageTitle(i18n._t('Reset your password'));

  useEffect(() => {
    setIsLoading(true);
    api
      .approvePasswordRecovery(email, approvalCode)
      .then((resp) => {
        setTmpCode(resp.newTmpPassword);
        setIsLoading(false);
      })
      .catch(() => {
        setIsSuccess(false);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Container>
        <Center maw={400} h={100} mx='auto'>
          <Loader />
        </Center>
      </Container>
    );
  }

  if (isSuccess) {
    return (
      <Container>
        <SuccessAlert i18n={i18n} />
      </Container>
    );
  }

  if (tmpCode !== '') {
    return (
      <Container>
        <ResetForm
          i18n={i18n}
          tmpCode={tmpCode}
          api={api}
          email={email}
          setIsSuccess={setIsSuccess}
        />
      </Container>
    );
  }

  if (!isSuccess) {
    return (
      <Container>
        <ErrorAlert i18n={i18n} />
      </Container>
    );
  }

  return <></>;
};

function ResetForm({
  i18n,
  tmpCode,
  email,
  api,
  setIsSuccess,
}: {
  i18n: I18nService;
  tmpCode: string;
  email: string;
  api: ApiService;
  setIsSuccess: (success: boolean) => void;
}) {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      password: (value: string) =>
        calcPasswordStrength(value) >= 16
          ? null
          : i18n._t('Your password is too weak. Please enter stronger password.'),
    },
  });

  const submitForm = useCallback(
    (values: { password: string }) => {
      api
        .changePassword(email.trim().toLowerCase(), tmpCode, values.password.trim())
        .then((resp) => {
          if (resp.authToken) {
            setIsSuccess(true);
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          form.setFieldError(
            'password',
            i18n._t('Failed to change password. Is your connection stable?')
          );
        });
    },
    [api]
  );

  return (
    <>
      <Alert icon={<IconAlertCircle size='1rem' />} title={i18n._t('Please note')} color='orange'>
        {i18n._t(
          "Your password has been set to temporary value. You won't be able to log in until you set you new password, even if you remembered your old password."
        )}
      </Alert>
      <Space h='xl' />
      <form onSubmit={form.onSubmit(submitForm)}>
        <PasswordInput
          placeholder={i18n._t('Enter new strong password')}
          icon={<IconLock size='1rem' />}
          {...form.getInputProps('password')}
        />
        <Group position='right' mt='md'>
          <Button type='submit'>{i18n._t('Update password')}</Button>
        </Group>
      </form>
    </>
  );
}

function ErrorAlert({ i18n }: { i18n: I18nService }) {
  return (
    <>
      <Alert
        icon={<IconAlertCircle size='1rem' />}
        title={i18n._t('Password recovery failed')}
        color='red'
      >
        {i18n._t(
          'Failed to recover your password. Probably the link you followed has been expired or already used. Please try again.'
        )}
      </Alert>
      <Space h='xl' />
      <Group position='right'>
        <Link to='/profile/resetPassword'>
          <Button variant='filled'>{i18n._t('Recover password')}</Button>
        </Link>
      </Group>
    </>
  );
}

function SuccessAlert({ i18n }: { i18n: I18nService }) {
  return (
    <>
      <Alert
        icon={<IconCheck size='1rem' />}
        title={i18n._t('Password successfully updated')}
        color='green'
      >
        {i18n._t('Your password has been successfully reset. Now you can proceed to login page.')}
      </Alert>
      <Space h='xl' />
      <Group position='right'>
        <Link to='/profile/login'>
          <Button variant='filled'>{i18n._t('Go to Login page')}</Button>
        </Link>
      </Group>
    </>
  );
}
