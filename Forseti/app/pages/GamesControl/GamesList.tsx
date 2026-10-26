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

import {
  GameConfig,
  IntermediateResultOfSession,
  RegisteredPlayer,
  SessionStatus,
  TableState,
  TournamentGamesStatus,
} from 'tsclients/proto/atoms.pb';
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Loader,
  Select,
  Space,
  Stack,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import {
  IconAlarm,
  IconArrowBackUp,
  IconFileCheck,
  IconTrashX,
  IconX,
  IconHandStop,
  IconZoomCheck,
  IconClockHour3,
} from '@tabler/icons-react';
import * as React from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { I18nService } from '../../services/i18n';
import { formatLastRoundParts, formatRoundIndex } from '../../helpers/lastRound';
import { useI18n } from '../../hooks/i18n';
import { Confirmation } from './Confirmation';
import { LastRoundText } from '../../components/LastRoundText';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { useState } from 'react';
import { EventsGetTimerStateResponse } from 'tsclients/proto/mimir.pb';
import { orderTables } from '../../helpers/orderTables';

type GamesListProps = {
  tablesState: TableState[];
  eventConfig: GameConfig | null;
  timerState: EventsGetTimerStateResponse | null;
  onCancelLastRound: (hash: string, intermediateResults: IntermediateResultOfSession[]) => void;
  onRemoveGame?: (hash: string) => void;
  onDefinalizeGame?: (hash: string) => void;
  onForceFinish?: (hash: string) => void;
  onAddExtraTime?: (hash: string, amount: number) => void;
};

export function GamesList({
  tablesState,
  eventConfig,
  timerState,
  onDefinalizeGame,
  onRemoveGame,
  onCancelLastRound,
  onForceFinish,
  onAddExtraTime,
}: GamesListProps) {
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const [extraTime, setExtraTime] = useState<string | null>('60');

  const matches = useMediaQuery('(max-width: 568px)');
  return (
    <Stack>
      {orderTables(tablesState, eventConfig).map((t, idx) => {
        const players = t.players.reduce(
          (acc, p) => {
            acc[p.id] = p;
            return acc;
          },
          {} as Record<number, RegisteredPlayer>
        );
        return (
          <Group
            data-testid={`forseti-game-row-${t.sessionHash}`}
            grow
            key={`ev_${t.sessionHash}`}
            style={{
              justifyContent: 'space-between',
              padding: '10px',
              backgroundColor:
                idx % 2 ? (isDark ? theme.colors.dark[7] : theme.colors.gray[1]) : 'transparent',
            }}
          >
            <Stack>
              <Group align='flex-start'>
                <Stack style={{ flex: 0, minWidth: '30px' }} justify='flex-start'>
                  {!!t.tableIndex && (
                    <ActionIcon
                      data-testid={`forseti-game-copy-session-${t.sessionHash}`}
                      style={{ cursor: 'default' }}
                      color='lime'
                      size='lg'
                      variant='filled'
                      title={i18n._t('Table # %1', [`${t.tableIndex} -- ${t.sessionHash}`])}
                      onClick={() => {
                        navigator.clipboard.writeText(t.sessionHash);
                      }}
                    >
                      #{t.tableIndex}
                    </ActionIcon>
                  )}
                  {getBadge(eventConfig?.gamesStatus, t.status, i18n)}
                  {t.status === SessionStatus.SESSION_STATUS_INPROGRESS && (
                    <ActionIcon
                      style={{ cursor: 'default' }}
                      component='span'
                      variant='light'
                      color='blue'
                      size='lg'
                      title={i18n._t('Current round')}
                    >
                      {formatRoundIndex(t.currentRoundIndex)}
                    </ActionIcon>
                  )}
                </Stack>
                <Stack spacing='0'>
                  {t.players.map((p) => {
                    const score = t.scores.find((s) => s.playerId === p.id)?.score ?? 0;
                    return (
                      <Group key={`pl_${p.id}`}>
                        <Badge
                          style={{ minWidth: '64px' }}
                          variant='outline'
                          color={
                            score === eventConfig?.rulesetConfig.startPoints
                              ? 'blue'
                              : score > (eventConfig?.rulesetConfig.startPoints ?? 0)
                                ? 'green'
                                : 'red'
                          }
                        >
                          {score}
                        </Badge>
                        <PlayerAvatar p={p} size='sm' />
                        <Text
                          weight='bold'
                          style={
                            matches
                              ? {
                                  textOverflow: 'ellipsis',
                                  overflow: 'hidden',
                                  maxWidth: '160px',
                                }
                              : {
                                  textOverflow: 'ellipsis',
                                  overflow: 'hidden',
                                  maxWidth: '320px',
                                }
                          }
                        >
                          {p.title}
                          {eventConfig?.isPrescripted ? ` id #${p.localId ?? '??'}` : null}
                          {eventConfig?.isOnline ? ` (${p.tenhouId})` : null}
                        </Text>
                      </Group>
                    );
                  })}
                </Stack>
                <Box style={{ flex: 1 }}>
                  {!!t.extraTime && (
                    <Text size='sm' weight='bold'>
                      {i18n._t('Extra minutes: %1', [t.extraTime / 60])}
                    </Text>
                  )}
                  {t.lastRound &&
                    formatLastRoundParts(t.lastRound, players, i18n).map((line, index) => (
                      <Text size='sm' key={index}>
                        <LastRoundText parts={line} />
                      </Text>
                    ))}
                </Box>
              </Group>
              <Group position='right'>
                {eventConfig?.syncStart &&
                  t.status === SessionStatus.SESSION_STATUS_INPROGRESS &&
                  !timerState?.waitingForTimer && (
                    <Confirmation
                      testId={`forseti-game-add-extra-time-${t.sessionHash}`}
                      icon={<IconClockHour3 />}
                      title={i18n._t('Add extra time for this table')}
                      text={i18n._t('Add extra time')}
                      warning={
                        <>
                          <Select
                            data-testid={`forseti-game-extra-time-${t.sessionHash}`}
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
                          <Text>
                            {i18n._t('Add selected amount of extra time for this table?')}
                          </Text>
                        </>
                      }
                      color='orange'
                      onCancel={() => setExtraTime('60')}
                      onConfirm={() => {
                        onAddExtraTime?.(t.sessionHash, parseInt(extraTime ?? '60', 10));
                      }}
                      i18n={i18n}
                    />
                  )}

                {(t.status === SessionStatus.SESSION_STATUS_INPROGRESS ||
                  (eventConfig?.syncStart &&
                    t.status === SessionStatus.SESSION_STATUS_PREFINISHED)) &&
                  t.lastRound && (
                    <Confirmation
                      testId={`forseti-game-cancel-last-round-${t.sessionHash}`}
                      icon={<IconArrowBackUp />}
                      title={i18n._t('Cancel last played round')}
                      text={i18n._t('Cancel round')}
                      warning={i18n._t("This action can't be undone. Continue?")}
                      color='orange'
                      onConfirm={() => {
                        onCancelLastRound(t.sessionHash, t.scores);
                      }}
                      i18n={i18n}
                    />
                  )}
                {t.status === SessionStatus.SESSION_STATUS_INPROGRESS &&
                  !t.lastRound &&
                  !!onRemoveGame && (
                    <Confirmation
                      testId={`forseti-game-remove-${t.sessionHash}`}
                      icon={<IconTrashX />}
                      title={i18n._t('Remove the game as it never existed')}
                      text={i18n._t('Remove game')}
                      warning={i18n._t("This action can't be undone. Continue?")}
                      color='yellow'
                      onConfirm={() => {
                        onRemoveGame(t.sessionHash);
                      }}
                      i18n={i18n}
                    />
                  )}
                {t.status === SessionStatus.SESSION_STATUS_INPROGRESS &&
                  t.lastRound &&
                  eventConfig &&
                  !eventConfig.syncStart &&
                  !!onForceFinish && (
                    <Confirmation
                      testId={`forseti-game-force-finish-${t.sessionHash}`}
                      icon={<IconHandStop />}
                      title={i18n._t('Forcefully finish the game')}
                      text={i18n._t('Force finish game')}
                      warning={i18n._t('You are going to forcefully finish this game. Continue?')}
                      color='yellow'
                      onConfirm={() => {
                        onForceFinish(t.sessionHash);
                      }}
                      i18n={i18n}
                    />
                  )}
                {t.status === SessionStatus.SESSION_STATUS_FINISHED &&
                  t.mayDefinalize &&
                  !!onDefinalizeGame && (
                    <Confirmation
                      testId={`forseti-game-cancel-results-${t.sessionHash}`}
                      icon={<IconArrowBackUp />}
                      title={i18n._t('Remove game results')}
                      text={i18n._t('Cancel results')}
                      warning={i18n._t(
                        'This will only remove the game results, but you will need to cancel last round separately. Continue?'
                      )}
                      color='red'
                      onConfirm={() => {
                        onDefinalizeGame(t.sessionHash);
                      }}
                      i18n={i18n}
                    />
                  )}
              </Group>
            </Stack>
          </Group>
        );
      })}
    </Stack>
  );
}

