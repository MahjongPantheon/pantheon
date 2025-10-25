import { ClientConfiguration } from 'twirpscript';
import { ConfigService } from './Config';
import { MetaService } from './Meta';
import {
  AccessAddRuleForPersonPayload,
  AccessAddRuleForPersonResponse,
  AccessDeleteRuleForPersonPayload,
  AccessGetEventAdminsPayload,
  AccessGetEventAdminsResponse,
  AccessGetEventRefereesPayload,
  AccessGetEventRefereesResponse,
  AccessGetOwnedEventIdsPayload,
  AccessGetOwnedEventIdsResponse,
  AccessGetSuperadminFlagPayload,
  AccessGetSuperadminFlagResponse,
  AddRuleForPerson,
  ApproveRegistration,
  ApproveResetPassword,
  AuthApproveRegistrationPayload,
  AuthApproveRegistrationResponse,
  AuthApproveResetPasswordPayload,
  AuthApproveResetPasswordResponse,
  AuthAuthorizePayload,
  AuthAuthorizeResponse,
  AuthChangePasswordPayload,
  AuthChangePasswordResponse,
  AuthMePayload,
  AuthMeResponse,
  Authorize,
  AuthQuickAuthorizePayload,
  AuthQuickAuthorizeResponse,
  AuthRequestRegistrationPayload,
  AuthRequestRegistrationResponse,
  AuthRequestResetPasswordPayload,
  AuthRequestResetPasswordResponse,
  ChangePassword,
  CreateAccount,
  DeleteRuleForPerson,
  DepersonalizeAccount,
  DepersonalizePayload,
  FindByMajsoulAccountId,
  FindByTenhouIds,
  FindByTitle,
  GetEventAdmins,
  GetEventReferees,
  GetMajsoulNicknames,
  GetNotificationsSettings,
  GetOwnedEventIds,
  GetPersonalInfo,
  GetSuperadminFlag,
  Me,
  PersonsCreateAccountPayload,
  PersonsCreateAccountResponse,
  PersonsFindByMajsoulIdsPayload,
  PersonsFindByTenhouIdsPayload,
  PersonsFindByTenhouIdsResponse,
  PersonsFindByTitlePayload,
  PersonsFindByTitleResponse,
  PersonsGetMajsoulNicknamesPayload,
  PersonsGetMajsoulNicknamesResponse,
  PersonsGetNotificationsSettingsPayload,
  PersonsGetNotificationsSettingsResponse,
  PersonsGetPersonalInfoPayload,
  PersonsGetPersonalInfoResponse,
  PersonsSetNotificationsSettingsPayload,
  PersonsUpdatePersonalInfoPayload,
  QuickAuthorize,
  RequestRegistration,
  RequestResetPassword,
  SetNotificationsSettings,
  UpdatePersonalInfo,
} from 'tsclients/proto/frey.pb';
import { GenericSuccessResponse } from 'tsclients/proto/atoms.pb';

export class FreyService {
  protected _config: ClientConfiguration;

