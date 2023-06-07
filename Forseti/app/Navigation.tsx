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
  Anchor,
  Button,
  Container,
  createStyles,
  Header,
  rem,
  Menu,
  useMantineTheme,
  Group,
  Text,
  Modal,
} from '@mantine/core';
import * as React from 'react';
import {
  IconAlertOctagon,
  IconChevronDown,
  IconFriends,
  IconList,
  IconTool,
  IconLogin,
  IconLogout,
  IconOlympics,
  IconScript,
  IconUserCircle,
  IconUserPlus,
  IconRefreshAlert,
  IconHandStop,
} from '@tabler/icons-react';
import { useLocation, useRoute } from 'wouter';
import { useI18n } from './hooks/i18n';
import { useEffect, useState } from 'react';
import { Event } from './clients/proto/atoms.pb';
import { useApi } from './hooks/api';
import { useStorage } from './hooks/storage';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { MenuItemLink } from './helpers/MenuItemLink';

const HEADER_HEIGHT = rem(60);

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
    height: rem(56),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.white,
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: 'filled', color: theme.primaryColor }).background!,
        0.1
      ),
    },
  },

  linkLabel: {
    marginRight: rem(5),
  },

  dropdown: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: 'hidden',

    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
}));

export const Navigation: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
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
    (eventData?.title?.length ?? 0) > 13
      ? `${eventData?.title?.slice(0, 13)}...`
      : eventData?.title;

  return (
    <Header bg={theme.primaryColor} height={HEADER_HEIGHT} mb={120} pt={12}>
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
      <Container>
        <Group position='apart'>
          <Anchor
            href={`/ownedEvents`}
            onClick={(e) => {
              navigate(`/ownedEvents`);
              e.preventDefault();
            }}
          >
            {largeScreen ? (
              <Button
                className={classes.link}
                leftIcon={<IconList size={20} />}
                title={i18n._t('To events list')}
              >
                {i18n._t('Events list')}
              </Button>
            ) : (
              <ActionIcon
                title={i18n._t('To events list')}
                variant='filled'
                color='green'
                size='lg'
              >
                <IconList size='1.5rem' />
              </ActionIcon>
            )}
          </Anchor>
          <Group>
            {(match || matchEdit) && (
              <Menu shadow='md'>
                <Menu.Target>
                  <Button
                    className={classes.link}
                    leftIcon={<IconChevronDown size={20} />}
                    title={eventData?.title}
                  >
                    {title}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <MenuItemLink
                    href={`/ownedEvents/edit/${(match ? params : paramsEdit)?.id}`}
                    icon={<IconTool size={18} />}
                    text={i18n._t('Settings')}
                  />
                  <MenuItemLink
                    href={`/event/${(match ? params : paramsEdit)?.id}/players`}
                    icon={<IconFriends size={18} />}
                    text={i18n._t('Manage players')}
                  />
                  <MenuItemLink
                    href={`event/${(match ? params : paramsEdit)?.id}/penalties`}
                    icon={<IconAlertOctagon size={18} />}
                    text={i18n._t('Penalties')}
                  />
                  <MenuItemLink
                    href={`/event/${(match ? params : paramsEdit)?.id}/games`}
                    icon={<IconOlympics size={18} />}
                    text={i18n._t('Manage games')}
                  />
                  {eventData?.isPrescripted && (
                    <MenuItemLink
                      href={`/event/${(match ? params : paramsEdit)?.id}/prescript`}
                      icon={<IconScript size={18} />}
                      text={i18n._t('Predefined seating')}
                    />
                  )}
                  <Menu.Divider />
                  <Menu.Label>{i18n._t('Danger zone')}</Menu.Label>
                  {isSuperadmin && (
                    <Menu.Item
                      title={i18n._t('Rebuild scoring')}
                      onClick={() =>
                        rebuildScoring(parseInt((match ? params : paramsEdit)?.id ?? '', 10))
                      }
                      icon={<IconRefreshAlert />}
                    >
                      {i18n._t('Rebuild scoring')}
                    </Menu.Item>
                  )}
                  <Menu.Item
                    title={i18n._t('Finish event')}
                    color='red'
                    icon={<IconHandStop />}
                    onClick={() => {
                      setStopEventData({
                        id: parseInt((match ? params : paramsEdit)?.id ?? '', 10),
                        title: eventData?.title ?? '',
                      });
                      stopEventModalOpen();
                    }}
                  >
                    {i18n._t('Finish event')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
            <Menu shadow='md'>
              <Menu.Target>
                <Button
                  className={classes.link}
                  leftIcon={<IconChevronDown size={20} />}
                  title={i18n._t('Your profile')}
                >
                  {i18n._t('Your profile')}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {!isLoggedIn && (
                  <MenuItemLink
                    href={'/profile/login'}
                    icon={<IconLogin size={18} />}
                    text={i18n._t('Sign in')}
                  />
                )}
                {!isLoggedIn && (
                  <MenuItemLink
                    href='/profile/signup'
                    icon={<IconUserPlus size={18} />}
                    text={i18n._t('Sign up')}
                  />
                )}
                {!isSuperadmin && (
                  <MenuItemLink
                    href='/profile/signupAdmin'
                    icon={<IconUserPlus size={18} />}
                    text={i18n._t('Register player')}
                  />
                )}
                {isLoggedIn && (
                  <MenuItemLink
                    href='/profile/manage'
                    icon={<IconUserCircle size={18} />}
                    text={i18n._t('Edit profile')}
                  />
                )}
                {isLoggedIn && (
                  <MenuItemLink
                    href='/profile/logout'
                    icon={<IconLogout size={18} />}
                    text={i18n._t('Sign out')}
                  />
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Container>
    </Header>
  );
};
