import * as React from 'react';
import {
  Alert,
  Badge,
  Center,
  Container,
  Divider,
  Group,
  MantineColor,
  Space,
  Stack,
  Text,
} from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { useEvent } from '../hooks/useEvent';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { ReactNode, useEffect, useState } from 'react';
import { IconAlarm } from '@tabler/icons-react';
import { PlayerSeating } from '../clients/proto/atoms.pb';
import sound from '../../assets/snd/5min.wav';
import { useI18n } from '../hooks/i18n';
import { Helmet } from 'react-helmet';

export const Timer: React.FC<{ params: { eventId: string } }> = ({ params: { eventId } }) => {
  const events = useEvent(eventId);
  const i18n = useI18n();
  const [soundPlayed, setSoundPlayed] = useState(false);
  const [formatterTimer, setFormattedTimer] = useState<ReactNode | null>(null);
  const [showSeating, setShowSeating] = useState(false);
  const api = useApi();
  const [seating] = useIsomorphicState(
    [],
    'TimerState_seating_' + eventId,
    () => api.getSeating(parseInt(eventId, 10)),
    [eventId]
  );

  useEffect(() => {
    if (!(window as any).__endingSound) {
      (window as any).__endingSound = new Audio(sound); // buffers automatically when created
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      api.getTimerState(parseInt(eventId, 10)).then((newState) => {
        setShowSeating(newState.showSeating);
        setSoundPlayed((old) => {
          if (newState.finished && !old) {
            (window as any).__endingSound.play();
            return true;
          } else {
            return old;
          }
        });

        setFormattedTimer(
          formatTimer(
            newState.waitingForTimer,
            newState.finished,
            newState.timeRemaining,
            newState.showSeating
          )
        );
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!events || !seating) {
    return null;
  }

  if (events?.length > 1) {
    return (
      <Container>
        <Alert color='red'>{i18n._t('Timer is not available for aggregated events')}</Alert>
      </Container>
    );
  }

  const tables = new Map<number, PlayerSeating[]>();
  for (const t of seating ?? []) {
    if (!tables.has(t.tableIndex)) {
      tables.set(t.tableIndex, []);
    }

    const table = tables.get(t.tableIndex);
    if (table) {
      table.push(t);
    }
  }

  for (const v of tables.values()) {
    v.sort((a, b) => a.order - b.order);
  }

  const tablesIterable = [...tables.entries()]
    .map(([index, table]) => ({ index, table }))
    .sort((a, b) => a.index - b.index);

  return (
    <Container w='100%' m={10} maw='100%'>
      <Helmet>
        <title>
          {i18n._t('Timer')} - {events[0]?.title} - Sigrun
        </title>
      </Helmet>
      {!showSeating && (
        <>
          <h2 style={{ display: 'flex', gap: '20px' }}>
            {events[0] && <EventTypeIcon event={events[0]} />}
            {events[0]?.title}
          </h2>
          <Divider size='xs' />
          <Space h='md' />
        </>
      )}
      <Center>{formatterTimer}</Center>
      {showSeating && (
        <Group>
          {tablesIterable.map((table, tidx) => (
            <Table key={`tbl_${tidx}`} table={table.table} index={table.index} />
          ))}
        </Group>
      )}
    </Container>
  );
};

const winds = ['東', '南', '西', '北'];
const colors: MantineColor[] = ['red', 'yellow', 'green', 'blue'];
function Table({ index, table }: { index: number; table: PlayerSeating[] }) {
  return (
    <Group
      align='flex-start'
      style={{
        border: '1px solid #ccc',
        borderRadius: '7px',
        padding: '5px',
        backgroundColor: '#eee',
      }}
    >
      <Badge variant='filled' size='xl' radius='sm' pl={8} pr={8}>
        {index}
      </Badge>
      <Stack spacing={0}>
        {table.map((seat, idx) => (
          <Group key={`st_${idx}`} position='apart'>
            <Badge size='xl' radius='sm' p={5} color={colors[idx]}>
              {winds[idx]}
            </Badge>
            {seat.playerTitle}
            <Badge
              radius='sm'
              pl={5}
              pr={5}
              color={seat.rating > 0 ? 'green' : 'red'}
              variant='filled'
            >
              {seat.rating}
            </Badge>
          </Group>
        ))}
      </Stack>
    </Group>
  );
}

function formatTimer(waiting: boolean, finished: boolean, timeRemaining: number, small: boolean) {
  if (waiting || finished) {
    return <IconAlarm size={small ? 120 : 240} />;
  }

  const minutes = (Math.ceil(timeRemaining / 60) - (timeRemaining % 60 === 0 ? 0 : 1)).toString();
  const seconds =
    timeRemaining % 60 >= 10
      ? (timeRemaining % 60).toString()
      : '0' + (timeRemaining % 60).toString();

  return (
    <Text size={small ? 120 : 240}>
      {minutes}:{seconds}
    </Text>
  );
}
