/*
 * Tyr - Allows online game recording in japanese (riichi) mahjong sessions
 * Copyright (C) 2016 Oleg Klimenko aka ctizen <me@ctizen.net>
 *
 * This file is part of Tyr.
 *
 * Tyr is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tyr is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tyr.  If not, see <http://www.gnu.org/licenses/>.
 */

import {
  RCurrentGames,
  RRound,
  RUserInfo,
  RAllPlayersInEvent,
  RPlayerData,
  RTimerState,
  RGameConfig,
  RTablesState,
  RSessionOverview,
  RFreyAuthData,
  REventsList,
} from '#/interfaces/remote';
import {
  LCurrentGame,
  LUser,
  LUserWithScore,
  LTimerState,
  LGameConfig,
  LSessionOverview,
  LFreyAuthData,
  LEventsList,
} from '#/interfaces/local';
import { Player, Table } from '#/interfaces/common';
import { YakuId } from '#/primitives/yaku';
import {
  getLosingUsers,
  getNagashiUsers,
  getPaoUsers,
  getRiichiUsers,
  getWinningUsers,
  getWins,
} from '#/store/selectors/mimirSelectors';
import { IAppState } from '#/store/interfaces';
import { getDora, getFu, getHan } from '#/store/selectors/hanFu';
import { getSelectedYaku } from '#/store/selectors/yaku';
import { environment } from '#config';
import {
  AbortResult,
  ChomboResult,
  DrawResult,
  MultironResult,
  MultironWin,
  NagashiResult,
  RonResult,
  Round,
  RoundOutcome,
  TsumoResult,
} from '#/clients/atoms.pb';

export function gameOverviewFormatter(overview: RSessionOverview): LSessionOverview {
  return {
    tableIndex: overview.table_index,
    players: [
      ...overview.players.map((pl) => {
        return {
          tenhouId: '', // TODO: workaround
          ratingDelta: 0, // TODO: workaround
          id: pl.id,
          displayName: pl.title,
          score: overview.state.scores[pl.id] || 0,
          penalties: overview.state.penalties[pl.id] || 0,
        };
      }),
    ] as [LUserWithScore, LUserWithScore, LUserWithScore, LUserWithScore],
    currentRound: overview.state.round,
    riichiOnTable: overview.state.riichi,
    honba: overview.state.honba,
    yellowZoneAlreadyPlayed: overview.state.yellowZoneAlreadyPlayed,
  };
}

export function timerFormatter(timer: RTimerState): LTimerState {
  return {
    started: !!timer.started,
    finished: !!timer.finished,
    timeRemaining: timer.time_remaining ? parseInt(timer.time_remaining.toString(), 10) : 0,
    waitingForTimer: !!timer.waiting_for_timer,
    haveAutostart: !!timer.have_autostart,
    autostartTimer: timer.autostart_timer ? parseInt(timer.autostart_timer.toString(), 10) : 0,
  };
}

export function userInfoFormatter(user: RUserInfo): LUser {
  return {
    id: parseInt(user.id.toString(), 10),
    displayName: user.title,
    tenhouId: user.tenhou_id,
  };
}

export function userListFormatter(list: RAllPlayersInEvent): LUser[] {
  return list.map((user) => ({
    id: parseInt(user.id.toString(), 10),
    displayName: user.title,
    tenhouId: user.tenhou_id,
  }));
}

export function lastResultsFormatter(list: RPlayerData[]): LUserWithScore[] {
  if (!list) {
    return [];
  }
  return list.map((user) => ({
    id: parseInt(user.id.toString(), 10),
    displayName: user.title,
    tenhouId: '', // TODO?
    score: user.score,
    ratingDelta: user.rating_delta,
    penalties: 0, // TODO?
  }));
}

export function eventsListFormatter(list: REventsList): LEventsList {
  return list
    .filter((event) => !event.isOnline)
    .map((event) => ({
      id: parseInt(event.id.toString(), 10),
      description: event.description,
      title: event.title,
    }));
}

