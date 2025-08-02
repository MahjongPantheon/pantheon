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
import { useI18n } from '../../hooks/i18n';
import {
  GameConfig,
  RegisteredPlayer,
  SessionStatus,
  TableState,
  TournamentGamesStatus,
} from 'tsclients/proto/atoms.pb';
import {
  Box,
  Button,
  Checkbox,
  Group,
  SegmentedControl,
  Select,
  Space,
  Stack,
  Text,
} from '@mantine/core';
import { useState } from 'react';
import { Confirmation } from './Confirmation';
import {
  IconArrowsRandom,
  IconClockHour3,
  IconEyeCheck,
  IconLineHeight,
  IconNotification,
  IconPlayerPlay,
  IconScript,
  IconSortAscending2,
  IconSquareX,
} from '@tabler/icons-react';
enum Stage {
  NOT_READY = 'not_ready',
  READY_BUT_NOT_STARTED = 'ready_not_started',
  SEATING_INPROGRESS = 'seating_inprogress',
  SEATING_READY = 'seating_ready',
  STARTED = 'started',
  PREFINISHED = 'prefinished',
}

type TournamentControlsProps = {
  players: RegisteredPlayer[];
  tablesState: TableState[];
  eventConfig: GameConfig | null;
  toggleResults: () => void;
  makeRandomSeating: () => void;
  makeIntervalSeating: (interval: number) => void;
  makeSwissSeating: () => void;
  makeNextPredefinedSeating: (rndSeats: boolean) => void;
  startTimer: () => void;
  notifyPlayers: () => void;
  addExtraTime: (amount: number) => void;
  approveResults: () => void;
  resetSeating: () => void;
  seatingLoading: boolean;
};
export function TournamentControls({
  players,
  tablesState,
  eventConfig,
  toggleResults,
  makeIntervalSeating,
  makeRandomSeating,
  makeSwissSeating,
  makeNextPredefinedSeating,
  approveResults,
  startTimer,
  notifyPlayers,
  addExtraTime,
  resetSeating,
  seatingLoading,
}: TournamentControlsProps) {
  const i18n = useI18n();
  const [interval, setInterval] = useState<string | null>('1');
  const [extraTime, setExtraTime] = useState<string | null>('60');
  const [rndSeats, setRndSeats] = useState(false);
  const currentStage = determineStage(tablesState, players, eventConfig, seatingLoading);

  return (
    <>
      <Text weight='bold'>{i18n._t('Current status')}</Text>
      <Group align='flex-start'>
        <SegmentedControl
          color='blue'
          orientation='vertical'
          value={currentStage}
          data={[
            { label: i18n._t('Not ready'), value: Stage.NOT_READY },
            { label: i18n._t('Not started'), value: Stage.READY_BUT_NOT_STARTED },
            { label: i18n._t('Seating...'), value: Stage.SEATING_INPROGRESS },
            { label: i18n._t('Seating ready'), value: Stage.SEATING_READY },
            { label: i18n._t('Session started'), value: Stage.STARTED },
            { label: i18n._t('Ready to approve'), value: Stage.PREFINISHED },
          ]}
        />
        {currentStage === Stage.NOT_READY && (
          <Box>
            {i18n._t("Can't generate seating: count of registered players is not divisible by 4")}
          </Box>
        )}
        {currentStage === Stage.READY_BUT_NOT_STARTED && !eventConfig?.isPrescripted && (
          <Stack>
            <Button color={eventConfig?.hideResults ? 'red' : 'gray'} onClick={toggleResults}>
              {eventConfig?.hideResults
                ? i18n._t('Show results table and achievements')
                : i18n._t('Hide results table and achievements')}
            </Button>
            <Confirmation
              i18n={i18n}
              title={i18n._t('Use random seating for next session')}
              text={i18n._t('Random seating')}
              warning={i18n._t('Use random seating for next session?')}
              icon={<IconArrowsRandom />}
              color='indigo'
              onConfirm={makeRandomSeating}
            />
            <Confirmation
              disabled={tablesState.length === 0}
              i18n={i18n}
              title={
                tablesState.length === 0
                  ? i18n._t("Interval seating can't be used for first session in tournament")
                  : i18n._t('Use interval seating for next session')
              }
              text={i18n._t('Interval seating')}
              warning={
                <>
                  <Select
                    label={i18n._t('Select interval')}
                    value={interval}
                    onChange={setInterval}
                    data={[
                      { value: '1', label: '1-2-3-4' },
                      { value: '2', label: '1-3-5-7' },
                      { value: '3', label: '1-4-7-11' },
                      { value: '4', label: '1-5-9-13' },
                      { value: '5', label: '1-6-11-16' },
                      { value: '6', label: '1-7-13-19' },
                    ]}
                  />
                  <Space h='md' />
                  <Text>{i18n._t('Use interval seating for next session?')}</Text>
                </>
              }
              icon={<IconLineHeight />}
              color='green'
              onConfirm={() => {
                makeIntervalSeating(parseInt(interval ?? '0', 10));
              }}
            />
            <Confirmation
              disabled={tablesState.length === 0}
              i18n={i18n}
              title={
                tablesState.length === 0
                  ? i18n._t("Swiss seating can't be used for first session in tournament")
                  : i18n._t('Use swiss seating for next session')
              }
              text={i18n._t('Swiss seating')}
              warning={i18n._t('Use swiss seating for next session?')}
              icon={<IconSortAscending2 />}
              color='grape'
              onConfirm={makeSwissSeating}
            />
          </Stack>
        )}
        {currentStage === Stage.READY_BUT_NOT_STARTED && !!eventConfig?.isPrescripted && (
          <Stack>
            <Button color={eventConfig?.hideResults ? 'red' : 'gray'} onClick={toggleResults}>
              {eventConfig?.hideResults
                ? i18n._t('Show results table')
                : i18n._t('Hide results table')}
            </Button>
            <Confirmation
              i18n={i18n}
              title={i18n._t('Generate seating for next session')}
              text={i18n._t('Next seating')}
              warning={
                <>
                  <Checkbox
                    label={i18n._t('Randomize seating by wind')}
                    checked={rndSeats}
                    onChange={(event) => setRndSeats(event.currentTarget.checked)}
                  />
                  <Space h='md' />
                  <Text>{i18n._t('Apply seating for next session?')}</Text>
                </>
              }
              icon={<IconScript />}
              color='green'
              onConfirm={() => {
                makeNextPredefinedSeating(rndSeats);
              }}
            />
          </Stack>
        )}
        {currentStage === Stage.SEATING_INPROGRESS && (
          <Box>{i18n._t('Please wait unit seating is ready')}</Box>
        )}
        {currentStage === Stage.SEATING_READY && (
          <Stack>
            <Confirmation
              disabled={tablesState.length === 0}
              i18n={i18n}
              title={i18n._t('Reset generated seating')}
              text={i18n._t('Reset seating')}
              warning={i18n._t('This will remove generated seating. Continue?')}
              icon={<IconSquareX />}
              color='orange'
              onConfirm={resetSeating}
            />
            {!!import.meta.env.VITE_BOT_NICKNAME && (
              <Confirmation
                disabled={tablesState.length === 0}
                i18n={i18n}
                title={i18n._t('Notify players to come to their tables')}
                text={i18n._t('Notify players')}
                warning={i18n._t(
                  'Notify all subscribed players to come to their tables? This will send a message through notification service.'
                )}
                icon={<IconNotification />}
                color='green'
                onConfirm={notifyPlayers}
              />
            )}
            <Confirmation
              disabled={tablesState.length === 0}
              i18n={i18n}
              title={i18n._t('Start timer and sessions')}
              text={i18n._t('Start timer')}
              warning={i18n._t('Start timer and game sessions?')}
              icon={<IconPlayerPlay />}
              color='red'
              onConfirm={startTimer}
            />
          </Stack>
        )}
        {currentStage === Stage.STARTED && (
          <Stack>
            <Confirmation
              disabled={tablesState.length === 0}
              i18n={i18n}
              title={i18n._t('Add extra time')}
              text={i18n._t('Add extra time')}
              warning={
                <>
                  <Select
                    label={i18n._t('Select extra time')}
                    value={extraTime}
                    onChange={setExtraTime}
                    data={[
                      { value: '60', label: i18n._t('1 minute') },
                      { value: '120', label: i18n._t('2 minutes') },
                      { value: '180', label: i18n._t('3 minutes') },
                      { value: '240', label: i18n._t('4 minutes') },
                      { value: '300', label: i18n._t('5 minutes') },
                      { value: '420', label: i18n._t('7 minutes') },
                    ]}
                  />
                  <Space h='md' />
                  <Text>{i18n._t('Add selected amount of extra time for all tables?')}</Text>
                </>
              }
              icon={<IconClockHour3 />}
              color='orange'
              onConfirm={() => addExtraTime(parseInt(extraTime ?? '60', 10))}
            />
            <Button color={eventConfig?.hideResults ? 'red' : 'gray'} onClick={toggleResults}>
              {eventConfig?.hideResults
                ? i18n._t('Show results table')
                : i18n._t('Hide results table')}
            </Button>
          </Stack>
        )}
        {currentStage === Stage.PREFINISHED && (
          <Stack>
            <Confirmation
              disabled={tablesState.length === 0}
              i18n={i18n}
              title={i18n._t('Approve session results and go on to next session')}
              text={i18n._t('Approve sessions')}
              warning={i18n._t(
                "You won't be able to cancel last round after the results are approved. Approve session results?"
              )}
              icon={<IconEyeCheck />}
              color='red'
              onConfirm={approveResults}
            />
            <Button color={eventConfig?.hideResults ? 'red' : 'gray'} onClick={toggleResults}>
              {eventConfig?.hideResults
                ? i18n._t('Show results table')
                : i18n._t('Hide results table')}
            </Button>
          </Stack>
        )}
      </Group>
      <Space h='lg' />
    </>
  );
}

