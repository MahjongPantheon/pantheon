/*  Sigrun: rating tables and statistics frontend
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
  useMantineColorScheme,
  useMantineTheme,
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
import { Meta } from '../components/Meta';
import { useMediaQuery } from '@mantine/hooks';

let largeScreen = false;
export const Timer: React.FC<{ params: { eventId: string } }> = ({ params: { eventId } }) => {
  const events = useEvent(eventId);
  const i18n = useI18n();
  const [, setSoundPlayed] = useState(false);
  const [, setCurrentTimer] = useState(0);
  largeScreen = useMediaQuery('(min-width: 768px)');
  const [formatterTimer, setFormattedTimer] = useState<ReactNode | null>(null);
  const [showSeating, setShowSeating] = useState(false);
  const [timerWaiting, setTimerWaiting] = useState(false);

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
    let shouldUpdateTimerFromServer = true;
    let hideSeatingAfter = 0;
    const timer = setInterval(() => {
      if (shouldUpdateTimerFromServer) {
        api.getTimerState(parseInt(eventId, 10)).then((newState) => {
          setShowSeating(
            newState.timeRemaining > newState.hideSeatingAfter || newState.waitingForTimer
          );
          setTimerWaiting(newState.waitingForTimer);
          hideSeatingAfter = newState.hideSeatingAfter;
          // If we're still watinig, we do updates every second.
          shouldUpdateTimerFromServer = newState.waitingForTimer;
          setSoundPlayed((old) => {
            if (newState.finished && !old) {
              (window as any).__endingSound.play();
              return true;
            } else {
              return old;
            }
          });

          setCurrentTimer(newState.timeRemaining);
          setFormattedTimer(
            formatTimer(
              newState.finished,
              newState.timeRemaining,
              newState.timeRemaining > newState.hideSeatingAfter
            )
          );
        });
      } else {
        setCurrentTimer((oldT) => {
          const newT = oldT - 1;
          const showSeat = newT > hideSeatingAfter; // hideSeatingAfter contains time point on decreasing scale.
          setFormattedTimer(formatTimer(newT <= 0, newT, showSeat || !largeScreen));
          setShowSeating(showSeat);
          if (oldT > 0 && oldT % 60 === 0) {
            // update timer from server once a minute (auto update in case of timer reset, for example)
            shouldUpdateTimerFromServer = true;
          }
          return newT;
        });
      }
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
      <Meta
        title={`${i18n._t('Timer')} - ${events?.[0].title} - Sigrun`}
        description={i18n._t('Timer page for the event "%1" provided by Mahjong Pantheon', [
          events?.[0].title,
        ])}
      />
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
      {!timerWaiting && <Center>{formatterTimer}</Center>}
      {showSeating && (
        <Group style={{ alignItems: 'flex-start' }}>
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
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const theme = useMantineTheme();
  return (
    <Group
      align='flex-start'
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[4],
        borderRadius: '7px',
        padding: '5px',
        backgroundColor: isDark ? theme.colors.dark[6] : theme.colors.gray[2],
      }}
    >
      <Badge variant='filled' size='xl' radius='sm' pl={8} pr={8}>
        {index}
      </Badge>
      <Stack spacing={0}>
        {table.map((seat, idx) => (
          <Group key={`st_${idx}`} position='apart' style={{ alignItems: 'flex-start' }}>
            <Badge size='xl' radius='sm' p={5} color={colors[idx]}>
              {winds[idx]}
            </Badge>
            <Text pt={3} style={{ width: '160px', fontWeight: 'bold' }}>
              {seat.playerTitle}
            </Text>
            <Badge
              w={60}
              radius='sm'
              pl={5}
              pr={5}
              mt={5}
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

function formatTimer(finished: boolean, timeRemaining: number, small: boolean) {
  if (finished) {
    return <IconAlarm size={small ? 120 : 240} />;
  }

  const minutes = (Math.ceil(timeRemaining / 60) - (timeRemaining % 60 === 0 ? 0 : 1)).toString();
  const seconds =
    timeRemaining % 60 >= 10
      ? (timeRemaining % 60).toString()
      : '0' + (timeRemaining % 60).toString();

  return (
    <Text size={small ? 100 : 240}>
      {minutes}:{seconds}
    </Text>
  );
}
