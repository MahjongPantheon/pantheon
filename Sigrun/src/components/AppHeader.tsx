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
  ActionIcon,
  Anchor,
  Button,
  Container,
  createStyles,
  Divider,
  Drawer,
  Group,
  Header,
  LoadingOverlay,
  Modal,
  NavLink,
  Space,
  Stack,
  TextInput,
  useMantineTheme,
} from '@mantine/core';
import {
  IconAdjustmentsAlt,
  IconAlarm,
  IconAward,
  IconChartBar,
  IconChartLine,
  IconDeviceMobileShare,
  IconLanguageHiragana,
  IconList,
  IconListCheck,
  IconLogin,
  IconMoonStars,
  IconNetwork,
  IconNotes,
  IconOlympics,
  IconSun,
  IconUserPlus,
} from '@tabler/icons-react';
import { useI18n } from '../hooks/i18n';
import * as React from 'react';
import { useContext, useState } from 'react';
import { useLocation } from 'wouter';
import { globalsCtx } from '../hooks/globals';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { EventType } from '../clients/proto/atoms.pb';
import { useApi } from '../hooks/api';
import { env } from '../env';
import { ExternalTarget, MainMenuLink } from './MainMenuLink';
import { FlagEn, FlagRu } from '../helpers/flags';
import { authCtx } from '../hooks/auth';

