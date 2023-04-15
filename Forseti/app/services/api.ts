import { environment } from '#config';
import {
  AddPenalty,
  CancelGame,
  CreateEvent,
  DefinalizeGame,
  DropLastRound,
  FinishEvent,
  GetAllRegisteredPlayers,
  GetCountries,
  GetEventForEdit,
  GetEvents,
  GetEventsById,
  GetGameConfig,
  GetRulesets,
  GetTablesState,
  GetTimezones,
  RebuildScoring,
  RegisterPlayer,
  ToggleHideResults,
  ToggleListed,
  UnregisterPlayer,
  UpdateEvent,
  UpdatePlayerReplacement,
  UpdatePlayerSeatingFlag,
  UpdatePlayersLocalIds,
  UpdatePlayersTeams,
} from '#/clients/mimir.pb';
import {
  AddRuleForPerson,
  ApproveRegistration,
  ApproveResetPassword,
  Authorize,
  ChangePassword,
  DeleteRuleForPerson,
  FindByTitle,
  GetEventAdmins,
  GetOwnedEventIds,
  GetPersonalInfo,
  GetSuperadminFlag,
  QuickAuthorize,
  RequestRegistration,
  RequestResetPassword,
  UpdatePersonalInfo,
} from '#/clients/frey.pb';
import { ClientConfiguration } from 'twirpscript';
import { EventData, IntermediateResultOfSession } from '#/clients/atoms.pb';
import { handleReleaseTag } from '#/services/releaseTags';

