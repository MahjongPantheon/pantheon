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

import { ActionIcon, Button, Container, createStyles, Drawer, Group, Header } from '@mantine/core';
import * as React from 'react';
import { IconList } from '@tabler/icons-react';
import { useI18n } from '../hooks/i18n';
import { Event } from 'tsclients/proto/atoms.pb';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { MainMenu } from './MainMenu';

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.fn.variant({
      variant: 'filled',
      color: theme.primaryColor,
    }).background,
    borderBottom: 0,
    zIndex: 10000,
  },

  inner: {
    height: '44px',
    position: 'absolute',
    top: 0,
    left: 0,
  },

  eventTitle: {
    display: 'inline-flex',
    color: 'white',
    height: '100%',
    alignItems: 'center',
  },
}));

export const AppHeader: React.FC<{
  eventData: Event | null;
  title?: string;
  dark: boolean;
  toggleColorScheme: () => void;
  toggleDimmed: () => void;
  saveLang: (lang: string) => void;
}> = ({ title, eventData, dark, toggleColorScheme, toggleDimmed, saveLang }) => {
  const { classes } = useStyles();
  const i18n = useI18n();

  const largeScreen = useMediaQuery('(min-width: 768px)');
  const veryLargeScreen = useMediaQuery('(min-width: 1024px)');
  const [menuOpened, { open: openMenu, close: closeMenu }] = useDisclosure(false);

  return (
    <Header
      bg={dark ? '#784421' : '#DCA57F'}
      height={44}
      mb={120}
      pt={0}
      pl={veryLargeScreen ? 350 : 0}
    >
      {!veryLargeScreen && (
        <Drawer
          size='sm'
          opened={menuOpened}
          closeOnClickOutside={true}
          closeOnEscape={true}
          withCloseButton={false}
          lockScroll={false}
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
            title={title}
            dark={dark}
            closeMenu={closeMenu}
            toggleColorScheme={toggleColorScheme}
            toggleDimmed={toggleDimmed}
            saveLang={saveLang}
            eventData={eventData}
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
        {title && (
          <Group position='right' h={44}>
            <div className={classes.eventTitle}>{title}</div>
          </Group>
        )}
      </Container>
    </Header>
  );
};