const useStyles = createStyles((theme) => ({
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
  const [, navigate] = useLocation();
  const theme = useMantineTheme();
  const globals = useContext(globalsCtx);
  const [menuOpened, { open: openMenu, close: closeMenu }] = useDisclosure(false);
  const largeScreen = useMediaQuery('(min-width: 640px)');
  const auth = useContext(authCtx);

  // Online add replay related
  const [onlineModalOpened, { open: openOnlineModal, close: closeOnlineModal }] =
    useDisclosure(false);
  const [onlineLink, setOnlineLink] = useState('');
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const api = useApi();
  const tryAddOnline = () => {
    if (!onlineLink.match(/^https?:\/\/[^\/]+\/\d\/\?log=\d+gm-[0-9a-f]+-\d+-[0-9a-f]+/i)) {
      setOnlineError(i18n._t('Replay link is invalid. Please check if you copied it correctly'));
    } else {
      setOnlineError(null);
      setOnlineLoading(true);
      if (globals.data.eventId?.[0]) {
        api
          .addOnlineGame(globals.data.eventId?.[0], onlineLink)
          .then(() => {
            setOnlineLoading(false);
            window.location.href = `/event/${globals.data.eventId}/games`;
          })
          .catch((e) => {
            setOnlineLoading(false);
            setOnlineError(e.message);
          });
      }
    }
  };

  return (
    <Header height={44} className={classes.header} mb={120}>
      <Drawer
        size='sm'
        opened={menuOpened}
        closeOnClickOutside={true}
        closeOnEscape={true}
        withCloseButton={false}
        closeButtonProps={{ size: 'lg' }}
        lockScroll={false}
        onClose={closeMenu}
        overlayProps={{ opacity: 0.5, blur: 4 }}
        transitionProps={{ transition: 'pop-top-left', duration: 150, timingFunction: 'linear' }}
        style={{ zIndex: 10000, position: 'fixed' }}
        styles={{ body: { height: 'calc(100% - 68px)', paddingTop: 0 } }}
      >
        <Stack justify='space-between' style={{ height: '100%' }}>
          <Stack spacing={0}>
            {globals.data.eventId && (
              <>
                <Divider
                  size='xs'
                  mt={10}
                  mb={10}
                  label={i18n._t('Current event')}
                  labelPosition='center'
                />
                {globals.data.eventId?.length === 1 &&
                  (auth.ownEvents.includes(globals.data.eventId?.[0]) || auth.isSuperadmin) && (
                    <MainMenuLink
                      external={ExternalTarget.FORSETI}
                      href={`${env.urls.forseti}/ownedEvents/edit/${globals.data.eventId?.[0]}`}
                      icon={<IconAdjustmentsAlt size={20} />}
                      text={i18n._t('Edit event in admin panel')}
                      onClick={closeMenu}
                    />
                  )}
                <MainMenuLink
                  href={`/event/${globals.data.eventId?.join('.')}/info`}
                  icon={<IconNotes size={24} />}
                  text={i18n._pt('Event menu', 'Description')}
                  onClick={closeMenu}
                />
                <MainMenuLink
                  href={`/event/${globals.data.eventId?.join('.')}/rules`}
                  icon={<IconListCheck size={24} />}
                  text={i18n._pt('Event menu', 'Rules overview')}
                  onClick={closeMenu}
                />
                <MainMenuLink
                  href={`/event/${globals.data.eventId?.join('.')}/games`}
                  icon={<IconOlympics size={24} />}
                  text={i18n._pt('Event menu', 'Recent games')}
                  onClick={closeMenu}
                />
                <MainMenuLink
                  href={`/event/${globals.data.eventId?.join('.')}/order/rating`}
                  icon={<IconChartBar size={24} />}
                  text={i18n._pt('Event menu', 'Rating table')}
                  onClick={closeMenu}
                />
                {globals.data.eventId?.length === 1 && (
                  <MainMenuLink
                    href={`/event/${globals.data.eventId?.join('.')}/achievements`}
                    icon={<IconAward size={24} />}
                    text={i18n._pt('Event menu', 'Achievements')}
                    onClick={closeMenu}
                  />
                )}
                {globals.data.hasSeries && globals.data.eventId?.length === 1 && (
                  <MainMenuLink
                    href={`/event/${globals.data.eventId?.join('.')}/seriesRating`}
                    icon={<IconChartLine size={24} />}
                    text={i18n._pt('Event menu', 'Series rating')}
                    onClick={closeMenu}
                  />
                )}
                {globals.data.type === EventType.EVENT_TYPE_TOURNAMENT &&
                  globals.data.eventId?.length === 1 && (
                    <MainMenuLink
                      href={`/event/${globals.data.eventId?.join('.')}/timer`}
                      icon={<IconAlarm size={24} />}
                      text={i18n._pt('Event menu', 'Timer & seating')}
                      onClick={closeMenu}
                    />
                  )}
                {globals.data.type === EventType.EVENT_TYPE_ONLINE &&
                  globals.data.eventId?.length === 1 && (
                    <NavLink
                      styles={{ label: { fontSize: '18px' } }}
                      icon={<IconNetwork size={24} />}
                      label={i18n._pt('Event menu', 'Add online game')}
                      onClick={(e) => {
                        openOnlineModal();
                        closeMenu();
                        e.preventDefault();
                      }}
                    />
                  )}
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
              href='/'
              icon={<IconList size={20} />}
              text={i18n._t('To events list')}
              onClick={closeMenu}
            />
            {isLoggedIn && (
              <MainMenuLink
                external={ExternalTarget.FORSETI}
                href={`${env.urls.forseti}/profile/manage`}
                icon={<IconAdjustmentsAlt size={20} />}
                text={i18n._t('Edit my profile')}
                onClick={closeMenu}
              />
            )}
            {!isLoggedIn && (
              <MainMenuLink
                external={ExternalTarget.FORSETI}
                href={`${env.urls.forseti}/profile/login`}
                icon={<IconLogin size={20} />}
                text={i18n._t('Sign in')}
                onClick={closeMenu}
              />
            )}
            {!isLoggedIn && (
              <MainMenuLink
                external={ExternalTarget.FORSETI}
                href={`${env.urls.forseti}/profile/signup`}
                icon={<IconUserPlus size={20} />}
                text={i18n._t('Sign up')}
                onClick={closeMenu}
              />
            )}
            {globals.data.eventId?.length === 1 && (
              <MainMenuLink
                external={ExternalTarget.TYR}
                href={env.urls.tyr}
                icon={<IconDeviceMobileShare size={20} />}
                text={i18n._t('Open assistant')}
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
        {auth.userInfo && (
          <Group position='right' h={44}>
            <div className={classes.userTitle}>{auth.userInfo?.title}</div>
          </Group>
        )}
        <Modal
          opened={onlineModalOpened}
          onClose={closeOnlineModal}
          overlayProps={{
            color: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2],
            opacity: 0.55,
            blur: 3,
          }}
          title={i18n._t('Add online game')}
          centered
        >
          <LoadingOverlay visible={onlineLoading} />
          <TextInput
            placeholder='http://tenhou.net/0/?log=XXXXXXXXXXgm-XXXX-XXXXX-XXXXXXXX'
            label={'Enter replay URL'}
            error={onlineError}
            value={onlineLink}
            onChange={(event) => setOnlineLink(event.currentTarget.value)}
            withAsterisk
          />
          <Space h='md' />
          <Group position='right'>
            <Button onClick={tryAddOnline}>{i18n._t('Add replay')}</Button>
          </Group>
        </Modal>
      </Container>
    </Header>
  );
}