export function gameConfigFormatter(config: RGameConfig): LGameConfig {
  return {
    yakuWithPao: (config.yakuWithPao || []).map((y) => parseInt(y.toString(), 10)),
    allowedYaku: (config.allowedYaku || []).map((y) => parseInt(y.toString(), 10)),
    startPoints: parseInt(config.startPoints.toString(), 10),
    withKazoe: !!config.withKazoe,
    withKiriageMangan: !!config.withKiriageMangan,
    withAbortives: !!config.withAbortives,
    withNagashiMangan: !!config.withNagashiMangan,
    eventTitle: config.eventTitle,
    withAtamahane: !!config.withAtamahane,
    autoSeating: !!config.autoSeating,
    isPrescripted: !!config.isPrescripted,
    rulesetTitle: config.rulesetTitle,
    eventStatHost: environment.guiFix(config.eventStatHost),
    tonpuusen: !!config.tonpuusen,
    startRating: parseInt(config.startRating.toString(), 10),
    riichiGoesToWinner: !!config.riichiGoesToWinner,
    extraChomboPayments: !!config.extraChomboPayments,
    chomboPenalty: parseInt(config.chomboPenalty.toString(), 10),
    withKuitan: !!config.withKuitan,
    withButtobi: !!config.withButtobi,
    withMultiYakumans: !!config.withMultiYakumans,
    gameExpirationTime: parseInt(config.gameExpirationTime.toString(), 10),
    withLeadingDealerGameOver: !!config.withLeadingDealerGameOver,
    redZone: config.redZone ? parseInt(config.redZone.toString(), 10) : null,
    yellowZone: config.yellowZone ? parseInt(config.yellowZone.toString(), 10) : null,
    timerPolicy:
      config.timerPolicy === 'yellowZone' || config.timerPolicy === 'redZone'
        ? config.timerPolicy
        : 'none',
    useTimer: !!config.useTimer,
    isOnline: !!config.isOnline,
    isTextlog: !!config.isTextlog,
    syncStart: !!config.syncStart,
    sortByGames: !!config.sortByGames,
    allowPlayerAppend: !!config.allowPlayerAppend,
  };
}

export function currentGamesFormatter(games: RCurrentGames): LCurrentGame[] {
  const formatPlayer = (player: RPlayerData): Player => ({
    id: parseInt(player.id.toString(), 10),
    displayName: player.title,
    score: player.score,
    penalties: 0, // TODO?
  });

  return games.map(
    (game): LCurrentGame => ({
      hashcode: game.hashcode,
      tableIndex: game.table_index,
      status: game.status,
      players: [
        formatPlayer(game.players[0]),
        formatPlayer(game.players[1]),
        formatPlayer(game.players[2]),
        formatPlayer(game.players[3]),
      ],
    })
  );
}

export function formatRoundToRemote(state: IAppState): RRound | undefined {
  switch (state.currentOutcome?.selectedOutcome) {
    case 'ron':
      let winIdx = 0;
      const wins = getWins(state).map((win) => {
        const riichi =
          winIdx > 0
            ? ''
            : getRiichiUsers(state)
                .map((player) => player.id)
                .join(',');
        winIdx++; // TODO: выпилить когда завезут вынос riichi из секции wins внутри апи
        return {
          riichi: riichi,
          winner_id: win.winner,
          pao_player_id: win.paoPlayerId,
          han: win.han + win.dora,
          fu: getFu(state, win.winner),
          dora: win.dora,
          uradora: win.uradora,
          kandora: win.kandora,
          kanuradora: win.kanuradora,
          yaku: win.yaku.filter((y: YakuId) => y > 0).join(','),
          open_hand: win.yaku.includes(YakuId.__OPENHAND),
        };
      });

      if (wins.length > 1) {
        // multiron
        return {
          round_index: state.currentRound,
          honba: state.honba,
          outcome: 'multiron',
          loser_id: getLosingUsers(state)[0].id,
          multi_ron: wins.length,
          wins: wins,
        };
      }

      // single winner ron
      return {
        round_index: state.currentRound,
        honba: state.honba,
        outcome: 'ron',
        loser_id: getLosingUsers(state)[0].id,
        multi_ron: null,
        ...wins[0],
      };

    case 'tsumo':
      return {
        round_index: state.currentRound,
        honba: state.honba,
        outcome: 'tsumo',
        riichi: getRiichiUsers(state)
          .map((player) => player.id)
          .join(','),
        winner_id: getWinningUsers(state)[0].id,
        pao_player_id: (getPaoUsers(state)[0] || { id: null }).id,
        han: getHan(state) + getDora(state),
        fu: getFu(state),
        multi_ron: null,
        dora: getDora(state),
        uradora: 0, // TODO
        kandora: 0, // TODO
        kanuradora: 0, // TODO
        yaku: getSelectedYaku(state)
          .filter((y) => y > 0)
          .join(','),
        open_hand: getSelectedYaku(state).includes(YakuId.__OPENHAND),
      };
    case 'draw':
      return {
        round_index: state.currentRound,
        honba: state.honba,
        outcome: 'draw',
        riichi: getRiichiUsers(state)
          .map((player) => player.id)
          .join(','),
        tempai: getWinningUsers(state)
          .map((player) => player.id)
          .join(','),
      };
    case 'nagashi':
      return {
        round_index: state.currentRound,
        honba: state.honba,
        outcome: 'nagashi',
        riichi: getRiichiUsers(state)
          .map((player) => player.id)
          .join(','),
        tempai: getWinningUsers(state)
          .map((player) => player.id)
          .join(','),
        nagashi: getNagashiUsers(state)
          .map((player) => player.id)
          .join(','),
      };
    case 'abort':
      return {
        round_index: state.currentRound,
        honba: state.honba,
        outcome: 'abort',
        riichi: getRiichiUsers(state)
          .map((player) => player.id)
          .join(','),
      };
    case 'chombo':
      return {
        round_index: state.currentRound,
        honba: state.honba,
        outcome: 'chombo',
        loser_id: getLosingUsers(state)[0].id,
      };
    default:
      return undefined;
  }
}

