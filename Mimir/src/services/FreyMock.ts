import { ClientConfiguration } from 'twirpscript';
import { ConfigService } from './Config.js';
import { MetaService } from './Meta.js';
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
} from 'tsclients/proto/frey.pb.js';
import { GenericSuccessResponse } from 'tsclients/proto/atoms.pb.js';
import { FreyService } from './Frey.js';

export class FreyServiceMock extends FreyService {
  RequestRegistration(
    _authRequestRegistrationPayload: AuthRequestRegistrationPayload
  ): Promise<AuthRequestRegistrationResponse> {
    return Promise.resolve({ approvalCode: '012345' });
  }

  ApproveRegistration(
    _authApproveRegistrationPayload: AuthApproveRegistrationPayload
  ): Promise<AuthApproveRegistrationResponse> {
    return Promise.resolve({ personId: 1 });
  }

  Authorize(_authAuthorizePayload: AuthAuthorizePayload): Promise<AuthAuthorizeResponse> {
    return Promise.resolve({ personId: 1, authToken: '123456' });
  }

  QuickAuthorize(
    _authQuickAuthorizePayload: AuthQuickAuthorizePayload
  ): Promise<AuthQuickAuthorizeResponse> {
    return Promise.resolve({ authSuccess: true });
  }

  Me(_authMePayload: AuthMePayload): Promise<AuthMeResponse> {
    return Promise.resolve({
      personId: 1,
      email: 'test@example.com',
      title: '123',
      tenhouId: '123',
      hasAvatar: false,
      country: 'test',
      city: 'test',
      phone: '',
      lastUpdate: new Date().toISOString(),
    });
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
