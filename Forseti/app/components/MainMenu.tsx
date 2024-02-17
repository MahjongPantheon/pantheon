import { Divider, Group, NavLink, Stack } from '@mantine/core';
import { ExternalTarget, MainMenuLink } from './MainMenuLink';
import { env } from '../env';
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
  IconNotification,
  IconOlympics,
  IconRefreshAlert,
  IconScript,
  IconSun,
  IconTool,
  IconUserCircle,
  IconUserPlus,
} from '@tabler/icons-react';
import { FlagEn, FlagRu } from '../helpers/flags';
import * as React from 'react';
import { useI18n } from '../hooks/i18n';
import { Event } from '../clients/proto/atoms.pb';
import { useApi } from '../hooks/api';
import { useRoute } from 'wouter';
import { useContext } from 'react';
import { modalsCtx } from '../hooks/modals';

type MainMenuProps = {
  title?: string;
  closeMenu?: () => void;
  isLoggedIn: boolean;
  isSuperadmin: boolean;
  dark: boolean;
  toggleColorScheme: () => void;
  toggleDimmed: () => void;
  saveLang: (lang: string) => void;
  eventData: Event | null;
};

export const MainMenu = ({
  title,
  closeMenu,
  isLoggedIn,
  isSuperadmin,
  dark,
  toggleColorScheme,
  toggleDimmed,
  saveLang,
  eventData,
}: MainMenuProps) => {
  const i18n = useI18n();
  const api = useApi();
  const modals = useContext(modalsCtx);
  const [match, params] = useRoute('/event/:id/:subpath');
  const [matchEdit, paramsEdit] = useRoute('/ownedEvents/edit/:id');
  const rebuildScoring = (eid: number) => {
    api.rebuildScoring(eid).then(() => {
      window.location.reload();
    });
  };

  return (
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
            {eventData && !eventData.finished && (
              <>
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
              </>
            )}
            {eventData && !eventData.finished && (
              <Divider
                size='xs'
                mt={10}
                mb={10}
                label={i18n._t('Danger zone')}
                labelPosition='center'
              />
            )}
            {isSuperadmin && eventData && !eventData.finished && (
              <NavLink
                label={i18n._t('Rebuild scoring')}
                styles={{ label: { fontSize: '18px', color: 'red' } }}
                onClick={() => {
                  closeMenu?.();
                  rebuildScoring(parseInt((match ? params : paramsEdit)?.id ?? '', 10));
                }}
                icon={<IconRefreshAlert />}
              />
            )}
            {eventData && !eventData.finished && (
              <NavLink
                label={i18n._t('Finish event')}
                styles={{ label: { fontSize: '18px', color: 'red' } }}
                icon={<IconHandStop />}
                onClick={() => {
                  closeMenu?.();
                  modals.setStopEventModalData({
                    id: parseInt((match ? params : paramsEdit)?.id ?? '', 10),
                    title: eventData?.title ?? '',
                  });
                  modals.showStopEventModal();
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
            href='/profile/notifications'
            icon={<IconNotification size={18} />}
            text={i18n._t('Notifications')}
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
          styles={{ label: { fontSize: '18px' }, children: { paddingLeft: 0 } }}
          icon={<IconLanguageHiragana size={20} />}
          label={i18n._t('Language')}
        >
          <NavLink
            onClick={() => {
              saveLang('en');
              closeMenu?.();
            }}
            icon={<FlagEn width={24} />}
            label='en'
          />
          <NavLink
            onClick={() => {
              saveLang('ru');
              closeMenu?.();
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
            closeMenu?.();
          }}
          label={i18n._t('Toggle dimmed colors')}
        />
        <NavLink
          styles={{ label: { fontSize: '18px' } }}
          icon={dark ? <IconSun size={20} /> : <IconMoonStars size={20} />}
          onClick={() => {
            toggleColorScheme();
            closeMenu?.();
          }}
          label={i18n._t('Toggle color scheme')}
        />
      </Group>
    </Stack>
  );
};
