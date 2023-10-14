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
import { AppShell, Container, createTheme, MantineProvider, Space, Title } from '@mantine/core';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Navigation } from './Navigation';
import { authCtx } from './hooks/auth';
import { actionButtonCtx, actionButtonRef } from './hooks/actionButton';
import { useApi } from './hooks/api';
import { Notifications } from '@mantine/notifications';
import { NavigationProgress } from '@mantine/nprogress';
import { useAnalytics } from './hooks/analytics';
import { useI18n } from './hooks/i18n';
import { useStorage } from './hooks/storage';
import favicon from './forsetiico.png';
import { AppFooter } from './AppFooter';
import { localStorageColorSchemeManager } from './helpers/colorSchemeManager';
import '@mantine/core/styles.css';

const csm = localStorageColorSchemeManager();

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  // kludges. Dunno how to do better :[
  const [pageTitle, setPageTitle] = useState('');
  ctxValue.pageTitle = pageTitle;
  ctxValue.setPageTitle = setPageTitle;
  // /kludges

  const storage = useStorage();
  const api = useApi();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [useDimmed, setUseDimmed] = useState<boolean>(storage.getDimmed());

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

  const toggleDimmed = () => {
    setUseDimmed(!useDimmed);
    storage.setDimmed(!useDimmed);
  };
  const dark = csm.get('light') === 'dark';
  const i18n = useI18n();

  const theme = createTheme({
    colors: useDimmed
      ? {
          red: [
            '#F6EEEE',
            '#E6D0D0',
            '#D7B2B2',
            '#C79494',
            '#B77676',
            '#A75858',
            '#864646',
            '#643535',
            '#432323',
            '#211212',
          ],
          orange: [
            '#F9F1EB',
            '#EFD8C7',
            '#E6BEA3',
            '#DCA57F',
            '#D28B5B',
            '#C87237',
            '#A05B2C',
            '#784421',
            '#502E16',
            '#28170B',
          ],
          yellow: [
            '#F9F5EB',
            '#EEE2C8',
            '#E4CFA5',
            '#D9BC82',
            '#CEAA5E',
            '#C4973B',
            '#9D792F',
            '#755B24',
            '#4E3C18',
            '#271E0C',
          ],
          green: [
            '#EEF6F2',
            '#D0E6DB',
            '#B3D6C4',
            '#95C6AD',
            '#77B695',
            '#59A67E',
            '#478565',
            '#35644C',
            '#244233',
            '#122119',
          ],
          lime: [
            '#F1F6EE',
            '#D7E6D0',
            '#BDD6B3',
            '#A4C695',
            '#8AB677',
            '#70A659',
            '#5A8547',
            '#436435',
            '#2D4224',
            '#162112',
          ],
          teal: [
            '#EFF6F6',
            '#D1E5E5',
            '#B4D5D4',
            '#97C4C3',
            '#79B4B2',
            '#5CA3A1',
            '#498381',
            '#376260',
            '#254140',
            '#122120',
          ],
          cyan: [
            '#EFF5F5',
            '#D3E2E4',
            '#B6CFD3',
            '#9ABCC1',
            '#7DA9B0',
            '#61969E',
            '#4D787F',
            '#3A5A5F',
            '#273C3F',
            '#131E20',
          ],
          blue: [
            '#EDF2F7',
            '#CEDCE9',
            '#AEC5DA',
            '#8FAECC',
            '#6F97BE',
            '#5081AF',
            '#40678C',
            '#304D69',
            '#203346',
            '#101A23',
          ],
          purple: [
            '#F1F0F5',
            '#D9D4E2',
            '#C0B9D0',
            '#A79DBD',
            '#8F82AB',
            '#766699',
            '#5E527A',
            '#473D5C',
            '#2F293D',
            '#18141F',
          ],
          grape: [
            '#F5EDF7',
            '#E2CDEA',
            '#CFACDC',
            '#BC8CCF',
            '#AA6CC1',
            '#974BB4',
            '#793C90',
            '#5B2D6C',
            '#3C1E48',
            '#1E0F24',
          ],
          pink: [
            '#F7EDF2',
            '#EACDDC',
            '#DCACC5',
            '#CF8CAE',
            '#C16C97',
            '#B44B81',
            '#903C67',
            '#6C2D4D',
            '#481E33',
            '#240F1A',
          ],
        }
      : {},
    components: {
      AppShell: AppShell.extend({
        styles: {
          main: {
            background: dark ? '#141517' : '#f8f9fa',
          },
        },
      }),
    },
    fontFamily: 'IBM Plex Sans, Noto Sans Wind, Sans, serif',
  });

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
        <HelmetProvider>
          <MantineProvider colorSchemeManager={csm} theme={theme}>
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
            <AppShell>
              <AppShell.Header>
                <Navigation
                  dark={dark}
                  isLoggedIn={isLoggedIn}
                  toggleColorScheme={() => csm.set(csm.get('light') === 'dark' ? 'light' : 'dark')}
                  toggleDimmed={toggleDimmed}
                  saveLang={saveLang}
                />
              </AppShell.Header>
              <AppShell.Main>
                <Container>
                  <Title order={4}>{pageTitle}</Title>
                  <Space h='xl' />
                </Container>
                {children}
                <Notifications autoClose={4000} />
              </AppShell.Main>
              <AppFooter dark={dark} />
            </AppShell>
          </MantineProvider>
        </HelmetProvider>
      </authCtx.Provider>
    </actionButtonCtx.Provider>
  );
};
