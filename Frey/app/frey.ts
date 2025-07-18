import { GenericSuccessResponse } from "clients/proto/atoms.pb";
import {
  AccessAddRuleForPersonPayload,
  AccessAddRuleForPersonResponse,
  AccessClearAccessCachePayload,
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
} from "./clients/proto/frey.pb";
import { Database } from "./db";
import { Context } from "./context";
import {
  addRuleForPerson,
  clearAccessCache,
  deleteRuleForPerson,
  getEventAdmins,
  getEventReferees,
  getOwnedEventIds,
  getSuperadminFlag,
} from "./models/access";
import {
  approveRegistration,
  approveResetPassword,
  authorize,
  changePassword,
  me,
  quickAuthorize,
  requestRegistration,
  requestResetPassword,
} from "./models/auth";
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
} from "./models/persons";

// TODO: remove groups
export class FreyClient implements Frey<Context> {
  constructor(protected db: Database) {}

  async AddRuleForPerson(
    accessAddRuleForPersonPayload: AccessAddRuleForPersonPayload,
    context: Context,
  ): Promise<AccessAddRuleForPersonResponse> {
    return addRuleForPerson(this.db, accessAddRuleForPersonPayload);
  }

  async ApproveRegistration(
    authApproveRegistrationPayload: AuthApproveRegistrationPayload,
    context: Context,
  ): Promise<AuthApproveRegistrationResponse> {
    return approveRegistration(this.db, authApproveRegistrationPayload);
  }

  async ApproveResetPassword(
    authApproveResetPasswordPayload: AuthApproveResetPasswordPayload,
    context: Context,
  ): Promise<AuthApproveResetPasswordResponse> {
    return approveResetPassword(this.db, authApproveResetPasswordPayload);
  }

  async Authorize(
    authAuthorizePayload: AuthAuthorizePayload,
    context: Context,
  ): Promise<AuthAuthorizeResponse> {
    return authorize(this.db, authAuthorizePayload);
  }

  async ChangePassword(
    authChangePasswordPayload: AuthChangePasswordPayload,
    context: Context,
  ): Promise<AuthChangePasswordResponse> {
    return changePassword(this.db, authChangePasswordPayload);
  }

  async ClearAccessCache(
    accessClearAccessCachePayload: AccessClearAccessCachePayload,
    context: Context,
  ): Promise<GenericSuccessResponse> {
    return clearAccessCache(accessClearAccessCachePayload);
  }

  async CreateAccount(
    personsCreateAccountPayload: PersonsCreateAccountPayload,
    context: Context,
  ): Promise<PersonsCreateAccountResponse> {
    return createAccount(this.db, personsCreateAccountPayload);
  }

  async DeleteRuleForPerson(
    accessDeleteRuleForPersonPayload: AccessDeleteRuleForPersonPayload,
    context: Context,
  ): Promise<GenericSuccessResponse> {
    return deleteRuleForPerson(this.db, accessDeleteRuleForPersonPayload);
  }

  async DepersonalizeAccount(
    depersonalizePayload: DepersonalizePayload,
    context: Context,
  ): Promise<GenericSuccessResponse> {
    return depersonalizeAccount(this.db, context);
  }

  // TODO: find by nickname
  async FindByMajsoulAccountId(
    personsFindByMajsoulIdsPayload: PersonsFindByMajsoulIdsPayload,
    context: Context,
  ): Promise<PersonsFindByTenhouIdsResponse> {
    return findByMajsoulAccountId(this.db, personsFindByMajsoulIdsPayload);
  }

  async FindByTenhouIds(
    personsFindByTenhouIdsPayload: PersonsFindByTenhouIdsPayload,
    context: Context,
  ): Promise<PersonsFindByTenhouIdsResponse> {
    return findByTenhouIds(this.db, personsFindByTenhouIdsPayload);
  }

