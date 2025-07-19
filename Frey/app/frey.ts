import { GenericSuccessResponse } from 'clients/proto/atoms.pb';
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
  AuthQuickAuthorizePayload,
  AuthQuickAuthorizeResponse,
  AuthRequestRegistrationPayload,
  AuthRequestRegistrationResponse,
  AuthRequestResetPasswordPayload,
  AuthRequestResetPasswordResponse,
  DepersonalizePayload,
  Frey,
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
} from './clients/proto/frey.pb';
import { Database } from './database/db';
import { Context } from './context';
import {
  addRuleForPerson,
  deleteRuleForPerson,
  getEventAdmins,
  getEventReferees,
  getOwnedEventIds,
  getSuperadminFlag,
} from './models/access';
import {
  approveRegistration,
  approveResetPassword,
  authorize,
  changePassword,
  me,
  quickAuthorize,
  requestRegistration,
  requestResetPassword,
} from './models/auth';
import {
  createAccount,
  depersonalizeAccount,
  findByMajsoulAccountId,
  findByTenhouIds,
  findByTitle,
  getMajsoulNicknames,
  getNotificationsSettings,
  getPersonalInfo,
  setNotificationsSettings,
  updatePersonalInfo,
} from './models/persons';
import { IRedisClient } from './helpers/cache/RedisClient';

export class FreyClient implements Frey<Context> {
  constructor(
    protected db: Database,
    protected redisClient: IRedisClient
  ) {}

  async AddRuleForPerson(
    accessAddRuleForPersonPayload: AccessAddRuleForPersonPayload
  ): Promise<AccessAddRuleForPersonResponse> {
    return addRuleForPerson(this.db, accessAddRuleForPersonPayload);
  }

  async ApproveRegistration(
    authApproveRegistrationPayload: AuthApproveRegistrationPayload
  ): Promise<AuthApproveRegistrationResponse> {
    return approveRegistration(this.db, authApproveRegistrationPayload);
  }

  async ApproveResetPassword(
    authApproveResetPasswordPayload: AuthApproveResetPasswordPayload
  ): Promise<AuthApproveResetPasswordResponse> {
    return approveResetPassword(this.db, this.redisClient, authApproveResetPasswordPayload);
  }

  async Authorize(authAuthorizePayload: AuthAuthorizePayload): Promise<AuthAuthorizeResponse> {
    return authorize(this.db, authAuthorizePayload);
  }

  async ChangePassword(
    authChangePasswordPayload: AuthChangePasswordPayload
  ): Promise<AuthChangePasswordResponse> {
    return changePassword(this.db, this.redisClient, authChangePasswordPayload);
  }

  async CreateAccount(
    personsCreateAccountPayload: PersonsCreateAccountPayload
  ): Promise<PersonsCreateAccountResponse> {
    return createAccount(this.db, personsCreateAccountPayload);
  }

  async DeleteRuleForPerson(
    accessDeleteRuleForPersonPayload: AccessDeleteRuleForPersonPayload
  ): Promise<GenericSuccessResponse> {
    return deleteRuleForPerson(this.db, accessDeleteRuleForPersonPayload);
  }

  async DepersonalizeAccount(
    _depersonalizePayload: DepersonalizePayload,
    context: Context
  ): Promise<GenericSuccessResponse> {
    return depersonalizeAccount(this.db, this.redisClient, context);
  }

  async FindByMajsoulAccountId(
    personsFindByMajsoulIdsPayload: PersonsFindByMajsoulIdsPayload,
    context: Context
  ): Promise<PersonsFindByTenhouIdsResponse> {
    return findByMajsoulAccountId(this.db, personsFindByMajsoulIdsPayload, context);
  }

  async FindByTenhouIds(
    personsFindByTenhouIdsPayload: PersonsFindByTenhouIdsPayload,
    context: Context
  ): Promise<PersonsFindByTenhouIdsResponse> {
    return findByTenhouIds(this.db, personsFindByTenhouIdsPayload, context);
  }

  async FindByTitle(
    personsFindByTitlePayload: PersonsFindByTitlePayload,
    context: Context
  ): Promise<PersonsFindByTitleResponse> {
    return findByTitle(this.db, personsFindByTitlePayload, context);
  }

  async GetEventAdmins(
    accessGetEventAdminsPayload: AccessGetEventAdminsPayload
  ): Promise<AccessGetEventAdminsResponse> {
    return getEventAdmins(this.db, accessGetEventAdminsPayload);
  }

  async GetEventReferees(
    accessGetEventRefereesPayload: AccessGetEventRefereesPayload
  ): Promise<AccessGetEventRefereesResponse> {
    return getEventReferees(this.db, accessGetEventRefereesPayload);
  }

  async GetMajsoulNicknames(
    personsGetMajsoulNicknamesPayload: PersonsGetMajsoulNicknamesPayload
  ): Promise<PersonsGetMajsoulNicknamesResponse> {
    return getMajsoulNicknames(this.db, personsGetMajsoulNicknamesPayload);
  }

  async GetNotificationsSettings(
    personsGetNotificationsSettingsPayload: PersonsGetNotificationsSettingsPayload
  ): Promise<PersonsGetNotificationsSettingsResponse> {
    return getNotificationsSettings(this.db, personsGetNotificationsSettingsPayload);
  }

  async GetOwnedEventIds(
    accessGetOwnedEventIdsPayload: AccessGetOwnedEventIdsPayload
  ): Promise<AccessGetOwnedEventIdsResponse> {
    return getOwnedEventIds(this.db, accessGetOwnedEventIdsPayload);
  }

  async GetPersonalInfo(
    personsGetPersonalInfoPayload: PersonsGetPersonalInfoPayload,
    context: Context
  ): Promise<PersonsGetPersonalInfoResponse> {
    return getPersonalInfo(this.db, this.redisClient, personsGetPersonalInfoPayload, context);
  }

  async GetSuperadminFlag(
    accessGetSuperadminFlagPayload: AccessGetSuperadminFlagPayload
  ): Promise<AccessGetSuperadminFlagResponse> {
    return getSuperadminFlag(this.db, this.redisClient, accessGetSuperadminFlagPayload);
  }

  async Me(authMePayload: AuthMePayload, context: Context): Promise<AuthMeResponse> {
    return me(this.db, this.redisClient, authMePayload, context);
  }

  async QuickAuthorize(
    authQuickAuthorizePayload: AuthQuickAuthorizePayload
  ): Promise<AuthQuickAuthorizeResponse> {
    return quickAuthorize(this.db, this.redisClient, authQuickAuthorizePayload);
  }

  async RequestRegistration(
    authRequestRegistrationPayload: AuthRequestRegistrationPayload
  ): Promise<AuthRequestRegistrationResponse> {
    return requestRegistration(this.db, authRequestRegistrationPayload);
  }

  async RequestResetPassword(
    authRequestResetPasswordPayload: AuthRequestResetPasswordPayload
  ): Promise<AuthRequestResetPasswordResponse> {
    return requestResetPassword(this.db, this.redisClient, authRequestResetPasswordPayload);
  }

  async SetNotificationsSettings(
    personsSetNotificationsSettingsPayload: PersonsSetNotificationsSettingsPayload
  ): Promise<GenericSuccessResponse> {
    return setNotificationsSettings(this.db, personsSetNotificationsSettingsPayload);
  }

  async UpdatePersonalInfo(
    personsUpdatePersonalInfoPayload: PersonsUpdatePersonalInfoPayload,
    context: Context
  ): Promise<GenericSuccessResponse> {
    return updatePersonalInfo(this.db, this.redisClient, personsUpdatePersonalInfoPayload, context);
  }
}
