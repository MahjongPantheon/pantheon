import { environment } from '#config';
import { GetAllRegisteredPlayers, GetTablesState } from '#/clients/mimir.pb';
import {
  ApproveRegistration,
  ApproveResetPassword,
  Authorize,
  ChangePassword,
  QuickAuthorize,
  RequestRegistration,
  RequestResetPassword,
} from '#/clients/frey.pb';
import { ClientConfiguration } from 'twirpscript';
import { IntermediateResultOfSession, SessionStatus } from '#/clients/atoms.pb';
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
      }).then(handleReleaseTag);
    };
  }

  getAllPlayers(eventId: number) {
    return GetAllRegisteredPlayers({ eventIds: [eventId] }, this._clientConfMimir).then((val) =>
      val.players.map((user) => ({ ...user, displayName: user.title }))
    );
  }

  private static fromScores(scores: IntermediateResultOfSession[]): Record<number, number> {
    return scores.reduce((acc, val) => {
      acc[val.playerId] = val.score;
      return acc;
    }, {} as Record<number, number>);
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
          scores: ApiService.fromScores(table.scores),
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
}
