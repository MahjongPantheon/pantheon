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
  AddPenalty,
  CancelGame,
  CancelPenalty,
  CreateEvent,
  DefinalizeGame,
  DropLastRound,
  FinalizeSession,
  FinishEvent,
  ForceFinishGame,
  GetAllRegisteredPlayers,
  GetCountries,
  GetEventForEdit,
  GetEvents,
  GetEventsById,
  GetGameConfig,
  GetPrescriptedEventConfig,
  GetRulesets,
  GetTablesState,
  GetTimezones,
  ListPenalties,
  MakeIntervalSeating,
  MakePrescriptedSeating,
  MakeShuffledSeating,
  MakeSwissSeating,
  NotifyPlayersSessionStartsSoon,
  RebuildScoring,
  RecalcAchievements,
  RecalcPlayerStats,
  RegisterPlayer,
  ResetSeating,
  StartTimer,
  ToggleHideAchievements,
  ToggleHideResults,
  ToggleListed,
  UnregisterPlayer,
  UpdateEvent,
  UpdatePlayerReplacement,
  UpdatePlayerSeatingFlag,
  UpdatePlayersLocalIds,
  UpdatePlayersTeams,
  UpdatePrescriptedEventConfig,
} from '../clients/proto/mimir.pb';
import {
  AddRuleForPerson,
  ApproveRegistration,
  ApproveResetPassword,
  Authorize,
  ChangePassword,
  CreateAccount,
  DeleteRuleForPerson,
  DepersonalizeAccount,
  FindByTitle,
  GetEventAdmins,
  GetOwnedEventIds,
  GetPersonalInfo,
  GetSuperadminFlag,
  QuickAuthorize,
  RequestRegistration,
  RequestResetPassword,
  UpdatePersonalInfo,
  GetNotificationsSettings,
  SetNotificationsSettings,
} from '../clients/proto/frey.pb';
import { ClientConfiguration } from 'twirpscript';
import { EventData, IntermediateResultOfSession } from '../clients/proto/atoms.pb';
import { handleReleaseTag } from './releaseTags';
import { Analytics } from './analytics';
import { GetLastDay, GetLastMonth, GetLastYear } from '../clients/proto/hugin.pb';
import { env } from '../env';

export class ApiService {
  private _authToken: string | null = null;
  private _personId: string | null = null;
  private _eventId: string | null = null;
  private _analytics: Analytics | null = null;
  private readonly _clientConfMimir: ClientConfiguration = {
    prefix: '/v2',
  };
  private readonly _clientConfFrey: ClientConfiguration = {
    prefix: '/v2',
  };
  private readonly _clientConfHugin: ClientConfiguration = {
    prefix: '/v2',
  };

  setAnalytics(analytics: Analytics) {
    this._analytics = analytics;
    return this;
  }

  setEventId(eventId: number) {
    this._eventId = eventId ? eventId.toString() : '';
    return this;
  }

