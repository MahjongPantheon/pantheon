import { globalsCtx } from '../hooks/globals';
import { authCtx } from '../hooks/auth';
import { Divider, Group, NavLink, Stack, useMantineColorScheme } from '@mantine/core';
import { ExternalTarget, MainMenuLink } from './MainMenuLink';
import { env } from '../env';
import {
  IconAdjustmentsAlt,
  IconAlarm,
  IconAward,
  IconChartBar,
  IconChartLine,
  IconClipboardData,
  IconDeviceMobileShare,
  IconLanguageHiragana,
  IconList,
  IconListCheck,
  IconLogin,
  IconMoonStars,
  IconNotes,
  IconOlympics,
  IconSun,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import { EventType, PlatformType } from 'tsclients/proto/atoms.pb';
import { FlagEn, FlagKo, FlagRu, FlagDe } from '../helpers/flags';
import { useI18n } from '../hooks/i18n';
import { useContext } from 'react';
import { AddOnlineReplayLink } from './AddOnlineReplayLink';

type MainMenuProps = {
  closeMenu?: () => void;
  isLoggedIn: boolean;
  saveLang: (lang: string) => void;
  toggleDimmed: () => void;
  showLabels: boolean;
};

export const MainMenu = ({
  closeMenu,
  isLoggedIn,
  saveLang,
  toggleDimmed,
  showLabels,
}: MainMenuProps) => {
  const i18n = useI18n();
  const globals = useContext(globalsCtx);
  const auth = useContext(authCtx);
  const { toggleColorScheme } = useMantineColorScheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';

  return (
    <>
      <Stack justify='space-between' style={{ height: '100%' }}>
        <Stack gap={0}>
          {globals.data.eventId && (
            <>
              <Divider
                size='xs'
                mt={10}
                mb={10}
                label={showLabels ? i18n._t('Current event') : ''}
                labelPosition='center'
              />
              {globals.data.eventId?.length === 1 &&
                (auth.ownEvents.includes(globals.data.eventId?.[0]) || auth.isSuperadmin) && (
                  <MainMenuLink
                    external={ExternalTarget.FORSETI}
                    href={`${env.urls.forseti}/ownedEvents/edit/${globals.data.eventId?.[0]}`}
                    icon={<IconAdjustmentsAlt size={20} />}
                    text={showLabels ? i18n._t('Event admin panel') : ''}
                    title={i18n._t('Event admin panel')}
                    onClick={closeMenu}
                  />
                )}
              <MainMenuLink
                href={`/event/${globals.data.eventId?.join('.')}/info`}
                icon={<IconNotes size={24} />}
                text={showLabels ? i18n._pt('Event menu', 'Description') : ''}
                title={i18n._pt('Event menu', 'Description')}
                onClick={closeMenu}
              />
              <MainMenuLink
                href={`/event/${globals.data.eventId?.join('.')}/rules`}
                icon={<IconListCheck size={24} />}
                text={showLabels ? i18n._pt('Event menu', 'Rules overview') : ''}
                title={i18n._pt('Event menu', 'Rules overview')}
                onClick={closeMenu}
              />
              <MainMenuLink
                href={`/event/${globals.data.eventId?.join('.')}/games`}
                icon={<IconOlympics size={24} />}
                text={showLabels ? i18n._pt('Event menu', 'Recent games') : ''}
                title={i18n._pt('Event menu', 'Recent games')}
                onClick={closeMenu}
              />
              <MainMenuLink
                href={`/event/${globals.data.eventId?.join('.')}/order/rating`}
                icon={<IconChartBar size={24} />}
                text={showLabels ? i18n._pt('Event menu', 'Rating table') : ''}
                title={i18n._pt('Event menu', 'Rating table')}
                onClick={closeMenu}
              />
              {globals.data.type === EventType.EVENT_TYPE_TOURNAMENT && (
                <MainMenuLink
                  href={`/event/${globals.data.eventId?.join('.')}/tablesState`}
                  icon={<IconClipboardData size={24} />}
                  text={showLabels ? i18n._pt('Event menu', 'Tables state') : ''}
                  title={i18n._pt('Event menu', 'Tables state')}
                  onClick={closeMenu}
                />
              )}
              {globals.data.type === EventType.EVENT_TYPE_ONLINE && (
                <MainMenuLink
                  href={`/event/${globals.data.eventId?.[0]}/playersList`}
                  icon={<IconUsers size={24} />}
                  text={showLabels ? i18n._pt('Event menu', 'Registered players') : ''}
                  title={i18n._pt('Event menu', 'Players registered to event')}
                  onClick={closeMenu}
                />
              )}
              {globals.data.eventId?.length === 1 && (
                <MainMenuLink
                  href={`/event/${globals.data.eventId?.join('.')}/achievements`}
                  icon={<IconAward size={24} />}
                  text={showLabels ? i18n._pt('Event menu', 'Achievements') : ''}
                  title={i18n._pt('Event menu', 'Achievements')}
                  onClick={closeMenu}
                />
              )}
              {globals.data.hasSeries && globals.data.eventId?.length === 1 && (
                <MainMenuLink
                  href={`/event/${globals.data.eventId?.join('.')}/seriesRating`}
                  icon={<IconChartLine size={24} />}
                  text={showLabels ? i18n._pt('Event menu', 'Series rating') : ''}
                  title={i18n._pt('Event menu', 'Series rating')}
                  onClick={closeMenu}
                />
              )}
              {globals.data.type === EventType.EVENT_TYPE_TOURNAMENT &&
                globals.data.eventId?.length === 1 && (
                  <MainMenuLink
                    href={`/event/${globals.data.eventId?.join('.')}/timer`}
                    icon={<IconAlarm size={24} />}
                    text={showLabels ? i18n._pt('Event menu', 'Timer & seating') : ''}
                    title={i18n._pt('Event menu', 'Timer & seating')}
                    onClick={closeMenu}
                  />
                )}
              {globals.data.type === EventType.EVENT_TYPE_ONLINE &&
                globals.data.platformType === PlatformType.PLATFORM_TYPE_TENHOUNET &&
                globals.data.eventId?.length === 1 &&
                globals.data.allowManualAddReplay && (
                  <AddOnlineReplayLink showLabel={showLabels} onClick={closeMenu} />
                )}
            </>
          )}
          <Divider
            size='xs'
            mt={10}
            mb={10}
            label={showLabels ? i18n._t('Common actions') : ''}
            labelPosition='center'
          />
          <MainMenuLink
            href='/'
            icon={<IconList size={20} />}
            text={showLabels ? i18n._t('To events list') : ''}
            title={i18n._t('To events list')}
            onClick={closeMenu}
          />
          {isLoggedIn && (
            <MainMenuLink
              external={ExternalTarget.FORSETI}
              href={`${env.urls.forseti}/profile/manage`}
              icon={<IconAdjustmentsAlt size={20} />}
              text={showLabels ? i18n._t('Edit my profile') : ''}
              title={i18n._t('Edit my profile')}
              onClick={closeMenu}
            />
          )}
          {!isLoggedIn && (
            <MainMenuLink
              external={ExternalTarget.FORSETI}
              href={`${env.urls.forseti}/profile/login`}
              icon={<IconLogin size={20} />}
              text={showLabels ? i18n._t('Sign in') : ''}
              title={i18n._t('Sign in')}
              onClick={closeMenu}
            />
          )}
          {!isLoggedIn && (
            <MainMenuLink
              external={ExternalTarget.FORSETI}
              href={`${env.urls.forseti}/profile/signup`}
              icon={<IconUserPlus size={20} />}
              text={showLabels ? i18n._t('Sign up') : ''}
              title={i18n._t('Sign up')}
              onClick={closeMenu}
            />
          )}
          <MainMenuLink
            external={ExternalTarget.TYR}
            href={env.urls.tyr}
            icon={<IconDeviceMobileShare size={20} />}
            text={showLabels ? i18n._t('Open assistant') : ''}
            title={i18n._t('Open assistant')}
            onClick={closeMenu}
          />
        </Stack>
        <Group mt={0} gap={0}>
          <NavLink
            styles={{
              label: { fontSize: '18px' },
              children: { paddingLeft: 0 },
              icon: { marginRight: showLabels ? '0.75rem' : '0' },
            }}
            leftSection={<IconLanguageHiragana size={20} />}
            label={showLabels ? i18n._t('Language') : ''}
            title={i18n._t('Language')}
          >
            <NavLink
              onClick={() => {
                saveLang('en');
                closeMenu?.();
              }}
              leftSection={<FlagEn width={24} />}
              label={showLabels ? 'en' : ''}
            />
            <NavLink
              onClick={() => {
                saveLang('ru');
                closeMenu?.();
              }}
              leftSection={<FlagRu width={24} />}
              label={showLabels ? 'ru' : ''}
            />
            <NavLink
              onClick={() => {
                saveLang('de');
                closeMenu?.();
              }}
              leftSection={<FlagDe width={24} />}
              label={showLabels ? 'de' : ''}
            />
            <NavLink
              onClick={() => {
                saveLang('ko');
                closeMenu?.();
              }}
              leftSection={<FlagKo width={24} />}
              label={showLabels ? 'ko' : ''}
            />
          </NavLink>
          <NavLink
            styles={{ label: { fontSize: '18px' } }}
            leftSection={<IconSun size={20} />}
            onClick={() => {
              toggleDimmed();
              closeMenu?.();
            }}
            label={showLabels ? i18n._t('Toggle dimmed colors') : ''}
            title={i18n._t('Toggle dimmed colors')}
          />
          <NavLink
            styles={{ label: { fontSize: '18px' } }}
            leftSection={isDark ? <IconSun size={20} /> : <IconMoonStars size={20} />}
            onClick={() => {
              toggleColorScheme();
              closeMenu?.();
            }}
            label={showLabels ? i18n._t('Toggle color scheme') : ''}
            title={i18n._t('Toggle color scheme')}
          />
        </Group>
      </Stack>
    </>
  );
};
