/*  Sigrun: rating tables and statistics frontend
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

import { Menu, Group, ActionIcon, Container, Anchor, Stack } from '@mantine/core';
import {
  IconArrowBarToUp,
  IconLanguageHiragana,
  IconMoonStars,
  IconSun,
} from '@tabler/icons-react';
import { FlagEn, FlagRu } from '../helpers/flags';
import { useI18n } from '../hooks/i18n';
import * as React from 'react';
import { useContext } from 'react';
import { globalsCtx } from '../hooks/globals';
import { useMediaQuery } from '@mantine/hooks';
import { EventType } from '../clients/proto/atoms.pb';

interface AppFooterProps {
  dark: boolean;
  toggleColorScheme: () => void;
  saveLang: (lang: string) => void;
}

export function AppFooter({ dark, toggleColorScheme, saveLang }: AppFooterProps) {
  const i18n = useI18n();
  const largeScreen = useMediaQuery('(min-width: 640px)');
  const globals = useContext(globalsCtx);

  return (
    <>
      <Container style={{ flex: 1 }}>
        <Group position='apart'>
          <ActionIcon
            variant='filled'
            color='blue'
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title={i18n._t('Back to top')}
            mt={0}
          >
            <IconArrowBarToUp size='1.1rem' />
          </ActionIcon>
          <Group style={{ display: largeScreen ? 'inherit' : 'none' }} align='flex-start'>
            {globals.data.eventId && (
              <Stack spacing={0}>
                <Anchor
                  color='white'
                  size='xs'
                  href={`/event/${globals.data.eventId?.join('.')}/info`}
                >
                  {i18n._t('Description')}
                </Anchor>
                {globals.data.eventId?.length === 1 && (
                  <Anchor
                    color='white'
                    size='xs'
                    href={`/event/${globals.data.eventId?.join('.')}/rules`}
                  >
                    {i18n._t('Rules overview')}
                  </Anchor>
                )}
              </Stack>
            )}
            {globals.data.eventId && (
              <Stack spacing={0}>
                <Anchor
                  color='white'
                  size='xs'
                  href={`/event/${globals.data.eventId?.join('.')}/games`}
                >
                  {i18n._t('Recent games')}
                </Anchor>
                <Anchor
                  color='white'
                  size='xs'
                  href={`/event/${globals.data.eventId?.join('.')}/order/rating`}
                >
                  {i18n._t('Rating table')}
                </Anchor>
              </Stack>
            )}
            <Stack spacing={0}>
              {globals.data.eventId?.length === 1 && (
                <Anchor
                  color='white'
                  size='xs'
                  href={`/event/${globals.data.eventId.join('.')}/achievements`}
                >
                  {i18n._t('Achievements')}
                </Anchor>
              )}
              {globals.data.hasSeries && globals.data.eventId?.length === 1 && (
                <Anchor
                  color='white'
                  size='xs'
                  href={`/event/${globals.data.eventId.join('.')}/seriesRating`}
                >
                  {i18n._t('Series rating')}
                </Anchor>
              )}
            </Stack>
            <Stack spacing={0}>
              {globals.data.type === EventType.EVENT_TYPE_TOURNAMENT &&
                globals.data.eventId?.length === 1 && (
                  <Anchor
                    color='white'
                    size='xs'
                    href={`/event/${globals.data.eventId.join('.')}/timer`}
                  >
                    {i18n._t('Timer & seating')}
                  </Anchor>
                )}
            </Stack>
          </Group>
          <Group position='right' mt={0}>
            <ActionIcon
              variant='filled'
              color={dark ? 'grape' : 'indigo'}
              onClick={() => toggleColorScheme()}
              title={i18n._t('Toggle color scheme')}
            >
              {dark ? <IconSun size='1.1rem' /> : <IconMoonStars size='1.1rem' />}
            </ActionIcon>
            <Menu shadow='md' width={200}>
              <Menu.Target>
                <ActionIcon color='green' variant='filled' title={i18n._t('Language')}>
                  <IconLanguageHiragana size='1.1rem' />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => saveLang('en')} icon={<FlagEn width={24} />}>
                  en
                </Menu.Item>
                <Menu.Item onClick={() => saveLang('ru')} icon={<FlagRu width={24} />}>
                  ru
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Container>
    </>
  );
}