  setCredentials(personId: number, token: string) {
    this._authToken = token;
    this._personId = (personId || 0).toString();

    const headers = new Headers();
    headers.append('X-Auth-Token', this._authToken ?? '');
    headers.append('X-Current-Person-Id', this._personId ?? '');

    this._clientConfMimir.baseURL = env.urls.mimir;
    this._clientConfFrey.baseURL = env.urls.frey;
    this._clientConfHugin.baseURL = env.urls.hugin;
    this._clientConfFrey.rpcTransport = (url, opts) => {
      Object.keys(opts.headers ?? {}).forEach((key) => headers.set(key, opts.headers[key]));
      headers.set('X-Current-Event-Id', this._eventId ?? '');
      return fetch(url + (process.env.NODE_ENV === 'production' ? '' : '?XDEBUG_SESSION=start'), {
        ...opts,
        headers,
      })
        .then(handleReleaseTag)
        .then((resp) => {
          if (!resp.ok) {
            return resp.json().then((err) => {
              // Twirp server error handling
              if (err.code && err.code === 'internal' && err.meta && err.meta.cause) {
                fetch(env.urls.hugin, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    source: 'Forseti [twirp]',
                    error: `From: ${
                      typeof window !== 'undefined' && window.location.href
                    } | To: ${url} | Details: ${err.meta.cause}`,
                  }),
                });
                throw new Error(err.meta.cause);
              }
              return resp;
            });
          }
          return resp;
        });
    };

    this._clientConfMimir.rpcTransport = this._clientConfFrey.rpcTransport;
    this._clientConfHugin.rpcTransport = this._clientConfFrey.rpcTransport;
  }

  getAllPlayers(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'GetAllRegisteredPlayers' });
    return GetAllRegisteredPlayers({ eventIds: [eventId] }, this._clientConfMimir).then(
      (val) => val.players
    );
  }

  getTablesState(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'GetTablesState' });
    return GetTablesState({ eventId, omitLastRound: false }, this._clientConfMimir).then(
      (v) => v.tables
    );
  }

  quickAuthorize() {
    if (!this._personId || !this._authToken) {
      return Promise.reject();
    }
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'QuickAuthorize' });
    return QuickAuthorize(
      {
        personId: parseInt(this._personId, 10),
        authToken: this._authToken,
      },
      this._clientConfFrey
    ).then((v) => v.authSuccess);
  }

  authorize(email: string, password: string) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'Authorize' });
    return Authorize({ email, password }, this._clientConfFrey);
  }

  requestRegistration(email: string, title: string, password: string) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'RequestRegistration' });
    return RequestRegistration({ email, title, password, sendEmail: true }, this._clientConfFrey);
  }

  confirmRegistration(code: string) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'ApproveRegistration' });
    return ApproveRegistration({ approvalCode: code }, this._clientConfFrey);
  }

  requestPasswordRecovery(email: string) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'RequestResetPassword' });
    return RequestResetPassword({ email, sendEmail: true }, this._clientConfFrey);
  }

  approvePasswordRecovery(email: string, resetToken: string) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'ApproveResetPassword' });
    return ApproveResetPassword({ email, resetToken }, this._clientConfFrey);
  }

  changePassword(email: string, password: string, newPassword: string) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'ChangePassword' });
    return ChangePassword({ email, password, newPassword }, this._clientConfFrey);
  }

  getCountries() {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'GetCountries' });
    return GetCountries({ addr: '' }, this._clientConfMimir);
  }

  getPersonalInfo(personId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'GetPersonalInfo' });
    return GetPersonalInfo({ ids: [personId] }, this._clientConfFrey).then(
      (resp) => resp.people[0]
    );
  }

  depersonalizeAccount() {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'DepersonalizeMyAccount' });
    return DepersonalizeAccount({}, this._clientConfFrey);
  }

  updatePersonalInfo(
    id: number,
    title: string,
    country: string,
    city: string,
    email: string,
    phone: string,
    tenhouId: string,
    hasAvatar: boolean,
    avatarData: string,
    msNickname: string,
    msFriendId: number,
    msAccountId: number
  ) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'UpdatePersonalInfo' });
    return UpdatePersonalInfo(
      {
        id,
        title,
        country,
        city,
        email,
        phone,
        tenhouId,
        hasAvatar,
        avatarData,
        msNickname,
        msFriendId,
        msAccountId,
      },
      this._clientConfFrey
    ).then((resp) => resp.success);
  }

  getOwnedEventIds(personId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'GetOwnedEventIds' });
    return GetOwnedEventIds({ personId }, this._clientConfFrey).then((r) => r.eventIds);
  }

  getSuperadminFlag(personId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'GetSuperadminFlag' });
    return GetSuperadminFlag({ personId }, this._clientConfFrey).then((r) => r.isAdmin);
  }

  getEvents(limit: number, offset: number, filterUnlisted: boolean) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'GetEvents' });
    return GetEvents({ limit, offset, filter: '', filterUnlisted }, this._clientConfMimir);
  }

  getEventsById(ids: number[]) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'GetEventsById' });
    return GetEventsById({ ids }, this._clientConfMimir).then((r) => r.events);
  }

  getEventAdmins(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'GetEventAdmins' });
    return GetEventAdmins({ eventId }, this._clientConfFrey).then((r) => r.admins);
  }

  rebuildScoring(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'RebuildScoring' });
    return RebuildScoring({ eventId }, this._clientConfMimir).then((r) => r.success);
  }

  toggleHideResults(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'ToggleHideResults' });
    return ToggleHideResults({ eventId }, this._clientConfMimir).then((r) => r.success);
  }

  toggleListed(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'ToggleListed' });
    return ToggleListed({ eventId }, this._clientConfMimir).then((r) => r.success);
  }

  finishEvent(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'FinishEvent' });
    return FinishEvent({ eventId }, this._clientConfMimir).then((r) => r.success);
  }

  recalcAchievements(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'RecalcAchievements' });
    return RecalcAchievements({ eventId }, this._clientConfMimir).then((r) => r.success);
  }

  recalcPlayerStats(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'RecalcPlayerStats' });
    return RecalcPlayerStats({ eventId }, this._clientConfMimir).then((r) => r.success);
  }

  getEventForEdit(id: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'GetEventForEdit' });
    return GetEventForEdit({ id }, this._clientConfMimir);
  }

  updateEvent(id: number, event: EventData) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'UpdateEvent' });
    return UpdateEvent({ id, event }, this._clientConfMimir).then((r) => r.success);
  }

  createEvent(event: EventData) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'CreateEvent' });
    return CreateEvent(event, this._clientConfMimir).then((r) => r.eventId);
  }

  getRulesets() {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'GetRulesets' });
    return GetRulesets({}, this._clientConfMimir).then((r) => {
      const rulesets = [];
      for (let i = 0; i < r.rulesets.length; i++) {
        rulesets.push({
          id: r.rulesetIds[i],
          title: r.rulesetTitles[i],
          rules: r.rulesets[i],
        });
      }
      return rulesets;
    });
  }

  getTimezones() {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'GetTimezones' });
    return GetTimezones(
      { addr: '' /* mimir will substitute with current IP if empty*/ },
      this._clientConfMimir
    );
  }

  getGameConfig(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'GetGameConfig' });
    return GetGameConfig({ eventId }, this._clientConfMimir);
  }

  getPenalties(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'ListPenalties' });
    return ListPenalties({ eventId }, this._clientConfMimir);
  }

  addPenalty(eventId: number, playerId: number, amount: number, reason: string) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'AddPenalty' });
    return AddPenalty({ eventId, playerId, amount, reason }, this._clientConfMimir).then(
      (r) => r.success
    );
  }

  cancelPenalty(penaltyId: number, reason: string) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'CancelPenalty' });
    return CancelPenalty({ penaltyId, reason }, this._clientConfMimir).then((r) => r.success);
  }

  updateSeatingFlag(playerId: number, eventId: number, ignoreSeating: boolean) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'UpdatePlayerSeatingFlag' });
    return UpdatePlayerSeatingFlag(
      { playerId, eventId, ignoreSeating },
      this._clientConfMimir
    ).then((r) => r.success);
  }

  registerPlayer(playerId: number, eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'RegisterPlayer' });
    return RegisterPlayer({ eventId, playerId }, this._clientConfMimir).then((r) => r.success);
  }

  unregisterPlayer(playerId: number, eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'UnregisterPlayer' });
    return UnregisterPlayer({ eventId, playerId }, this._clientConfMimir).then((r) => r.success);
  }

  findByTitle(query: string) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'FindByTitle' });
    return FindByTitle({ query }, this._clientConfFrey).then((r) => r.people);
  }

  addEventAdmin(playerId: number, eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'AddRuleForPerson' });
    return AddRuleForPerson(
      {
        personId: playerId,
        eventId,
        ruleName: 'ADMIN_EVENT',
        ruleType: 'bool',
        ruleValue: { boolValue: true },
      },
      this._clientConfFrey
    ).then((r) => r.ruleId);
  }

  removeEventAdmin(ruleId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'DeleteRuleForPerson' });
    return DeleteRuleForPerson({ ruleId }, this._clientConfFrey).then((r) => r.success);
  }

  updatePlayerReplacement(playerId: number, eventId: number, replacementId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'UpdatePlayerReplacement' });
    return UpdatePlayerReplacement(
      { playerId, replacementId, eventId },
      this._clientConfMimir
    ).then((r) => r.success);
  }

  updateLocalIds(eventId: number, idMap: Record<number, number>) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'UpdatePlayersLocalIds' });
    return UpdatePlayersLocalIds(
      {
        eventId,
        idsToLocalIds: Object.keys(idMap).map((k) => {
          const playerId = typeof k === 'number' ? k : parseInt(k, 10);
          return { playerId, localId: idMap[playerId] };
        }),
      },
      this._clientConfMimir
    ).then((r) => r.success);
  }

  updateTeamNames(eventId: number, teamMap: Record<number, string>) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'UpdatePlayersTeams' });
    return UpdatePlayersTeams(
      {
        eventId,
        idsToTeamNames: Object.keys(teamMap).map((k) => {
          const playerId = typeof k === 'number' ? k : parseInt(k, 10);
          return { playerId, teamName: teamMap[playerId] };
        }),
      },
      this._clientConfMimir
    ).then((r) => r.success);
  }

  cancelLastRound(sessionHash: string, intermediateResults: IntermediateResultOfSession[]) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'DropLastRound' });
    return DropLastRound({ sessionHash, intermediateResults }, this._clientConfMimir).then(
      (r) => r.success
    );
  }

  cancelGame(sessionHash: string) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'CancelGame' });
    return CancelGame({ sessionHash }, this._clientConfMimir).then((r) => r.success);
  }

  definalizeGame(sessionHash: string) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'DefinalizeGame' });
    return DefinalizeGame({ sessionHash }, this._clientConfMimir).then((r) => r.success);
  }

  startTimer(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'StartTimer' });
    return StartTimer({ eventId }, this._clientConfMimir).then((r) => r.success);
  }

  notifyPlayers(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'NotifyPlayers' });
    return NotifyPlayersSessionStartsSoon({ eventId }, this._clientConfMimir).then(
      (r) => r.success
    );
  }

  toggleResults(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'ToggleHideResults' });
    return ToggleHideResults({ eventId }, this._clientConfMimir).then((r) => r.success);
  }

  toggleAchievements(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'ToggleHideAchievements' });
    return ToggleHideAchievements({ eventId }, this._clientConfMimir).then((r) => r.success);
  }

  approveResults(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'FinalizeSession' });
    return FinalizeSession({ eventId }, this._clientConfMimir).then((r) => r.success);
  }

  makeShuffledSeating(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'MakeShuffledSeating' });
    return MakeShuffledSeating(
      {
        eventId,
        groupsCount: 1,
        seed: Math.floor(Math.random() * 1_000_000) % 1_000_000,
      },
      this._clientConfMimir
    )
      .then((r) => r.success)
      .catch(() => {
        // Seating took too long, nginx dropped connection, let's wait a bit
        return new Promise((resolve) => {
          setTimeout(() => resolve(true), 3000);
        });
      });
  }

  makeIntervalSeating(eventId: number, interval: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'MakeIntervalSeating' });
    return MakeIntervalSeating({ eventId, step: interval }, this._clientConfMimir)
      .then((r) => r.success)
      .catch(() => {
        // Seating took too long, nginx dropped connection, let's wait a bit
        return new Promise((resolve) => {
          setTimeout(() => resolve(true), 3000);
        });
      });
  }

  makeSwissSeating(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'MakeSwissSeating' });
    return MakeSwissSeating({ eventId }, this._clientConfMimir)
      .then((r) => r.success)
      .catch(() => {
        // Seating took too long, nginx dropped connection, let's wait a bit
        return new Promise((resolve) => {
          setTimeout(() => resolve(true), 3000);
        });
      });
  }

  makePrescriptedSeating(eventId: number, randomizeAtTables: boolean) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'MakePrescriptedSeating' });
    return MakePrescriptedSeating({ eventId, randomizeAtTables }, this._clientConfMimir)
      .then((r) => r.success)
      .catch(() => {
        // Seating took too long, nginx dropped connection, let's wait a bit
        return new Promise((resolve) => {
          setTimeout(() => resolve(true), 3000);
        });
      });
  }

  resetSeating(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'ResetSeating' });
    return ResetSeating({ eventId }, this._clientConfMimir).then((r) => r.success);
  }

  forceFinish(sessionHash: string) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'ForceFinishGame' });
    return ForceFinishGame({ sessionHash }, this._clientConfMimir).then((r) => r.success);
  }

  getPrescriptedEventConfig(eventId: number) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'GetPrescriptedEventConfig' });
    return GetPrescriptedEventConfig({ eventId }, this._clientConfMimir);
  }

  updatePrescriptedEventConfig(eventId: number, nextSessionIndex: number, prescript: string) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'UpdatePrescriptedEventConfig' });
    return UpdatePrescriptedEventConfig(
      {
        eventId,
        nextSessionIndex,
        prescript,
      },
      this._clientConfMimir
    ).then((r) => r.success);
  }

  createAccount(
    email: string,
    title: string,
    password: string,
    city: string,
    country: string,
    phone: string,
    tenhouId: string
  ) {
    this._analytics?.track(Analytics.LOAD_STARTED, { method: 'CreateAccount' });
    return CreateAccount(
      { email, title, password, city, country, phone, tenhouId },
      this._clientConfFrey
    ).then((r) => r.personId);
  }

  getLastDayStats() {
    return GetLastDay({}, this._clientConfHugin).then((r) => r.data);
  }

  getLastMonthStats() {
    return GetLastMonth({}, this._clientConfHugin).then((r) => r.data);
  }

  getLastYearStats() {
    return GetLastYear({}, this._clientConfHugin).then((r) => r.data);
  }

  getNotificationsSettings(personId: number) {
    return GetNotificationsSettings({ personId }, this._clientConfFrey).then((r) => {
      let notifications = {};
      try {
        notifications = JSON.parse(r.notifications);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        notifications = {};
      }
      return { id: r.telegramId, notifications: notifications as Record<string, number> };
    });
  }

  setNotificationsSettings(
    personId: number,
    telegramId: string,
    notifications: Record<string, any>
  ) {
    for (const i in notifications) {
      if (notifications[i] === false) {
        notifications[i] = 0;
      }
      if (notifications[i] === true) {
        notifications[i] = 1;
      }
    }
    return SetNotificationsSettings(
      { personId, telegramId, notifications: JSON.stringify(notifications) },
      this._clientConfFrey
    ).then((r) => r.success);
  }
}
