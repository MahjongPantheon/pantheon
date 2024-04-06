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
import { Button, Group, Space, Alert, Container, LoadingOverlay } from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { Link } from 'wouter';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { useEffect, useState } from 'react';
import { I18nService } from '../services/i18n';

export const ProfileConfirm: React.FC<{ params: { code: string } }> = ({ params: { code } }) => {
  const api = useApi();
  const i18n = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  usePageTitle(i18n._t('Confirm your email'));
  api.setEventId(0);

  useEffect(() => {
    setIsLoading(true);
    api
      .confirmRegistration(code)
      .then((resp) => {
        if (resp.personId) {
          setIsSuccess(true);
        }
      })
      .catch(() => {
        setIsSuccess(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <Container>
      <LoadingOverlay visible={isLoading} overlayOpacity={1} />
      {isSuccess ? <SuccessAlert i18n={i18n} /> : <ErrorAlert i18n={i18n} />}
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
          'Failed to confirm your email. Probably the link you followed has been expired or already used. Please try registering again.'
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
      <Alert
        data-testid='confirmation_success'
        icon={<IconCheck size='1rem' />}
        title={i18n._t('Email confirmed')}
        color='green'
      >
        {i18n._t('Your email has been successfully confirmed. Now you can proceed to login page.')}
      </Alert>
      <Space h='xl' />
      <Group position='right'>
        <Link to='/profile/login'>
          <Button variant='filled' data-testid='goto_login'>
            {i18n._t('Go to Login page')}
          </Button>
        </Link>
      </Group>
    </>
  );
}
