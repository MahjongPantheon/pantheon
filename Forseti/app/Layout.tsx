import * as React from 'react';
import { useState } from 'react';
import { ctxValue } from '#/hooks/pageTitle';
import { AppShell, Header, MantineProvider, Text, useMantineTheme } from '@mantine/core';
import { MainMenu } from '#/MainMenu';

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [pageTitle, setPageTitle] = useState('');
  ctxValue.pageTitle = pageTitle; // kludge. Dunno how to do better :[
  ctxValue.setPageTitle = setPageTitle;
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
                justifyContent: 'space-between',
              }}
            >
              <Text>Forseti :: {pageTitle}</Text>
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