  constructor(config: ConfigService, meta: MetaService) {
    this._config = {
      prefix: '/v2',
      baseURL: config.freyUrl,
    };

    const headers = new Headers();
    headers.append('X-Auth-Token', meta.authToken ?? '');
    headers.append('X-Current-Person-Id', meta.personId?.toString() ?? '');

    this._config.rpcTransport = async (url, opts) => {
      Object.keys(opts.headers ?? {}).forEach((key) => headers.set(key, opts.headers[key]));
      headers.set('X-Current-Event-Id', meta.currentEventId?.toString() ?? '');
      const resp = await fetch(url, {
        ...opts,
        headers,
      });

      if (!resp.ok) {
        const err = await resp.json();
        // Twirp server error handling
        if (err.code && err.code === 'internal' && err.meta && err.meta.cause) {
          fetch(config.huginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source: 'Mimir [twirp]',
              error: `To: ${url} | Details: ${err.meta.cause}`,
            }),
          });
          throw new Error(err.meta.cause);
        }
      }
      return resp;
    };
  }

  RequestRegistration(
    authRequestRegistrationPayload: AuthRequestRegistrationPayload
  ): Promise<AuthRequestRegistrationResponse> {
    return RequestRegistration(authRequestRegistrationPayload, this._config);
  }

  ApproveRegistration(
    authApproveRegistrationPayload: AuthApproveRegistrationPayload
  ): Promise<AuthApproveRegistrationResponse> {
    return ApproveRegistration(authApproveRegistrationPayload, this._config);
  }

  Authorize(authAuthorizePayload: AuthAuthorizePayload): Promise<AuthAuthorizeResponse> {
    return Authorize(authAuthorizePayload, this._config);
  }

  QuickAuthorize(
    authQuickAuthorizePayload: AuthQuickAuthorizePayload
  ): Promise<AuthQuickAuthorizeResponse> {
    return QuickAuthorize(authQuickAuthorizePayload, this._config);
  }

  Me(authMePayload: AuthMePayload): Promise<AuthMeResponse> {
    return Me(authMePayload, this._config);
  }

  DepersonalizeAccount(
    depersonalizePayload: DepersonalizePayload
  ): Promise<GenericSuccessResponse> {
    return DepersonalizeAccount(depersonalizePayload, this._config);
  }

  ChangePassword(
    authChangePasswordPayload: AuthChangePasswordPayload
  ): Promise<AuthChangePasswordResponse> {
    return ChangePassword(authChangePasswordPayload, this._config);
  }

  RequestResetPassword(
    authRequestResetPasswordPayload: AuthRequestResetPasswordPayload
  ): Promise<AuthRequestResetPasswordResponse> {
    return RequestResetPassword(authRequestResetPasswordPayload, this._config);
  }

  ApproveResetPassword(
    authApproveResetPasswordPayload: AuthApproveResetPasswordPayload
  ): Promise<AuthApproveResetPasswordResponse> {
    return ApproveResetPassword(authApproveResetPasswordPayload, this._config);
  }

  UpdatePersonalInfo(
    personsUpdatePersonalInfoPayload: PersonsUpdatePersonalInfoPayload
  ): Promise<GenericSuccessResponse> {
    return UpdatePersonalInfo(personsUpdatePersonalInfoPayload, this._config);
  }

  GetPersonalInfo(
    personsGetPersonalInfoPayload: PersonsGetPersonalInfoPayload
  ): Promise<PersonsGetPersonalInfoResponse> {
    return GetPersonalInfo(personsGetPersonalInfoPayload, this._config);
  }

  FindByTenhouIds(
    personsFindByTenhouIdsPayload: PersonsFindByTenhouIdsPayload
  ): Promise<PersonsFindByTenhouIdsResponse> {
    return FindByTenhouIds(personsFindByTenhouIdsPayload, this._config);
  }

  FindByMajsoulAccountId(
    personsFindByMajsoulIdsPayload: PersonsFindByMajsoulIdsPayload
  ): Promise<PersonsFindByTenhouIdsResponse> {
    return FindByMajsoulAccountId(personsFindByMajsoulIdsPayload, this._config);
  }

  FindByTitle(
    personsFindByTitlePayload: PersonsFindByTitlePayload
  ): Promise<PersonsFindByTitleResponse> {
    return FindByTitle(personsFindByTitlePayload, this._config);
  }

  GetEventAdmins(
    accessGetEventAdminsPayload: AccessGetEventAdminsPayload
  ): Promise<AccessGetEventAdminsResponse> {
    return GetEventAdmins(accessGetEventAdminsPayload, this._config);
  }

  GetEventReferees(
    accessGetEventRefereesPayload: AccessGetEventRefereesPayload
  ): Promise<AccessGetEventRefereesResponse> {
    return GetEventReferees(accessGetEventRefereesPayload, this._config);
  }

  GetMajsoulNicknames(
    personsGetMajsoulNicknamesPayload: PersonsGetMajsoulNicknamesPayload
  ): Promise<PersonsGetMajsoulNicknamesResponse> {
    return GetMajsoulNicknames(personsGetMajsoulNicknamesPayload, this._config);
  }

  GetSuperadminFlag(
    accessGetSuperadminFlagPayload: AccessGetSuperadminFlagPayload
  ): Promise<AccessGetSuperadminFlagResponse> {
    return GetSuperadminFlag(accessGetSuperadminFlagPayload, this._config);
  }

  GetOwnedEventIds(
    accessGetOwnedEventIdsPayload: AccessGetOwnedEventIdsPayload
  ): Promise<AccessGetOwnedEventIdsResponse> {
    return GetOwnedEventIds(accessGetOwnedEventIdsPayload, this._config);
  }

  AddRuleForPerson(
    accessAddRuleForPersonPayload: AccessAddRuleForPersonPayload
  ): Promise<AccessAddRuleForPersonResponse> {
    return AddRuleForPerson(accessAddRuleForPersonPayload, this._config);
  }

  DeleteRuleForPerson(
    accessDeleteRuleForPersonPayload: AccessDeleteRuleForPersonPayload
  ): Promise<GenericSuccessResponse> {
    return DeleteRuleForPerson(accessDeleteRuleForPersonPayload, this._config);
  }

  CreateAccount(
    personsCreateAccountPayload: PersonsCreateAccountPayload
  ): Promise<PersonsCreateAccountResponse> {
    return CreateAccount(personsCreateAccountPayload, this._config);
  }

  GetNotificationsSettings(
    personsGetNotificationsSettingsPayload: PersonsGetNotificationsSettingsPayload
  ): Promise<PersonsGetNotificationsSettingsResponse> {
    return GetNotificationsSettings(personsGetNotificationsSettingsPayload, this._config);
  }

  SetNotificationsSettings(
    personsSetNotificationsSettingsPayload: PersonsSetNotificationsSettingsPayload
  ): Promise<GenericSuccessResponse> {
    return SetNotificationsSettings(personsSetNotificationsSettingsPayload, this._config);
  }
}