function getBadge(
  gamesStatus: TournamentGamesStatus | undefined,
  status: SessionStatus,
  i18n: I18nService
) {
  switch (status) {
    case SessionStatus.SESSION_STATUS_INPROGRESS:
      if (gamesStatus === TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY) {
        return (
          <ActionIcon
            style={{ cursor: 'default' }}
            color='green'
            variant='light'
            size='lg'
            title={i18n._t('Session is ready to start')}
          >
            <IconZoomCheck />
          </ActionIcon>
        );
      } else {
        return (
          <ActionIcon
            style={{ cursor: 'default' }}
            color='lime'
            variant='light'
            size='lg'
            title={i18n._t('Session in progress')}
          >
            <Loader size='xs' variant='bars' color='lime' />
          </ActionIcon>
        );
      }
    case SessionStatus.SESSION_STATUS_PREFINISHED:
      return (
        <ActionIcon
          style={{ cursor: 'default' }}
          color='orange'
          variant='light'
          size='lg'
          title={i18n._t('Session finished, but not confirmed')}
        >
          <IconFileCheck />
        </ActionIcon>
      );
    case SessionStatus.SESSION_STATUS_FINISHED:
      return (
        <ActionIcon
          style={{ cursor: 'default' }}
          color='blue'
          variant='light'
          size='lg'
          title={i18n._t('Session finished')}
        >
          <IconFileCheck />
        </ActionIcon>
      );
    case SessionStatus.SESSION_STATUS_CANCELLED:
      return (
        <ActionIcon
          style={{ cursor: 'default' }}
          color='gray'
          size='lg'
          variant='light'
          title={i18n._t('Session cancelled')}
        >
          <IconX />
        </ActionIcon>
      );
    case SessionStatus.SESSION_STATUS_PLANNED:
      return (
        <ActionIcon
          style={{ cursor: 'default' }}
          color='yellow'
          variant='light'
          size='lg'
          title={i18n._t('Session is scheduled')}
        >
          <IconAlarm />
        </ActionIcon>
      );
    case SessionStatus.SESSION_STATUS_UNSPECIFIED:
    default:
      return <></>;
  }
}
