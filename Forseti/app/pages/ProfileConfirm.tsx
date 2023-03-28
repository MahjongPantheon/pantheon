import * as React from 'react';
import { usePageTitle } from '#/hooks/pageTitle';
import { Button, Group, Space, Loader, Alert, Center, Container } from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { Link } from 'wouter';
import { useApi } from '#/hooks/api';
import { useI18n } from '#/hooks/i18n';
import { useEffect, useState } from 'react';
import { I18nService } from '#/services/i18n';

export const ProfileConfirm: React.FC<{ params: { code: string } }> = ({ params: { code } }) => {
  const api = useApi();
  const i18n = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  usePageTitle(i18n._t('Confirm your email'));

  useEffect(() => {
    api
      .confirmRegistration(code)
      .then((resp) => {
        if (resp.personId) {
          setIsSuccess(true);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsSuccess(false);
        setIsLoading(false);
      });
  }, []);

  return (
    <Container>
      {isLoading ? (
        <Center maw={400} h={100} mx='auto'>
          <Loader />
        </Center>
      ) : isSuccess ? (
        <SuccessAlert i18n={i18n} />
      ) : (
        <ErrorAlert i18n={i18n} />
      )}
    </Container>
  );
};

function ErrorAlert({ i18n }: { i18n: I18nService }) {
  return (
    <>
      <Alert
        icon={<IconAlertCircle size='1rem' />}
        title={i18n._t('Email confirmation failed')}
        color='red'
      >
        {i18n._t(
          'Failed to confirm your email. Probably the link you used has been expired or already used. Please try registering again.'
        )}
      </Alert>
      <Space h='xl' />
      <Group position='right'>
        <Link to='/profile/signup'>
          <Button variant='filled'>{i18n._t('Go to Signup page')}</Button>
        </Link>
      </Group>
    </>
  );
}

function SuccessAlert({ i18n }: { i18n: I18nService }) {
  return (
    <>
      <Alert icon={<IconCheck size='1rem' />} title={i18n._t('Email confirmed')} color='green'>
        {i18n._t('Your email has been successfully confirmed. Now you can proceed to login page.')}
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
