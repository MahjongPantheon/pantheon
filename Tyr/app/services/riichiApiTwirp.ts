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

import { IAppState } from '#/store/interfaces';
import { environment } from '#config';
import {
  AddRound,
  GetAllRegisteredPlayers,
  GetAllRounds,
  GetCurrentSessions,
  GetGameConfig,
  GetLastResults,
  GetLastRound,
  GetLastRoundByHash,
  GetMyEvents,
  GetSessionOverview,
  GetTablesState,
  GetTimerState,
  PreviewRound,
  StartGame,
} from '#/clients/mimir.pb';
import { IRiichiApi } from '#/services/IRiichiApi';
import { Authorize, GetPersonalInfo, QuickAuthorize } from '#/clients/frey.pb';
import { formatRoundToTwirp, fromTwirpOutcome } from '#/services/formatters';
import { ClientConfiguration } from 'twirpscript';
import {
  IntermediateResultOfSession,
  PaymentLog,
  RoundState,
  SessionStatus,
} from '#/clients/atoms.pb';
import {
  RRoundOverviewAbort,
  RRoundOverviewBase,
  RRoundOverviewChombo,
  RRoundOverviewDraw,
  RRoundOverviewMultiRon,
  RRoundOverviewNagashi,
  RRoundOverviewRon,
  RRoundOverviewTsumo,
  RRoundPaymentsInfo,
} from '#/interfaces/remote';

export class RiichiApiTwirpService implements IRiichiApi {
  private _authToken: string | null = null;
  private _personId: string | null = null;
  private readonly _clientConfMimir: ClientConfiguration = {
    prefix: '/v2',
  };
  private readonly _clientConfFrey: ClientConfiguration = {
    prefix: '/v2',
  };

  setCredentials(personId: number, token: string) {
    this._authToken = token;
    this._personId = (personId || 0).toString();

    const headers = new Headers();
    headers.append('X-Api-Version', environment.apiVersion.map((v) => v.toString()).join('.'));
    headers.append('X-Auth-Token', this._authToken ?? '');
    headers.append('X-Twirp', 'true');
    headers.append('X-Current-Person-Id', this._personId ?? '');

    this._clientConfMimir.baseURL = environment.apiUrl;
    this._clientConfFrey.baseURL = environment.uaUrl;
    // eslint-disable-next-line no-multi-assign
    this._clientConfFrey.rpcTransport = this._clientConfMimir.rpcTransport = (url, opts) => {
      Object.keys(opts.headers ?? {}).forEach((key) => headers.set(key, opts.headers[key]));
      return fetch(url + (environment.production ? '' : '?XDEBUG_SESSION=start'), {
        ...opts,
        headers,
      });
    };
  }

  // returns game hashcode
  startGame(eventId: number, playerIds: number[]) {
    return StartGame(
      {
        eventId,
        players: playerIds,
      },
      this._clientConfMimir
    ).then((val) => val.sessionHash);
  }

  getMyEvents() {
    return GetMyEvents({}, this._clientConfMimir).then((val) => val.events);
  }

  getGameConfig(eventId: number) {
    return GetGameConfig({ eventId }, this._clientConfMimir).then((val) => ({
      ...val,
      isTextlog: false,
      timerPolicy: val.timerPolicy as 'redZone' | 'yellowZone' | 'none', // TODO remove
    }));
  }

  getTimerState(eventId: number) {
    return GetTimerState({ eventId }, this._clientConfMimir).then((val) => ({
      ...val,
      autostartTimer: 0, // TODO: fix this in https://github.com/MahjongPantheon/pantheon/issues/282
    }));
  }

  getLastResults(playerId: number, eventId: number) {
    return GetLastResults(
      {
        playerId,
        eventId,
      },
      this._clientConfMimir
    ).then((val) =>
      val.results.map((user) => ({
        ...user,
        tenhouId: '', // TODO?
        id: user.playerId,
        displayName: user.title,
        penalties: 0, // TODO?
      }))
    );
  }

