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

import {
  AppShell,
  ColorScheme,
  ColorSchemeProvider,
  Footer,
  MantineProvider,
  useMantineTheme,
} from '@mantine/core';
import { AppHeader } from './components/AppHeader';
import { AnalyticsProvider, useAnalytics } from './hooks/analytics';
import { StorageProvider, useStorage } from './hooks/storage';
import { I18nProvider, useI18n } from './hooks/i18n';
import { ApiProvider } from './hooks/api';
import './App.css';
import { useCallback, useState, ReactNode, useEffect } from 'react';
import { Globals, globalsCtx } from './hooks/globals';
import { AppFooter } from './components/AppFooter';
import { NavigationProgress } from '@mantine/nprogress';
import { EmotionCache } from '@emotion/css';
import { Meta } from './components/Meta';

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

export function Layout({ children, cache }: { children: ReactNode; cache: EmotionCache }) {
  const storage = useStorage();
  const i18n = useI18n();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(themeToLocal(storage.getTheme()));

  const analytics = useAnalytics();
  useEffect(() => {
    const track = (e: any) => {
      analytics.trackView(e?.currentTarget?.location?.pathname);
    };
    window.addEventListener('popstate', track);
    window.addEventListener('pushState', track);
    window.addEventListener('replaceState', track);
  }, []);

  const toggleColorScheme = (value?: ColorScheme) => {
    const newValue = value ?? (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(newValue);
    storage.setTheme(themeFromLocal(newValue));
  };
  const theme = useMantineTheme();
  const dark = colorScheme === 'dark';

  const [data, setDataInt] = useState<Globals>({
    eventId: null,
    type: null,
    isTeam: false,
    isPrescripted: false,
    loading: false,
    ratingHidden: false,
    hasSeries: false,
    withChips: false,
    minGamesCount: 0,
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
        forceUpdate();
      },
      (err) => console.error(err)
    );
  };

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme,
        colors: {
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
        },
        fontFamily: 'IBM Plex Sans, Noto Sans Wind, Sans, serif',
      }}
      emotionCache={cache}
    >
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <AnalyticsProvider>
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
                    header={<AppHeader />}
                    footer={
                      <Footer
                        height={60}
                        bg={theme.primaryColor}
                        style={{ position: 'static', display: 'flex', alignItems: 'center' }}
                      >
                        <AppFooter
                          dark={dark}
                          toggleColorScheme={toggleColorScheme}
                          saveLang={saveLang}
                        />
                      </Footer>
                    }
                    styles={{
                      main: {
                        minHeight: 'calc(100vh - var(--mantine-footer-height, 0px))',
                        background: dark ? theme.colors.dark[8] : theme.colors.gray[0],
                      },
                    }}
                  >
                    {children}
                  </AppShell>
                </ApiProvider>
              </I18nProvider>
            </StorageProvider>
          </globalsCtx.Provider>
        </AnalyticsProvider>
      </ColorSchemeProvider>
    </MantineProvider>
  );
}
