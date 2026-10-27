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
import { FlagEn, FlagKo, FlagRu, FlagDe, FlagJa, FlagCn, FlagBe } from '../helpers/flags';
import { useI18n } from '../hooks/i18n';
import { useContext } from 'react';
import { AddOnlineReplayLink } from './AddOnlineReplayLink';

type MainMenuProps = {
  closeMenu?: () => void;
  isLoggedIn: boolean;
  saveLang: (lang: string) => void;
  toggleDimmed: () => void;
  showLabels: boolean;
  testIdScope: 'drawer' | 'sidebar';
};

export const MainMenu = ({
  closeMenu,
  isLoggedIn,
  saveLang,
  toggleDimmed,
  showLabels,
  testIdScope,
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
                    testId={`sigrun-menu-${testIdScope}-event-admin`}
                    external={ExternalTarget.FORSETI}
                    href={`${env.urls.forseti}/ownedEvents/edit/${globals.data.eventId?.[0]}`}
                    icon={<IconAdjustmentsAlt size={20} />}
                    text={showLabels ? i18n._t('Event admin panel') : ''}
                    title={i18n._t('Event admin panel')}
                    onClick={closeMenu}
                  />
                )}
              <MainMenuLink
                testId={`sigrun-menu-${testIdScope}-event-info`}
                href={`/event/${globals.data.eventId?.join('.')}/info`}
                icon={<IconNotes size={24} />}
                text={showLabels ? i18n._pt('Event menu', 'Description') : ''}
                title={i18n._pt('Event menu', 'Description')}
                onClick={closeMenu}
              />
              <MainMenuLink
                testId={`sigrun-menu-${testIdScope}-event-rules`}
                href={`/event/${globals.data.eventId?.join('.')}/rules`}
                icon={<IconListCheck size={24} />}
                text={showLabels ? i18n._pt('Event menu', 'Rules overview') : ''}
                title={i18n._pt('Event menu', 'Rules overview')}
                onClick={closeMenu}
              />
              <MainMenuLink
                testId={`sigrun-menu-${testIdScope}-recent-games`}
                href={`/event/${globals.data.eventId?.join('.')}/games`}
                icon={<IconOlympics size={24} />}
                text={showLabels ? i18n._pt('Event menu', 'Recent games') : ''}
                title={i18n._pt('Event menu', 'Recent games')}
                onClick={closeMenu}
              />
              <MainMenuLink
                testId={`sigrun-menu-${testIdScope}-rating-table`}
                href={`/event/${globals.data.eventId?.join('.')}/order/rating`}
                icon={<IconChartBar size={24} />}
                text={showLabels ? i18n._pt('Event menu', 'Rating table') : ''}
                title={i18n._pt('Event menu', 'Rating table')}
                onClick={closeMenu}
              />
              {globals.data.type === EventType.EVENT_TYPE_TOURNAMENT && (
                <MainMenuLink
                  testId={`sigrun-menu-${testIdScope}-tables-state`}
                  href={`/event/${globals.data.eventId?.join('.')}/tablesState`}
                  icon={<IconClipboardData size={24} />}
                  text={showLabels ? i18n._pt('Event menu', 'Tables state') : ''}
                  title={i18n._pt('Event menu', 'Tables state')}
                  onClick={closeMenu}
                />
              )}
              {globals.data.type === EventType.EVENT_TYPE_ONLINE && (
                <MainMenuLink
                  testId={`sigrun-menu-${testIdScope}-registered-players`}
                  href={`/event/${globals.data.eventId?.[0]}/playersList`}
                  icon={<IconUsers size={24} />}
                  text={showLabels ? i18n._pt('Event menu', 'Registered players') : ''}
                  title={i18n._pt('Event menu', 'Players registered to event')}
                  onClick={closeMenu}
                />
              )}
              {globals.data.eventId?.length === 1 && (
                <MainMenuLink
                  testId={`sigrun-menu-${testIdScope}-achievements`}
                  href={`/event/${globals.data.eventId?.join('.')}/achievements`}
                  icon={<IconAward size={24} />}
                  text={showLabels ? i18n._pt('Event menu', 'Achievements') : ''}
                  title={i18n._pt('Event menu', 'Achievements')}
                  onClick={closeMenu}
                />
              )}
              {globals.data.hasSeries && globals.data.eventId?.length === 1 && (
                <MainMenuLink
                  testId={`sigrun-menu-${testIdScope}-series-rating`}
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
                    testId={`sigrun-menu-${testIdScope}-timer`}
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
                  <AddOnlineReplayLink
                    showLabel={showLabels}
                    onClick={closeMenu}
                    testId={`sigrun-menu-${testIdScope}-add-online-game`}
                  />
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
            testId={`sigrun-menu-${testIdScope}-events-list`}
            href='/'
            icon={<IconList size={20} />}
            text={showLabels ? i18n._t('To events list') : ''}
            title={i18n._t('To events list')}
            onClick={closeMenu}
          />
          {isLoggedIn && (
            <MainMenuLink
              testId={`sigrun-menu-${testIdScope}-edit-profile`}
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
              testId={`sigrun-menu-${testIdScope}-sign-in`}
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
              testId={`sigrun-menu-${testIdScope}-sign-up`}
              external={ExternalTarget.FORSETI}
              href={`${env.urls.forseti}/profile/signup`}
              icon={<IconUserPlus size={20} />}
              text={showLabels ? i18n._t('Sign up') : ''}
              title={i18n._t('Sign up')}
              onClick={closeMenu}
            />
          )}
          <MainMenuLink
            testId={`sigrun-menu-${testIdScope}-open-assistant`}
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
            data-testid={`sigrun-menu-${testIdScope}-language`}
            styles={{
              label: { fontSize: '18px' },
              children: { paddingLeft: 0 },
              section: {
                '&[data-position="left"]': { marginRight: showLabels ? '0.75rem' : '0' },
              },
            }}
            leftSection={<IconLanguageHiragana size={20} />}
            label={showLabels ? i18n._t('Language') : ''}
            title={i18n._t('Language')}
          >
            <NavLink
              data-testid={`sigrun-menu-${testIdScope}-language-en`}
              onClick={() => {
                saveLang('en');
                closeMenu?.();
              }}
              leftSection={<FlagEn width={24} />}
              label={showLabels ? 'en' : ''}
            />
            <NavLink
              data-testid={`sigrun-menu-${testIdScope}-language-ru`}
              onClick={() => {
                saveLang('ru');
                closeMenu?.();
              }}
              leftSection={<FlagRu width={24} />}
              label={showLabels ? 'ru' : ''}
            />
            <NavLink
              data-testid={`sigrun-menu-${testIdScope}-language-de`}
              onClick={() => {
                saveLang('de');
                closeMenu?.();
              }}
              leftSection={<FlagDe width={24} />}
              label={showLabels ? 'de' : ''}
            />
            <NavLink
              data-testid={`sigrun-menu-${testIdScope}-language-ko`}
              onClick={() => {
                saveLang('ko');
                closeMenu?.();
              }}
              leftSection={<FlagKo width={24} />}
              label={showLabels ? 'ko' : ''}
            />
            <NavLink
              data-testid={`sigrun-menu-${testIdScope}-language-jp`}
              onClick={() => {
                saveLang('jp');
                closeMenu?.();
              }}
              leftSection={<FlagJa width={24} />}
              label={showLabels ? 'jp' : ''}
            />
            <NavLink
              data-testid={`sigrun-menu-${testIdScope}-language-cn`}
              onClick={() => {
                saveLang('cn');
                closeMenu?.();
              }}
              leftSection={<FlagCn width={24} />}
              label={showLabels ? 'cn' : ''}
            />
            <NavLink
              data-testid={`sigrun-menu-${testIdScope}-language-be`}
              onClick={() => {
                saveLang('be');
                closeMenu?.();
              }}
              leftSection={<FlagBe width={24} />}
              label={showLabels ? 'be' : ''}
            />
          </NavLink>
          <NavLink
            data-testid={`sigrun-menu-${testIdScope}-dimmed-colors`}
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
            data-testid={`sigrun-menu-${testIdScope}-color-scheme`}
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