export function fromTwirpOutcome(outcome: RoundOutcome): RRound['outcome'] {
  switch (outcome) {
    case 'RON':
      return 'ron';
    case 'ABORT':
      return 'abort';
    case 'TSUMO':
      return 'tsumo';
    case 'DRAW':
      return 'draw';
    case 'CHOMBO':
      return 'chombo';
    case 'NAGASHI':
      return 'nagashi';
    case 'MULTIRON':
      return 'multiron';
  }
}

export function formatRoundToTwirp(state: IAppState): Round | undefined {
  switch (state.currentOutcome?.selectedOutcome) {
    case 'ron':
      const wins = getWins(state).map((win) => {
        return {
          winnerId: win.winner,
          paoPlayerId: win.paoPlayerId,
          han: win.han + win.dora,
          fu: getFu(state, win.winner),
          dora: win.dora,
          uradora: win.uradora,
          kandora: win.kandora,
          kanuradora: win.kanuradora,
          yaku: win.yaku.filter((y: YakuId) => y > 0),
          openHand: win.yaku.includes(YakuId.__OPENHAND),
        } as MultironWin;
      });

      if (wins.length > 1) {
        // multiron
        return {
          multiron: {
            roundIndex: state.currentRound,
            honba: state.honba,
            loserId: getLosingUsers(state)[0].id,
            multiRon: wins.length,
            wins: wins,
            riichiBets: getRiichiUsers(state).map((player) => player.id),
          } as MultironResult,
        };
      }

      // single winner ron
      return {
        ron: {
          roundIndex: state.currentRound,
          honba: state.honba,
          riichiBets: getRiichiUsers(state).map((player) => player.id),
          loserId: getLosingUsers(state)[0].id,
          multiRon: null,
          ...wins[0],
        } as RonResult,
      };

    case 'tsumo':
      return {
        tsumo: {
          roundIndex: state.currentRound,
          honba: state.honba,
          riichiBets: getRiichiUsers(state).map((player) => player.id),
          winnerId: getWinningUsers(state)[0].id,
          paoPlayerId: (getPaoUsers(state)[0] || { id: null }).id,
          han: getHan(state) + getDora(state),
          fu: getFu(state),
          dora: getDora(state),
          uradora: 0, // TODO
          kandora: 0, // TODO
          kanuradora: 0, // TODO
          yaku: getSelectedYaku(state).filter((y) => y > 0),
          openHand: getSelectedYaku(state).includes(YakuId.__OPENHAND),
        } as TsumoResult,
      };
    case 'draw':
      return {
        draw: {
          roundIndex: state.currentRound,
          honba: state.honba,
          riichiBets: getRiichiUsers(state).map((player) => player.id),
          tempai: getWinningUsers(state).map((player) => player.id),
        } as DrawResult,
      };
    case 'nagashi':
      return {
        nagashi: {
          roundIndex: state.currentRound,
          honba: state.honba,
          riichiBets: getRiichiUsers(state).map((player) => player.id),
          tempai: getWinningUsers(state).map((player) => player.id),
          nagashi: getNagashiUsers(state).map((player) => player.id),
        } as NagashiResult,
      };
    case 'abort':
      return {
        abort: {
          roundIndex: state.currentRound,
          honba: state.honba,
          riichiBets: getRiichiUsers(state).map((player) => player.id),
        } as AbortResult,
      };
    case 'chombo':
      return {
        chombo: {
          roundIndex: state.currentRound,
          honba: state.honba,
          loserId: getLosingUsers(state)[0].id,
        } as ChomboResult,
      };
    default:
      return undefined;
  }
}

export function tablesStateFormatter(tables: RTablesState): Table[] {
  return tables
    .filter((t) => t.status === 'inprogress') // get only playing tables
    .map((t) => ({
      hash: t.hash,
      currentRound: parseInt(t.current_round.toString(), 10),
      index: parseInt((t.table_index ?? '').toString(), 10),
      players: t.players.map((p) => ({
        id: parseInt(p.id.toString(), 10),
        displayName: p.title,
        score: parseInt(t.scores[p.id].toString(), 10),
        penalties: 0, // mock
      })),
    }));
}

export function freyAuthFormatter(data: RFreyAuthData): LFreyAuthData {
  return {
    personId: parseInt((data[0] ?? 0).toString(), 10),
    token: data[1],
  };
}
