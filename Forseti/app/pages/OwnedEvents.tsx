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

import * as React from 'react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePageTitle } from '../hooks/pageTitle';
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Center,
  Container,
  Group,
  Menu,
  Modal,
  Pagination,
  Space,
  Stack,
  Text,
  Tooltip,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import {
  IconAlertOctagon,
  IconCopy,
  IconExternalLink,
  IconEye,
  IconFriends,
  IconHandStop,
  IconMilitaryRank,
  IconNetwork,
  IconOlympics,
  IconRefreshAlert,
  IconScript,
  IconSquare,
  IconSquareCheckFilled,
  IconTool,
  IconTournament,
} from '@tabler/icons-react';
import { Link, Redirect } from 'wouter';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { useStorage } from '../hooks/storage';
import { Event, EventType } from 'tsclients/proto/atoms.pb';
import { authCtx, PrivilegesLevel } from '../hooks/auth';
import { useDisclosure } from '@mantine/hooks';
import { nprogress } from '@mantine/nprogress';
import { MenuItemLink } from '../components/MenuItemLink';
import { env } from '../env';
import { notifications } from '@mantine/notifications';
import { loadOwnedEvents } from '../helpers/ownedEventsData';

export const OwnedEvents: React.FC<{ params: { page?: string } }> = ({ params: { page } }) => {
  const EVENTS_PERPAGE = 30;
  const api = useApi();
  api.setEventId(0);
  const { isLoggedIn, privilegesLevel } = useContext(authCtx);
  const i18n = useI18n();
  const storage = useStorage();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const [stopEventModalOpened, { close: stopEventModalClose, open: stopEventModalOpen }] =
    useDisclosure(false);
  const [stopEventData, setStopEventData] = useState({ id: 0, title: '' });
  const [currentPage, setCurrentPage] = useState(parseInt(page ?? '1', 10));
  const [onlyOngoing, setOnlyOngoing] = useState(true);
  const loadRequest = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [visibilityLoading, setVisibilityLoading] = useState<Record<number, boolean>>({});
  const [resultsLoading, setResultsLoading] = useState<Record<number, boolean>>({});
  const [achievementsLoading, setAchievementsLoading] = useState<Record<number, boolean>>({});
  const [scoringLoading, setScoringLoading] = useState<Record<number, boolean>>({});
  usePageTitle(i18n._t('Manage my events'));

  const errHandler = useCallback((err: Error) => {
    notifications.show({
      title: i18n._t('Error has occurred'),
      message: err.message,
      color: 'red',
    });
  }, []);

  const loadPageData = useCallback(
    async (pageToLoad: number) => {
      const request = ++loadRequest.current;
      if (!isLoggedIn || !storage.getPersonId()) {
        setIsLoading(false);
        return;
      }
      nprogress.reset();
      nprogress.start();
      setIsLoading(true);
      try {
        const result = await loadOwnedEvents(
          api,
          storage.getPersonId()!,
          pageToLoad,
          onlyOngoing,
          EVENTS_PERPAGE
        );
        if (request !== loadRequest.current) return;
        setEvents(result.events);
        setCurrentPage(result.page);
        setTotalPages(result.totalPages);
      } catch (e) {
        if (request === loadRequest.current) errHandler(e as Error);
      } finally {
        if (request === loadRequest.current) {
          setIsLoading(false);
          nprogress.complete();
        }
      }
    },
    [isLoggedIn, onlyOngoing]
  );

  const setPage = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const setFilter = (ongoing: boolean) => {
    setCurrentPage(1);
    setOnlyOngoing(ongoing);
  };

  const toggleVisibility = (id: number) => {
    setVisibilityLoading({ ...scoringLoading, [id]: true });
    api
      .toggleListed(id)
      .then((resp) => {
        if (resp) {
          const idx = events.findIndex((ev) => ev.id === id);
          setEvents([
            ...events.slice(0, idx),
            { ...events[idx], isListed: !events[idx].isListed },
            ...events.slice(idx + 1),
          ]);
        }
        setVisibilityLoading({ ...scoringLoading, [id]: false });
      })
      .catch(errHandler);
  };

  const rebuildScoring = (id: number) => {
    setScoringLoading({ ...scoringLoading, [id]: true });
    api.rebuildScoring(id).finally(() => {
      setScoringLoading({ ...scoringLoading, [id]: false });
    });
  };

  const stopEvent = (id: number) => {
    api
      .finishEvent(id)
      .then((resp) => {
        if (resp) {
          void loadPageData(currentPage);
        }
      })
      .catch(errHandler);
  };

  const onToggleResults = (id: number) => {
    setResultsLoading({ ...resultsLoading, [id]: true });
    api
      .toggleResults(id)
      .then((r) => {
        if (!r) {
          throw new Error(i18n._t('Failed to toggle results visibility'));
        }
        if (r) {
          const idx = events.findIndex((ev) => ev.id === id);
          setEvents([
            ...events.slice(0, idx),
            { ...events[idx], isRatingShown: !events[idx].isRatingShown },
            ...events.slice(idx + 1),
          ]);
        }
        setResultsLoading({ ...resultsLoading, [id]: false });
      })
      .catch(errHandler);
  };

  const onToggleAchievements = (id: number) => {
    setAchievementsLoading({ ...achievementsLoading, [id]: true });
    api
      .toggleAchievements(id)
      .then((r) => {
        if (!r) {
          throw new Error(i18n._t('Failed to toggle achievements visibility'));
        }
        if (r) {
          const idx = events.findIndex((ev) => ev.id === id);
          setEvents([
            ...events.slice(0, idx),
            { ...events[idx], achievementsShown: !events[idx].achievementsShown },
            ...events.slice(idx + 1),
          ]);
        }
        setAchievementsLoading({ ...resultsLoading, [id]: false });
      })
      .catch(errHandler);
  };

  useEffect(() => {
    void loadPageData(currentPage);
    return () => {
      loadRequest.current++;
    };
  }, [loadPageData, currentPage]);

  if (!storage.getPersonId()) {
    return <Redirect to='/profile/login' />;
  }

  return (
    <>
      <Modal
        data-testid='forseti-owned-events-stop-modal'
        opened={stopEventModalOpened}
        onClose={stopEventModalClose}
        size='auto'
        centered
      >
        <Text>
          {i18n._t('Stop event "%1" (id #%2)? This action can\'t be undone!', [
            stopEventData.title,
            stopEventData.id,
          ])}
        </Text>
        <Group mt='xl' grow>
          <Button
            data-testid='forseti-owned-events-stop-cancel'
            variant='outline'
            onClick={stopEventModalClose}
          >
            {i18n._t('Cancel')}
          </Button>
          <Button
            data-testid='forseti-owned-events-stop-confirm'
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
      <Container
        data-testid='forseti-owned-events-page'
        aria-busy={isLoading}
        pos='relative'
        style={{ minHeight: '400px' }}
      >
        <Group gap='xs' mb='md'>
          <Badge
            data-testid='forseti-owned-events-filter-ongoing'
            component='button'
            type='button'
            size='lg'
            color='orange'
            radius='sm'
            variant={onlyOngoing ? 'filled' : 'light'}
            aria-pressed={onlyOngoing}
            onClick={() => setFilter(true)}
            style={{ cursor: 'pointer' }}
          >
            {i18n._t('Only ongoing events')}
          </Badge>
          <Badge
            data-testid='forseti-owned-events-filter-all'
            component='button'
            type='button'
            size='lg'
            color='lime'
            radius='sm'
            variant={onlyOngoing ? 'light' : 'filled'}
            aria-pressed={!onlyOngoing}
            onClick={() => setFilter(false)}
            style={{ cursor: 'pointer' }}
          >
            {i18n._t('All my events')}
          </Badge>
        </Group>
        <Stack justify='flex-start' gap='0'>
          {events.map((event, idx) => {
            return (
              <Group
                data-testid={`forseti-owned-event-row-${event.id}`}
                key={`ev_${idx}`}
                style={{
                  padding: '10px',
                  backgroundColor:
                    idx % 2
                      ? isDark
                        ? theme.colors.dark[7]
                        : theme.colors.gray[1]
                      : 'transparent',
                }}
              >
                <Group style={{ flex: 1, flexWrap: 'nowrap' }}>
                  {event.type === EventType.EVENT_TYPE_LOCAL && (
                    <Tooltip
                      events={{ hover: true, touch: true, focus: true }}
                      openDelay={500}
                      position='bottom'
                      withArrow
                      label={i18n._t('Local rating')}
                    >
                      <Avatar color='green' radius='xl'>
                        <IconFriends />
                      </Avatar>
                    </Tooltip>
                  )}
                  {event.type === EventType.EVENT_TYPE_TOURNAMENT && (
                    <Tooltip
                      events={{ hover: true, touch: true, focus: true }}
                      openDelay={500}
                      position='bottom'
                      withArrow
                      label={i18n._t('Tournament')}
                    >
                      <Avatar color='red' radius='xl'>
                        <IconTournament />
                      </Avatar>
                    </Tooltip>
                  )}
                  {event.type === EventType.EVENT_TYPE_ONLINE && (
                    <Tooltip
                      events={{ hover: true, touch: true, focus: true }}
                      openDelay={500}
                      position='bottom'
                      withArrow
                      label={i18n._t('Online event')}
                    >
                      <Avatar color='blue' radius='xl'>
                        <IconNetwork />
                      </Avatar>
                    </Tooltip>
                  )}
                  <Link
                    data-testid={`forseti-owned-event-settings-link-${event.id}`}
                    to={`/ownedEvents/edit/${event.id}`}
                  >
                    {event.title}
                  </Link>
                  <a
                    data-testid={`forseti-owned-event-public-link-${event.id}`}
                    href={`${env.urls.sigrun}/event/${event.id}/info`}
                    target='_blank'
                  >
                    <ActionIcon
                      title={i18n._t('Open event page in new tab')}
                      loading={visibilityLoading[event.id]}
                      variant='subtle'
                      size='sm'
                      color='gray'
                    >
                      <IconExternalLink />
                    </ActionIcon>
                  </a>
                </Group>
                <Group justify='flex-end' gap='xs' ml='auto'>
                  {event.finished && (
                    <Badge color='pink' variant='outline'>
                      {i18n._t('Event finished')}
                    </Badge>
                  )}
                  <Menu shadow='md' width={200}>
                    <Menu.Target>
                      <Button data-testid={`forseti-owned-event-actions-${event.id}`} color='grape'>
                        {i18n._t('Actions')}
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>{i18n._t('Event management')}</Menu.Label>
                      <MenuItemLink
                        testId={`forseti-owned-event-copy-${event.id}`}
                        href={`/ownedEvents/copy/${event.id}`}
                        icon={<IconCopy />}
                        text={i18n._t('Copy event')}
                      />
                      {!event.finished && (
                        <>
                          {privilegesLevel >= PrivilegesLevel.ADMIN && (
                            <MenuItemLink
                              testId={`forseti-owned-event-menu-settings-${event.id}`}
                              href={`/ownedEvents/edit/${event.id}`}
                              title={i18n._t('Edit event settings')}
                              icon={<IconTool />}
                              text={i18n._t('Settings')}
                            />
                          )}
                          {privilegesLevel >= PrivilegesLevel.ADMIN && (
                            <MenuItemLink
                              testId={`forseti-owned-event-menu-privileges-${event.id}`}
                              href={`/ownedEvents/privileges/${event.id}`}
                              title={i18n._t('Manage administrators and referees in event')}
                              icon={<IconMilitaryRank />}
                              text={i18n._t('Manage privileges')}
                            />
                          )}
                          <MenuItemLink
                            testId={`forseti-owned-event-menu-players-${event.id}`}
                            href={`/event/${event.id}/players`}
                            title={i18n._t('Manage players')}
                            icon={<IconFriends />}
                            text={i18n._t('Manage players')}
                          />
                          <MenuItemLink
                            testId={`forseti-owned-event-menu-penalties-${event.id}`}
                            href={`/event/${event.id}/penalties`}
                            title={i18n._t('Manage penalties')}
                            icon={<IconAlertOctagon />}
                            text={i18n._t('Penalties')}
                          />
                          <MenuItemLink
                            testId={`forseti-owned-event-menu-games-${event.id}`}
                            href={`/event/${event.id}/games`}
                            title={i18n._t('Manage current games')}
                            icon={<IconOlympics />}
                            text={i18n._t('Manage games')}
                          />
                          {event.isPrescripted && privilegesLevel >= PrivilegesLevel.ADMIN && (
                            <MenuItemLink
                              testId={`forseti-owned-event-menu-seating-${event.id}`}
                              href={`/event/${event.id}/prescript`}
                              title={i18n._t('Manage predefined seating')}
                              icon={<IconScript />}
                              text={i18n._t('Predefined seating')}
                            />
                          )}
                          {privilegesLevel >= PrivilegesLevel.ADMIN && (
                            <>
                              <Menu.Divider />
                              <Menu.Label>{i18n._t('Danger zone')}</Menu.Label>
                              {privilegesLevel === PrivilegesLevel.SUPERADMIN && (
                                <Menu.Item
                                  data-testid={`forseti-owned-event-menu-rebuild-scoring-${event.id}`}
                                  title={i18n._t('Rebuild scoring')}
                                  onClick={() => rebuildScoring(event.id)}
                                  leftSection={<IconRefreshAlert />}
                                >
                                  {i18n._t('Rebuild scoring')}
                                </Menu.Item>
                              )}

                              <Menu.Item
                                data-testid={`forseti-owned-event-menu-finish-${event.id}`}
                                title={i18n._t('Finish event')}
                                color='red'
                                leftSection={<IconHandStop />}
                                onClick={() => {
                                  setStopEventData({ id: event.id, title: event.title });
                                  stopEventModalOpen();
                                }}
                              >
                                {i18n._t('Finish event')}
                              </Menu.Item>
                            </>
                          )}
                        </>
                      )}
                    </Menu.Dropdown>
                  </Menu>

                  <Menu shadow='md' width={200}>
                    <Menu.Target>
                      <ActionIcon
                        data-testid={`forseti-owned-event-visibility-${event.id}`}
                        title={i18n._t('Visibility')}
                        loading={
                          visibilityLoading[event.id] ||
                          resultsLoading[event.id] ||
                          achievementsLoading[event.id]
                        }
                        variant='filled'
                        size='lg'
                        color='gray'
                      >
                        <IconEye />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>{i18n._t('Visibility management')}</Menu.Label>
                      {privilegesLevel >= PrivilegesLevel.ADMIN && (
                        <Menu.Item
                          data-testid={`forseti-owned-event-toggle-listed-${event.id}`}
                          title={i18n._t('Toggle visibility in ratings global list')}
                          leftSection={event.isListed ? <IconSquareCheckFilled /> : <IconSquare />}
                          onClick={() => toggleVisibility(event.id)}
                        >
                          {i18n._t('Event visible in global list')}
                        </Menu.Item>
                      )}
                      <Menu.Item
                        data-testid={`forseti-owned-event-toggle-rating-${event.id}`}
                        title={i18n._t('Toggle visibility of rating table')}
                        leftSection={
                          event.isRatingShown ? <IconSquareCheckFilled /> : <IconSquare />
                        }
                        onClick={() => onToggleResults(event.id)}
                      >
                        {i18n._t('Rating table visible')}
                      </Menu.Item>
                      <Menu.Item
                        data-testid={`forseti-owned-event-toggle-achievements-${event.id}`}
                        title={i18n._t('Toggle visibility of achievements')}
                        leftSection={
                          event.achievementsShown ? <IconSquareCheckFilled /> : <IconSquare />
                        }
                        onClick={() => onToggleAchievements(event.id)}
                      >
                        {i18n._t('Achievements visible')}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>
            );
          })}
        </Stack>
      </Container>
      {totalPages > 1 && (
        <>
          <Space h='xl' />
          <Center>
            <Pagination
              data-testid='forseti-owned-events-pagination'
              total={totalPages}
              siblings={2}
              value={currentPage}
              onChange={setPage}
            />
          </Center>
        </>
      )}
    </>
  );
};
