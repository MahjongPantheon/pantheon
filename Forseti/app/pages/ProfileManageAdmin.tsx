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
import { useI18n } from '../hooks/i18n';
import {
  Container,
  PasswordInput,
  Space,
  TextInput,
  LoadingOverlay,
  Select,
  Checkbox,
  Group,
  Avatar,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconIdBadge2,
  IconLock,
  IconMailQuestion,
  IconMap2,
  IconMapPin,
  IconPhoneCall,
  IconSignature,
  IconUserPlus,
} from '@tabler/icons-react';
import { Redirect } from 'wouter';
import { createRef, useCallback, useEffect, useState } from 'react';
import { useApi } from '../hooks/api';
import { usePageTitle } from '../hooks/pageTitle';
import { notifications } from '@mantine/notifications';
import { TopActionButton } from '../helpers/TopActionButton';
import { useStorage } from '../hooks/storage';
import { FileUploadButton } from '../helpers/FileUploadButton';
import { env } from '../env';

export const ProfileManageAdmin: React.FC<{ params: { id?: string } }> = ({ params: { id } }) => {
  const i18n = useI18n();
  if (id) {
    usePageTitle(i18n._t('Update player account'));
  } else {
    usePageTitle(i18n._t('Register new account'));
  }
  const api = useApi();
  api.setEventId(0);
  const storage = useStorage();
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [countries, setCountries] = useState<Array<{ value: string; label: string }>>([]);
  const formRef: React.RefObject<HTMLFormElement> = createRef();
  const personId = storage.getPersonId();
  const [avatarData, setAvatarData] = useState<string | null | undefined>();
  const [playerEditId, setPlayerEditId] = useState(0);
  const form = useForm({
    initialValues: {
      email: '',
      title: '',
      password: '',
      city: '',
      country: '',
      phone: '',
      tenhouId: '',
      hasAvatar: false,
      avatarData: '',
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
      country: string;
      phone: string;
      tenhouId: string;
      hasAvatar: boolean;
      avatarData: string;
    }) => {
      if (!id) {
        setIsSaving(true);
        api
          .createAccount(
            values.email.trim().toLowerCase(),
            values.title.trim(),
            values.password.trim(),
            values.city.trim(),
            values.country.trim(),
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
      } else {
        setIsSaving(true);
        api
          .updatePersonalInfo(
            parseInt(id, 10),
            values.title.trim(),
            values.country.trim(),
            values.city.trim(),
            values.email.trim().toLowerCase(),
            values.phone.trim(),
            values.tenhouId.trim(),
            values.hasAvatar,
            values.avatarData
          )
          .then((resp) => {
            setIsSaving(false);
            if (resp) {
              notifications.show({
                title: i18n._t('Success'),
                message: i18n._t('Player details were successfully saved'),
                color: 'green',
              });
              if (!id) {
                form.reset();
              }
            }
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 5000);
          })
          .catch(() => {
            setIsSaving(false);
            form.setFieldError(
              'password',
              i18n._t('Failed to update player details. Is your connection stable?')
            );
          });
      }
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
      if (!flag || !id) {
        setIsLoading(false);
        return;
      }

      if (id) {
        api.getPersonalInfo(parseInt(id, 10)).then((player) => {
          form.setValues(player);
          setPlayerEditId(player.id);
          setIsLoading(false);
        });
      }
    });
    api.getCountries().then((respCountries) => {
      setCountries(respCountries.countries.map((v) => ({ value: v.code, label: v.name })));
    });
  }, [personId]);

  function updateAvatar(file?: File) {
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', (e) => {
        setAvatarData(e.target?.result as string);
        form.setFieldValue('avatarData', e.target?.result as string);
      });
      reader.readAsDataURL(file);
    }
  }

  if (!isLoading && !isSuperadmin) {
    return <Redirect to='/' />;
  }

  return (
    <>
      <Container>
        <LoadingOverlay visible={isLoading} opacity={1} />
        <form ref={formRef} onSubmit={form.onSubmit(submitForm)}>
          <TextInput
            withAsterisk
            leftSection={<IconMailQuestion size='1rem' />}
            description={i18n._t("Enter player's e-mail address")}
            {...form.getInputProps('email')}
          />
          <Space h='md' />
          <TextInput
            withAsterisk
            leftSection={<IconSignature size='1rem' />}
            description={i18n._t(
              'This is a title that will be shown in rating table and in mobile assistant. Please select some unique title, like nickname or name+surname.'
            )}
            {...form.getInputProps('title')}
          />
          {!id && (
            <>
              <Space h='md' />
              <PasswordInput
                withAsterisk
                description={i18n._t('Enter strong password')}
                leftSection={<IconLock size='1rem' />}
                {...form.getInputProps('password')}
              />
            </>
          )}
          <Space h='md' />
          <Select
            leftSection={<IconMap2 size='1rem' />}
            label={i18n._t('Country')}
            searchable
            nothingFoundMessage={i18n._t('Nothing found')}
            maxDropdownHeight={280}
            data={countries}
            {...form.getInputProps('country')}
          />
          <Space h='md' />
          <TextInput
            description={i18n._t('Enter city of the player')}
            leftSection={<IconMapPin size='1rem' />}
            {...form.getInputProps('city')}
          />
          <Space h='md' />
          <TextInput
            description={i18n._t("Enter player's phone")}
            leftSection={<IconPhoneCall size='1rem' />}
            {...form.getInputProps('phone')}
          />
          <Space h='md' />
          <TextInput
            leftSection={<IconIdBadge2 size='1rem' />}
            description={i18n._t('Tenhou ID')}
            {...form.getInputProps('tenhouId')}
          />
          <Space h='md' />
          <Checkbox
            label={i18n._t('Show user avatar')}
            description={i18n._t(
              'If checked, uploaded avatar will be shown instead of default circle with initials. If no avatar is uploaded, the default circle will be shown.'
            )}
            {...form.getInputProps('hasAvatar', { type: 'checkbox' })}
          />
          <Space h='md' />
          {form.getTransformedValues().hasAvatar && (
            <>
              <Group>
                <Avatar
                  radius='xl'
                  src={avatarData ?? `${env.urls.gullveig}/files/avatars/user_${playerEditId}.jpg`}
                ></Avatar>
                <FileUploadButton i18n={i18n} onChange={updateAvatar} />
              </Group>
              <div
                style={{
                  color: '#909296',
                  fontSize: 'calc(0.875rem - 0.125rem)',
                  lineHeight: 1.2,
                  display: 'block',
                  marginTop: 'calc(0.625rem / 2)',
                }}
              >
                {i18n._t(
                  "Avatar should be an image file. It's recommended to upload a square-sized image, otherwise it will be cropped to center square. File size should not be more than 256 KB."
                )}
              </div>
            </>
          )}
          <TopActionButton
            title={
              isSaved
                ? id
                  ? i18n._t('Changes saved!')
                  : i18n._t('Registration done!')
                : id
                ? i18n._t('Update player')
                : i18n._t('Register player')
            }
            loading={isSaving || isSaved}
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
