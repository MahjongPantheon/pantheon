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
  LoadingOverlay,
  Pagination,
  Space,
  Badge,
  useMantineTheme,
  useMantineColorScheme,
  Modal,
  Text,
  Button,
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
    setIsLoading(true);
    Promise.all([
      api.getOwnedEventIds(storage.getPersonId()!),
      api.getSuperadminFlag(storage.getPersonId()!),
    ])
      .then(([events, superadmin]) => {
        setIsSuperadmin(superadmin);
        const pageOffset = (currentPage - 1) * EVENTS_PERPAGE;
        if (events.includes(-1)) {
          // -1 === global privileges
          api.getEvents(EVENTS_PERPAGE, pageOffset, false).then((resp) => {
            setEvents(resp.events);
            setTotalPages(Math.ceil(resp.total / EVENTS_PERPAGE));
            setIsLoading(false);
          });
        } else {
          const eventIds = events.slice(pageOffset, pageOffset + EVENTS_PERPAGE);
          api.getEventsById(eventIds).then((resp) => {
            setEvents(resp);
            setTotalPages(Math.ceil(events.length / EVENTS_PERPAGE));
            setIsLoading(false);
          });
        }
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [currentPage, auth]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
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

  return (
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
        <LoadingOverlay visible={isLoading} overlayBlur={2} />
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
                key={'ev_' + idx}
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
                  <ActionIcon
                    title={i18n._t('Toggle visibility in ratings global list')}
                    loading={visibilityLoading[event.id]}
                    variant='filled'
                    size='lg'
                    color='grape'
                    onClick={() => toggleVisibility(event.id)}
                  >
                    {event.isListed ? <IconEye /> : <IconEyeOff />}
                  </ActionIcon>
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
                  <a href={environment.guiUrl + '/eid' + event.id} target='_blank'>
                    {event.title}
                  </a>
                </Group>
                <Group>
                  {!event.finished && (
                    <Link to={'/ownedEvents/edit/' + event.id}>
                      <ActionIcon
                        variant='filled'
                        size='lg'
                        color='blue'
                        title={i18n._t('Edit event settings')}
                      >
                        <IconTool />
                      </ActionIcon>
                    </Link>
                  )}
                  {!event.finished && !!isSuperadmin && (
                    <ActionIcon
                      title={i18n._t('Rebuild scoring')}
                      loading={scoringLoading[event.id]}
                      variant='filled'
                      size='lg'
                      color='orange'
                      onClick={() => rebuildScoring(event.id)}
                    >
                      <IconRefreshAlert />
                    </ActionIcon>
                  )}
                  {!event.finished && (
                    <ActionIcon
                      title={i18n._t('Stop event')}
                      variant='filled'
                      size='lg'
                      radius='xl'
                      color='red'
                      onClick={() => {
                        setStopEventData({ id: event.id, title: event.title });
                        stopEventModalOpen();
                      }}
                    >
                      <IconHandStop />
                    </ActionIcon>
                  )}

                  {event.finished && (
                    <Badge color='pink' variant='outline'>
                      {i18n._t('Event finished')}
                    </Badge>
                  )}
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
