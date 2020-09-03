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
  RCurrentGames, RRound, RUserInfo,
  RAllPlayersInEvent, RPlayerData,
  RTimerState, RGameConfig, RTablesState, RSessionOverview
} from '#/interfaces/remote';
import {
  LCurrentGame, LUser, LUserWithScore,
  LTimerState, LGameConfig, LSessionOverview
} from '#/interfaces/local';
import { Player, Table } from '#/interfaces/common';
import { YakuId } from '#/primitives/yaku';
import {
  getLosingUsers,
  getNagashiUsers,
  getPaoUsers,
  getRiichiUsers,
  getWinningUsers,
  getWins
} from '#/store/selectors/mimirSelectors';
import { IAppState } from '#/store/interfaces';
import { getDora, getFu, getHan } from '#/store/selectors/hanFu';
import { getSelectedYaku } from '#/store/selectors/yaku';
import { environment } from "#config";

export function gameOverviewFormatter(overview: RSessionOverview): LSessionOverview {
  return {
    tableIndex: overview.table_index,
    players: [...overview.players.map((pl) => {
      return {
        ident: '', // TODO: workaround
        tenhouId: '', // TODO: workaround
        ratingDelta: 0, // TODO: workaround
        id: pl.id,
        alias: '',
        displayName: pl.display_name,
        score: overview.state.scores[pl.id] || 0,
        penalties: overview.state.penalties[pl.id] || 0
      };
    })] as [LUserWithScore, LUserWithScore, LUserWithScore, LUserWithScore],
    currentRound: overview.state.round,
    riichiOnTable: overview.state.riichi,
    honba: overview.state.honba,
    yellowZoneAlreadyPlayed: overview.state.yellowZoneAlreadyPlayed,
  }
}

export function timerFormatter(timer: RTimerState): LTimerState {
  return {
    started: !!timer.started,
    finished: !!timer.finished,
    timeRemaining: timer.time_remaining ? parseInt(timer.time_remaining.toString(), 10) : 0,
    waitingForTimer: !!timer.waiting_for_timer
  };
}

export function userInfoFormatter(user: RUserInfo): LUser {
  return {
    id: parseInt(user.id.toString(), 10),
    displayName: user.display_name,
    alias: user.alias,
    tenhouId: user.tenhou_id,
    ident: user.ident
  };
}

export function userListFormatter(list: RAllPlayersInEvent): LUser[] {
  return list.map((user) => ({
    id: parseInt(user.id.toString(), 10),
    displayName: user.display_name,
    alias: user.alias,
    tenhouId: user.tenhou_id,
    ident: ''  // TODO?
  }));
}

export function lastResultsFormatter(list: RPlayerData[]): LUserWithScore[] {
  if (!list) {
    return [];
  }
  return list.map((user) => ({
    id: parseInt(user.id.toString(), 10),
    displayName: user.display_name,
    alias: user.alias,
    ident: user.ident,
    tenhouId: '', // TODO?
    score: user.score,
    ratingDelta: user.rating_delta,
    penalties: 0, // TODO?
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
    withLeadingDealerGameover: !!config.withLeadingDealerGameover,
    redZone: config.redZone ? parseInt(config.redZone.toString(), 10) : null,
    yellowZone: config.yellowZone ? parseInt(config.yellowZone.toString(), 10) : null,
    timerPolicy: (config.timerPolicy === 'yellowZone' || config.timerPolicy === 'redZone') ? config.timerPolicy : 'none',
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
    alias: player.alias,
    displayName: player.display_name,
    score: player.score,
    penalties: 0, // TODO?
  });

  return games.map((game): LCurrentGame => ({
    hashcode: game.hashcode,
    tableIndex: game.table_index,
    status: game.status,
    players: [
      formatPlayer(game.players[0]),
      formatPlayer(game.players[1]),
      formatPlayer(game.players[2]),
      formatPlayer(game.players[3])
    ]
  }))
}

export function formatRoundToRemote(state: IAppState): RRound | undefined {
  switch (state.currentOutcome?.selectedOutcome) {
    case 'ron':
      return {
        round_index: state.currentRound,
        honba: state.honba,
        outcome: 'ron',
        riichi: getRiichiUsers(state).map((player) => player.id).join(','),
        winner_id: getWinningUsers(state)[0].id,
        loser_id: getLosingUsers(state)[0].id,
        pao_player_id: (getPaoUsers(state)[0] || { id: null }).id,
        han: getHan(state) + getDora(state),
        fu: getFu(state),
        multi_ron: null,
        dora: getDora(state),
        uradora: 0, // TODO
        kandora: 0, // TODO
        kanuradora: 0, // TODO
        yaku: getSelectedYaku(state).filter(y => y > 0).join(','),
        open_hand: getSelectedYaku(state).indexOf(YakuId.__OPENHAND) !== -1
      };
    case 'multiron':
      let winIdx = 0;
      let wins = getWins(state).map(win => {
        let riichi = winIdx > 0 ? '' : getRiichiUsers(state).map((player) => player.id).join(',');
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
          open_hand: win.yaku.indexOf(YakuId.__OPENHAND) !== -1
        };
      });

      return {
        round_index: state.currentRound,
        honba: state.honba,
        outcome: 'multiron',
        loser_id: getLosingUsers(state)[0].id,
        multi_ron: wins.length,
        wins: wins
      };
    case 'tsumo':
      return {
        round_index: state.currentRound,
        honba: state.honba,
        outcome: 'tsumo',
        riichi: getRiichiUsers(state).map((player) => player.id).join(','),
        winner_id: getWinningUsers(state)[0].id,
        pao_player_id: (getPaoUsers(state)[0] || { id: null }).id,
        han: getHan(state) + getDora(state),
        fu: getFu(state),
        multi_ron: null,
        dora: getDora(state),
        uradora: 0, // TODO
        kandora: 0, // TODO
        kanuradora: 0, // TODO
        yaku: getSelectedYaku(state).filter(y => y > 0).join(','),
        open_hand: getSelectedYaku(state).indexOf(YakuId.__OPENHAND) !== -1
      };
    case 'draw':
      return {
        round_index: state.currentRound,
        honba: state.honba,
        outcome: 'draw',
        riichi: getRiichiUsers(state).map((player) => player.id).join(','),
        tempai: getWinningUsers(state).map((player) => player.id).join(',')
      };
    case 'nagashi':
      return {
        round_index: state.currentRound,
        honba: state.honba,
        outcome: 'nagashi',
        riichi: getRiichiUsers(state).map((player) => player.id).join(','),
        tempai: getWinningUsers(state).map((player) => player.id).join(','),
        nagashi: getNagashiUsers(state).map((player) => player.id).join(',')
      };
    case 'abort':
      return {
        round_index: state.currentRound,
        honba: state.honba,
        outcome: 'abort',
        riichi: getRiichiUsers(state).map((player) => player.id).join(',')
      };
    case 'chombo':
      return {
        round_index: state.currentRound,
        honba: state.honba,
        outcome: 'chombo',
        loser_id: getLosingUsers(state)[0].id
      };
  }
}

export function tablesStateFormatter(tables: RTablesState): Table[] {
  return tables
    .filter((t) => t.status === 'inprogress') // get only playing tables
    .map((t) => ({
      hash: t.hash,
      currentRound: parseInt(t.current_round.toString(), 10),
      index: parseInt((t.table_index || '').toString(), 10),
      players: t.players.map((p) => ({
        id: parseInt(p.id.toString(), 10),
        alias: '', // mock
        displayName: p.display_name,
        score: parseInt(t.scores[p.id].toString(), 10),
        penalties: 0, // mock
      }))
    }));
}
