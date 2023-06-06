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
  Round,
  SessionStatus,
  TableState,
  TournamentGamesStatus,
} from '../../clients/proto/atoms.pb';
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Loader,
  Stack,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { makeColor, makeInitials } from '../../helpers/playersList';
import {
  IconAlarm,
  IconArrowBackUp,
  IconFileCheck,
  IconTrashX,
  IconX,
  IconZoomCheck,
} from '@tabler/icons-react';
import * as React from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { I18nService } from '../../services/i18n';
import { yakuList } from '../../helpers/yaku';
import { useI18n } from '../../hooks/i18n';
import { Confirmation } from './Confirmation';

type GamesListProps = {
  tablesState: TableState[];
  eventConfig: GameConfig | null;
  onCancelLastRound: (hash: string, intermediateResults: IntermediateResultOfSession[]) => void;
  onRemoveGame?: (hash: string) => void;
  onDefinalizeGame?: (hash: string) => void;
};

export function GamesList({
  tablesState,
  eventConfig,
  onDefinalizeGame,
  onRemoveGame,
  onCancelLastRound,
}: GamesListProps) {
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';

  const matches = useMediaQuery('(max-width: 568px)');
  return (
    <Stack>
      {tablesState.map((t, idx) => {
        const players = t.players.reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {} as Record<number, RegisteredPlayer>);
        return (
          <Group
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
                      style={{ cursor: 'default' }}
                      color='lime'
                      size='lg'
                      variant='filled'
                      title={i18n._t('Table # %1', [t.tableIndex])}
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
                      {makeRound(t.currentRoundIndex)}
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
                        <Avatar color={makeColor(p.title)} radius='xl' size='sm' title={`#${p.id}`}>
                          {makeInitials(p.title)}
                        </Avatar>
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
                  <Text size='sm'>
                    {t.lastRound && <Box>{formatRound(t.lastRound, players, i18n)}</Box>}
                  </Text>
                </Box>
              </Group>
              <Group position='right'>
                {(t.status === SessionStatus.SESSION_STATUS_INPROGRESS ||
                  (eventConfig?.syncStart &&
                    t.status === SessionStatus.SESSION_STATUS_PREFINISHED)) &&
                  t.lastRound && (
                    <Confirmation
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
                {t.status === SessionStatus.SESSION_STATUS_FINISHED &&
                  t.mayDefinalize &&
                  !!onDefinalizeGame && (
                    <Confirmation
                      icon={<IconArrowBackUp />}
                      title={i18n._t('Remove game results')}
                      text={i18n._t('Cancel results')}
                      warning={i18n._t(
                        "This will only remove the game results, but you will need to cancel last round separately. This action can't be undone. Continue?"
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
    default:
      return <></>;
  }
}

const winds = [
  '?',
  '東1',
  '東2',
  '東3',
  '東4',
  '南1',
  '南2',
  '南3',
  '南4',
  '西1',
  '西2',
  '西3',
  '西4',
  '北1',
  '北2',
  '北3',
  '北4',
];
function makeRound(roundIndex: number) {
  return winds[roundIndex] ?? '?';
}

function formatRound(round: Round, players: Record<number, RegisteredPlayer>, i18n: I18nService) {
  if (round.ron) {
    return i18n._t('Ron, %1 from %2 (%3), riichi: %4', [
      players[round.ron.winnerId].title,
      players[round.ron.loserId].title,
      formatYaku(round.ron.yaku, i18n).join(', '),
      round.ron.riichiBets.map((id) => players[id].title).join(', ') || '--',
    ]);
  }

  if (round.multiron) {
    return round.multiron.wins
      .map((win) =>
        i18n._t('Ron, %1 from %2 (%3), riichi: %4', [
          players[win.winnerId].title,
          players[round.multiron!.loserId].title,
          formatYaku(win.yaku, i18n).join(', '),
          round.multiron!.riichiBets.map((id) => players[id].title).join(', ') || '--',
        ])
      )
      .join(', ');
  }

  if (round.tsumo) {
    return i18n._t('Tsumo, %1 (%2), riichi: %3', [
      players[round.tsumo.winnerId].title,
      formatYaku(round.tsumo.yaku, i18n).join(', '),
      round.tsumo.riichiBets.map((id) => players[id].title).join(', ') || '--',
    ]);
  }

  if (round.chombo) {
    return i18n._t('Chombo, %1', [players[round.chombo.loserId].title]);
  }

  if (round.draw) {
    return i18n._t('Draw, tempai: %1, riichi: %2', [
      round.draw.tempai.map((id) => players[id].title).join(', ') || '--',
      round.draw.riichiBets.map((id) => players[id].title).join(', ') || '--',
    ]);
  }

  if (round.abort) {
    return i18n._t('Abortive draw, riichi: %1', [
      round.abort.riichiBets.map((id) => players[id].title).join(', ') || '--',
    ]);
  }

  if (round.nagashi) {
    return i18n._t('Nagashi mangan, nagashi: %1, tempai: %2, riichi: %3', [
      round.nagashi.nagashi.map((id) => players[id].title).join(', ') || '--',
      round.nagashi.tempai.map((id) => players[id].title).join(', ') || '--',
      round.nagashi.riichiBets.map((id) => players[id].title).join(', ') || '--',
    ]);
  }
}

function formatYaku(yaku: number[], i18n: I18nService) {
  return yakuList.filter((y) => yaku.includes(y.id)).map((y) => y.name(i18n));
}
