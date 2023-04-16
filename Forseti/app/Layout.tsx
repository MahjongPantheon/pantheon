import * as React from 'react';
import { useEffect, useState } from 'react';
import { ctxValue } from '#/hooks/pageTitle';
import {
  ActionIcon,
  AppShell,
  Burger,
  ColorScheme,
  ColorSchemeProvider,
  Header,
  MantineProvider,
  MediaQuery,
  Navbar,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { Navigation } from '#/Navigation';
import { authCtx } from '#/hooks/auth';
import { actionButtonCtx, actionButtonRef } from '#/hooks/actionButton';
import { useApi } from '#/hooks/api';
import { IconMoonStars, IconSun } from '@tabler/icons-react';
import { useLocalStorage } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import { NavigationProgress } from '@mantine/nprogress';
import { useAnalytics } from '#/hooks/analytics';
import { useLocation } from 'wouter';
import { environment } from '#config';

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
    if (!environment.production) {
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
                <Navbar p='md' hiddenBreakpoint='sm' hidden={!opened} width={{ sm: 200, lg: 300 }}>
                  <Navigation loading={authLoading} onClick={() => setOpened(false)} />

                  <ActionIcon
                    variant='outline'
                    color={dark ? 'yellow' : 'blue'}
                    onClick={() => toggleColorScheme()}
                    title='Toggle color scheme'
                  >
                    {dark ? <IconSun size='1.1rem' /> : <IconMoonStars size='1.1rem' />}
                  </ActionIcon>
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
                    <Text>{pageTitle}</Text>
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
              {children}
              <Notifications autoClose={4000} />
            </AppShell>
          </MantineProvider>
        </ColorSchemeProvider>
      </authCtx.Provider>
    </actionButtonCtx.Provider>
  );
};
