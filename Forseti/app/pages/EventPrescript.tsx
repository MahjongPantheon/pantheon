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
import {
  Box,
  Container,
  Group,
  NumberInput,
  Textarea,
  Text,
  Space,
  Button,
  Modal,
  Code,
  LoadingOverlay,
} from '@mantine/core';
import { useI18n } from '../hooks/i18n';
import { useCallback, useEffect, useState } from 'react';
import { useApi } from '../hooks/api';
import { IconCircleCheck, IconDeviceFloppy } from '@tabler/icons-react';
import { TopActionButton } from '../helpers/TopActionButton';
import { nprogress } from '@mantine/nprogress';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { usePageTitle } from '../hooks/pageTitle';
import { Redirect } from 'wouter';
import { useStorage } from '../hooks/storage';

const scriptExample = `1-2-3-4
5-6-7-8

1-3-5-7
2-4-6-8
`;

export const EventPrescript: React.FC<{ params: { id?: string } }> = ({ params: { id } }) => {
  const eventId = parseInt(id ?? '0', 10);
  const api = useApi();
  const storage = useStorage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [nextSessionIndex, setNextSessionIndex] = useState<number | ''>(1);
  const [script, setScript] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const i18n = useI18n();
  api.setEventId(eventId);
  usePageTitle(i18n._t('Predefined seating configuration'));

  const loadConfig = useCallback(() => {
    return api
      .getPrescriptedEventConfig(eventId)
      .then((conf) => {
        setScript(conf.prescript ?? '');
        setErrors(conf.errors);
        setNextSessionIndex(conf.nextSessionIndex);
      })
      .catch((err: Error) => {
        notifications.show({
          title: i18n._t('Error has occurred'),
          message: err.message,
          color: 'red',
        });
      });
  }, [eventId]);

  useEffect(() => {
    nprogress.reset();
    nprogress.start();
    setIsLoading(true);
    loadConfig().finally(() => {
      setIsLoading(false);
      nprogress.complete();
    });
  }, []);

  const updateScript = useCallback(() => {
    setIsSaving(true);
    setIsSaved(false);
    api
      .updatePrescriptedEventConfig(eventId, nextSessionIndex || 1, script)
      .then((r) => {
        if (r) {
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 5000);
          return loadConfig();
        } else {
          throw new Error(
            i18n._t('Failed to save event script: server error or network unreachable')
          );
        }
      })
      .catch((err: Error) => {
        notifications.show({
          title: i18n._t('Error has occurred'),
          message: err.message,
          color: 'red',
        });
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [eventId, nextSessionIndex, script]);

  if (!storage.getPersonId()) {
    return <Redirect to='/profile/login' />;
  }

  return (
    <Container>
      <LoadingOverlay visible={isLoading} overlayOpacity={1} />
      <Modal
        opened={opened}
        onClose={close}
        title={<Text weight='bold'>{i18n._t('Event script filling instruction')}</Text>}
        centered
      >
        {i18n._t(
          'Predefined seating is entered as list of tables, one table per row. New game session should be indicated as an empty line. Example:'
        )}
        <Space h='lg' />
        <Code block color='teal'>
          {scriptExample}
        </Code>
        <Space h='lg' />
        {i18n._t(
          'In this example, two tables play two games. Numbers in seating are called "Local IDs". They persist between games and are defined at Manage players page of the event.'
        )}
      </Modal>

      <NumberInput
        label={i18n._t('Next session index')}
        description={i18n._t(
          'This is the index of next session script (starting from 1). Each time new session starts, this value is increased automatically.'
        )}
        value={nextSessionIndex}
        onChange={setNextSessionIndex}
      />
      <Space h='xl' />
      <Group grow align='flex-start'>
        <Textarea
          placeholder={i18n._t('Please enter event script here')}
          label={
            <Group>
              <Text weight='bold'>{i18n._t('Event script')}</Text>{' '}
              <Button variant='subtle' onClick={open}>
                {i18n._t('Instructions')}
              </Button>
            </Group>
          }
          autosize
          minRows={2}
          value={script}
          onChange={(event) => setScript(event.currentTarget.value)}
        />
        <Box>
          <Text weight='bold'>
            {errors.length > 0 &&
              i18n._nt(['Found %1 error', 'Found %1 errors'], errors.length, [errors.length])}
            {errors.length === 0 && i18n._t('No errors found')}
          </Text>
          {errors.length > 0 && (
            <ul>
              {errors.map((e, idx) => (
                <li key={`er_${idx}`}>{e}</li>
              ))}
            </ul>
          )}
        </Box>
      </Group>
      <TopActionButton
        title={isSaved ? i18n._t('Script updated!') : i18n._t('Update script')}
        loading={isSaving}
        disabled={isLoading || isSaved}
        icon={isSaved ? <IconCircleCheck /> : <IconDeviceFloppy />}
        onClick={updateScript}
      />
    </Container>
  );
};
