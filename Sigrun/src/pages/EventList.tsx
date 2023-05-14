import * as React from 'react';
import { useApi } from '../hooks/api';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import {
  Avatar,
  Center,
  Container,
  Divider,
  Group,
  Pagination,
  Space,
  Text,
  Stack,
  Tooltip,
  useMantineColorScheme,
  useMantineTheme,
  ActionIcon,
} from '@mantine/core';
import { useLocation } from 'wouter';
import { useI18n } from '../hooks/i18n';
import { EventType } from '../clients/proto/atoms.pb';
import { IconFriends, IconNetwork, IconTournament } from '@tabler/icons-react';
import { CSSProperties } from 'react';

const PERPAGE = 20;
export const EventList: React.FC<{ params: { page?: string } }> = ({ params: { page } }) => {
  page = page ?? '1';
  const api = useApi();
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const [, navigate] = useLocation();
  const [events] = useIsomorphicState(
    [],
    'EventList_events_' + page,
    () => api.getEvents(PERPAGE, (parseInt(page ?? '1', 10) - 1) * PERPAGE, true),
    [page]
  );

  return (
    <Container>
      <h2>{i18n._t('Riichi mahjong events list')}</h2>
      <Divider size='xs' />
      <Stack justify='flex-start' spacing='0'>
        {(events?.events ?? []).map((e, idx) => (
          <Group
            key={`ev_${idx}`}
            style={{
              padding: '10px',
              backgroundColor:
                idx % 2 ? (isDark ? theme.colors.dark[7] : theme.colors.gray[1]) : 'transparent',
            }}
          >
            {e.type === EventType.EVENT_TYPE_LOCAL && (
              <Tooltip openDelay={500} position='bottom' withArrow label={i18n._t('Local rating')}>
                <Avatar color='green' radius='xl'>
                  <IconFriends />
                </Avatar>
              </Tooltip>
            )}
            {e.type === EventType.EVENT_TYPE_TOURNAMENT && (
              <Tooltip openDelay={500} position='bottom' withArrow label={i18n._t('Tournament')}>
                <Avatar color='red' radius='xl'>
                  <IconTournament />
                </Avatar>
              </Tooltip>
            )}
            {e.type === EventType.EVENT_TYPE_ONLINE && (
              <Tooltip openDelay={500} position='bottom' withArrow label={i18n._t('Online event')}>
                <Avatar color='blue' radius='xl'>
                  <IconNetwork />
                </Avatar>
              </Tooltip>
            )}
            <a href={`/event/${e.id}/rating`} onClick={() => navigate(`/event/${e.id}/rating`)}>
              <ActionIcon color='grape' variant='filled' title={i18n._t('Rating table')}>
                <PodiumIco size='1.1rem' />
              </ActionIcon>
            </a>
            <a href={`/event/${e.id}`} onClick={() => navigate(`/event/${e.id}`)}>
              {e.title}
            </a>
            <Text
              c='dimmed'
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                flex: 1,
              }}
            >
              {e.description}
            </Text>
          </Group>
        ))}
      </Stack>
      <Divider size='xs' />
      <Space h='md' />
      <Center>
        <Pagination
          value={parseInt(page, 10)}
          onChange={(p) => navigate(`/page/${p}`)}
          total={Math.ceil((events?.total ?? 0) / PERPAGE)}
        />
      </Center>
    </Container>
  );
};

function PodiumIco({ size }: { size: string }) {
  const st: CSSProperties = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: '32px',
  };
  return (
    <svg width={size} height={size} viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M32,160V456a8,8,0,0,0,8,8H176V160a16,16,0,0,0-16-16H48A16,16,0,0,0,32,160Z'
        style={st}
      />
      <path d='M320,48H192a16,16,0,0,0-16,16V464H336V64A16,16,0,0,0,320,48Z' style={st} />
      <path
        d='M464,208H352a16,16,0,0,0-16,16V464H472a8,8,0,0,0,8-8V224A16,16,0,0,0,464,208Z'
        style={st}
      />
    </svg>
  );
}
