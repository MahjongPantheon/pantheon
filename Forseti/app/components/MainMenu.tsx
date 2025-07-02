import { Divider, Group, NavLink, Stack } from '@mantine/core';
import { ExternalTarget, MainMenuLink } from './MainMenuLink';
import { env } from '../env';
import {
  IconAlertOctagon,
  IconChartArea,
  IconDeviceMobileShare,
  IconExternalLink,
  IconFriends,
  IconHandStop,
  IconLanguageHiragana,
  IconList,
  IconLogin,
  IconLogout,
  IconMilitaryRank,
  IconMoonStars,
  IconNotification,
  IconOlympics,
  IconRefresh,
  IconRefreshAlert,
  IconScript,
  IconSun,
  IconTimelineEventPlus,
  IconTool,
  IconUserCircle,
  IconUserPlus,
} from '@tabler/icons-react';
import { FlagDe, FlagEn, FlagKo, FlagRu } from '../helpers/flags';
import * as React from 'react';
import { useContext } from 'react';
import { useI18n } from '../hooks/i18n';
import { Event, EventType } from '../clients/proto/atoms.pb';
import { useApi } from '../hooks/api';
import { useRoute } from 'wouter';
import { modalsCtx } from '../hooks/modals';
import { authCtx, PrivilegesLevel } from '../hooks/auth';

type MainMenuProps = {
  title?: string;
  closeMenu?: () => void;
  dark: boolean;
  toggleColorScheme: () => void;
  toggleDimmed: () => void;
  saveLang: (lang: string) => void;
  eventData: Event | null;
};

