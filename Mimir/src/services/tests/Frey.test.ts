import { jest } from '@jest/globals';
import * as Pb from 'tsclients/proto/frey.pb.js';
import * as Atoms from 'tsclients/proto/atoms.pb.js';
import { ConfigService } from '../Config.js';
import { MetaService } from '../Meta.js';
import { FreyService } from '../Frey.js';
import { FreyServiceMock } from '../FreyMock.js';

const requests = [
  {
    name: 'RequestRegistration',
    request: Pb.AuthRequestRegistrationPayload.encode(
      Pb.AuthRequestRegistrationPayload.decode(new Uint8Array())
    ),
    response: Pb.AuthRequestRegistrationResponse.encode(
      Pb.AuthRequestRegistrationResponse.decode(new Uint8Array())
    ),
    expected: Pb.AuthRequestRegistrationResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.RequestRegistration(Pb.AuthRequestRegistrationPayload.decode(new Uint8Array())),
  },
  {
    name: 'ApproveRegistration',
    request: Pb.AuthApproveRegistrationPayload.encode(
      Pb.AuthApproveRegistrationPayload.decode(new Uint8Array())
    ),
    response: Pb.AuthApproveRegistrationResponse.encode(
      Pb.AuthApproveRegistrationResponse.decode(new Uint8Array())
    ),
    expected: Pb.AuthApproveRegistrationResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.ApproveRegistration(Pb.AuthApproveRegistrationPayload.decode(new Uint8Array())),
  },
  {
    name: 'Authorize',
    request: Pb.AuthAuthorizePayload.encode(Pb.AuthAuthorizePayload.decode(new Uint8Array())),
    response: Pb.AuthAuthorizeResponse.encode(Pb.AuthAuthorizeResponse.decode(new Uint8Array())),
    expected: Pb.AuthAuthorizeResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.Authorize(Pb.AuthAuthorizePayload.decode(new Uint8Array())),
  },
  {
    name: 'QuickAuthorize',
    request: Pb.AuthQuickAuthorizePayload.encode(
      Pb.AuthQuickAuthorizePayload.decode(new Uint8Array())
    ),
    response: Pb.AuthQuickAuthorizeResponse.encode(
      Pb.AuthQuickAuthorizeResponse.decode(new Uint8Array())
    ),
    expected: Pb.AuthQuickAuthorizeResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.QuickAuthorize(Pb.AuthQuickAuthorizePayload.decode(new Uint8Array())),
  },
  {
    name: 'Me',
    request: Pb.AuthMePayload.encode(Pb.AuthMePayload.decode(new Uint8Array())),
    response: Pb.AuthMeResponse.encode(Pb.AuthMeResponse.decode(new Uint8Array())),
    expected: Pb.AuthMeResponse.decode(new Uint8Array()),
    call: (service: FreyService) => service.Me(Pb.AuthMePayload.decode(new Uint8Array())),
  },
  {
    name: 'DepersonalizeAccount',
    request: Pb.DepersonalizePayload.encode(Pb.DepersonalizePayload.decode(new Uint8Array())),
    response: Atoms.GenericSuccessResponse.encode(
      Atoms.GenericSuccessResponse.decode(new Uint8Array())
    ),
    expected: Atoms.GenericSuccessResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.DepersonalizeAccount(Pb.DepersonalizePayload.decode(new Uint8Array())),
  },
  {
    name: 'ChangePassword',
    request: Pb.AuthChangePasswordPayload.encode(
      Pb.AuthChangePasswordPayload.decode(new Uint8Array())
    ),
    response: Pb.AuthChangePasswordResponse.encode(
      Pb.AuthChangePasswordResponse.decode(new Uint8Array())
    ),
    expected: Pb.AuthChangePasswordResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.ChangePassword(Pb.AuthChangePasswordPayload.decode(new Uint8Array())),
  },
  {
    name: 'RequestResetPassword',
    request: Pb.AuthRequestResetPasswordPayload.encode(
      Pb.AuthRequestResetPasswordPayload.decode(new Uint8Array())
    ),
    response: Pb.AuthRequestResetPasswordResponse.encode(
      Pb.AuthRequestResetPasswordResponse.decode(new Uint8Array())
    ),
    expected: Pb.AuthRequestResetPasswordResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.RequestResetPassword(Pb.AuthRequestResetPasswordPayload.decode(new Uint8Array())),
  },
  {
    name: 'ApproveResetPassword',
    request: Pb.AuthApproveResetPasswordPayload.encode(
      Pb.AuthApproveResetPasswordPayload.decode(new Uint8Array())
    ),
    response: Pb.AuthApproveResetPasswordResponse.encode(
      Pb.AuthApproveResetPasswordResponse.decode(new Uint8Array())
    ),
    expected: Pb.AuthApproveResetPasswordResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.ApproveResetPassword(Pb.AuthApproveResetPasswordPayload.decode(new Uint8Array())),
  },
  {
    name: 'UpdatePersonalInfo',
    request: Pb.PersonsUpdatePersonalInfoPayload.encode(
      Pb.PersonsUpdatePersonalInfoPayload.decode(new Uint8Array())
    ),
    response: Atoms.GenericSuccessResponse.encode(
      Atoms.GenericSuccessResponse.decode(new Uint8Array())
    ),
    expected: Atoms.GenericSuccessResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.UpdatePersonalInfo(Pb.PersonsUpdatePersonalInfoPayload.decode(new Uint8Array())),
  },
  {
    name: 'GetPersonalInfo',
    request: Pb.PersonsGetPersonalInfoPayload.encode(
      Pb.PersonsGetPersonalInfoPayload.decode(new Uint8Array())
    ),
    response: Pb.PersonsGetPersonalInfoResponse.encode(
      Pb.PersonsGetPersonalInfoResponse.decode(new Uint8Array())
    ),
    expected: Pb.PersonsGetPersonalInfoResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.GetPersonalInfo(Pb.PersonsGetPersonalInfoPayload.decode(new Uint8Array())),
  },
  {
    name: 'FindByTenhouIds',
    request: Pb.PersonsFindByTenhouIdsPayload.encode(
      Pb.PersonsFindByTenhouIdsPayload.decode(new Uint8Array())
    ),
    response: Pb.PersonsFindByTenhouIdsResponse.encode(
      Pb.PersonsFindByTenhouIdsResponse.decode(new Uint8Array())
    ),
    expected: Pb.PersonsFindByTenhouIdsResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.FindByTenhouIds(Pb.PersonsFindByTenhouIdsPayload.decode(new Uint8Array())),
  },
  {
    name: 'FindByMajsoulAccountId',
    request: Pb.PersonsFindByMajsoulIdsPayload.encode(
      Pb.PersonsFindByMajsoulIdsPayload.decode(new Uint8Array())
    ),
    response: Pb.PersonsFindByTenhouIdsResponse.encode(
      Pb.PersonsFindByTenhouIdsResponse.decode(new Uint8Array())
    ),
    expected: Pb.PersonsFindByTenhouIdsResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.FindByMajsoulAccountId(Pb.PersonsFindByMajsoulIdsPayload.decode(new Uint8Array())),
  },
  {
    name: 'FindByTitle',
    request: Pb.PersonsFindByTitlePayload.encode(
      Pb.PersonsFindByTitlePayload.decode(new Uint8Array())
    ),
    response: Pb.PersonsFindByTitleResponse.encode(
      Pb.PersonsFindByTitleResponse.decode(new Uint8Array())
    ),
    expected: Pb.PersonsFindByTitleResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.FindByTitle(Pb.PersonsFindByTitlePayload.decode(new Uint8Array())),
  },
  {
    name: 'GetEventAdmins',
    request: Pb.AccessGetEventAdminsPayload.encode(
      Pb.AccessGetEventAdminsPayload.decode(new Uint8Array())
    ),
    response: Pb.AccessGetEventAdminsResponse.encode(
      Pb.AccessGetEventAdminsResponse.decode(new Uint8Array())
    ),
    expected: Pb.AccessGetEventAdminsResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.GetEventAdmins(Pb.AccessGetEventAdminsPayload.decode(new Uint8Array())),
  },
  {
    name: 'GetEventReferees',
    request: Pb.AccessGetEventRefereesPayload.encode(
      Pb.AccessGetEventRefereesPayload.decode(new Uint8Array())
    ),
    response: Pb.AccessGetEventRefereesResponse.encode(
      Pb.AccessGetEventRefereesResponse.decode(new Uint8Array())
    ),
    expected: Pb.AccessGetEventRefereesResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.GetEventReferees(Pb.AccessGetEventRefereesPayload.decode(new Uint8Array())),
  },
  {
    name: 'GetMajsoulNicknames',
    request: Pb.PersonsGetMajsoulNicknamesPayload.encode(
      Pb.PersonsGetMajsoulNicknamesPayload.decode(new Uint8Array())
    ),
    response: Pb.PersonsGetMajsoulNicknamesResponse.encode(
      Pb.PersonsGetMajsoulNicknamesResponse.decode(new Uint8Array())
    ),
    expected: Pb.PersonsGetMajsoulNicknamesResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.GetMajsoulNicknames(Pb.PersonsGetMajsoulNicknamesPayload.decode(new Uint8Array())),
  },
  {
    name: 'GetSuperadminFlag',
    request: Pb.AccessGetSuperadminFlagPayload.encode(
      Pb.AccessGetSuperadminFlagPayload.decode(new Uint8Array())
    ),
    response: Pb.AccessGetSuperadminFlagResponse.encode(
      Pb.AccessGetSuperadminFlagResponse.decode(new Uint8Array())
    ),
    expected: Pb.AccessGetSuperadminFlagResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.GetSuperadminFlag(Pb.AccessGetSuperadminFlagPayload.decode(new Uint8Array())),
  },
  {
    name: 'GetOwnedEventIds',
    request: Pb.AccessGetOwnedEventIdsPayload.encode(
      Pb.AccessGetOwnedEventIdsPayload.decode(new Uint8Array())
    ),
    response: Pb.AccessGetOwnedEventIdsResponse.encode(
      Pb.AccessGetOwnedEventIdsResponse.decode(new Uint8Array())
    ),
    expected: Pb.AccessGetOwnedEventIdsResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.GetOwnedEventIds(Pb.AccessGetOwnedEventIdsPayload.decode(new Uint8Array())),
  },
  {
    name: 'AddRuleForPerson',
    request: Pb.AccessAddRuleForPersonPayload.encode(
      Pb.AccessAddRuleForPersonPayload.decode(new Uint8Array())
    ),
    response: Pb.AccessAddRuleForPersonResponse.encode(
      Pb.AccessAddRuleForPersonResponse.decode(new Uint8Array())
    ),
    expected: Pb.AccessAddRuleForPersonResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.AddRuleForPerson(Pb.AccessAddRuleForPersonPayload.decode(new Uint8Array())),
  },
  {
    name: 'DeleteRuleForPerson',
    request: Pb.AccessDeleteRuleForPersonPayload.encode(
      Pb.AccessDeleteRuleForPersonPayload.decode(new Uint8Array())
    ),
    response: Atoms.GenericSuccessResponse.encode(
      Atoms.GenericSuccessResponse.decode(new Uint8Array())
    ),
    expected: Atoms.GenericSuccessResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.DeleteRuleForPerson(Pb.AccessDeleteRuleForPersonPayload.decode(new Uint8Array())),
  },
  {
    name: 'CreateAccount',
    request: Pb.PersonsCreateAccountPayload.encode(
      Pb.PersonsCreateAccountPayload.decode(new Uint8Array())
    ),
    response: Pb.PersonsCreateAccountResponse.encode(
      Pb.PersonsCreateAccountResponse.decode(new Uint8Array())
    ),
    expected: Pb.PersonsCreateAccountResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.CreateAccount(Pb.PersonsCreateAccountPayload.decode(new Uint8Array())),
  },
  {
    name: 'GetNotificationsSettings',
    request: Pb.PersonsGetNotificationsSettingsPayload.encode(
      Pb.PersonsGetNotificationsSettingsPayload.decode(new Uint8Array())
    ),
    response: Pb.PersonsGetNotificationsSettingsResponse.encode(
      Pb.PersonsGetNotificationsSettingsResponse.decode(new Uint8Array())
    ),
    expected: Pb.PersonsGetNotificationsSettingsResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.GetNotificationsSettings(
        Pb.PersonsGetNotificationsSettingsPayload.decode(new Uint8Array())
      ),
  },
  {
    name: 'SetNotificationsSettings',
    request: Pb.PersonsSetNotificationsSettingsPayload.encode(
      Pb.PersonsSetNotificationsSettingsPayload.decode(new Uint8Array())
    ),
    response: Atoms.GenericSuccessResponse.encode(
      Atoms.GenericSuccessResponse.decode(new Uint8Array())
    ),
    expected: Atoms.GenericSuccessResponse.decode(new Uint8Array()),
    call: (service: FreyService) =>
      service.SetNotificationsSettings(
        Pb.PersonsSetNotificationsSettingsPayload.decode(new Uint8Array())
      ),
  },
];

