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
import { useEffect, useState } from 'react';
import { ctxValue } from '#/hooks/pageTitle';
import {
  ActionIcon,
  AppShell,
  Burger,
  ColorScheme,
  ColorSchemeProvider,
  Container,
  Group,
  Header,
  MantineProvider,
  MediaQuery,
  Menu,
  Navbar,
  Space,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { Navigation } from '#/Navigation';
import { authCtx } from '#/hooks/auth';
import { actionButtonCtx, actionButtonRef } from '#/hooks/actionButton';
import { useApi } from '#/hooks/api';
import { IconLanguageHiragana, IconMoonStars, IconSun } from '@tabler/icons-react';
import { useLocalStorage } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import { NavigationProgress } from '@mantine/nprogress';
import { useAnalytics } from '#/hooks/analytics';
import { useLocation } from 'wouter';
import { useI18n } from '#/hooks/i18n';
import { FlagEn, FlagRu } from '#/helpers/flags';
import { useStorage } from '#/hooks/storage';

let lastLocation = '';

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  // kludges. Dunno how to do better :[
  const [pageTitle, setPageTitle] = useState('');
  ctxValue.pageTitle = pageTitle;
  ctxValue.setPageTitle = setPageTitle;
  // /kludges

  const analytics = useAnalytics();
  const [location] = useLocation();
  if (lastLocation !== location) {
    analytics.trackView(location);
    lastLocation = location;
    if (process.env.NODE_ENV !== 'production') {
      console.log('Location change: ', lastLocation);
    }
  }

  const api = useApi();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setAuthLoading(true);
    api
      .quickAuthorize()
      .then((resp) => {
        setIsLoggedIn(resp);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  // Themes related
  const theme = useMantineTheme();
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: 'light',
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value ?? (colorScheme === 'dark' ? 'light' : 'dark'));
  const dark = colorScheme === 'dark';
  const i18n = useI18n();
  const storage = useStorage();

  // Small kludge to forcefully rerender after language change
  const [, updateState] = React.useState({});
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const saveLang = (lang: string) => {
    storage.setLang(lang);
    i18n.init(
      (locale) => {
        storage.setLang(locale);
        forceUpdate();
      },
      (err) => console.error(err)
    );
  };

  return (
    <actionButtonCtx.Provider value={actionButtonRef}>
      <authCtx.Provider value={{ isLoggedIn, setIsLoggedIn }}>
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
          <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{
              colorScheme,
              fontFamily: 'IBM Plex Sans, Noto Sans Wind, Sans, serif',
            }}
          >
            <NavigationProgress />
            <AppShell
              styles={{
                main: {
                  background: dark ? theme.colors.dark[8] : theme.colors.gray[0],
                },
              }}
              navbarOffsetBreakpoint='sm'
              navbar={
                <Navbar p='md' hiddenBreakpoint='sm' hidden={!opened} width={{ sm: 300, lg: 300 }}>
                  <Navigation loading={authLoading} onClick={() => setOpened(false)} />

                  <Group>
                    <ActionIcon
                      variant='outline'
                      color={dark ? 'yellow' : 'blue'}
                      onClick={() => toggleColorScheme()}
                      title={i18n._t('Toggle color scheme')}
                    >
                      {dark ? <IconSun size='1.1rem' /> : <IconMoonStars size='1.1rem' />}
                    </ActionIcon>
                    <Menu shadow='md' width={200}>
                      <Menu.Target>
                        <ActionIcon color='green' variant='outline' title={i18n._t('Language')}>
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
                </Navbar>
              }
              header={
                <Header height={{ base: 50, md: 70 }} p='md'>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'space-around',
                    }}
                  >
                    <MediaQuery largerThan='sm' styles={{ display: 'none' }}>
                      <Burger
                        opened={opened}
                        onClick={() => setOpened((o) => !o)}
                        size='sm'
                        color={theme.colors.gray[6]}
                        mr='xl'
                      />
                    </MediaQuery>
                    <Text style={{ flex: 1 }}>{/*Divider*/}</Text>
                    <div
                      style={{
                        marginTop: '5px',
                      }}
                      ref={actionButtonRef}
                    />
                  </div>
                </Header>
              }
            >
              <Container>
                <Title order={4}>{pageTitle}</Title>
                <Space h='xl' />
              </Container>
              {children}
              <Notifications autoClose={4000} />
            </AppShell>
          </MantineProvider>
        </ColorSchemeProvider>
      </authCtx.Provider>
    </actionButtonCtx.Provider>
  );
};