export class ApiService {
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
      })
        .then(handleReleaseTag)
        .then((resp) => {
          if (!resp.ok) {
            return resp.json().then((err) => {
              // Twirp server error handling
              if (err.code && err.code === 'internal' && err.meta && err.meta.cause) {
                throw new Error(err.meta.cause);
              }
              return resp;
            });
          }
          return resp;
        });
    };
  }

  getAllPlayers(eventId: number) {
    return GetAllRegisteredPlayers({ eventIds: [eventId] }, this._clientConfMimir).then(
      (val) => val.players
    );
  }

  getTablesState(eventId: number) {
    return GetTablesState({ eventId }, this._clientConfMimir).then((v) => v.tables);
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
    return Authorize({ email, password }, this._clientConfFrey);
  }

  requestRegistration(email: string, title: string, password: string) {
    return RequestRegistration({ email, title, password, sendEmail: true }, this._clientConfFrey);
  }

  confirmRegistration(code: string) {
    return ApproveRegistration({ approvalCode: code }, this._clientConfFrey);
  }

  requestPasswordRecovery(email: string) {
    return RequestResetPassword({ email, sendEmail: true }, this._clientConfFrey);
  }

  approvePasswordRecovery(email: string, resetToken: string) {
    return ApproveResetPassword({ email, resetToken }, this._clientConfFrey);
  }

  changePassword(email: string, password: string, newPassword: string) {
    return ChangePassword({ email, password, newPassword }, this._clientConfFrey);
  }

  getCountries() {
    return GetCountries({ addr: '' }, this._clientConfMimir);
  }

  getPersonalInfo(personId: number) {
    return GetPersonalInfo({ ids: [personId] }, this._clientConfFrey).then(
      (resp) => resp.persons[0]
    );
  }

  updatePersonalInfo(
    id: number,
    title: string,
    country: string,
    city: string,
    email: string,
    phone: string,
    tenhouId: string
  ) {
    return UpdatePersonalInfo(
      {
        id,
        title,
        country,
        city,
        email,
        phone,
        tenhouId,
      },
      this._clientConfFrey
    ).then((resp) => resp.success);
  }

  getOwnedEventIds(personId: number) {
    return GetOwnedEventIds({ personId }, this._clientConfFrey).then((r) => r.eventIds);
  }

  getSuperadminFlag(personId: number) {
    return GetSuperadminFlag({ personId }, this._clientConfFrey).then((r) => r.isAdmin);
  }

  getEvents(limit: number, offset: number, filterUnlisted: boolean) {
    return GetEvents({ limit, offset, filterUnlisted }, this._clientConfMimir);
  }

  getEventsById(ids: number[]) {
    return GetEventsById({ ids }, this._clientConfMimir).then((r) => r.events);
  }

  getEventAdmins(eventId: number) {
    return GetEventAdmins({ eventId }, this._clientConfFrey).then((r) => r.admins);
  }

  rebuildScoring(eventId: number) {
    return RebuildScoring({ eventId }, this._clientConfMimir).then((r) => r.success);
  }

  toggleHideResults(eventId: number) {
    return ToggleHideResults({ eventId }, this._clientConfMimir).then((r) => r.success);
  }

  toggleListed(eventId: number) {
    return ToggleListed({ eventId }, this._clientConfMimir).then((r) => r.success);
  }

  finishEvent(eventId: number) {
    return FinishEvent({ eventId }, this._clientConfMimir).then((r) => r.success);
  }

  getEventForEdit(id: number) {
    return GetEventForEdit({ id }, this._clientConfMimir);
  }

  updateEvent(id: number, event: EventData) {
    return UpdateEvent({ id, event }, this._clientConfMimir).then((r) => r.success);
  }

  createEvent(event: EventData) {
    return CreateEvent(event, this._clientConfMimir).then((r) => r.eventId);
  }

  getRulesets() {
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
    return GetTimezones(
      { addr: '' /* mimir will substitute with current IP if empty*/ },
      this._clientConfMimir
    );
  }

  getGameConfig(eventId: number) {
    return GetGameConfig({ eventId }, this._clientConfMimir);
  }

  addPenalty(eventId: number, playerId: number, amount: number, reason: string) {
    return AddPenalty({ eventId, playerId, amount, reason }, this._clientConfMimir).then(
      (r) => r.success
    );
  }

  updateSeatingFlag(playerId: number, eventId: number, ignoreSeating: boolean) {
    return UpdatePlayerSeatingFlag(
      { playerId, eventId, ignoreSeating },
      this._clientConfMimir
    ).then((r) => r.success);
  }

  registerPlayer(playerId: number, eventId: number) {
    return RegisterPlayer({ eventId, playerId }, this._clientConfMimir).then((r) => r.success);
  }

  unregisterPlayer(playerId: number, eventId: number) {
    return UnregisterPlayer({ eventId, playerId }, this._clientConfMimir).then((r) => r.success);
  }

  findByTitle(query: string) {
    return FindByTitle({ query }, this._clientConfFrey).then((r) => r.persons);
  }

  addEventAdmin(playerId: number, eventId: number) {
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
    return DeleteRuleForPerson({ ruleId }, this._clientConfFrey).then((r) => r.success);
  }

  updatePlayerReplacement(playerId: number, eventId: number, replacementId: number) {
    return UpdatePlayerReplacement(
      { playerId, replacementId, eventId },
      this._clientConfMimir
    ).then((r) => r.success);
  }

  updateLocalIds(eventId: number, idMap: Record<number, number>) {
    return UpdatePlayersLocalIds(
      {
        eventId,
        idMap: Object.keys(idMap).map((k) => {
          const playerId = typeof k === 'number' ? k : parseInt(k, 10);
          return { playerId, localId: idMap[playerId] };
        }),
      },
      this._clientConfMimir
    ).then((r) => r.success);
  }

  updateTeamNames(eventId: number, teamMap: Record<number, string>) {
    return UpdatePlayersTeams(
      {
        eventId,
        teamNameMap: Object.keys(teamMap).map((k) => {
          const playerId = typeof k === 'number' ? k : parseInt(k, 10);
          return { playerId, teamName: teamMap[playerId] };
        }),
      },
      this._clientConfMimir
    ).then((r) => r.success);
  }

  cancelLastRound(sessionHash: string, intermediateResults: IntermediateResultOfSession[]) {
    return DropLastRound({ sessionHash, intermediateResults }, this._clientConfMimir).then(
      (r) => r.success
    );
  }

  cancelGame(sessionHash: string) {
    return CancelGame({ sessionHash }, this._clientConfMimir).then((r) => r.success);
  }

  definalizeGame(sessionHash: string) {
    return DefinalizeGame({ sessionHash }, this._clientConfMimir).then((r) => r.success);
  }
}