describe('Frey transport', () => {
  const config = new ConfigService();
  const meta = new MetaService(
    { 'x-auth-token': 'token', 'x-current-person-id': '12', 'x-current-event-id': '19' },
    config
  );
  afterEach(() => jest.restoreAllMocks());

  it.each(requests)(
    'sends $name to its Twirp endpoint with authentication and protobuf data',
    async ({ name, request, response, expected, call }) => {
      const transport = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(Uint8Array.from(response).buffer));
      await expect(call(new FreyService(config, meta))).resolves.toEqual(expected);
      expect(transport).toHaveBeenCalledTimes(1);
      const [url, options] = transport.mock.calls[0];
      expect(url).toBe(`${config.freyUrl}/v2/common.Frey/${name}`);
      expect(options?.method).toBe('POST');
      expect(options?.body).toEqual(request);
      const headers = new Headers(options?.headers);
      expect(headers.get('X-Auth-Token')).toBe('token');
      expect(headers.get('X-Current-Person-Id')).toBe('12');
      expect(headers.get('X-Current-Event-Id')).toBe('19');
      expect(headers.get('Content-Type')).toContain('protobuf');
    }
  );

  it('sends empty identity headers for anonymous requests', async () => {
    const transport = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(
          Pb.AuthMeResponse.encode(Pb.AuthMeResponse.decode(new Uint8Array())).slice().buffer
        )
      );
    await new FreyService(config, new MetaService({}, config)).Me({});
    const headers = new Headers(transport.mock.calls[0][1]?.headers);
    expect(headers.get('X-Auth-Token')).toBe('');
    expect(headers.get('X-Current-Person-Id')).toBe('');
    expect(headers.get('X-Current-Event-Id')).toBe('');
  });

  it('reports internal errors to Hugin and exposes their cause', async () => {
    const transport = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        Response.json(
          { code: 'internal', msg: 'internal error', meta: { cause: 'service unavailable' } },
          { status: 500 }
        )
      )
      .mockResolvedValueOnce(new Response());
    await expect(new FreyService(config, meta).Me({})).rejects.toThrow('service unavailable');
    expect(transport).toHaveBeenCalledTimes(2);
    expect(transport.mock.calls[1][0]).toBe(config.huginUrl);
    expect(JSON.parse(transport.mock.calls[1][1]?.body as string)).toMatchObject({
      source: 'Mimir [twirp]',
      error: expect.stringContaining('service unavailable'),
    });
  });

  it('propagates network errors without making a monitoring request', async () => {
    const transport = jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('network unavailable'));
    await expect(new FreyService(config, meta).Me({})).rejects.toThrow('network unavailable');
    expect(transport).toHaveBeenCalledTimes(1);
  });
});

