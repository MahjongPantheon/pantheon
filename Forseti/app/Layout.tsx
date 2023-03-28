import * as React from 'react';
import { useEffect, useState } from 'react';
import { ctxValue } from '#/hooks/pageTitle';
import {
  AppShell,
  Burger,
  Center,
  Header,
  MantineProvider,
  MediaQuery,
  Navbar,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { Navigation } from '#/Navigation';
import { auth, useAuth } from '#/hooks/auth';
import { useApi } from '#/hooks/api';

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  // kludges. Dunno how to do better :[
  const [pageTitle, setPageTitle] = useState('');
  ctxValue.pageTitle = pageTitle;
  ctxValue.setPageTitle = setPageTitle;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  auth.isLoggedIn = isLoggedIn;
  auth.setIsLoggedIn = setIsLoggedIn;
  // /kludges

  const api = useApi();
  const authHook = useAuth();
  const [authLoading, setAuthLoading] = useState(true);
  useEffect(() => {
    setAuthLoading(true);
    api
      .quickAuthorize()
      .then((resp) => {
        authHook.setIsLoggedIn(resp);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  return (
    <MantineProvider
      theme={{
        fontFamily: 'IBM Plex Sans, Noto Sans Wind, Sans, serif',
      }}
    >
      <AppShell
        styles={{
          main: {
            background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
          },
        }}
        navbarOffsetBreakpoint='sm'
        navbar={
          <Navbar p='md' hiddenBreakpoint='sm' hidden={!opened} width={{ sm: 200, lg: 300 }}>
            <Navigation loading={authLoading} onClick={() => setOpened(false)} />
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
              <Center style={{ flex: 1 }}>
                <Text>Forseti :: {pageTitle}</Text>
              </Center>
            </div>
          </Header>
        }
      >
        {children}
      </AppShell>
    </MantineProvider>
  );
};
