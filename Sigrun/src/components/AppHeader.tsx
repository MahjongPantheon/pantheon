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

import { ActionIcon, Button, Container, createStyles, Drawer, Group, Header } from '@mantine/core';
import { IconList } from '@tabler/icons-react';
import { useI18n } from '../hooks/i18n';
import * as React from 'react';
import { useContext } from 'react';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { authCtx } from '../hooks/auth';
import { MainMenu } from './MainMenu';

const useStyles = createStyles(() => ({
  header: {
    backgroundColor: '#617193',
    borderBottom: 0,
    zIndex: 10000,
  },
  inner: {
    height: '44px',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  userTitle: {
    display: 'inline-flex',
    color: 'white',
    height: '100%',
    alignItems: 'center',
  },
}));

interface AppHeaderProps {
  dark: boolean;
  isLoggedIn: boolean;
  toggleColorScheme: () => void;
  toggleDimmed: () => void;
  saveLang: (lang: string) => void;
}

export function AppHeader({
  dark,
  isLoggedIn,
  toggleColorScheme,
  toggleDimmed,
  saveLang,
}: AppHeaderProps) {
  const { classes } = useStyles();
  const i18n = useI18n();
  const auth = useContext(authCtx);
  const [menuOpened, { open: openMenu, close: closeMenu }] = useDisclosure(false);
  const largeScreen = useMediaQuery('(min-width: 640px)');
  const veryLargeScreen = useMediaQuery('(min-width: 1024px)');

  return (
    <Header height={44} className={classes.header} mb={120}>
      {!veryLargeScreen && (
        <Drawer
          size='sm'
          opened={menuOpened}
          closeOnClickOutside={true}
          closeOnEscape={true}
          withCloseButton={false}
          lockScroll={true}
          onClose={closeMenu}
          withOverlay={true}
          overlayProps={{ opacity: 0.5, blur: 4 }}
          transitionProps={{ transition: 'slide-right', duration: 150, timingFunction: 'linear' }}
          style={{ zIndex: 10000, position: 'fixed' }}
          styles={{ body: { height: 'calc(100% - 68px)', paddingTop: 0 } }}
        >
          <Drawer.CloseButton
            size='xl'
            pos='absolute'
            style={{ right: 0, backgroundColor: dark ? '#1a1b1e' : '#fff' }}
          />
          <MainMenu
            closeMenu={closeMenu}
            isLoggedIn={isLoggedIn}
            saveLang={saveLang}
            toggleDimmed={toggleDimmed}
            toggleColorScheme={toggleColorScheme}
            showLabels={true}
            dark={dark}
          />
        </Drawer>
      )}
      <Container h={44} pos='relative'>
        <div className={classes.inner}>
          {!veryLargeScreen &&
            (largeScreen ? (
              <Button
                title={i18n._t('Open menu')}
                variant='filled'
                color='green'
                leftIcon={<IconList size='2rem' />}
                size='lg'
                style={{ height: '44px' }}
                onClick={() => (menuOpened ? closeMenu() : openMenu())}
              >
                {i18n._t('Menu')}
              </Button>
            ) : (
              <ActionIcon
                title={i18n._t('Open menu')}
                variant='filled'
                color='green'
                size='xl'
                style={{ height: '44px' }}
                onClick={() => (menuOpened ? closeMenu() : openMenu())}
              >
                <IconList size='2rem' />
              </ActionIcon>
            ))}
        </div>
        {auth.userInfo && (
          <Group position='right' h={44}>
            <div className={classes.userTitle}>{auth.userInfo?.title}</div>
          </Group>
        )}
      </Container>
    </Header>
  );
}
