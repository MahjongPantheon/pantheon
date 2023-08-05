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
  Avatar,
  Box,
  Checkbox,
  Container,
  Group,
  LoadingOverlay,
  Select,
  Space,
  TextInput,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconDeviceFloppy,
  IconId,
  IconIdBadge2,
  IconMail,
  IconMap2,
  IconMapPin,
  IconPhoneCall,
} from '@tabler/icons-react';
import { createRef, useCallback, useEffect, useState } from 'react';
import { useApi } from '../hooks/api';
import { usePageTitle } from '../hooks/pageTitle';
import { useStorage } from '../hooks/storage';
import { TopActionButton } from '../helpers/TopActionButton';
import { nprogress } from '@mantine/nprogress';
import { Redirect } from 'wouter';
import { FileUploadButton } from '../helpers/FileUploadButton';
import { env } from '../env';

export const ProfileManage: React.FC = () => {
  const i18n = useI18n();
  usePageTitle(i18n._t('Manage your account'));
  const api = useApi();
  api.setEventId(0);
  const storage = useStorage();
  const personId = storage.getPersonId()!;
  const formRef: React.RefObject<HTMLFormElement> = createRef();
  const [countries, setCountries] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const form = useForm({
    initialValues: {
      email: '',
      title: '',
      country: '',
      city: '',
      phone: '',
      tenhouId: '',
      hasAvatar: false,
      avatarData: '',
    },

    validate: {
      title: (value: string) => (value.trim().toLowerCase() ? null : i18n._t('Invalid title')),
      tenhouId: (value: string) =>
        value.trim().match(/^ID[a-z0-9]+-[a-z0-9]+$/i)
          ? i18n._t(
              'You have provided your tenhou login string instead of your username. You should NEVER give anyone your login string!'
            )
          : null,
    },
  });
  const [avatarData, setAvatarData] = useState<string | null | undefined>();

  const submitForm = useCallback(
    (values: {
      email: string;
      title: string;
      country: string;
      city: string;
      phone: string;
      tenhouId: string;
      hasAvatar: boolean;
      avatarData: string;
    }) => {
      setIsSaving(true);
      api
        .updatePersonalInfo(
          personId,
          values.title.trim(),
          values.country,
          values.city,
          '', // email can't be changed by yourself, pass just anything.
          values.phone.trim(),
          values.tenhouId.trim(),
          values.hasAvatar,
          values.avatarData
        )
        .then((resp) => {
          setIsSaving(false);
          if (!resp) {
            throw new Error();
          }
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 5000);
        })
        .catch(() => {
          setIsSaving(false);
          form.setFieldError(
            'password',
            i18n._t('Failed to update profile. Is your connection stable?')
          );
        });
    },
    [api]
  );

  useEffect(() => {
    nprogress.reset();
    nprogress.start();
    setIsLoading(true);
    api.getCountries().then((respCountries) => {
      setCountries(respCountries.countries.map((v) => ({ value: v.code, label: v.name })));
      api.getPersonalInfo(personId).then((resp) => {
        form.setFieldValue('email', resp.email);
        form.setFieldValue('title', resp.title);
        form.setFieldValue('city', resp.city);
        form.setFieldValue('phone', resp.phone);
        form.setFieldValue('tenhouId', resp.tenhouId);
        form.setFieldValue('country', resp.country || respCountries.preferredByIp);
        form.setFieldValue('hasAvatar', resp.hasAvatar);
        setIsLoading(false);
        nprogress.complete();
      });
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

  if (!storage.getPersonId()) {
    return <Redirect to='/profile/login' />;
  }

  return (
    <>
      <Container>
        <LoadingOverlay visible={isLoading} overlayOpacity={1} />
        <Box pos='relative'>
          <form ref={formRef} onSubmit={form.onSubmit(submitForm)}>
            <TextInput
              disabled={true}
              icon={<IconMail size='1rem' />}
              label={i18n._t('Your e-mail address')}
              description={i18n._t(
                'Your e-mail will not be shared with anyone else and will not be visible anywhere. If you want to change your address, contact chief administrator.'
              )}
              {...form.getInputProps('email')}
            />
            <Space h='md' />
            <TextInput
              icon={<IconId size='1rem' />}
              label={i18n._t('Player title')}
              description={i18n._t(
                "This is a title that will be shown in rating table and in mobile assistant, also event administrators will use this title to find you and add to the event. Please don't use your single name here, as it's not unique enough. Name and surname is fine."
              )}
              {...form.getInputProps('title')}
            />
            <Space h='md' />
            <Select
              icon={<IconMap2 size='1rem' />}
              label={i18n._t('Country')}
              searchable
              nothingFound={i18n._t('Nothing found')}
              maxDropdownHeight={280}
              data={countries}
              {...form.getInputProps('country')}
            />
            <Space h='md' />
            <TextInput
              icon={<IconMapPin size='1rem' />}
              label={i18n._t('City')}
              {...form.getInputProps('city')}
            />
            <Space h='md' />
            <TextInput
              icon={<IconPhoneCall size='1rem' />}
              label={i18n._t('Phone number')}
              {...form.getInputProps('phone')}
            />
            <Space h='md' />
            <TextInput
              icon={<IconIdBadge2 size='1rem' />}
              label={i18n._t('Tenhou ID')}
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
                    src={avatarData ?? `${env.urls.gullveig}/files/avatars/user_${personId}.jpg`}
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
              title={isSaved ? i18n._t('Changes saved!') : i18n._t('Save changes')}
              loading={isSaving || isLoading || isSaved}
              icon={isSaved ? <IconCircleCheck /> : <IconDeviceFloppy />}
              onClick={() => {
                formRef.current?.requestSubmit();
              }}
            />
          </form>
        </Box>
      </Container>
    </>
  );
};
