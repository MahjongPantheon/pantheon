import { createStyles } from '@mantine/emotion';
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
import { FlagEn, FlagRu, FlagJa, FlagCn, FlagKo, FlagDe, FlagBe } from '../helpers/flags';
import { Language, supportedLanguages, languageNames } from '../i18n/languages';
import { env } from '../env';
import { useLanguage } from '../hooks/useLanguage';

const useStyles = createStyles((theme) => ({
  grid: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: theme.spacing.lg,
    '@media (max-width: 25em)': { gridTemplateColumns: '1fr', gap: theme.spacing.sm },
  },
}));

const flags = {
  en: FlagEn,
  ru: FlagRu,
  jp: FlagJa,
  cn: FlagCn,
  ko: FlagKo,
  de: FlagDe,
  be: FlagBe,
};

interface AppHeaderProps {
  dark: boolean;
  toggleColorScheme: () => void;
  saveLang: (lang: Language) => void;
}

export function AppFooter({ dark, toggleColorScheme, saveLang }: AppHeaderProps) {
  const { classes } = useStyles();
  const i18n = useI18n();
  const theme = useMantineTheme();
  const language = useLanguage();

  return (
    <SimpleGrid
      className={classes.grid}
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
            {i18n._t('Mobile assistant')}
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
            {i18n._t('Ratings and stats')}
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
            {i18n._t('Profile & admin panel')}
          </a>
        </List.Item>
      </List>
      <Stack align='flex-end' gap={0}>
        <Text size='xs'>
          {i18n._t('Mahjong Pantheon team')}, {new Date().getFullYear()}.
        </Text>
        <Group mt={0} gap={8} justify='flex-end'>
          {supportedLanguages.map((locale) => {
            const Flag = flags[locale];
            return (
              <ActionIcon
                key={locale}
                onClick={() => saveLang(locale)}
                title={languageNames[locale]}
                aria-label={languageNames[locale]}
                aria-pressed={locale === language}
                variant={locale === language ? 'filled' : 'subtle'}
              >
                <Flag width={20} />
              </ActionIcon>
            );
          })}
          <ActionIcon
            onClick={() => {
              toggleColorScheme();
            }}
            title={i18n._t('Toggle color scheme')}
            aria-label={i18n._t('Toggle color scheme')}
          >
            {dark ? <IconSun size={20} /> : <IconMoonStars size={20} />}
          </ActionIcon>
        </Group>
      </Stack>
    </SimpleGrid>
  );
}
