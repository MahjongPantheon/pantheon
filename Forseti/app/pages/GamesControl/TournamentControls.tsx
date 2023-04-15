import * as React from 'react';
import { useI18n } from '#/hooks/i18n';
import { GameConfig, RegisteredPlayer, TableState } from '#/clients/atoms.pb';
import { Box, Button, Group, SegmentedControl, Select, Space, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { Confirmation } from '#/pages/GamesControl/Confirmation';
import {
  IconArrowsRandom,
  IconEyeCheck,
  IconLineHeight,
  IconPlayerPlay,
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
  startTimer: () => void;
  resetTimer: () => void;
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
  approveResults,
  startTimer,
  resetTimer,
  resetSeating,
  seatingLoading,
}: TournamentControlsProps) {
  const i18n = useI18n();
  const [interval, setInterval] = useState<string | null>('1');
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
        {currentStage === Stage.READY_BUT_NOT_STARTED && (
          <Stack>
            <Button color={eventConfig?.hideResults ? 'red' : 'gray'} onClick={toggleResults}>
              {eventConfig?.hideResults
                ? i18n._t('Show results table')
                : i18n._t('Hide results table')}
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
              title={i18n._t('Reset the timer to initial value')}
              text={i18n._t('Reset timer')}
              warning={i18n._t('Really reset timer?')}
              icon={<IconSquareX />}
              color='orange'
              onConfirm={resetTimer}
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
    (acc, t) => acc + (t.status === 'FINISHED' ? 0 : 1),
    0
  );
  // This will include both prefinished and finished tables, to show the "Finalize" button in case of any errors.
  // If some of the tables are finished, and some are prefinished, this will allow recovering working state.
  const preinishedTablesCount = tablesState.reduce(
    (acc, t) => acc + (t.status === 'PREFINISHED' || t.status === 'FINISHED' ? 1 : 0),
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

  if (eventConfig?.gamesStatus === 'SEATING_READY') {
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