describe('Frey player fixtures', () => {
  const config = new ConfigService();

  it('preserves supplied Tenhou identifiers in player lookups', async () => {
    const service = new FreyServiceMock(config, new MetaService({}, config));
    const result = await service.FindByTenhouIds({ ids: ['Alice', 'Bob'] });
    expect(result.people.map((person) => ({ id: person.id, tenhouId: person.tenhouId }))).toEqual([
      { id: 1, tenhouId: 'Alice' },
      { id: 2, tenhouId: 'Bob' },
    ]);
  });

  it('uses configured Majsoul accounts and nicknames while supplying defaults for other players', async () => {
    const service = new FreyServiceMock(config, new MetaService({}, config));
    service.mockMajsoul({ 12: 12345 }, { 12: 'Alice' });
    const result = await service.GetPersonalInfo({ ids: [12, 13] });
    expect(result.people).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 12, msAccountId: 12345, msNickname: 'Alice' }),
        expect.objectContaining({ id: 13, msAccountId: 1, msNickname: 'msNickname' }),
      ])
    );
    const accounts = await service.FindByMajsoulAccountId({
      ids: [
        { nickname: 'Alice', accountId: 12345 },
        { nickname: 'Bob', accountId: 67890 },
      ],
    });
    expect(
      accounts.people.map((person) => ({
        id: person.id,
        msNickname: person.msNickname,
        msAccountId: person.msAccountId,
      }))
    ).toEqual([
      { id: 12, msNickname: 'Alice', msAccountId: 12345 },
      { id: 1, msNickname: 'Bob', msAccountId: 67890 },
    ]);
  });
});
