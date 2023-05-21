import {
  AppShell,
  ColorScheme,
  ColorSchemeProvider,
  Footer,
  MantineProvider,
  useMantineTheme,
} from '@mantine/core';
import { AppHeader } from './AppHeader';
import { AnalyticsProvider } from './hooks/analytics';
import { StorageProvider, useStorage } from './hooks/storage';
import { I18nProvider, useI18n } from './hooks/i18n';
import { ApiProvider } from './hooks/api';
import { StorageStrategy } from '../../Common/storage';
import './App.css';
import { useLocalStorage } from '@mantine/hooks';
import { useCallback, useState, ReactNode } from 'react';
import { globalsCtx } from './hooks/globals';
import { AppFooter } from './AppFooter';

export function Layout({
  children,
  storageStrategy,
}: {
  children: ReactNode;
  storageStrategy: StorageStrategy;
}) {
  const theme = useMantineTheme();
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: 'light',
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value ?? (colorScheme === 'dark' ? 'light' : 'dark'));

  const storage = useStorage();
  const i18n = useI18n();
  const dark = colorScheme === 'dark';

  const [eventId, setEventId] = useState<number | null>(null);

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
        fontFamily: 'IBM Plex Sans, Noto Sans Wind, Sans, serif',
      }}
    >
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <AnalyticsProvider>
          <globalsCtx.Provider value={{ eventId, setEventId }}>
            <StorageProvider strategy={storageStrategy}>
              <I18nProvider>
                <ApiProvider>
                  <AppShell
                    padding='md'
                    header={<AppHeader />}
                    footer={
                      <Footer
                        height={60}
                        bg={theme.primaryColor}
                        fixed={false}
                        style={{ position: 'static' }}
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
