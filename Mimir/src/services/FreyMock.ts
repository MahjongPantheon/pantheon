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
} from 'tsclients/proto/frey.pb.js';
import { GenericSuccessResponse } from 'tsclients/proto/atoms.pb.js';
import { FreyService } from './Frey.js';

export class FreyServiceMock extends FreyService {
  _mockMajsoulNicknames: Record<number, string> = {};
  _mockMajsoulIds: Record<number, number> = {};

  mockMajsoul(ids: Record<number, number>, nicknames: Record<number, string>) {
    this._mockMajsoulIds = ids;
    this._mockMajsoulNicknames = nicknames;
  }

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
    _depersonalizePayload: DepersonalizePayload
  ): Promise<GenericSuccessResponse> {
    return Promise.resolve({ success: true });
  }

  ChangePassword(
    _authChangePasswordPayload: AuthChangePasswordPayload
  ): Promise<AuthChangePasswordResponse> {
    return Promise.resolve({ authToken: '123' });
  }

  RequestResetPassword(
    _authRequestResetPasswordPayload: AuthRequestResetPasswordPayload
  ): Promise<AuthRequestResetPasswordResponse> {
    return Promise.resolve({ resetToken: '123' });
  }

  ApproveResetPassword(
    _authApproveResetPasswordPayload: AuthApproveResetPasswordPayload
  ): Promise<AuthApproveResetPasswordResponse> {
    return Promise.resolve({ newTmpPassword: '123' });
  }

  UpdatePersonalInfo(
    _personsUpdatePersonalInfoPayload: PersonsUpdatePersonalInfoPayload
  ): Promise<GenericSuccessResponse> {
    return Promise.resolve({ success: true });
  }

  GetPersonalInfo(
    personsGetPersonalInfoPayload: PersonsGetPersonalInfoPayload
  ): Promise<PersonsGetPersonalInfoResponse> {
    return Promise.resolve({
      people: personsGetPersonalInfoPayload.ids.map((id) => ({
        id,
        city: 'city',
        tenhouId: 'player' + id,
        title: 'title',
        country: 'country',
        email: 'email',
        phone: 'phone',
        hasAvatar: false,
        lastUpdate: new Date().toISOString(),
        msNickname: this._mockMajsoulNicknames[id] ?? 'msNickname',
        msAccountId: this._mockMajsoulIds[id] ?? 1,
        telegramId: '121345',
        notifications: 'notifications',
      })),
    });
  }

  FindByTenhouIds(
    personsFindByTenhouIdsPayload: PersonsFindByTenhouIdsPayload
  ): Promise<PersonsFindByTenhouIdsResponse> {
    let id = 1;
    return Promise.resolve({
      people: personsFindByTenhouIdsPayload.ids.map((tid) => ({
        id: id++,
        city: 'city',
        tenhouId: tid,
        title: 'title',
        country: 'country',
        email: 'email',
        phone: 'phone',
        hasAvatar: false,
        lastUpdate: new Date().toISOString(),
        msNickname: 'msNickname',
        msAccountId: 1,
        telegramId: '121345',
        notifications: 'notifications',
      })),
    });
  }

  FindByMajsoulAccountId(
    personsFindByMajsoulIdsPayload: PersonsFindByMajsoulIdsPayload
  ): Promise<PersonsFindByTenhouIdsResponse> {
    return Promise.resolve({
      people: personsFindByMajsoulIdsPayload.ids.map(({nickname, accountId}) => (
        {
          id: +(Object.entries(this._mockMajsoulIds).find((el) => el[1] === accountId)?.[0] ?? '1'),
          city: 'city',
          tenhouId: 'tenhouId',
          title: 'title',
          country: 'country',
          email: 'email',
          phone: 'phone',
          hasAvatar: false,
          lastUpdate: new Date().toISOString(),
          msNickname: nickname,
          msAccountId: accountId,
          telegramId: '121345',
          notifications: 'notifications',
        }))
    });
  }

  FindByTitle(
    _personsFindByTitlePayload: PersonsFindByTitlePayload
  ): Promise<PersonsFindByTitleResponse> {
    return Promise.resolve({
      people: [
        {
          id: 1,
          city: 'city',
          tenhouId: 'tenhouId',
          title: 'title',
          hasAvatar: false,
          lastUpdate: new Date().toISOString(),
        },
      ],
    });
  }

  GetEventAdmins(
    _accessGetEventAdminsPayload: AccessGetEventAdminsPayload
  ): Promise<AccessGetEventAdminsResponse> {
    return Promise.resolve({
      admins: [
        {
          ruleId: 1,
          personId: 1,
          personName: 'title',
          hasAvatar: false,
          lastUpdate: new Date().toISOString(),
        },
      ],
    });
  }

  GetEventReferees(
    _accessGetEventRefereesPayload: AccessGetEventRefereesPayload
  ): Promise<AccessGetEventRefereesResponse> {
    return Promise.resolve({
      referees: [
        {
          ruleId: 1,
          personId: 1,
          personName: 'title',
          hasAvatar: false,
          lastUpdate: new Date().toISOString(),
        },
      ],
    });
  }

  GetMajsoulNicknames(
    _personsGetMajsoulNicknamesPayload: PersonsGetMajsoulNicknamesPayload
  ): Promise<PersonsGetMajsoulNicknamesResponse> {
    return Promise.resolve({
      mapping: [
        {
          personId: 1,
          nickname: 'nickname',
        },
      ],
    });
  }

  GetSuperadminFlag(
    _accessGetSuperadminFlagPayload: AccessGetSuperadminFlagPayload
  ): Promise<AccessGetSuperadminFlagResponse> {
    return Promise.resolve({
      isAdmin: true,
    });
  }

  GetOwnedEventIds(
    _accessGetOwnedEventIdsPayload: AccessGetOwnedEventIdsPayload
  ): Promise<AccessGetOwnedEventIdsResponse> {
    return Promise.resolve({
      eventIds: [1, 2, 3],
    });
  }

  AddRuleForPerson(
    _accessAddRuleForPersonPayload: AccessAddRuleForPersonPayload
  ): Promise<AccessAddRuleForPersonResponse> {
    return Promise.resolve({
      ruleId: 1,
    });
  }

  DeleteRuleForPerson(
    _accessDeleteRuleForPersonPayload: AccessDeleteRuleForPersonPayload
  ): Promise<GenericSuccessResponse> {
    return Promise.resolve({
      success: true,
    });
  }

  CreateAccount(
    _personsCreateAccountPayload: PersonsCreateAccountPayload
  ): Promise<PersonsCreateAccountResponse> {
    return Promise.resolve({
      personId: 1,
    });
  }

  GetNotificationsSettings(
    _personsGetNotificationsSettingsPayload: PersonsGetNotificationsSettingsPayload
  ): Promise<PersonsGetNotificationsSettingsResponse> {
    return Promise.resolve({
      telegramId: '123',
      notifications: '123',
    });
  }

  SetNotificationsSettings(
    _personsSetNotificationsSettingsPayload: PersonsSetNotificationsSettingsPayload
  ): Promise<GenericSuccessResponse> {
    return Promise.resolve({
      success: true,
    });
  }
}