  async FindByTitle(
    personsFindByTitlePayload: PersonsFindByTitlePayload,
    context: Context,
  ): Promise<PersonsFindByTitleResponse> {
    return findByTitle(this.db, personsFindByTitlePayload);
  }

  async GetEventAdmins(
    accessGetEventAdminsPayload: AccessGetEventAdminsPayload,
    context: Context,
  ): Promise<AccessGetEventAdminsResponse> {
    return getEventAdmins(this.db, accessGetEventAdminsPayload);
  }

  async GetEventReferees(
    accessGetEventRefereesPayload: AccessGetEventRefereesPayload,
    context: Context,
  ): Promise<AccessGetEventRefereesResponse> {
    return getEventReferees(this.db, accessGetEventRefereesPayload);
  }

  async GetMajsoulNicknames(
    personsGetMajsoulNicknamesPayload: PersonsGetMajsoulNicknamesPayload,
    context: Context,
  ): Promise<PersonsGetMajsoulNicknamesResponse> {
    return getMajsoulNicknames(this.db, personsGetMajsoulNicknamesPayload);
  }

  async GetNotificationsSettings(
    personsGetNotificationsSettingsPayload: PersonsGetNotificationsSettingsPayload,
    context: Context,
  ): Promise<PersonsGetNotificationsSettingsResponse> {
    return getNotificationsSettings(
      this.db,
      personsGetNotificationsSettingsPayload,
    );
  }

  async GetOwnedEventIds(
    accessGetOwnedEventIdsPayload: AccessGetOwnedEventIdsPayload,
    context: Context,
  ): Promise<AccessGetOwnedEventIdsResponse> {
    return getOwnedEventIds(this.db, accessGetOwnedEventIdsPayload);
  }

  async GetPersonalInfo(
    personsGetPersonalInfoPayload: PersonsGetPersonalInfoPayload,
    context: Context,
  ): Promise<PersonsGetPersonalInfoResponse> {
    return getPersonalInfo(this.db, personsGetPersonalInfoPayload);
  }

  async GetSuperadminFlag(
    accessGetSuperadminFlagPayload: AccessGetSuperadminFlagPayload,
    context: Context,
  ): Promise<AccessGetSuperadminFlagResponse> {
    return getSuperadminFlag(this.db, accessGetSuperadminFlagPayload);
  }

  async Me(
    authMePayload: AuthMePayload,
    context: Context,
  ): Promise<AuthMeResponse> {
    return me(this.db, authMePayload);
  }

  async QuickAuthorize(
    authQuickAuthorizePayload: AuthQuickAuthorizePayload,
    context: Context,
  ): Promise<AuthQuickAuthorizeResponse> {
    return quickAuthorize(this.db, authQuickAuthorizePayload);
  }

  async RequestRegistration(
    authRequestRegistrationPayload: AuthRequestRegistrationPayload,
    context: Context,
  ): Promise<AuthRequestRegistrationResponse> {
    return requestRegistration(this.db, authRequestRegistrationPayload);
  }

  async RequestResetPassword(
    authRequestResetPasswordPayload: AuthRequestResetPasswordPayload,
    context: Context,
  ): Promise<AuthRequestResetPasswordResponse> {
    return requestResetPassword(this.db, authRequestResetPasswordPayload);
  }

  async SetNotificationsSettings(
    personsSetNotificationsSettingsPayload: PersonsSetNotificationsSettingsPayload,
    context: Context,
  ): Promise<GenericSuccessResponse> {
    return setNotificationsSettings(
      this.db,
      personsSetNotificationsSettingsPayload,
    );
  }

  async UpdatePersonalInfo(
    personsUpdatePersonalInfoPayload: PersonsUpdatePersonalInfoPayload,
    context: Context,
  ): Promise<GenericSuccessResponse> {
    return updatePersonalInfo(
      this.db,
      personsUpdatePersonalInfoPayload,
      context,
    );
  }
}