  getAllPlayers(eventId: number) {
    return GetAllRegisteredPlayers({ eventIds: [eventId] }, this._clientConfMimir).then((val) =>
      val.players.map((user) => ({ ...user, displayName: user.title }))
    );
  }

  getGameOverview(sessionHashcode: string) {
    return GetSessionOverview({ sessionHash: sessionHashcode }, this._clientConfMimir).then(
      (val) => ({
        ...val,
        currentRound: val.state.roundIndex,
        riichiOnTable: val.state.riichiCount,
        honba: val.state.honbaCount,
        yellowZoneAlreadyPlayed: val.state.yellowZoneAlreadyPlayed,
        tableIndex: val.tableIndex ?? 0,
        players: val.players.map((user) => ({
          ...user,
          tenhouId: '', // TODO?
          displayName: user.title,
          penalties: val.state.penalties.reduce(
            (acc, v) => (v.who === user.id ? acc + v.amount : acc),
            0
          ),
        })),
      })
    );
  }

  getCurrentGames(playerId: number, eventId: number) {
    return GetCurrentSessions({ playerId, eventId }, this._clientConfMimir).then((val) =>
      val.sessions.map((session) => ({
        ...session,
        hashcode: session.sessionHash,
        tableIndex: session.tableIndex ?? 0,
        players: session.players.map((user) => ({
          ...user,
          tenhouId: '', // TODO?
          displayName: user.title,
          penalties: 0, // TODO?
        })),
      }))
    );
  }

  getUserInfo(personIds: number[]) {
    return GetPersonalInfo({ ids: personIds }, this._clientConfFrey).then((val) =>
      val.persons.map((user) => ({
        ...user,
        tenhouId: '', // TODO?
        displayName: user.title,
        penalties: 0, // TODO?
      }))
    );
  }

  /**
   * @deprecated
   * @param pin
   */
  confirmRegistration(pin: string) {
    return Promise.resolve(pin);
  }

  private static fromScores(scores: IntermediateResultOfSession[]): Record<number, number> {
    return scores.reduce((acc, val) => {
      acc[val.playerId] = val.score;
      return acc;
    }, {} as Record<number, number>);
  }

