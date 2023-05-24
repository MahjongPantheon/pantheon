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
            <Stack spacing={0}>
              <Anchor color='white' size='xs' href={`/event/${globals.data.eventId}`}>
                {i18n._t('Description')}
              </Anchor>
              <Anchor color='white' size='xs' href={`/event/${globals.data.eventId}/games`}>
                {i18n._t('Recent games')}
              </Anchor>
            </Stack>
            <Stack spacing={0}>
              <Anchor color='white' size='xs' href={`/event/${globals.data.eventId}/order/rating`}>
                {i18n._t('Rating table')}
              </Anchor>
              {globals.data.hasSeries && (
                <Anchor
                  color='white'
                  size='xs'
                  href={`/event/${globals.data.eventId}/seriesRating`}
                >
                  {i18n._t('Series rating')}
                </Anchor>
              )}
            </Stack>
            <Stack spacing={0}>
              {globals.data.type === EventType.EVENT_TYPE_TOURNAMENT && (
                <Anchor color='white' size='xs' href={`/event/${globals.data.eventId}/timer`}>
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
