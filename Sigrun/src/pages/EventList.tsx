import * as React from 'react';
import {
  Center,
  Container,
  Divider,
  Group,
  Pagination,
  Space,
  Text,
  Stack,
  useMantineColorScheme,
  useMantineTheme,
  ActionIcon,
} from '@mantine/core';
import { useLocation } from 'wouter';
import { useI18n } from '../hooks/i18n';
import { CSSProperties } from 'react';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { useRemarkSync } from 'react-remark';
import strip from 'strip-markdown';
import { renderToString } from 'react-dom/server';
import { useEvent } from '../hooks/useEvent';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';

let stripHtml: (dirtyString: string) => string;
if (import.meta.env.SSR) {
  stripHtml = (dirtyString) => {
    return (global as any).JSDOM.fragment(dirtyString).textContent ?? '';
  };
} else {
  stripHtml = (dirtyString: string) => {
    const doc = new DOMParser().parseFromString(dirtyString, 'text/html');
    return doc.body.textContent ?? '';
  };
}

const PERPAGE = 20;
export const EventList: React.FC<{ params: { page?: string } }> = ({ params: { page } }) => {
  page = page ?? '1';
  const api = useApi();
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const [, navigate] = useLocation();
  useEvent(null); // this resets global state
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
        {(events?.events ?? []).map((e, idx) => {
          const desc = useRemarkSync(e.description, {
            remarkPlugins: [strip as any],
          });
          const renderedDesc = stripHtml(renderToString(desc)).slice(0, 300) + '...';
          return (
            <Group
              key={`ev_${idx}`}
              style={{
                padding: '10px',
                backgroundColor:
                  idx % 2 ? (isDark ? theme.colors.dark[7] : theme.colors.gray[1]) : 'transparent',
              }}
            >
              <EventTypeIcon event={e} />
              <a
                href={`/event/${e.id}/order/rating`}
                onClick={(ev) => {
                  navigate(`/event/${e.id}/order/rating`);
                  ev.preventDefault();
                }}
              >
                <ActionIcon color='grape' variant='filled' title={i18n._t('Rating table')}>
                  <PodiumIco size='1.1rem' />
                </ActionIcon>
              </a>
              <a
                href={`/event/${e.id}/info`}
                onClick={(ev) => {
                  navigate(`/event/${e.id}/info`);
                  ev.preventDefault();
                }}
              >
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
                {renderedDesc}
              </Text>
            </Group>
          );
        })}
      </Stack>
      <Divider size='xs' />
      <Space h='md' />
      <Center>
        <Pagination
          value={parseInt(page, 10)}
          onChange={(p) => {
            navigate(`/page/${p}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
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
