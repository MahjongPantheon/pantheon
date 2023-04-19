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
import { useForm } from '@mantine/form';
import { useI18n } from '#/hooks/i18n';
import { Container, PasswordInput, Space, TextInput, LoadingOverlay } from '@mantine/core';
import {
  IconCircleCheck,
  IconIdBadge2,
  IconLock,
  IconMailQuestion,
  IconMapPin,
  IconPhoneCall,
  IconSignature,
  IconUserPlus,
} from '@tabler/icons-react';
import { Redirect } from 'wouter';
import { createRef, useCallback, useEffect, useState } from 'react';
import { useApi } from '#/hooks/api';
import { usePageTitle } from '#/hooks/pageTitle';
import { notifications } from '@mantine/notifications';
import { TopActionButton } from '#/helpers/TopActionButton';
import { useStorage } from '#/hooks/storage';

export const ProfileSignupAdmin: React.FC = () => {
  const i18n = useI18n();
  usePageTitle(i18n._t('Register new account'));
  const api = useApi();
  const storage = useStorage();
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const formRef: React.RefObject<HTMLFormElement> = createRef();
  const personId = storage.getPersonId();
  const form = useForm({
    initialValues: {
      email: '',
      title: '',
      password: '',
      city: '',
      phone: '',
      tenhouId: '',
    },

    validate: {
      email: (value: string) =>
        /^\S+@\S+$/.test(value.trim().toLowerCase()) ? null : i18n._t('Invalid email'),
      title: (value: string) => (value.trim().toLowerCase() ? null : i18n._t('Invalid title')),
    },
  });

  const submitForm = useCallback(
    (values: {
      email: string;
      title: string;
      password: string;
      city: string;
      phone: string;
      tenhouId: string;
    }) => {
      setIsSaving(true);
      api
        .createAccount(
          values.email.trim().toLowerCase(),
          values.title.trim(),
          values.password.trim(),
          values.city.trim(),
          values.phone.trim(),
          values.tenhouId.trim()
        )
        .then((resp) => {
          setIsSaving(false);
          if (resp) {
            notifications.show({
              title: i18n._t('Success'),
              message: i18n._t('Player was successfully registered'),
              color: 'green',
            });
            form.reset();
          }
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 5000);
        })
        .catch(() => {
          setIsSaving(false);
          form.setFieldError(
            'password',
            i18n._t('Failed to register player. Is your connection stable?')
          );
        });
    },
    [api]
  );

  useEffect(() => {
    setIsLoading(true);
    if (!personId) {
      setIsLoading(false);
      return;
    }
    api.getSuperadminFlag(personId).then((flag) => {
      setIsSuperadmin(flag);
      setIsLoading(false);
    });
  }, [personId]);

  if (!isLoading && !isSuperadmin) {
    return <Redirect to='/' />;
  }

  return (
    <>
      <Container>
        <LoadingOverlay visible={isLoading} overlayOpacity={1} />
        <form ref={formRef} onSubmit={form.onSubmit(submitForm)}>
          <TextInput
            withAsterisk
            icon={<IconMailQuestion size='1rem' />}
            description={i18n._t("Enter player's e-mail address")}
            {...form.getInputProps('email')}
          />
          <Space h='md' />
          <TextInput
            withAsterisk
            icon={<IconSignature size='1rem' />}
            description={i18n._t(
              'This is a title that will be shown in rating table and in mobile assistant. Please select some unique title, like nickname or name+surname.'
            )}
            {...form.getInputProps('title')}
          />
          <Space h='md' />
          <PasswordInput
            withAsterisk
            description={i18n._t('Enter strong password')}
            icon={<IconLock size='1rem' />}
            {...form.getInputProps('password')}
          />
          <Space h='md' />
          <TextInput
            description={i18n._t('Enter city of the player')}
            icon={<IconMapPin size='1rem' />}
            {...form.getInputProps('city')}
          />
          <Space h='md' />
          <TextInput
            description={i18n._t("Enter player's phone")}
            icon={<IconPhoneCall size='1rem' />}
            {...form.getInputProps('phone')}
          />
          <Space h='md' />
          <TextInput
            icon={<IconIdBadge2 size='1rem' />}
            description={i18n._t('Tenhou ID')}
            {...form.getInputProps('tenhouId')}
          />

          <TopActionButton
            title={isSaved ? i18n._t('Registration done!') : i18n._t('Register player')}
            loading={isSaving}
            disabled={isSaved}
            icon={isSaved ? <IconCircleCheck /> : <IconUserPlus />}
            onClick={() => {
              formRef.current?.requestSubmit();
            }}
          />
        </form>
      </Container>
    </>
  );
};
