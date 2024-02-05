/*  Bragi: Pantheon landing pages
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

import {
  ActionIcon,
  Group,
  List,
  SimpleGrid,
  ThemeIcon,
  Text,
  useMantineTheme,
  Stack,
} from '@mantine/core';
import {
  IconDeviceMobile,
  IconGraph,
  IconMoonStars,
  IconSettings,
  IconSun,
} from '@tabler/icons-react';
import { useI18n } from '../hooks/i18n';
import * as React from 'react';
import { FlagEn, FlagRu } from '../helpers/flags';
import { env } from '../env';
import { useStorage } from '../hooks/storage';

interface AppHeaderProps {
  dark: boolean;
  toggleColorScheme: () => void;
  saveLang: (lang: string) => void;
}

export function AppFooter({ dark, toggleColorScheme, saveLang }: AppHeaderProps) {
  const i18n = useI18n();
  const theme = useMantineTheme();
  const storage = useStorage();

  return (
    <SimpleGrid
      cols={2}
      spacing='lg'
      breakpoints={[{ maxWidth: '25rem', cols: 1, spacing: 'sm' }]}
      style={{
        backgroundColor: dark ? theme.colors.gray[9] : theme.colors.gray[3],
        borderRadius: 4,
        marginTop: 48,
        padding: '8px',
        paddingBottom: '24px',
      }}
    >
      <List center size='xs' spacing={1}>
        <List.Item
          icon={
            <ThemeIcon color='green' size={16} radius='sm'>
              <IconDeviceMobile size={14} />
            </ThemeIcon>
          }
        >
          <a href={env.urls.tyr} target='_blank'>
            {storage.getLang() === 'ru' ? 'Мобильный ассистент' : 'Mobile assistant'}
          </a>
        </List.Item>
        <List.Item
          icon={
            <ThemeIcon color='blue' size={16} radius='sm'>
              <IconGraph size={14} />
            </ThemeIcon>
          }
        >
          <a href={env.urls.sigrun} target='_blank'>
            {storage.getLang() === 'ru' ? 'Рейтинги и статистика' : 'Ratings and stats'}
          </a>
        </List.Item>
        <List.Item
          icon={
            <ThemeIcon color='orange' size={16} radius='sm'>
              <IconSettings size={14} />
            </ThemeIcon>
          }
        >
          <a href={env.urls.forseti} target='_blank'>
            {storage.getLang() === 'ru' ? 'Профиль и админка' : 'Profile & admin panel'}
          </a>
        </List.Item>
      </List>
      <Stack align='flex-end' spacing={0}>
        <Text size='xs'>Mahjong Pantheon dream team, {new Date().getFullYear()}.</Text>
        <Group mt={0} spacing={16} position='right'>
          <ActionIcon
            onClick={() => {
              saveLang('en');
              window.location.reload();
            }}
            title={'In English'}
          >
            <FlagEn width={20} />
          </ActionIcon>
          <ActionIcon
            onClick={() => {
              saveLang('ru');
              window.location.reload();
            }}
            title={'По-русски'}
          >
            <FlagRu width={20} />
          </ActionIcon>
          <ActionIcon
            onClick={() => {
              toggleColorScheme();
            }}
            title={i18n._t('Toggle color scheme')}
          >
            {dark ? <IconSun size={20} /> : <IconMoonStars size={20} />}
          </ActionIcon>
        </Group>
      </Stack>
    </SimpleGrid>
  );
}
