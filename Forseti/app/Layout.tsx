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
import { ctxValue } from './hooks/pageTitle';
import {
  AppShell,
  ColorScheme,
  ColorSchemeProvider,
  Container,
  Footer,
  MantineProvider,
  Space,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { Helmet } from 'react-helmet';
import { Navigation } from './Navigation';
import { authCtx } from './hooks/auth';
import { actionButtonCtx, actionButtonRef } from './hooks/actionButton';
import { useApi } from './hooks/api';
import { useLocalStorage } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import { NavigationProgress } from '@mantine/nprogress';
import { useAnalytics } from './hooks/analytics';
import { useI18n } from './hooks/i18n';
import { useStorage } from './hooks/storage';
import favicon from './forsetiico.png';
import { AppFooter } from './AppFooter';

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  // kludges. Dunno how to do better :[
  const [pageTitle, setPageTitle] = useState('');
  ctxValue.pageTitle = pageTitle;
  ctxValue.setPageTitle = setPageTitle;
  // /kludges

  const api = useApi();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const analytics = useAnalytics();
  useEffect(() => {
    const track = (e: any) => {
      analytics.trackView(e?.currentTarget?.location?.pathname);
    };
    window.addEventListener('popstate', track);
    window.addEventListener('pushState', track);
    window.addEventListener('replaceState', track);
  }, []);

  useEffect(() => {
    api.quickAuthorize().then((resp) => {
      setIsLoggedIn(resp);
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
            <Helmet>
              <meta charSet='utf-8' />
              <title>Forseti: game & profile manager</title>
              <base href='/' />
              <meta
                name='viewport'
                content='width=device-width, initial-scale=1, maximum-scale=1'
              />
              <link rel='icon' type='image/png' href={favicon} />
            </Helmet>
            <NavigationProgress />
            <AppShell
              styles={{
                main: {
                  background: dark ? theme.colors.dark[8] : theme.colors.gray[0],
                },
              }}
              header={<Navigation isLoggedIn={isLoggedIn} />}
              footer={
                <Footer
                  height={60}
                  bg={theme.primaryColor}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <AppFooter
                    dark={dark}
                    toggleColorScheme={toggleColorScheme}
                    saveLang={saveLang}
                  />
                </Footer>
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