  private static makePayments(plog: PaymentLog) {
    return {
      direct: plog.direct.reduce((acc, log) => {
        acc[`${log.to}<-${log.from}`] = log.amount;
        return acc;
      }, {} as Record<string, number>),
      riichi: plog.riichi.reduce((acc, log) => {
        acc[`${log.to}<-${log.from}`] = log.amount;
        return acc;
      }, {} as Record<string, number>),
      honba: plog.honba.reduce((acc, log) => {
        acc[`${log.to}<-${log.from}`] = log.amount;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  private static makePaymentsInfo(state: RoundState): RRoundPaymentsInfo {
    const outcome = fromTwirpOutcome(state.outcome);
    if (outcome === 'multiron') {
      return {
        outcome: 'multiron',
        sessionHash: state.sessionHash,
        dealer: state.dealer,
        round: state.roundIndex,
        riichi: state.riichi,
        honba: state.honba,
        riichiIds: state.riichiIds.map((v) => v.toString()),
        scores: state.scores.map((v) => v.score),

        winner: state.round.multiron?.wins.map((v) => v.winnerId) ?? [],
        paoPlayer: state.round.multiron?.wins.find((v) => v.paoPlayerId)?.paoPlayerId,
        yaku: state.round.multiron?.wins.map((w) => w.yaku.join(',')) ?? [],
        han: state.round.multiron?.wins.map((w) => w.han) ?? [],
        fu: state.round.multiron?.wins.map((w) => w.fu) ?? [],
        dora: state.round.multiron?.wins.map((w) => w.dora) ?? [],
        kandora: state.round.multiron?.wins.map((w) => w.kandora) ?? [],
        uradora: state.round.multiron?.wins.map((w) => w.uradora) ?? [],
        kanuradora: state.round.multiron?.wins.map((w) => w.kanuradora) ?? [],
        payments: RiichiApiTwirpService.makePayments(state.payments),
      };
    } else {
      return {
        outcome,
        sessionHash: state.sessionHash,
        penaltyFor: state.round.chombo?.loserId,
        dealer: state.dealer,
        round: state.roundIndex,
        riichi: state.riichi,
        honba: state.honba,
        riichiIds: state.riichiIds.map((v) => v.toString()),
        scores: state.scores.map((v) => v.score),
        // TODO remove all of these when reworking api client layer, along with R/L types
        winner: (state.round[outcome] as any)?.winnerId,
        paoPlayer: (state.round[outcome] as any)?.paoPlayerId,
        yaku: (state.round[outcome] as any)?.yaku?.join(','),
        han: (state.round[outcome] as any)?.han,
        fu: (state.round[outcome] as any)?.fu,
        dora: (state.round[outcome] as any)?.dora,
        kandora: (state.round[outcome] as any)?.kandora,
        uradora: (state.round[outcome] as any)?.uradora,
        kanuradora: (state.round[outcome] as any)?.kanuradora,
        payments: RiichiApiTwirpService.makePayments(state.payments),
      };
    }
  }

  getChangesOverview(state: IAppState) {
    const roundData = formatRoundToTwirp(state);
    if (!state.currentSessionHash || !roundData) {
      return Promise.reject();
    }

    return PreviewRound(
      { sessionHash: state.currentSessionHash, roundData },
      this._clientConfMimir
    ).then((val) => RiichiApiTwirpService.makePaymentsInfo(val.state));
  }

  getLastRoundByHash(sessionHashcode: string) {
    return GetLastRoundByHash({ sessionHash: sessionHashcode }, this._clientConfMimir).then((val) =>
      RiichiApiTwirpService.makePaymentsInfo(val.round)
    );
  }

  getLastRound(playerId: number, eventId: number) {
    return GetLastRound({ playerId, eventId }, this._clientConfMimir).then((val) =>
      RiichiApiTwirpService.makePaymentsInfo(val.round)
    );
  }

  getAllRounds(sessionHashcode: string) {
    return GetAllRounds({ sessionHash: sessionHashcode }, this._clientConfMimir).then((val) =>
      // eslint-disable-next-line array-callback-return
      val.round.map((round) => {
        const base: RRoundOverviewBase = {
          dealer: round.dealer,
          round: round.roundIndex,
          riichi: round.riichi,
          honba: round.honba,
          riichiIds: round.riichiIds.map((v: number) => v.toString()),
          scores: RiichiApiTwirpService.fromScores(round.scores),
          scoresDelta: RiichiApiTwirpService.fromScores(round.scoresDelta),
        };
        switch (round.outcome) {
          case 'RON':
            return {
              ...base,
              outcome: 'ron',
              loser: round.round.ron?.loserId,
              winner: round.round.ron?.winnerId,
              paoPlayer: round.round.ron?.paoPlayerId,
              yaku: round.round.ron?.yaku.join(','),
              han: round.round.ron?.han,
              fu: round.round.ron?.fu,
              dora: round.round.ron?.dora,
              kandora: round.round.ron?.kandora,
              uradora: round.round.ron?.uradora,
              kanuradora: round.round.ron?.kanuradora,
            } as RRoundOverviewRon;
          case 'MULTIRON':
            return {
              ...base,
              outcome: 'multiron',
              loser: round.round.multiron?.loserId,
              winner: round.round.multiron?.wins.map((w) => w.winnerId),
              paoPlayer: round.round.multiron?.wins.map((w) => w.paoPlayerId),
              yaku: round.round.multiron?.wins.map((w) => w.yaku.join(',')),
              han: round.round.multiron?.wins.map((w) => w.han),
              fu: round.round.multiron?.wins.map((w) => w.fu),
              dora: round.round.multiron?.wins.map((w) => w.dora),
              kandora: round.round.multiron?.wins.map((w) => w.kandora),
              uradora: round.round.multiron?.wins.map((w) => w.uradora),
              kanuradora: round.round.multiron?.wins.map((w) => w.kanuradora),
            } as RRoundOverviewMultiRon;
          case 'TSUMO':
            return {
              ...base,
              outcome: 'tsumo',
              winner: round.round.tsumo?.winnerId,
              paoPlayer: round.round.tsumo?.paoPlayerId,
              yaku: round.round.tsumo?.yaku.join(','),
              han: round.round.tsumo?.han,
              fu: round.round.tsumo?.fu,
              dora: round.round.tsumo?.dora,
              kandora: round.round.tsumo?.kandora,
              uradora: round.round.tsumo?.uradora,
              kanuradora: round.round.tsumo?.kanuradora,
            } as RRoundOverviewTsumo;
          case 'DRAW':
            return {
              ...base,
              outcome: 'draw',
              tempai: round.round.draw?.tempai.map((v) => v.toString()),
            } as RRoundOverviewDraw;
          case 'ABORT':
            return {
              ...base,
              outcome: 'abort',
            } as RRoundOverviewAbort;
          case 'CHOMBO':
            return {
              ...base,
              outcome: 'chombo',
              penaltyFor: round.round.chombo?.loserId,
            } as RRoundOverviewChombo;
          case 'NAGASHI':
            return {
              ...base,
              outcome: 'nagashi',
              tempai: round.round.nagashi?.tempai.map((v) => v.toString()),
              nagashi: round.round.nagashi?.nagashi.map((v) => v.toString()),
            } as RRoundOverviewNagashi;
        }
      })
    );
  }

  addRound(state: IAppState) {
    const sessionHash: string = state.currentSessionHash ?? '';
    const roundData = formatRoundToTwirp(state);
    if (!sessionHash || !roundData) {
      return Promise.reject();
    }
    return AddRound({ sessionHash, roundData }, this._clientConfMimir).then((val) => ({
      ...val,
      _lastOutcome: fromTwirpOutcome(val.lastOutcome!),
      _scores: RiichiApiTwirpService.fromScores(val.scores),
      _extraPenaltyLog: [], // TODO: unused
      _penalties: {}, // TODO: unused
      _round: val.round,
      _honba: val.honba,
      _riichiBets: val.riichiBets,
      _prematurelyFinished: val.prematurelyFinished,
      _roundJustChanged: val.roundJustChanged,
      _yellowZoneAlreadyPlayed: val.yellowZoneAlreadyPlayed,
      _isFinished: val.isFinished,
    }));
  }

  _fromTableStatus(status: string): string {
    return (
      {
        [SessionStatus.PLANNED]: 'planned',
        [SessionStatus.INPROGRESS]: 'inprogress',
        [SessionStatus.PREFINISHED]: 'prefinished',
        [SessionStatus.FINISHED]: 'finished',
        [SessionStatus.CANCELLED]: 'cancelled',
      }[status] ?? ''
    );
  }

  getTablesState(eventId: number) {
    return GetTablesState({ eventId }, this._clientConfMimir).then((v) =>
      v.tables
        .filter((t) => t.status === SessionStatus.INPROGRESS)
        .map((table) => ({
          ...table,
          status: this._fromTableStatus(table.status),
          penalties: table.penaltyLog,
          // last_round_detailed: table.lastRound ? this._fromRound(table.lastRound) : null,
          scores: RiichiApiTwirpService.fromScores(table.scores),
          hash: table.sessionHash,
          currentRound: table.currentRoundIndex,
          players: table.players.map((user) => ({
            ...user,
            tenhouId: '', // TODO?
            displayName: user.title,
            score: table.scores.find((s) => s.playerId === user.id)?.score ?? 0,
            penalties: table.penaltyLog.reduce(
              (acc, pen) => (pen.who === user.id ? acc + pen.amount : acc),
              0
            ),
          })),
        }))
    );
  }

  quickAuthorize() {
    if (!this._personId || !this._authToken) {
      return Promise.reject();
    }
    return QuickAuthorize(
      {
        personId: parseInt(this._personId, 10),
        authToken: this._authToken,
      },
      this._clientConfFrey
    ).then((v) => v.authSuccess);
  }

  authorize(email: string, password: string) {
    return Authorize({ email, password }, this._clientConfFrey).then((v) => ({
      ...v,
      token: v.authToken,
    }));
  }
}
