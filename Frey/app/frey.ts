import { GenericSuccessResponse } from 'tsclients/proto/atoms.pb';
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
} from 'tsclients/proto/frey.pb';
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
import { wrapError } from 'helpers/errors';

export const freyClient: Frey<Context> = {
  async AddRuleForPerson(
    accessAddRuleForPersonPayload: AccessAddRuleForPersonPayload,
    context: Context
  ): Promise<AccessAddRuleForPersonResponse> {
    return wrapError(
      addRuleForPerson(context.db, context.redisClient, context, accessAddRuleForPersonPayload)
    );
  },

  async ApproveRegistration(
    authApproveRegistrationPayload: AuthApproveRegistrationPayload,
    context: Context
  ): Promise<AuthApproveRegistrationResponse> {
    return wrapError(approveRegistration(context.db, authApproveRegistrationPayload));
  },

  async ApproveResetPassword(
    authApproveResetPasswordPayload: AuthApproveResetPasswordPayload,
    context: Context
  ): Promise<AuthApproveResetPasswordResponse> {
    return wrapError(
      approveResetPassword(context.db, context.redisClient, authApproveResetPasswordPayload)
    );
  },

  async Authorize(
    authAuthorizePayload: AuthAuthorizePayload,
    context: Context
  ): Promise<AuthAuthorizeResponse> {
    return wrapError(authorize(context.db, authAuthorizePayload));
  },

  async ChangePassword(
    authChangePasswordPayload: AuthChangePasswordPayload,
    context: Context
  ): Promise<AuthChangePasswordResponse> {
    return wrapError(changePassword(context.db, context.redisClient, authChangePasswordPayload));
  },

  async CreateAccount(
    personsCreateAccountPayload: PersonsCreateAccountPayload,
    context: Context
  ): Promise<PersonsCreateAccountResponse> {
    return wrapError(
      createAccount(context.db, context.redisClient, personsCreateAccountPayload, context)
    );
  },

  async DeleteRuleForPerson(
    accessDeleteRuleForPersonPayload: AccessDeleteRuleForPersonPayload,
    context: Context
  ): Promise<GenericSuccessResponse> {
    return wrapError(
      deleteRuleForPerson(
        context.db,
        context.redisClient,
        context,
        accessDeleteRuleForPersonPayload
      )
    );
  },

  async DepersonalizeAccount(
    _depersonalizePayload: DepersonalizePayload,
    context: Context
  ): Promise<GenericSuccessResponse> {
    return wrapError(depersonalizeAccount(context.db, context.redisClient, context));
  },

  async FindByMajsoulAccountId(
    personsFindByMajsoulIdsPayload: PersonsFindByMajsoulIdsPayload,
    context: Context
  ): Promise<PersonsFindByTenhouIdsResponse> {
    return wrapError(findByMajsoulAccountId(context.db, personsFindByMajsoulIdsPayload, context));
  },

  async FindByTenhouIds(
    personsFindByTenhouIdsPayload: PersonsFindByTenhouIdsPayload,
    context: Context
  ): Promise<PersonsFindByTenhouIdsResponse> {
    return wrapError(findByTenhouIds(context.db, personsFindByTenhouIdsPayload, context));
  },

  async FindByTitle(
    personsFindByTitlePayload: PersonsFindByTitlePayload,
    context: Context
  ): Promise<PersonsFindByTitleResponse> {
    return wrapError(findByTitle(context.db, personsFindByTitlePayload));
  },

  async GetEventAdmins(
    accessGetEventAdminsPayload: AccessGetEventAdminsPayload,
    context: Context
  ): Promise<AccessGetEventAdminsResponse> {
    return wrapError(getEventAdmins(context.db, accessGetEventAdminsPayload));
  },

  async GetEventReferees(
    accessGetEventRefereesPayload: AccessGetEventRefereesPayload,
    context: Context
  ): Promise<AccessGetEventRefereesResponse> {
    return wrapError(getEventReferees(context.db, accessGetEventRefereesPayload));
  },

  async GetMajsoulNicknames(
    personsGetMajsoulNicknamesPayload: PersonsGetMajsoulNicknamesPayload,
    context: Context
  ): Promise<PersonsGetMajsoulNicknamesResponse> {
    return wrapError(getMajsoulNicknames(context.db, personsGetMajsoulNicknamesPayload));
  },

  async GetNotificationsSettings(
    personsGetNotificationsSettingsPayload: PersonsGetNotificationsSettingsPayload,
    context: Context
  ): Promise<PersonsGetNotificationsSettingsResponse> {
    return wrapError(
      getNotificationsSettings(
        context.db,
        context.redisClient,
        personsGetNotificationsSettingsPayload
      )
    );
  },

  async GetOwnedEventIds(
    accessGetOwnedEventIdsPayload: AccessGetOwnedEventIdsPayload,
    context: Context
  ): Promise<AccessGetOwnedEventIdsResponse> {
    return wrapError(
      getOwnedEventIds(context.db, context.redisClient, context, accessGetOwnedEventIdsPayload)
    );
  },

  async GetPersonalInfo(
    personsGetPersonalInfoPayload: PersonsGetPersonalInfoPayload,
    context: Context
  ): Promise<PersonsGetPersonalInfoResponse> {
    return wrapError(
      getPersonalInfo(context.db, context.redisClient, personsGetPersonalInfoPayload, context)
    );
  },

  async GetSuperadminFlag(
    accessGetSuperadminFlagPayload: AccessGetSuperadminFlagPayload,
    context: Context
  ): Promise<AccessGetSuperadminFlagResponse> {
    return wrapError(
      getSuperadminFlag(context.db, context.redisClient, accessGetSuperadminFlagPayload)
    );
  },

  async Me(_: AuthMePayload, context: Context): Promise<AuthMeResponse> {
    return wrapError(me(context.db, context.redisClient, context));
  },

  async QuickAuthorize(
    authQuickAuthorizePayload: AuthQuickAuthorizePayload,
    context: Context
  ): Promise<AuthQuickAuthorizeResponse> {
    return wrapError(quickAuthorize(context.db, context.redisClient, authQuickAuthorizePayload));
  },

  async RequestRegistration(
    authRequestRegistrationPayload: AuthRequestRegistrationPayload,
    context: Context
  ): Promise<AuthRequestRegistrationResponse> {
    return wrapError(requestRegistration(context.db, authRequestRegistrationPayload));
  },

  async RequestResetPassword(
    authRequestResetPasswordPayload: AuthRequestResetPasswordPayload,
    context: Context
  ): Promise<AuthRequestResetPasswordResponse> {
    return wrapError(
      requestResetPassword(context.db, context.redisClient, authRequestResetPasswordPayload)
    );
  },

  async SetNotificationsSettings(
    personsSetNotificationsSettingsPayload: PersonsSetNotificationsSettingsPayload,
    context: Context
  ): Promise<GenericSuccessResponse> {
    return wrapError(
      setNotificationsSettings(
        context.db,
        context.redisClient,
        personsSetNotificationsSettingsPayload,
        context
      )
    );
  },

  async UpdatePersonalInfo(
    personsUpdatePersonalInfoPayload: PersonsUpdatePersonalInfoPayload,
    context: Context
  ): Promise<GenericSuccessResponse> {
    return wrapError(
      updatePersonalInfo(context.db, context.redisClient, personsUpdatePersonalInfoPayload, context)
    );
  },
};
