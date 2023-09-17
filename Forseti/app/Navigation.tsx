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

import {
  ActionIcon,
  Button,
  Container,
  createStyles,
  Divider,
  Drawer,
  Group,
  Header,
  Modal,
  NavLink,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  IconAlertOctagon,
  IconExternalLink,
  IconFriends,
  IconHandStop,
  IconLanguageHiragana,
  IconList,
  IconLogin,
  IconLogout,
  IconMoonStars,
  IconOlympics,
  IconRefreshAlert,
  IconScript,
  IconSun,
  IconTool,
  IconUserCircle,
  IconUserPlus,
} from '@tabler/icons-react';
import { useLocation, useRoute } from 'wouter';
import { useI18n } from './hooks/i18n';
import { Event } from './clients/proto/atoms.pb';
import { useApi } from './hooks/api';
import { useStorage } from './hooks/storage';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { env } from './env';
import { ExternalTarget, MainMenuLink } from './helpers/MainMenuLink';
import { FlagEn, FlagRu } from './helpers/flags';

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

export const Navigation: React.FC<{
  isLoggedIn: boolean;
  dark: boolean;
  toggleColorScheme: () => void;
  toggleDimmed: () => void;
  saveLang: (lang: string) => void;
}> = ({ isLoggedIn, dark, toggleColorScheme, toggleDimmed, saveLang }) => {
  const { classes } = useStyles();
  const i18n = useI18n();
  const api = useApi();
  const storage = useStorage();
  const theme = useMantineTheme();
  const [match, params] = useRoute('/event/:id/:subpath');
  const [matchEdit, paramsEdit] = useRoute('/ownedEvents/edit/:id');
  const id = (match ? params : paramsEdit)?.id;
  const [, navigate] = useLocation();
  const largeScreen = useMediaQuery('(min-width: 768px)');
  const [menuOpened, { open: openMenu, close: closeMenu }] = useDisclosure(false);
  const personId = storage.getPersonId();
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [stopEventModalOpened, { close: stopEventModalClose, open: stopEventModalOpen }] =
    useDisclosure(false);
  const [stopEventData, setStopEventData] = useState({ id: 0, title: '' });

  useEffect(() => {
    api.getSuperadminFlag(personId!).then((flag) => setIsSuperadmin(flag));

    if (!match && !matchEdit) {
      return;
    }
    api.getEventsById([parseInt(id ?? '0', 10)]).then((e) => {
      setEventData(e[0]);
    });
  }, [match, id, personId]);

  const rebuildScoring = (eid: number) => {
    api.rebuildScoring(eid).then(() => {
      window.location.reload();
    });
  };

  const stopEvent = (eid: number) => {
    api.finishEvent(eid).then(() => {
      navigate('/ownedEvents');
    });
  };

  const title =
    (eventData?.title?.length ?? 0) > 32
      ? `${eventData?.title?.slice(0, 32)}...`
      : eventData?.title;

  return (
    <Header bg={dark ? '#784421' : '#DCA57F'} height={44} mb={120} pt={0}>
      <Modal opened={stopEventModalOpened} onClose={stopEventModalClose} size='auto' centered>
        <Text>
          {i18n._t('Stop event "%1" (id #%2)? This action can\'t be undone!', [
            stopEventData.title,
            stopEventData.id,
          ])}
        </Text>
        <Group mt='xl' grow>
          <Button variant='outline' onClick={stopEventModalClose}>
            {i18n._t('Cancel')}
          </Button>
          <Button
            color='red'
            variant='filled'
            onClick={() => {
              stopEvent(stopEventData.id);
              stopEventModalClose();
            }}
          >
            {i18n._t('Stop event')}
          </Button>
        </Group>
      </Modal>
      <Drawer
        size='sm'
        opened={menuOpened}
        closeOnClickOutside={true}
        closeOnEscape={true}
        withCloseButton={false}
        lockScroll={false}
        onClose={closeMenu}
        overlayProps={{ opacity: 0.5, blur: 4 }}
        transitionProps={{ transition: 'pop-top-left', duration: 150, timingFunction: 'linear' }}
        style={{ zIndex: 10000, position: 'fixed' }}
        styles={{ body: { height: 'calc(100% - 68px)', paddingTop: 0 } }}
      >
        <Stack justify='space-between' style={{ height: '100%' }}>
          <Stack spacing={0}>
            {(match || matchEdit) && (
              <>
                <Divider
                  size='xs'
                  mt={10}
                  mb={10}
                  label={i18n._t('Event: %1', [title])}
                  labelPosition='center'
                />
                <MainMenuLink
                  external={ExternalTarget.SIGRUN}
                  href={`${env.urls.sigrun}/event/${(match ? params : paramsEdit)?.id}/info`}
                  icon={<IconExternalLink size={18} />}
                  text={i18n._t('Open event page')}
                  onClick={closeMenu}
                />
                <MainMenuLink
                  href={`/ownedEvents/edit/${(match ? params : paramsEdit)?.id}`}
                  icon={<IconTool size={18} />}
                  text={i18n._t('Settings')}
                  onClick={closeMenu}
                />
                <MainMenuLink
                  href={`/event/${(match ? params : paramsEdit)?.id}/players`}
                  icon={<IconFriends size={18} />}
                  text={i18n._t('Manage players')}
                  onClick={closeMenu}
                />
                <MainMenuLink
                  href={`event/${(match ? params : paramsEdit)?.id}/penalties`}
                  icon={<IconAlertOctagon size={18} />}
                  text={i18n._t('Penalties')}
                  onClick={closeMenu}
                />
                <MainMenuLink
                  href={`/event/${(match ? params : paramsEdit)?.id}/games`}
                  icon={<IconOlympics size={18} />}
                  text={i18n._t('Manage games')}
                  onClick={closeMenu}
                />
                {eventData?.isPrescripted && (
                  <MainMenuLink
                    href={`/event/${(match ? params : paramsEdit)?.id}/prescript`}
                    icon={<IconScript size={18} />}
                    text={i18n._t('Predefined seating')}
                    onClick={closeMenu}
                  />
                )}
                <Divider
                  size='xs'
                  mt={10}
                  mb={10}
                  label={i18n._t('Danger zone')}
                  labelPosition='center'
                />
                {isSuperadmin && (
                  <NavLink
                    label={i18n._t('Rebuild scoring')}
                    styles={{ label: { fontSize: '18px', color: 'red' } }}
                    onClick={() => {
                      closeMenu();
                      rebuildScoring(parseInt((match ? params : paramsEdit)?.id ?? '', 10));
                    }}
                    icon={<IconRefreshAlert />}
                  />
                )}
                <NavLink
                  label={i18n._t('Finish event')}
                  styles={{ label: { fontSize: '18px', color: 'red' } }}
                  icon={<IconHandStop />}
                  onClick={() => {
                    closeMenu();
                    setStopEventData({
                      id: parseInt((match ? params : paramsEdit)?.id ?? '', 10),
                      title: eventData?.title ?? '',
                    });
                    stopEventModalOpen();
                  }}
                />
              </>
            )}
            <Divider
              size='xs'
              mt={10}
              mb={10}
              label={i18n._t('Common actions')}
              labelPosition='center'
            />
            <MainMenuLink
              external={ExternalTarget.SIGRUN}
              href={`${env.urls.sigrun}`}
              icon={<IconExternalLink size={18} />}
              text={i18n._t('All events')}
              onClick={closeMenu}
            />
            {isLoggedIn && (
              <MainMenuLink
                href={'/ownedEvents'}
                icon={<IconList size={20} />}
                text={i18n._t('My events')}
                onClick={closeMenu}
              />
            )}
            {!isLoggedIn && (
              <MainMenuLink
                href={'/profile/login'}
                icon={<IconLogin size={18} />}
                text={i18n._t('Sign in')}
                onClick={closeMenu}
              />
            )}
            {!isLoggedIn && (
              <MainMenuLink
                href='/profile/signup'
                icon={<IconUserPlus size={18} />}
                text={i18n._t('Sign up')}
                onClick={closeMenu}
              />
            )}
            {isSuperadmin && (
              <MainMenuLink
                href='/profile/signupAdmin'
                icon={<IconUserPlus size={18} />}
                text={i18n._t('Register player')}
                onClick={closeMenu}
              />
            )}
            {isLoggedIn && (
              <MainMenuLink
                href='/profile/manage'
                icon={<IconUserCircle size={18} />}
                text={i18n._t('Edit profile')}
                onClick={closeMenu}
              />
            )}
            {isLoggedIn && (
              <MainMenuLink
                href='/profile/logout'
                icon={<IconLogout size={18} />}
                text={i18n._t('Sign out')}
                onClick={closeMenu}
              />
            )}
          </Stack>
          <Group mt={0} spacing={0}>
            <NavLink
              styles={{ label: { fontSize: '18px' } }}
              icon={<IconLanguageHiragana size={20} />}
              label={i18n._t('Language')}
            >
              <NavLink
                onClick={() => {
                  saveLang('en');
                  closeMenu();
                }}
                icon={<FlagEn width={24} />}
                label='en'
              />
              <NavLink
                onClick={() => {
                  saveLang('ru');
                  closeMenu();
                }}
                icon={<FlagRu width={24} />}
                label='ru'
              />
            </NavLink>
            <NavLink
              styles={{ label: { fontSize: '18px' } }}
              icon={<IconSun size={20} />}
              onClick={() => {
                toggleDimmed();
                closeMenu();
              }}
              label={i18n._t('Toggle dimmed colors')}
            />
            <NavLink
              styles={{ label: { fontSize: '18px' } }}
              icon={dark ? <IconSun size={20} /> : <IconMoonStars size={20} />}
              onClick={() => {
                toggleColorScheme();
                closeMenu();
              }}
              label={i18n._t('Toggle color scheme')}
            />
          </Group>
        </Stack>
      </Drawer>

      <Container h={44} pos='relative'>
        <div className={classes.inner}>
          {largeScreen ? (
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
          )}
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
