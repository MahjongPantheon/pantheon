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

export const freyClient: Frey<Context> = {
  async AddRuleForPerson(
    accessAddRuleForPersonPayload: AccessAddRuleForPersonPayload,
    context: Context
  ): Promise<AccessAddRuleForPersonResponse> {
    return addRuleForPerson(
      context.db,
      context.redisClient,
      context,
      accessAddRuleForPersonPayload
    );
  },

  async ApproveRegistration(
    authApproveRegistrationPayload: AuthApproveRegistrationPayload,
    context: Context
  ): Promise<AuthApproveRegistrationResponse> {
    return approveRegistration(context.db, authApproveRegistrationPayload);
  },

  async ApproveResetPassword(
    authApproveResetPasswordPayload: AuthApproveResetPasswordPayload,
    context: Context
  ): Promise<AuthApproveResetPasswordResponse> {
    return approveResetPassword(context.db, context.redisClient, authApproveResetPasswordPayload);
  },

  async Authorize(
    authAuthorizePayload: AuthAuthorizePayload,
    context: Context
  ): Promise<AuthAuthorizeResponse> {
    return authorize(context.db, authAuthorizePayload);
  },

  async ChangePassword(
    authChangePasswordPayload: AuthChangePasswordPayload,
    context: Context
  ): Promise<AuthChangePasswordResponse> {
    return changePassword(context.db, context.redisClient, authChangePasswordPayload);
  },

  async CreateAccount(
    personsCreateAccountPayload: PersonsCreateAccountPayload,
    context: Context
  ): Promise<PersonsCreateAccountResponse> {
    return createAccount(context.db, context.redisClient, personsCreateAccountPayload, context);
  },

  async DeleteRuleForPerson(
    accessDeleteRuleForPersonPayload: AccessDeleteRuleForPersonPayload,
    context: Context
  ): Promise<GenericSuccessResponse> {
    return deleteRuleForPerson(
      context.db,
      context.redisClient,
      context,
      accessDeleteRuleForPersonPayload
    );
  },

  async DepersonalizeAccount(
    _depersonalizePayload: DepersonalizePayload,
    context: Context
  ): Promise<GenericSuccessResponse> {
    return depersonalizeAccount(context.db, context.redisClient, context);
  },

  async FindByMajsoulAccountId(
    personsFindByMajsoulIdsPayload: PersonsFindByMajsoulIdsPayload,
    context: Context
  ): Promise<PersonsFindByTenhouIdsResponse> {
    return findByMajsoulAccountId(context.db, personsFindByMajsoulIdsPayload, context);
  },

  async FindByTenhouIds(
    personsFindByTenhouIdsPayload: PersonsFindByTenhouIdsPayload,
    context: Context
  ): Promise<PersonsFindByTenhouIdsResponse> {
    return findByTenhouIds(context.db, personsFindByTenhouIdsPayload, context);
  },

  async FindByTitle(
    personsFindByTitlePayload: PersonsFindByTitlePayload,
    context: Context
  ): Promise<PersonsFindByTitleResponse> {
    return findByTitle(context.db, personsFindByTitlePayload, context);
  },

  async GetEventAdmins(
    accessGetEventAdminsPayload: AccessGetEventAdminsPayload,
    context: Context
  ): Promise<AccessGetEventAdminsResponse> {
    return getEventAdmins(context.db, accessGetEventAdminsPayload);
  },

  async GetEventReferees(
    accessGetEventRefereesPayload: AccessGetEventRefereesPayload,
    context: Context
  ): Promise<AccessGetEventRefereesResponse> {
    return getEventReferees(context.db, accessGetEventRefereesPayload);
  },

  async GetMajsoulNicknames(
    personsGetMajsoulNicknamesPayload: PersonsGetMajsoulNicknamesPayload,
    context: Context
  ): Promise<PersonsGetMajsoulNicknamesResponse> {
    return getMajsoulNicknames(context.db, personsGetMajsoulNicknamesPayload);
  },

  async GetNotificationsSettings(
    personsGetNotificationsSettingsPayload: PersonsGetNotificationsSettingsPayload,
    context: Context
  ): Promise<PersonsGetNotificationsSettingsResponse> {
    return getNotificationsSettings(context.db, personsGetNotificationsSettingsPayload);
  },

  async GetOwnedEventIds(
    accessGetOwnedEventIdsPayload: AccessGetOwnedEventIdsPayload,
    context: Context
  ): Promise<AccessGetOwnedEventIdsResponse> {
    return getOwnedEventIds(context.db, accessGetOwnedEventIdsPayload);
  },

  async GetPersonalInfo(
    personsGetPersonalInfoPayload: PersonsGetPersonalInfoPayload,
    context: Context
  ): Promise<PersonsGetPersonalInfoResponse> {
    return getPersonalInfo(context.db, context.redisClient, personsGetPersonalInfoPayload, context);
  },

  async GetSuperadminFlag(
    accessGetSuperadminFlagPayload: AccessGetSuperadminFlagPayload,
    context: Context
  ): Promise<AccessGetSuperadminFlagResponse> {
    return getSuperadminFlag(context.db, context.redisClient, accessGetSuperadminFlagPayload);
  },

  async Me(authMePayload: AuthMePayload, context: Context): Promise<AuthMeResponse> {
    return me(context.db, context.redisClient, authMePayload, context);
  },

  async QuickAuthorize(
    authQuickAuthorizePayload: AuthQuickAuthorizePayload,
    context: Context
  ): Promise<AuthQuickAuthorizeResponse> {
    return quickAuthorize(context.db, context.redisClient, authQuickAuthorizePayload);
  },

  async RequestRegistration(
    authRequestRegistrationPayload: AuthRequestRegistrationPayload,
    context: Context
  ): Promise<AuthRequestRegistrationResponse> {
    return requestRegistration(context.db, authRequestRegistrationPayload);
  },

  async RequestResetPassword(
    authRequestResetPasswordPayload: AuthRequestResetPasswordPayload,
    context: Context
  ): Promise<AuthRequestResetPasswordResponse> {
    return requestResetPassword(context.db, context.redisClient, authRequestResetPasswordPayload);
  },

  async SetNotificationsSettings(
    personsSetNotificationsSettingsPayload: PersonsSetNotificationsSettingsPayload,
    context: Context
  ): Promise<GenericSuccessResponse> {
    return setNotificationsSettings(context.db, personsSetNotificationsSettingsPayload);
  },

  async UpdatePersonalInfo(
    personsUpdatePersonalInfoPayload: PersonsUpdatePersonalInfoPayload,
    context: Context
  ): Promise<GenericSuccessResponse> {
    return updatePersonalInfo(
      context.db,
      context.redisClient,
      personsUpdatePersonalInfoPayload,
      context
    );
  },
};