export const MainMenu = ({
  title,
  closeMenu,
  dark,
  toggleColorScheme,
  toggleDimmed,
  saveLang,
  eventData,
}: MainMenuProps) => {
  const i18n = useI18n();
  const api = useApi();
  const modals = useContext(modalsCtx);
  const { isLoggedIn, privilegesLevel } = useContext(authCtx);
  const [match, params] = useRoute('/event/:id/:subpath');
  const [matchEdit, paramsEdit] = useRoute('/ownedEvents/edit/:id');
  const [matchPrivileges, paramsPrivileges] = useRoute('/ownedEvents/privileges/:id');
  const rebuildScoring = (eid: number) => {
    api.rebuildScoring(eid).then(() => {
      window.location.reload();
    });
  };
  const eventId = (match ? params : matchEdit ? paramsEdit : paramsPrivileges)?.id;

  return (
    <Stack justify='space-between' style={{ height: '100%' }}>
      <Stack spacing={0}>
        {(match || matchEdit || matchPrivileges) && (
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
              href={`${env.urls.sigrun}/event/${eventId}/info`}
              icon={<IconExternalLink size={18} />}
              text={i18n._t('Open event page')}
              onClick={closeMenu}
            />
            {privilegesLevel >= PrivilegesLevel.ADMIN && (
              <MainMenuLink
                href={`/ownedEvents/edit/${eventId}`}
                icon={<IconTool size={18} />}
                text={i18n._t('Settings')}
                onClick={closeMenu}
              />
            )}
            {eventData && !eventData.finished && (
              <>
                {privilegesLevel >= PrivilegesLevel.ADMIN && (
                  <MainMenuLink
                    href={`/ownedEvents/privileges/${eventId}`}
                    icon={<IconMilitaryRank size={18} />}
                    text={i18n._t('Manage privileges')}
                    onClick={closeMenu}
                  />
                )}
                {privilegesLevel >= PrivilegesLevel.REFEREE && (
                  <MainMenuLink
                    href={`/event/${eventId}/players`}
                    icon={<IconFriends size={18} />}
                    text={i18n._t('Manage players')}
                    onClick={closeMenu}
                  />
                )}
                {eventData.type !== EventType.EVENT_TYPE_ONLINE && (
                  <>
                    <MainMenuLink
                      href={`event/${eventId}/penalties`}
                      icon={<IconAlertOctagon size={18} />}
                      text={i18n._t('Penalties')}
                      onClick={closeMenu}
                    />
                    <MainMenuLink
                      href={`/event/${eventId}/games`}
                      icon={<IconOlympics size={18} />}
                      text={i18n._t('Manage games')}
                      onClick={closeMenu}
                    />
                  </>
                )}
                {eventData?.isPrescripted && privilegesLevel >= PrivilegesLevel.ADMIN && (
                  <MainMenuLink
                    href={`/event/${eventId}/prescript`}
                    icon={<IconScript size={18} />}
                    text={i18n._t('Predefined seating')}
                    onClick={closeMenu}
                  />
                )}
              </>
            )}
            {eventData && !eventData.finished && privilegesLevel >= PrivilegesLevel.ADMIN && (
              <Divider
                size='xs'
                mt={10}
                mb={10}
                label={i18n._t('Danger zone')}
                labelPosition='center'
              />
            )}
            {privilegesLevel === PrivilegesLevel.SUPERADMIN && eventData && !eventData.finished && (
              <NavLink
                label={i18n._t('Rebuild scoring')}
                styles={{ label: { fontSize: '18px', color: 'red' } }}
                onClick={() => {
                  closeMenu?.();
                  rebuildScoring(parseInt(eventId ?? '', 10));
                }}
                icon={<IconRefreshAlert />}
              />
            )}
            {eventData && !eventData.finished && privilegesLevel >= PrivilegesLevel.ADMIN && (
              <NavLink
                label={i18n._t('Recalculate achievements')}
                styles={{ label: { fontSize: '18px', color: 'red' } }}
                icon={<IconRefresh />}
                onClick={() => {
                  closeMenu?.();
                  modals.setRecalcAchievementsModalData({
                    id: parseInt(eventId ?? '', 10),
                    title: eventData?.title ?? '',
                  });
                  modals.showRecalcAchievementsModal();
                }}
              />
            )}
            {eventData && !eventData.finished && privilegesLevel >= PrivilegesLevel.ADMIN && (
              <NavLink
                label={i18n._t('Recalculate players stats')}
                styles={{ label: { fontSize: '18px', color: 'red' } }}
                icon={<IconRefresh />}
                onClick={() => {
                  closeMenu?.();
                  modals.setRecalcPlayerStatsModalData({
                    id: parseInt(eventId ?? '', 10),
                    title: eventData?.title ?? '',
                  });
                  modals.showRecalcPlayerStatsModal();
                }}
              />
            )}
            {eventData && !eventData.finished && privilegesLevel >= PrivilegesLevel.ADMIN && (
              <NavLink
                label={i18n._t('Finish event')}
                styles={{ label: { fontSize: '18px', color: 'red' } }}
                icon={<IconHandStop />}
                onClick={() => {
                  closeMenu?.();
                  modals.setStopEventModalData({
                    id: parseInt(eventId ?? '', 10),
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
        {isLoggedIn && (
          <MainMenuLink
            href={'/ownedEvents/new'}
            icon={<IconTimelineEventPlus size={20} />}
            text={i18n._t('Create new event')}
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
        {privilegesLevel === PrivilegesLevel.SUPERADMIN && (
          <MainMenuLink
            href='/profile/signupAdmin'
            icon={<IconUserPlus size={18} />}
            text={i18n._t('Register player')}
            onClick={closeMenu}
          />
        )}
        {privilegesLevel === PrivilegesLevel.SUPERADMIN && (
          <MainMenuLink
            href='/stats'
            icon={<IconChartArea size={18} />}
            text={i18n._t('System stats')}
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
        {isLoggedIn && !!import.meta.env.VITE_BOT_NICKNAME && (
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
        <MainMenuLink
          external={ExternalTarget.TYR}
          href={env.urls.tyr}
          icon={<IconDeviceMobileShare size={20} />}
          text={i18n._t('Open assistant')}
          onClick={closeMenu}
        />
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
          <NavLink
            onClick={() => {
              saveLang('de');
              closeMenu?.();
            }}
            icon={<FlagDe width={24} />}
            label='de'
          />
          <NavLink
            onClick={() => {
              saveLang('ko');
              closeMenu?.();
            }}
            icon={<FlagKo width={24} />}
            label='ko'
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
