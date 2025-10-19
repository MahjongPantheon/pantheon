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

import { AppShell, MantineProvider, ScrollArea, createTheme } from '@mantine/core';
import { MantineEmotionProvider } from '@mantine/emotion';
import { Main } from 'Main';
import { AppHeader } from './components/AppHeader';
import { AnalyticsProvider, useAnalytics } from './hooks/analytics';
import { StorageProvider, useStorage } from './hooks/storage';
import { authCtx } from './hooks/auth';
import { modalsCtx } from './hooks/modals';
import { I18nProvider, useI18n } from './hooks/i18n';
import { ApiProvider, useApi } from './hooks/api';
import { useCallback, useState, ReactNode, useEffect } from 'react';
import { Globals, globalsCtx } from './hooks/globals';
import { AppFooter } from './components/AppFooter';
import { NavigationProgress } from '@mantine/nprogress';
import { Meta } from './components/Meta';
import { useIsomorphicState } from './hooks/useIsomorphicState';
import { PersonEx, PlatformType } from 'tsclients/proto/atoms.pb';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { MainMenu } from './components/MainMenu';
import { AddOnlineReplayModal } from './components/AddOnlineReplayModal';
import { useRoute } from 'wouter';
import { fontLoader } from './helpers/fontLoader';
import { getThemeOptions } from 'helpers/theme';
import { colorSchemeManager } from 'helpers/colorSchemeManager';
import '@mantine/core/styles.css';
import './App.css';

const curDate = new Date();
const haveNySpecs =
  (curDate.getMonth() === 11 && curDate.getDate() > 20) ||
  (curDate.getMonth() === 0 && curDate.getDate() < 10);

export function Layout({ children }: { children: ReactNode }) {
  const storage = useStorage();
  const i18n = useI18n();
  const [useDimmed, setUseDimmed] = useState<boolean>(storage.getDimmed());
  const [onlineModalShown, { open: showOnlineModal, close: hideOnlineModal }] =
    useDisclosure(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [userInfo, setUserInfo] = useState<PersonEx | null>(null);
  const [ownEvents, setOwnEvents] = useState<number[]>([]);
  const [personId] = useState(storage.getPersonId());
  const api = useApi();

  const analytics = useAnalytics();
  useEffect(() => {
    const track = (e: any) => {
      analytics.trackView(e?.currentTarget?.location?.pathname);
    };
    window.addEventListener('popstate', track);
    window.addEventListener('pushState', track);
    window.addEventListener('replaceState', track);
  }, []);

  const [authVals] = useIsomorphicState<
    [boolean, boolean, PersonEx | null, number[]],
    [boolean, boolean, PersonEx | null, number[]],
    Error
  >(
    [false, false, null, []],
    'Global_auth_' + (personId ?? '').toString(),
    () => {
      if (!personId) {
        return Promise.resolve([false, false, null, []]);
      }
      return Promise.allSettled([
        api.quickAuthorize(),
        api.getSuperadminFlag(personId ?? undefined),
        api.getPersonalInfo(personId ?? undefined),
        api.getOwnedEventIds(personId ?? undefined),
      ]).then(([authdata, superadmin, info, ownedEvents]) => [
        authdata.status === 'fulfilled' ? authdata.value : false,
        superadmin.status === 'fulfilled' ? superadmin.value : false,
        info.status === 'fulfilled' ? info.value : null,
        ownedEvents.status === 'fulfilled' ? ownedEvents.value : [],
      ]);
    },
    [personId]
  );

  const defaultTheme = createTheme(getThemeOptions(false));
  const dimmedTheme = createTheme(getThemeOptions(true));

  useEffect(() => {
    setIsLoggedIn(authVals?.[0] ?? false);
    setIsSuperadmin(authVals?.[1] ?? false);
    setUserInfo(authVals?.[2] ?? null);
    setOwnEvents(authVals?.[3] ?? []);
  }, [authVals]);

  const toggleDimmed = () => {
    setUseDimmed(!useDimmed);
    storage.setDimmed(!useDimmed);
  };

  // it's better to hide menu item labels for timer page on wide screen
  const [matchTimerPage] = useRoute('/event/:eventId/timer');
  const veryLargeScreen = useMediaQuery('(min-width: 1024px)');
  const showLabels = !(matchTimerPage && veryLargeScreen);

  const [data, setDataInt] = useState<Globals>({
    eventId: null,
    type: null,
    isTeam: false,
    isPrescripted: false,
    loading: false,
    ratingHidden: false,
    achievementsHidden: false,
    hasSeries: false,
    withChips: false,
    minGamesCount: 0,
    platformType: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
    allowManualAddReplay: false,
  });
  const setData = (newData: Partial<Globals>) => {
    setDataInt((old) => ({ ...old, ...newData }));
  };

  // Small kludge to forcefully rerender after language change
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);
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
    <MantineProvider
      theme={useDimmed ? dimmedTheme : defaultTheme}
      colorSchemeManager={colorSchemeManager(storage)}
    >
      <MantineEmotionProvider>
        <AnalyticsProvider>
          <modalsCtx.Provider value={{ onlineModalShown, showOnlineModal, hideOnlineModal }}>
            <authCtx.Provider
              value={{
                isLoggedIn,
                setIsLoggedIn,
                isSuperadmin,
                setIsSuperadmin,
                userInfo,
                setUserInfo,
                ownEvents,
                setOwnEvents,
              }}
            >
              <globalsCtx.Provider value={{ data, setData }}>
                <StorageProvider>
                  <I18nProvider>
                    <ApiProvider>
                      <Meta
                        title={i18n._t('Sigrun: riichi mahjong ratings and statistics')}
                        description={i18n._t(
                          'Sigrun is the statistics viewer for riichi mahjong club games and tournaments powered by Mahjong Pantheon system. It provides game logs, player statistics with graphs, rating tables and achievements list.'
                        )}
                      />
                      <NavigationProgress color='green' zIndex={10100} />
                      <AppShell
                        padding='md'
                        header={{ height: 44 }}
                        navbar={{
                          width: showLabels ? 350 : 80,
                          breakpoint: 'md',
                        }}
                        footer={{
                          height: veryLargeScreen ? 0 : 60,
                        }}
                        classNames={{
                          main: haveNySpecs ? 'newyear' : '',
                        }}
                      >
                        <AppHeader
                          isLoggedIn={isLoggedIn}
                          saveLang={saveLang}
                          toggleDimmed={toggleDimmed}
                        />

                        {veryLargeScreen ? (
                          <AppShell.Navbar p='xs'>
                            <ScrollArea scrollbars='y'>
                              <MainMenu
                                isLoggedIn={isLoggedIn}
                                saveLang={saveLang}
                                toggleDimmed={toggleDimmed}
                                showLabels={showLabels}
                              />
                            </ScrollArea>
                          </AppShell.Navbar>
                        ) : undefined}

                        <Main children={children}></Main>

                        {veryLargeScreen ? undefined : (
                          <AppShell.Footer style={{ display: 'flex', alignItems: 'center' }}>
                            <AppFooter />
                          </AppShell.Footer>
                        )}

                        <AddOnlineReplayModal />
                      </AppShell>
                    </ApiProvider>
                  </I18nProvider>
                </StorageProvider>
              </globalsCtx.Provider>
            </authCtx.Provider>
          </modalsCtx.Provider>
        </AnalyticsProvider>
      </MantineEmotionProvider>
    </MantineProvider>
  );
}
