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
  RTimerState, RGameConfig, RTablesState
} from '../interfaces/remote';
import {
  LCurrentGame, LUser, LUserWithScore,
  LTimerState, LGameConfig
} from '../interfaces/local';
import { Player, Table } from '../interfaces/common';
import { AppState } from '../primitives/appstate';
import { YakuId } from "../primitives/yaku";

export function timerFormatter(timer: RTimerState): LTimerState {
  return {
    started: !!timer.started,
    finished: !!timer.finished,
    timeRemaining: timer.time_remaining ? parseInt(timer.time_remaining.toString(), 10) : 0
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
    ident: null  // TODO?
  }));
}

export function lastResultsFormatter(list: RPlayerData[]): LUserWithScore[] {
  if (!list) {
    return null;
  }
  return list.map((user) => ({
    id: parseInt(user.id.toString(), 10),
    displayName: user.display_name,
    alias: user.alias,
    ident: user.ident,
    tenhouId: null, // TODO?
    score: user.score,
    ratingDelta: user.rating_delta,
    penalties: 0, // TODO?
  }));
}

export function gameConfigFormatter(config: RGameConfig): LGameConfig {
  if (!config) {
    return null;
  }

  return {
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
    eventStatHost: config.eventStatHost,
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
  const formatPlayer = (player): Player => ({
    id: parseInt(player.id, 10),
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

export function formatRoundToRemote(state: AppState): RRound {
  switch (state.getOutcome()) {
    case 'ron':
      return {
        round_index: state.getCurrentRound(),
        honba: state.getHonba(),
        outcome: 'ron',
        riichi: state.getRiichiUsers().map((player) => player.id).join(','),
        winner_id: state.getWinningUsers()[0].id,
        loser_id: state.getLosingUsers()[0].id,
        han: state.getHan() + state.getDora(),
        fu: state.getFu(),
        multi_ron: null,
        dora: state.getDora(),
        uradora: state.getUradora(),
        kandora: state.getKandora(),
        kanuradora: state.getKanuradora(),
        yaku: state.getSelectedYaku().filter(y => y > 0).join(','),
        open_hand: state.getSelectedYaku().indexOf(YakuId.__OPENHAND) !== -1
      };
    case 'multiron':
      let winIdx = 0;
      let wins = state.getWins().map(win => {
        let riichi = winIdx > 0 ? '' : state.getRiichiUsers().map((player) => player.id).join(',');
        winIdx++; // TODO: выпилить когда завезут вынос riichi из секции wins внутри апи
        return {
          riichi: riichi,
          winner_id: win.winner,
          han: win.han + win.dora,
          fu: state.getFuOf(win.winner),
          dora: win.dora,
          uradora: win.uradora,
          kandora: win.kandora,
          kanuradora: win.kanuradora,
          yaku: win.yaku.filter(y => y > 0).join(','),
          open_hand: win.yaku.indexOf(YakuId.__OPENHAND) !== -1
        };
      });

      return {
        round_index: state.getCurrentRound(),
        honba: state.getHonba(),
        outcome: 'multiron',
        loser_id: state.getLosingUsers()[0].id,
        multi_ron: wins.length,
        wins: wins
      };
    case 'tsumo':
      return {
        round_index: state.getCurrentRound(),
        honba: state.getHonba(),
        outcome: 'tsumo',
        riichi: state.getRiichiUsers().map((player) => player.id).join(','),
        winner_id: state.getWinningUsers()[0].id,
        han: state.getHan() + state.getDora(),
        fu: state.getFu(),
        multi_ron: null,
        dora: state.getDora(),
        uradora: state.getUradora(),
        kandora: state.getKandora(),
        kanuradora: state.getKanuradora(),
        yaku: state.getSelectedYaku().filter(y => y > 0).join(','),
        open_hand: state.getSelectedYaku().indexOf(YakuId.__OPENHAND) !== -1
      };
    case 'draw':
      return {
        round_index: state.getCurrentRound(),
        honba: state.getHonba(),
        outcome: 'draw',
        riichi: state.getRiichiUsers().map((player) => player.id).join(','),
        tempai: state.getWinningUsers().map((player) => player.id).join(',')
      };
    case 'abort':
      return {
        round_index: state.getCurrentRound(),
        honba: state.getHonba(),
        outcome: 'abort',
        riichi: state.getRiichiUsers().map((player) => player.id).join(',')
      };
    case 'chombo':
      return {
        round_index: state.getCurrentRound(),
        honba: state.getHonba(),
        outcome: 'chombo',
        loser_id: state.getLosingUsers()[0].id
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
      players: t.players.map((p, idx) => ({
        id: parseInt(p.id.toString(), 10),
        alias: '', // mock
        displayName: p.display_name,
        score: parseInt(t.scores[p.id].toString(), 10),
        penalties: 0, // mock
      }))
    }));
}
