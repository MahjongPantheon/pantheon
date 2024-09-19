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
  MantineProvider,
  Navbar,
  ScrollArea,
  Space,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { AppHeader } from './components/AppHeader';
import { authCtx } from './hooks/auth';
import { modalsCtx } from './hooks/modals';
import { actionButtonCtx, actionButtonRef } from './hooks/actionButton';
import { useApi } from './hooks/api';
import { Notifications } from '@mantine/notifications';
import { NavigationProgress } from '@mantine/nprogress';
import { useAnalytics } from './hooks/analytics';
import { useI18n } from './hooks/i18n';
import { useStorage } from './hooks/storage';
import favicon from './forsetiico.png';
import { AppFooter } from './components/AppFooter';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { StopEventModal } from './components/StopEventModal';
import { MainMenu } from './components/MainMenu';
import { useRoute } from 'wouter';
import { Event } from './clients/proto/atoms.pb';
import { fontLoader } from './helpers/fontLoader';
import { RecalcAchievementsModal } from './components/RecalcAchievementsModal';
import { RecalcPlayerStatsModal } from './components/RecalcPlayerStatsModal';

// See also Tyr/app/services/themes.ts - we use names from there to sync themes
const themeToLocal: (theme?: string | null) => ColorScheme = (theme) => {
  return ({
    day: 'light',
    night: 'dark',
  }[theme ?? 'day'] ?? 'light') as ColorScheme;
};
const themeFromLocal: (theme?: ColorScheme | null) => string = (theme) => {
  return (
    {
      light: 'day',
      dark: 'night',
    }[theme ?? 'light'] ?? 'day'
  );
};
const curDate = new Date();
const haveNySpecs =
  (curDate.getMonth() === 11 && curDate.getDate() > 20) ||
  (curDate.getMonth() === 0 && curDate.getDate() < 10);

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  // kludges. Dunno how to do better :[
  const [pageTitle, setPageTitle] = useState('');
  ctxValue.pageTitle = pageTitle;
  ctxValue.setPageTitle = setPageTitle;
  // /kludges

  const [stopEventModalShown, { close: hideStopEventModal, open: showStopEventModal }] =
    useDisclosure(false);
  const [stopEventModalData, setStopEventModalData] = useState({ id: 0, title: '' });
  const [
    recalcAchievementsModalShown,
    { close: hideRecalcAchievementsModal, open: showRecalcAchievementsModal },
  ] = useDisclosure(false);
  const [recalcAchievementsModalData, setRecalcAchievementsModalData] = useState({
    id: 0,
    title: '',
  });
  const [
    recalcPlayerStatsModalShown,
    { close: hideRecalcPlayerStatsModal, open: showRecalcPlayerStatsModal },
  ] = useDisclosure(false);
  const [recalcPlayerStatsModalData, setRecalcPlayerStatsModalData] = useState({
    id: 0,
    title: '',
  });

  const storage = useStorage();
  const api = useApi();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [colorScheme, setColorScheme] = useState<ColorScheme>(themeToLocal(storage.getTheme()));
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

  const toggleColorScheme = (value?: ColorScheme) => {
    const newValue = value ?? (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(newValue);
    storage.setTheme(themeFromLocal(newValue));
  };
  const toggleDimmed = () => {
    setUseDimmed(!useDimmed);
    storage.setDimmed(!useDimmed);
  };
  const theme = useMantineTheme();
  const dark = colorScheme === 'dark';

  const i18n = useI18n();
  const veryLargeScreen = useMediaQuery('(min-width: 1024px)');

  // Menu related logic
  const [match, params] = useRoute('/event/:id/:subpath');
  const [matchEdit, paramsEdit] = useRoute('/ownedEvents/edit/:id');
  const id = (match ? params : paramsEdit)?.id;
  const personId = storage.getPersonId();
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [eventData, setEventData] = useState<Event | null>(null);

  useEffect(() => {
    api.getSuperadminFlag(personId!).then((flag) => setIsSuperadmin(flag));

    if (!match && !matchEdit) {
      return;
    }
    api.getEventsById([parseInt(id ?? '0', 10)]).then((e) => {
      setEventData(e[0]);
    });
  }, [match, id, personId]);

  const title =
    (eventData?.title?.length ?? 0) > 32
      ? `${eventData?.title?.slice(0, 32)}...`
      : eventData?.title;
  // /Menu related logic

  // Small kludge to forcefully rerender after language change
  const [, updateState] = React.useState({});
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const saveLang = (lang: string) => {
    storage.setLang(lang);
    i18n.init(
      (locale) => {
        storage.setLang(locale);
        fontLoader(locale);
        forceUpdate();
      },
      (err) => console.error(err)
    );
  };

  return (
    <actionButtonCtx.Provider value={actionButtonRef}>
      <authCtx.Provider value={{ isLoggedIn, setIsLoggedIn, isSuperadmin, setIsSuperadmin }}>
        <modalsCtx.Provider
          value={{
            showStopEventModal,
            setStopEventModalData,
            stopEventModalData,
            stopEventModalShown,
            hideStopEventModal,

            showRecalcAchievementsModal,
            setRecalcAchievementsModalData,
            recalcAchievementsModalData,
            recalcAchievementsModalShown,
            hideRecalcAchievementsModal,

            showRecalcPlayerStatsModal,
            setRecalcPlayerStatsModalData,
            recalcPlayerStatsModalData,
            recalcPlayerStatsModalShown,
            hideRecalcPlayerStatsModal,
          }}
        >
          <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <HelmetProvider>
              <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                  colorScheme,
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
                    : undefined,
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
                  header={
                    <AppHeader
                      title={title}
                      eventData={eventData}
                      dark={dark}
                      toggleColorScheme={toggleColorScheme}
                      toggleDimmed={toggleDimmed}
                      saveLang={saveLang}
                    />
                  }
                  navbar={
                    veryLargeScreen ? (
                      <Navbar width={{ base: 350 }} p='xs'>
                        <Navbar.Section grow component={ScrollArea} mx='-xs' px='xs'>
                          <MainMenu
                            title={title}
                            dark={dark}
                            toggleColorScheme={toggleColorScheme}
                            toggleDimmed={toggleDimmed}
                            saveLang={saveLang}
                            eventData={eventData}
                          />
                        </Navbar.Section>
                      </Navbar>
                    ) : undefined
                  }
                  classNames={{
                    main: haveNySpecs ? 'newyear' : '',
                  }}
                  footer={<AppFooter dark={dark} />}
                >
                  <Container>
                    <Title order={4}>{pageTitle}</Title>
                    <Space h='xl' />
                  </Container>
                  {children}
                  <StopEventModal />
                  <RecalcAchievementsModal />
                  <RecalcPlayerStatsModal />
                  <Notifications autoClose={4000} />
                </AppShell>
              </MantineProvider>
            </HelmetProvider>
          </ColorSchemeProvider>
        </modalsCtx.Provider>
      </authCtx.Provider>
    </actionButtonCtx.Provider>
  );
};
