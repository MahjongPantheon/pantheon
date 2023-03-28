import * as React from 'react';
import { useEffect, useState } from 'react';
import { ctxValue } from '#/hooks/pageTitle';
import { AppShell, Center, Header, MantineProvider, Text, useMantineTheme } from '@mantine/core';
import { MainMenu } from '#/MainMenu';
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
  useEffect(() => {
    api.quickAuthorize().then((resp) => {
      authHook.setIsLoggedIn(resp);
    });
  }, []);

  const theme = useMantineTheme();

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
        asideOffsetBreakpoint='sm'
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
              <Center style={{ flex: 1 }}>
                <Text>Forseti :: {pageTitle}</Text>
              </Center>
              <MainMenu />
            </div>
          </Header>
        }
      >
        {children}
      </AppShell>
    </MantineProvider>
  );
};