function determineStage(
  tablesState: TableState[],
  players: RegisteredPlayer[],
  eventConfig: GameConfig | null,
  seatingLoading: boolean
) {
  if (seatingLoading) {
    return Stage.SEATING_INPROGRESS;
  }

  const notFinishedTablesCount = tablesState.reduce(
    (acc, t) => acc + (t.status === SessionStatus.SESSION_STATUS_FINISHED ? 0 : 1),
    0
  );
  // This will include both prefinished and finished tables, to show the "Finalize" button in case of any errors.
  // If some of the tables are finished, and some are prefinished, this will allow recovering working state.
  const preinishedTablesCount = tablesState.reduce(
    (acc, t) =>
      acc +
      (t.status === SessionStatus.SESSION_STATUS_PREFINISHED ||
      t.status === SessionStatus.SESSION_STATUS_FINISHED
        ? 1
        : 0),
    0
  );

  const playersFiltered = players.filter((p) => !p.ignoreSeating);

  if (playersFiltered.length % 4 !== 0) {
    return Stage.NOT_READY;
  }

  if (
    eventConfig?.syncEnd &&
    preinishedTablesCount === tablesState.length &&
    notFinishedTablesCount !== 0
  ) {
    return Stage.PREFINISHED;
  }

  if (eventConfig?.gamesStatus === TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY) {
    if (!eventConfig?.isPrescripted) {
      if (notFinishedTablesCount === Math.round(playersFiltered.length / 4)) {
        return Stage.SEATING_READY;
      } else {
        return Stage.SEATING_INPROGRESS;
      }
    } else {
      const assignedPlayersCount = playersFiltered.reduce((acc, p) => acc + (p.localId ? 1 : 0), 0);
      if (notFinishedTablesCount === Math.round(assignedPlayersCount / 4)) {
        return Stage.SEATING_READY;
      } else {
        return Stage.SEATING_INPROGRESS;
      }
    }
  }

  if (notFinishedTablesCount !== 0) {
    return Stage.STARTED;
  }

  return eventConfig ? Stage.READY_BUT_NOT_STARTED : Stage.NOT_READY;
}
