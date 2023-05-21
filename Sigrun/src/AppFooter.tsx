import { Menu, Group, ActionIcon, Space, Container } from '@mantine/core';
import {
  IconArrowBarToUp,
  IconLanguageHiragana,
  IconMoonStars,
  IconSun,
} from '@tabler/icons-react';
import { FlagEn, FlagRu } from './helpers/flags';
import { useI18n } from './hooks/i18n';
import * as React from 'react';

interface AppFooterProps {
  dark: boolean;
  toggleColorScheme: () => void;
  saveLang: (lang: string) => void;
}

export function AppFooter({ dark, toggleColorScheme, saveLang }: AppFooterProps) {
  const i18n = useI18n();

  return (
    <>
      <Space h={16} />
      <Container>
        <Group position='apart'>
          <ActionIcon
            variant='filled'
            color='blue'
            onClick={() => window.scrollTo({ top: 0 })}
            title={i18n._t('Back to top')}
          >
            <IconArrowBarToUp size='1.1rem' />
          </ActionIcon>
          <Group position='right'>
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
