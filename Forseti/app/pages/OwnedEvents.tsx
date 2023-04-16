import * as React from 'react';
import { usePageTitle } from '#/hooks/pageTitle';
import {
  Group,
  Center,
  Container,
  Stack,
  ActionIcon,
  Tooltip,
  Avatar,
  Pagination,
  Space,
  Badge,
  useMantineTheme,
  useMantineColorScheme,
  Modal,
  Text,
  Button,
  Menu,
} from '@mantine/core';
import {
  IconEyeOff,
  IconEye,
  IconTool,
  IconRefreshAlert,
  IconHandStop,
  IconFriends,
  IconTournament,
  IconNetwork,
  IconAlertOctagon,
  IconOlympics,
  IconScript,
} from '@tabler/icons-react';
import { Link, Redirect } from 'wouter';
import { useApi } from '#/hooks/api';
import { useI18n } from '#/hooks/i18n';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useStorage } from '#/hooks/storage';
import type { Event } from '#/clients/atoms.pb';
import { environment } from '#config';
import { authCtx } from '#/hooks/auth';
import { useDisclosure } from '@mantine/hooks';
import { nprogress } from '@mantine/nprogress';

export const OwnedEvents: React.FC<{ params: { page?: string } }> = ({ params: { page } }) => {
  const EVENTS_PERPAGE = 30;
  const api = useApi();
  const auth = useContext(authCtx);
  const i18n = useI18n();
  const storage = useStorage();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const [stopEventModalOpened, { close: stopEventModalClose, open: stopEventModalOpen }] =
    useDisclosure(false);
  const [stopEventData, setStopEventData] = useState({ id: 0, title: '' });
  const [currentPage, setCurrentPage] = useState(parseInt(page ?? '1', 10));
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [visibilityLoading, setVisibilityLoading] = useState<Record<number, boolean>>({});
  const [scoringLoading, setScoringLoading] = useState<Record<number, boolean>>({});
  usePageTitle(i18n._t('Manage my events'));

  const loadPageData = useCallback(() => {
    if (!auth.isLoggedIn || !storage.getPersonId()) {
      setIsLoading(false);
      return;
    }
    nprogress.reset();
    nprogress.start();
    setIsLoading(true);
    Promise.all([
      api.getOwnedEventIds(storage.getPersonId()!),
      api.getSuperadminFlag(storage.getPersonId()!),
    ])
      .then(([eventsList, superadmin]) => {
        setIsSuperadmin(superadmin);
        const pageOffset = (currentPage - 1) * EVENTS_PERPAGE;
        if (eventsList.includes(-1)) {
          // -1 === global privileges
          api.getEvents(EVENTS_PERPAGE, pageOffset, false).then((resp) => {
            setEvents(resp.events);
            setTotalPages(Math.ceil(resp.total / EVENTS_PERPAGE));
            setIsLoading(false);
            nprogress.complete();
          });
        } else {
          const eventIds = eventsList.slice(pageOffset, pageOffset + EVENTS_PERPAGE);
          api.getEventsById(eventIds).then((resp) => {
            setEvents(resp);
            setTotalPages(Math.ceil(eventsList.length / EVENTS_PERPAGE));
            setIsLoading(false);
            nprogress.complete();
          });
        }
      })
      .catch(() => {
        setIsLoading(false);
        nprogress.complete();
      });
  }, [currentPage, auth]);

  const setPage = useCallback((newpage: number) => {
    setCurrentPage(newpage);
    loadPageData();
  }, []);

  const toggleVisibility = (id: number) => {
    setVisibilityLoading({ ...scoringLoading, [id]: true });
    api.toggleListed(id).then((resp) => {
      if (resp) {
        const idx = events.findIndex((ev) => ev.id === id);
        setEvents([
          ...events.slice(0, idx),
          { ...events[idx], isListed: !events[idx].isListed },
          ...events.slice(idx + 1),
        ]);
      }
      setVisibilityLoading({ ...scoringLoading, [id]: false });
    });
  };

  const rebuildScoring = (id: number) => {
    setScoringLoading({ ...scoringLoading, [id]: true });
    api.rebuildScoring(id).finally(() => {
      setScoringLoading({ ...scoringLoading, [id]: false });
    });
  };

  const stopEvent = (id: number) => {
    api.finishEvent(id).then((resp) => {
      if (resp) {
        const idx = events.findIndex((ev) => ev.id === id);
        setEvents([
          ...events.slice(0, idx),
          { ...events[idx], finished: true },
          ...events.slice(idx + 1),
        ]);
      }
    });
  };

  // Initial load
  useEffect(loadPageData, [auth]);

  if (!storage.getPersonId()) {
    return <Redirect to='/profile/login' />;
  }

  return isLoading ? null : (
    <>
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
      <Container pos='relative' sx={{ minHeight: '400px' }}>
        <Group position='right'>
          <Link to='/ownedEvents/new'>
            <Button>{i18n._t('Create new event')}</Button>
          </Link>
        </Group>
        <Space h='xl' />
        <Stack justify='flex-start' spacing='0'>
          {events.map((event, idx) => {
            return (
              <Group
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
                <Group sx={{ flex: 1, minWidth: '300px' }}>
                  {event.type === 'LOCAL' && (
                    <Tooltip
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
                  {event.type === 'TOURNAMENT' && (
                    <Tooltip
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
                  {event.type === 'ONLINE' && (
                    <Tooltip
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
                  <a href={`${environment.guiUrl}/eid${event.id}`} target='_blank'>
                    {event.title}
                  </a>
                </Group>
                <Group position='right'>
                  {!event.finished && (
                    <Menu shadow='md' width={200}>
                      <Menu.Target>
                        <Button>{i18n._t('Actions')}</Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Label>{i18n._t('Event management')}</Menu.Label>
                        {event.isPrescripted && (
                          <Link to={`/event/${event.id}/prescript`}>
                            <Menu.Item
                              title={i18n._t('Manage predefined seating')}
                              icon={<IconScript />}
                            >
                              {i18n._t('Predefined seating')}
                            </Menu.Item>
                          </Link>
                        )}
                        <Link to={`/event/${event.id}/games`}>
                          <Menu.Item
                            title={i18n._t('Manage current games')}
                            icon={<IconOlympics />}
                          >
                            {i18n._t('Manage games')}
                          </Menu.Item>
                        </Link>
                        <Link to={`/event/${event.id}/penalties`}>
                          <Menu.Item
                            title={i18n._t('Manage penalties')}
                            icon={<IconAlertOctagon />}
                          >
                            {i18n._t('Penalties')}
                          </Menu.Item>
                        </Link>
                        <Link to={`/event/${event.id}/players`}>
                          <Menu.Item title={i18n._t('Manage players')} icon={<IconFriends />}>
                            {i18n._t('Manage players')}
                          </Menu.Item>
                        </Link>
                        <Link to={`/ownedEvents/edit/${event.id}`}>
                          <Menu.Item title={i18n._t('Edit event settings')} icon={<IconTool />}>
                            {i18n._t('Settings')}
                          </Menu.Item>
                        </Link>

                        <Menu.Divider />
                        <Menu.Label>{i18n._t('Danger zone')}</Menu.Label>
                        {isSuperadmin && (
                          <Menu.Item
                            title={i18n._t('Rebuild scoring')}
                            onClick={() => rebuildScoring(event.id)}
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
                            setStopEventData({ id: event.id, title: event.title });
                            stopEventModalOpen();
                          }}
                        >
                          {i18n._t('Finish event')}
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  )}

                  {event.finished && (
                    <Badge color='pink' variant='outline'>
                      {i18n._t('Event finished')}
                    </Badge>
                  )}

                  <ActionIcon
                    title={i18n._t('Toggle visibility in ratings global list')}
                    loading={visibilityLoading[event.id]}
                    variant='filled'
                    size='lg'
                    color='gray'
                    onClick={() => toggleVisibility(event.id)}
                  >
                    {event.isListed ? <IconEye /> : <IconEyeOff />}
                  </ActionIcon>
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
            <Pagination total={totalPages} siblings={2} value={currentPage} onChange={setPage} />
          </Center>
        </>
      )}
    </>
  );
};
