import * as protoscript from "protoscript";
import { JSONrequest, PBrequest } from "twirpscript";
export { MIN_SUPPORTED_VERSION_0_0_56 } from "twirpscript";
import * as protoAtoms from "./atoms.pb";
export async function RequestRegistration(authRequestRegistrationPayload, config) {
  const response = await PBrequest(
    "/common.Frey/RequestRegistration",
    AuthRequestRegistrationPayload.encode(authRequestRegistrationPayload),
    config
  );
  return AuthRequestRegistrationResponse.decode(response);
}
export async function ApproveRegistration(authApproveRegistrationPayload, config) {
  const response = await PBrequest(
    "/common.Frey/ApproveRegistration",
    AuthApproveRegistrationPayload.encode(authApproveRegistrationPayload),
    config
  );
  return AuthApproveRegistrationResponse.decode(response);
}
export async function Authorize(authAuthorizePayload, config) {
  const response = await PBrequest(
    "/common.Frey/Authorize",
    AuthAuthorizePayload.encode(authAuthorizePayload),
    config
  );
  return AuthAuthorizeResponse.decode(response);
}
export async function QuickAuthorize(authQuickAuthorizePayload, config) {
  const response = await PBrequest(
    "/common.Frey/QuickAuthorize",
    AuthQuickAuthorizePayload.encode(authQuickAuthorizePayload),
    config
  );
  return AuthQuickAuthorizeResponse.decode(response);
}
export async function Me(authMePayload, config) {
  const response = await PBrequest(
    "/common.Frey/Me",
    AuthMePayload.encode(authMePayload),
    config
  );
  return AuthMeResponse.decode(response);
}
export async function DepersonalizeAccount(depersonalizePayload, config) {
  const response = await PBrequest(
    "/common.Frey/DepersonalizeAccount",
    DepersonalizePayload.encode(depersonalizePayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function ChangePassword(authChangePasswordPayload, config) {
  const response = await PBrequest(
    "/common.Frey/ChangePassword",
    AuthChangePasswordPayload.encode(authChangePasswordPayload),
    config
  );
  return AuthChangePasswordResponse.decode(response);
}
export async function RequestResetPassword(authRequestResetPasswordPayload, config) {
  const response = await PBrequest(
    "/common.Frey/RequestResetPassword",
    AuthRequestResetPasswordPayload.encode(authRequestResetPasswordPayload),
    config
  );
  return AuthRequestResetPasswordResponse.decode(response);
}
export async function ApproveResetPassword(authApproveResetPasswordPayload, config) {
  const response = await PBrequest(
    "/common.Frey/ApproveResetPassword",
    AuthApproveResetPasswordPayload.encode(authApproveResetPasswordPayload),
    config
  );
  return AuthApproveResetPasswordResponse.decode(response);
}
export async function UpdatePersonalInfo(personsUpdatePersonalInfoPayload, config) {
  const response = await PBrequest(
    "/common.Frey/UpdatePersonalInfo",
    PersonsUpdatePersonalInfoPayload.encode(personsUpdatePersonalInfoPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function GetPersonalInfo(personsGetPersonalInfoPayload, config) {
  const response = await PBrequest(
    "/common.Frey/GetPersonalInfo",
    PersonsGetPersonalInfoPayload.encode(personsGetPersonalInfoPayload),
    config
  );
  return PersonsGetPersonalInfoResponse.decode(response);
}
export async function FindByTenhouIds(personsFindByTenhouIdsPayload, config) {
  const response = await PBrequest(
    "/common.Frey/FindByTenhouIds",
    PersonsFindByTenhouIdsPayload.encode(personsFindByTenhouIdsPayload),
    config
  );
  return PersonsFindByTenhouIdsResponse.decode(response);
}
export async function FindByMajsoulAccountId(personsFindByMajsoulIdsPayload, config) {
  const response = await PBrequest(
    "/common.Frey/FindByMajsoulAccountId",
    PersonsFindByMajsoulIdsPayload.encode(personsFindByMajsoulIdsPayload),
    config
  );
  return PersonsFindByTenhouIdsResponse.decode(response);
}
export async function FindByTitle(personsFindByTitlePayload, config) {
  const response = await PBrequest(
    "/common.Frey/FindByTitle",
    PersonsFindByTitlePayload.encode(personsFindByTitlePayload),
    config
  );
  return PersonsFindByTitleResponse.decode(response);
}
export async function GetEventAdmins(accessGetEventAdminsPayload, config) {
  const response = await PBrequest(
    "/common.Frey/GetEventAdmins",
    AccessGetEventAdminsPayload.encode(accessGetEventAdminsPayload),
    config
  );
  return AccessGetEventAdminsResponse.decode(response);
}
export async function GetEventReferees(accessGetEventRefereesPayload, config) {
  const response = await PBrequest(
    "/common.Frey/GetEventReferees",
    AccessGetEventRefereesPayload.encode(accessGetEventRefereesPayload),
    config
  );
  return AccessGetEventRefereesResponse.decode(response);
}
export async function GetMajsoulNicknames(personsGetMajsoulNicknamesPayload, config) {
  const response = await PBrequest(
    "/common.Frey/GetMajsoulNicknames",
    PersonsGetMajsoulNicknamesPayload.encode(personsGetMajsoulNicknamesPayload),
    config
  );
  return PersonsGetMajsoulNicknamesResponse.decode(response);
}
export async function GetSuperadminFlag(accessGetSuperadminFlagPayload, config) {
  const response = await PBrequest(
    "/common.Frey/GetSuperadminFlag",
    AccessGetSuperadminFlagPayload.encode(accessGetSuperadminFlagPayload),
    config
  );
  return AccessGetSuperadminFlagResponse.decode(response);
}
export async function GetOwnedEventIds(accessGetOwnedEventIdsPayload, config) {
  const response = await PBrequest(
    "/common.Frey/GetOwnedEventIds",
    AccessGetOwnedEventIdsPayload.encode(accessGetOwnedEventIdsPayload),
    config
  );
  return AccessGetOwnedEventIdsResponse.decode(response);
}
export async function AddRuleForPerson(accessAddRuleForPersonPayload, config) {
  const response = await PBrequest(
    "/common.Frey/AddRuleForPerson",
    AccessAddRuleForPersonPayload.encode(accessAddRuleForPersonPayload),
    config
  );
  return AccessAddRuleForPersonResponse.decode(response);
}
export async function DeleteRuleForPerson(accessDeleteRuleForPersonPayload, config) {
  const response = await PBrequest(
    "/common.Frey/DeleteRuleForPerson",
    AccessDeleteRuleForPersonPayload.encode(accessDeleteRuleForPersonPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function CreateAccount(personsCreateAccountPayload, config) {
  const response = await PBrequest(
    "/common.Frey/CreateAccount",
    PersonsCreateAccountPayload.encode(personsCreateAccountPayload),
    config
  );
  return PersonsCreateAccountResponse.decode(response);
}
export async function GetNotificationsSettings(personsGetNotificationsSettingsPayload, config) {
  const response = await PBrequest(
    "/common.Frey/GetNotificationsSettings",
    PersonsGetNotificationsSettingsPayload.encode(
      personsGetNotificationsSettingsPayload
    ),
    config
  );
  return PersonsGetNotificationsSettingsResponse.decode(response);
}
export async function SetNotificationsSettings(personsSetNotificationsSettingsPayload, config) {
  const response = await PBrequest(
    "/common.Frey/SetNotificationsSettings",
    PersonsSetNotificationsSettingsPayload.encode(
      personsSetNotificationsSettingsPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function RequestRegistrationJSON(authRequestRegistrationPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/RequestRegistration",
    AuthRequestRegistrationPayloadJSON.encode(authRequestRegistrationPayload),
    config
  );
  return AuthRequestRegistrationResponseJSON.decode(response);
}
export async function ApproveRegistrationJSON(authApproveRegistrationPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/ApproveRegistration",
    AuthApproveRegistrationPayloadJSON.encode(authApproveRegistrationPayload),
    config
  );
  return AuthApproveRegistrationResponseJSON.decode(response);
}
export async function AuthorizeJSON(authAuthorizePayload, config) {
  const response = await JSONrequest(
    "/common.Frey/Authorize",
    AuthAuthorizePayloadJSON.encode(authAuthorizePayload),
    config
  );
  return AuthAuthorizeResponseJSON.decode(response);
}
export async function QuickAuthorizeJSON(authQuickAuthorizePayload, config) {
  const response = await JSONrequest(
    "/common.Frey/QuickAuthorize",
    AuthQuickAuthorizePayloadJSON.encode(authQuickAuthorizePayload),
    config
  );
  return AuthQuickAuthorizeResponseJSON.decode(response);
}
export async function MeJSON(authMePayload, config) {
  const response = await JSONrequest(
    "/common.Frey/Me",
    AuthMePayloadJSON.encode(authMePayload),
    config
  );
  return AuthMeResponseJSON.decode(response);
}
export async function DepersonalizeAccountJSON(depersonalizePayload, config) {
  const response = await JSONrequest(
    "/common.Frey/DepersonalizeAccount",
    DepersonalizePayloadJSON.encode(depersonalizePayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function ChangePasswordJSON(authChangePasswordPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/ChangePassword",
    AuthChangePasswordPayloadJSON.encode(authChangePasswordPayload),
    config
  );
  return AuthChangePasswordResponseJSON.decode(response);
}
export async function RequestResetPasswordJSON(authRequestResetPasswordPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/RequestResetPassword",
    AuthRequestResetPasswordPayloadJSON.encode(authRequestResetPasswordPayload),
    config
  );
  return AuthRequestResetPasswordResponseJSON.decode(response);
}
export async function ApproveResetPasswordJSON(authApproveResetPasswordPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/ApproveResetPassword",
    AuthApproveResetPasswordPayloadJSON.encode(authApproveResetPasswordPayload),
    config
  );
  return AuthApproveResetPasswordResponseJSON.decode(response);
}
export async function UpdatePersonalInfoJSON(personsUpdatePersonalInfoPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/UpdatePersonalInfo",
    PersonsUpdatePersonalInfoPayloadJSON.encode(
      personsUpdatePersonalInfoPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function GetPersonalInfoJSON(personsGetPersonalInfoPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/GetPersonalInfo",
    PersonsGetPersonalInfoPayloadJSON.encode(personsGetPersonalInfoPayload),
    config
  );
  return PersonsGetPersonalInfoResponseJSON.decode(response);
}
export async function FindByTenhouIdsJSON(personsFindByTenhouIdsPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/FindByTenhouIds",
    PersonsFindByTenhouIdsPayloadJSON.encode(personsFindByTenhouIdsPayload),
    config
  );
  return PersonsFindByTenhouIdsResponseJSON.decode(response);
}
export async function FindByMajsoulAccountIdJSON(personsFindByMajsoulIdsPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/FindByMajsoulAccountId",
    PersonsFindByMajsoulIdsPayloadJSON.encode(personsFindByMajsoulIdsPayload),
    config
  );
  return PersonsFindByTenhouIdsResponseJSON.decode(response);
}
export async function FindByTitleJSON(personsFindByTitlePayload, config) {
  const response = await JSONrequest(
    "/common.Frey/FindByTitle",
    PersonsFindByTitlePayloadJSON.encode(personsFindByTitlePayload),
    config
  );
  return PersonsFindByTitleResponseJSON.decode(response);
}
export async function GetEventAdminsJSON(accessGetEventAdminsPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/GetEventAdmins",
    AccessGetEventAdminsPayloadJSON.encode(accessGetEventAdminsPayload),
    config
  );
  return AccessGetEventAdminsResponseJSON.decode(response);
}
export async function GetEventRefereesJSON(accessGetEventRefereesPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/GetEventReferees",
    AccessGetEventRefereesPayloadJSON.encode(accessGetEventRefereesPayload),
    config
  );
  return AccessGetEventRefereesResponseJSON.decode(response);
}
export async function GetMajsoulNicknamesJSON(personsGetMajsoulNicknamesPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/GetMajsoulNicknames",
    PersonsGetMajsoulNicknamesPayloadJSON.encode(
      personsGetMajsoulNicknamesPayload
    ),
    config
  );
  return PersonsGetMajsoulNicknamesResponseJSON.decode(response);
}
export async function GetSuperadminFlagJSON(accessGetSuperadminFlagPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/GetSuperadminFlag",
    AccessGetSuperadminFlagPayloadJSON.encode(accessGetSuperadminFlagPayload),
    config
  );
  return AccessGetSuperadminFlagResponseJSON.decode(response);
}
export async function GetOwnedEventIdsJSON(accessGetOwnedEventIdsPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/GetOwnedEventIds",
    AccessGetOwnedEventIdsPayloadJSON.encode(accessGetOwnedEventIdsPayload),
    config
  );
  return AccessGetOwnedEventIdsResponseJSON.decode(response);
}
export async function AddRuleForPersonJSON(accessAddRuleForPersonPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/AddRuleForPerson",
    AccessAddRuleForPersonPayloadJSON.encode(accessAddRuleForPersonPayload),
    config
  );
  return AccessAddRuleForPersonResponseJSON.decode(response);
}
export async function DeleteRuleForPersonJSON(accessDeleteRuleForPersonPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/DeleteRuleForPerson",
    AccessDeleteRuleForPersonPayloadJSON.encode(
      accessDeleteRuleForPersonPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function CreateAccountJSON(personsCreateAccountPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/CreateAccount",
    PersonsCreateAccountPayloadJSON.encode(personsCreateAccountPayload),
    config
  );
  return PersonsCreateAccountResponseJSON.decode(response);
}
export async function GetNotificationsSettingsJSON(personsGetNotificationsSettingsPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/GetNotificationsSettings",
    PersonsGetNotificationsSettingsPayloadJSON.encode(
      personsGetNotificationsSettingsPayload
    ),
    config
  );
  return PersonsGetNotificationsSettingsResponseJSON.decode(response);
}
export async function SetNotificationsSettingsJSON(personsSetNotificationsSettingsPayload, config) {
  const response = await JSONrequest(
    "/common.Frey/SetNotificationsSettings",
    PersonsSetNotificationsSettingsPayloadJSON.encode(
      personsSetNotificationsSettingsPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export function createFrey(service) {
  return {
    name: "common.Frey",
    methods: {
      RequestRegistration: {
        name: "RequestRegistration",
        handler: service.RequestRegistration,
        input: {
          protobuf: AuthRequestRegistrationPayload,
          json: AuthRequestRegistrationPayloadJSON
        },
        output: {
          protobuf: AuthRequestRegistrationResponse,
          json: AuthRequestRegistrationResponseJSON
        }
      },
      ApproveRegistration: {
        name: "ApproveRegistration",
        handler: service.ApproveRegistration,
        input: {
          protobuf: AuthApproveRegistrationPayload,
          json: AuthApproveRegistrationPayloadJSON
        },
        output: {
          protobuf: AuthApproveRegistrationResponse,
          json: AuthApproveRegistrationResponseJSON
        }
      },
      Authorize: {
        name: "Authorize",
        handler: service.Authorize,
        input: {
          protobuf: AuthAuthorizePayload,
          json: AuthAuthorizePayloadJSON
        },
        output: {
          protobuf: AuthAuthorizeResponse,
          json: AuthAuthorizeResponseJSON
        }
      },
      QuickAuthorize: {
        name: "QuickAuthorize",
        handler: service.QuickAuthorize,
        input: {
          protobuf: AuthQuickAuthorizePayload,
          json: AuthQuickAuthorizePayloadJSON
        },
        output: {
          protobuf: AuthQuickAuthorizeResponse,
          json: AuthQuickAuthorizeResponseJSON
        }
      },
      Me: {
        name: "Me",
        handler: service.Me,
        input: { protobuf: AuthMePayload, json: AuthMePayloadJSON },
        output: { protobuf: AuthMeResponse, json: AuthMeResponseJSON }
      },
      DepersonalizeAccount: {
        name: "DepersonalizeAccount",
        handler: service.DepersonalizeAccount,
        input: {
          protobuf: DepersonalizePayload,
          json: DepersonalizePayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      ChangePassword: {
        name: "ChangePassword",
        handler: service.ChangePassword,
        input: {
          protobuf: AuthChangePasswordPayload,
          json: AuthChangePasswordPayloadJSON
        },
        output: {
          protobuf: AuthChangePasswordResponse,
          json: AuthChangePasswordResponseJSON
        }
      },
      RequestResetPassword: {
        name: "RequestResetPassword",
        handler: service.RequestResetPassword,
        input: {
          protobuf: AuthRequestResetPasswordPayload,
          json: AuthRequestResetPasswordPayloadJSON
        },
        output: {
          protobuf: AuthRequestResetPasswordResponse,
          json: AuthRequestResetPasswordResponseJSON
        }
      },
      ApproveResetPassword: {
        name: "ApproveResetPassword",
        handler: service.ApproveResetPassword,
        input: {
          protobuf: AuthApproveResetPasswordPayload,
          json: AuthApproveResetPasswordPayloadJSON
        },
        output: {
          protobuf: AuthApproveResetPasswordResponse,
          json: AuthApproveResetPasswordResponseJSON
        }
      },
      UpdatePersonalInfo: {
        name: "UpdatePersonalInfo",
        handler: service.UpdatePersonalInfo,
        input: {
          protobuf: PersonsUpdatePersonalInfoPayload,
          json: PersonsUpdatePersonalInfoPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      GetPersonalInfo: {
        name: "GetPersonalInfo",
        handler: service.GetPersonalInfo,
        input: {
          protobuf: PersonsGetPersonalInfoPayload,
          json: PersonsGetPersonalInfoPayloadJSON
        },
        output: {
          protobuf: PersonsGetPersonalInfoResponse,
          json: PersonsGetPersonalInfoResponseJSON
        }
      },
      FindByTenhouIds: {
        name: "FindByTenhouIds",
        handler: service.FindByTenhouIds,
        input: {
          protobuf: PersonsFindByTenhouIdsPayload,
          json: PersonsFindByTenhouIdsPayloadJSON
        },
        output: {
          protobuf: PersonsFindByTenhouIdsResponse,
          json: PersonsFindByTenhouIdsResponseJSON
        }
      },
      FindByMajsoulAccountId: {
        name: "FindByMajsoulAccountId",
        handler: service.FindByMajsoulAccountId,
        input: {
          protobuf: PersonsFindByMajsoulIdsPayload,
          json: PersonsFindByMajsoulIdsPayloadJSON
        },
        output: {
          protobuf: PersonsFindByTenhouIdsResponse,
          json: PersonsFindByTenhouIdsResponseJSON
        }
      },
      FindByTitle: {
        name: "FindByTitle",
        handler: service.FindByTitle,
        input: {
          protobuf: PersonsFindByTitlePayload,
          json: PersonsFindByTitlePayloadJSON
        },
        output: {
          protobuf: PersonsFindByTitleResponse,
          json: PersonsFindByTitleResponseJSON
        }
      },
      GetEventAdmins: {
        name: "GetEventAdmins",
        handler: service.GetEventAdmins,
        input: {
          protobuf: AccessGetEventAdminsPayload,
          json: AccessGetEventAdminsPayloadJSON
        },
        output: {
          protobuf: AccessGetEventAdminsResponse,
          json: AccessGetEventAdminsResponseJSON
        }
      },
      GetEventReferees: {
        name: "GetEventReferees",
        handler: service.GetEventReferees,
        input: {
          protobuf: AccessGetEventRefereesPayload,
          json: AccessGetEventRefereesPayloadJSON
        },
        output: {
          protobuf: AccessGetEventRefereesResponse,
          json: AccessGetEventRefereesResponseJSON
        }
      },
      GetMajsoulNicknames: {
        name: "GetMajsoulNicknames",
        handler: service.GetMajsoulNicknames,
        input: {
          protobuf: PersonsGetMajsoulNicknamesPayload,
          json: PersonsGetMajsoulNicknamesPayloadJSON
        },
        output: {
          protobuf: PersonsGetMajsoulNicknamesResponse,
          json: PersonsGetMajsoulNicknamesResponseJSON
        }
      },
      GetSuperadminFlag: {
        name: "GetSuperadminFlag",
        handler: service.GetSuperadminFlag,
        input: {
          protobuf: AccessGetSuperadminFlagPayload,
          json: AccessGetSuperadminFlagPayloadJSON
        },
        output: {
          protobuf: AccessGetSuperadminFlagResponse,
          json: AccessGetSuperadminFlagResponseJSON
        }
      },
      GetOwnedEventIds: {
        name: "GetOwnedEventIds",
        handler: service.GetOwnedEventIds,
        input: {
          protobuf: AccessGetOwnedEventIdsPayload,
          json: AccessGetOwnedEventIdsPayloadJSON
        },
        output: {
          protobuf: AccessGetOwnedEventIdsResponse,
          json: AccessGetOwnedEventIdsResponseJSON
        }
      },
      AddRuleForPerson: {
        name: "AddRuleForPerson",
        handler: service.AddRuleForPerson,
        input: {
          protobuf: AccessAddRuleForPersonPayload,
          json: AccessAddRuleForPersonPayloadJSON
        },
        output: {
          protobuf: AccessAddRuleForPersonResponse,
          json: AccessAddRuleForPersonResponseJSON
        }
      },
      DeleteRuleForPerson: {
        name: "DeleteRuleForPerson",
        handler: service.DeleteRuleForPerson,
        input: {
          protobuf: AccessDeleteRuleForPersonPayload,
          json: AccessDeleteRuleForPersonPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      CreateAccount: {
        name: "CreateAccount",
        handler: service.CreateAccount,
        input: {
          protobuf: PersonsCreateAccountPayload,
          json: PersonsCreateAccountPayloadJSON
        },
        output: {
          protobuf: PersonsCreateAccountResponse,
          json: PersonsCreateAccountResponseJSON
        }
      },
      GetNotificationsSettings: {
        name: "GetNotificationsSettings",
        handler: service.GetNotificationsSettings,
        input: {
          protobuf: PersonsGetNotificationsSettingsPayload,
          json: PersonsGetNotificationsSettingsPayloadJSON
        },
        output: {
          protobuf: PersonsGetNotificationsSettingsResponse,
          json: PersonsGetNotificationsSettingsResponseJSON
        }
      },
      SetNotificationsSettings: {
        name: "SetNotificationsSettings",
        handler: service.SetNotificationsSettings,
        input: {
          protobuf: PersonsSetNotificationsSettingsPayload,
          json: PersonsSetNotificationsSettingsPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      }
    }
  };
}
export const AuthRequestRegistrationPayload = {
  /**
   * Serializes AuthRequestRegistrationPayload to protobuf.
   */
  encode: function(msg) {
    return AuthRequestRegistrationPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthRequestRegistrationPayload from protobuf.
   */
  decode: function(bytes) {
    return AuthRequestRegistrationPayload._readMessage(
      AuthRequestRegistrationPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AuthRequestRegistrationPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      email: "",
      title: "",
      password: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.email) {
      writer.writeString(1, msg.email);
    }
    if (msg.title) {
      writer.writeString(2, msg.title);
    }
    if (msg.password) {
      writer.writeString(3, msg.password);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.email = reader.readString();
          break;
        }
        case 2: {
          msg.title = reader.readString();
          break;
        }
        case 3: {
          msg.password = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AuthRequestRegistrationResponse = {
  /**
   * Serializes AuthRequestRegistrationResponse to protobuf.
   */
  encode: function(msg) {
    return AuthRequestRegistrationResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthRequestRegistrationResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthRequestRegistrationResponse._readMessage(
      AuthRequestRegistrationResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AuthRequestRegistrationResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      approvalCode: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.approvalCode) {
      writer.writeString(1, msg.approvalCode);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.approvalCode = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AuthApproveRegistrationPayload = {
  /**
   * Serializes AuthApproveRegistrationPayload to protobuf.
   */
  encode: function(msg) {
    return AuthApproveRegistrationPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthApproveRegistrationPayload from protobuf.
   */
  decode: function(bytes) {
    return AuthApproveRegistrationPayload._readMessage(
      AuthApproveRegistrationPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AuthApproveRegistrationPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      approvalCode: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.approvalCode) {
      writer.writeString(1, msg.approvalCode);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.approvalCode = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AuthApproveRegistrationResponse = {
  /**
   * Serializes AuthApproveRegistrationResponse to protobuf.
   */
  encode: function(msg) {
    return AuthApproveRegistrationResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthApproveRegistrationResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthApproveRegistrationResponse._readMessage(
      AuthApproveRegistrationResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AuthApproveRegistrationResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.personId) {
      writer.writeInt32(1, msg.personId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.personId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AuthAuthorizePayload = {
  /**
   * Serializes AuthAuthorizePayload to protobuf.
   */
  encode: function(msg) {
    return AuthAuthorizePayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthAuthorizePayload from protobuf.
   */
  decode: function(bytes) {
    return AuthAuthorizePayload._readMessage(
      AuthAuthorizePayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AuthAuthorizePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      email: "",
      password: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.email) {
      writer.writeString(1, msg.email);
    }
    if (msg.password) {
      writer.writeString(2, msg.password);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.email = reader.readString();
          break;
        }
        case 2: {
          msg.password = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AuthAuthorizeResponse = {
  /**
   * Serializes AuthAuthorizeResponse to protobuf.
   */
  encode: function(msg) {
    return AuthAuthorizeResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthAuthorizeResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthAuthorizeResponse._readMessage(
      AuthAuthorizeResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AuthAuthorizeResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      authToken: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.personId) {
      writer.writeInt32(1, msg.personId);
    }
    if (msg.authToken) {
      writer.writeString(2, msg.authToken);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.personId = reader.readInt32();
          break;
        }
        case 2: {
          msg.authToken = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AuthQuickAuthorizePayload = {
  /**
   * Serializes AuthQuickAuthorizePayload to protobuf.
   */
  encode: function(msg) {
    return AuthQuickAuthorizePayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthQuickAuthorizePayload from protobuf.
   */
  decode: function(bytes) {
    return AuthQuickAuthorizePayload._readMessage(
      AuthQuickAuthorizePayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AuthQuickAuthorizePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      authToken: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.personId) {
      writer.writeInt32(1, msg.personId);
    }
    if (msg.authToken) {
      writer.writeString(2, msg.authToken);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.personId = reader.readInt32();
          break;
        }
        case 2: {
          msg.authToken = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AuthQuickAuthorizeResponse = {
  /**
   * Serializes AuthQuickAuthorizeResponse to protobuf.
   */
  encode: function(msg) {
    return AuthQuickAuthorizeResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthQuickAuthorizeResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthQuickAuthorizeResponse._readMessage(
      AuthQuickAuthorizeResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AuthQuickAuthorizeResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      authSuccess: false,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.authSuccess) {
      writer.writeBool(1, msg.authSuccess);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.authSuccess = reader.readBool();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AuthMePayload = {
  /**
   * Serializes AuthMePayload to protobuf.
   */
  encode: function(_msg) {
    return new Uint8Array();
  },
  /**
   * Deserializes AuthMePayload from protobuf.
   */
  decode: function(_bytes) {
    return {};
  },
  /**
   * Initializes AuthMePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(_msg, writer) {
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(_msg, _reader) {
    return _msg;
  }
};
export const AuthMeResponse = {
  /**
   * Serializes AuthMeResponse to protobuf.
   */
  encode: function(msg) {
    return AuthMeResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthMeResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthMeResponse._readMessage(
      AuthMeResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AuthMeResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      country: "",
      city: "",
      email: "",
      phone: "",
      tenhouId: "",
      title: "",
      hasAvatar: false,
      lastUpdate: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.personId) {
      writer.writeInt32(1, msg.personId);
    }
    if (msg.country) {
      writer.writeString(2, msg.country);
    }
    if (msg.city) {
      writer.writeString(3, msg.city);
    }
    if (msg.email) {
      writer.writeString(4, msg.email);
    }
    if (msg.phone) {
      writer.writeString(5, msg.phone);
    }
    if (msg.tenhouId) {
      writer.writeString(6, msg.tenhouId);
    }
    if (msg.title) {
      writer.writeString(7, msg.title);
    }
    if (msg.hasAvatar) {
      writer.writeBool(9, msg.hasAvatar);
    }
    if (msg.lastUpdate) {
      writer.writeString(10, msg.lastUpdate);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.personId = reader.readInt32();
          break;
        }
        case 2: {
          msg.country = reader.readString();
          break;
        }
        case 3: {
          msg.city = reader.readString();
          break;
        }
        case 4: {
          msg.email = reader.readString();
          break;
        }
        case 5: {
          msg.phone = reader.readString();
          break;
        }
        case 6: {
          msg.tenhouId = reader.readString();
          break;
        }
        case 7: {
          msg.title = reader.readString();
          break;
        }
        case 9: {
          msg.hasAvatar = reader.readBool();
          break;
        }
        case 10: {
          msg.lastUpdate = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AuthChangePasswordPayload = {
  /**
   * Serializes AuthChangePasswordPayload to protobuf.
   */
  encode: function(msg) {
    return AuthChangePasswordPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthChangePasswordPayload from protobuf.
   */
  decode: function(bytes) {
    return AuthChangePasswordPayload._readMessage(
      AuthChangePasswordPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AuthChangePasswordPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      email: "",
      password: "",
      newPassword: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.email) {
      writer.writeString(1, msg.email);
    }
    if (msg.password) {
      writer.writeString(2, msg.password);
    }
    if (msg.newPassword) {
      writer.writeString(3, msg.newPassword);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.email = reader.readString();
          break;
        }
        case 2: {
          msg.password = reader.readString();
          break;
        }
        case 3: {
          msg.newPassword = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AuthChangePasswordResponse = {
  /**
   * Serializes AuthChangePasswordResponse to protobuf.
   */
  encode: function(msg) {
    return AuthChangePasswordResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthChangePasswordResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthChangePasswordResponse._readMessage(
      AuthChangePasswordResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AuthChangePasswordResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      authToken: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.authToken) {
      writer.writeString(1, msg.authToken);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.authToken = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AuthRequestResetPasswordPayload = {
  /**
   * Serializes AuthRequestResetPasswordPayload to protobuf.
   */
  encode: function(msg) {
    return AuthRequestResetPasswordPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthRequestResetPasswordPayload from protobuf.
   */
  decode: function(bytes) {
    return AuthRequestResetPasswordPayload._readMessage(
      AuthRequestResetPasswordPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AuthRequestResetPasswordPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      email: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.email) {
      writer.writeString(1, msg.email);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.email = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AuthRequestResetPasswordResponse = {
  /**
   * Serializes AuthRequestResetPasswordResponse to protobuf.
   */
  encode: function(msg) {
    return AuthRequestResetPasswordResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthRequestResetPasswordResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthRequestResetPasswordResponse._readMessage(
      AuthRequestResetPasswordResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AuthRequestResetPasswordResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      resetToken: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.resetToken) {
      writer.writeString(1, msg.resetToken);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.resetToken = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AuthApproveResetPasswordPayload = {
  /**
   * Serializes AuthApproveResetPasswordPayload to protobuf.
   */
  encode: function(msg) {
    return AuthApproveResetPasswordPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthApproveResetPasswordPayload from protobuf.
   */
  decode: function(bytes) {
    return AuthApproveResetPasswordPayload._readMessage(
      AuthApproveResetPasswordPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AuthApproveResetPasswordPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      email: "",
      resetToken: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.email) {
      writer.writeString(1, msg.email);
    }
    if (msg.resetToken) {
      writer.writeString(2, msg.resetToken);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.email = reader.readString();
          break;
        }
        case 2: {
          msg.resetToken = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AuthApproveResetPasswordResponse = {
  /**
   * Serializes AuthApproveResetPasswordResponse to protobuf.
   */
  encode: function(msg) {
    return AuthApproveResetPasswordResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthApproveResetPasswordResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthApproveResetPasswordResponse._readMessage(
      AuthApproveResetPasswordResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AuthApproveResetPasswordResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      newTmpPassword: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.newTmpPassword) {
      writer.writeString(1, msg.newTmpPassword);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.newTmpPassword = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AccessGetEventAdminsPayload = {
  /**
   * Serializes AccessGetEventAdminsPayload to protobuf.
   */
  encode: function(msg) {
    return AccessGetEventAdminsPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetEventAdminsPayload from protobuf.
   */
  decode: function(bytes) {
    return AccessGetEventAdminsPayload._readMessage(
      AccessGetEventAdminsPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AccessGetEventAdminsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AccessGetEventAdminsResponse = {
  /**
   * Serializes AccessGetEventAdminsResponse to protobuf.
   */
  encode: function(msg) {
    return AccessGetEventAdminsResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetEventAdminsResponse from protobuf.
   */
  decode: function(bytes) {
    return AccessGetEventAdminsResponse._readMessage(
      AccessGetEventAdminsResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AccessGetEventAdminsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      admins: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.admins?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.admins,
        protoAtoms.EventAdmin._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.EventAdmin.initialize();
          reader.readMessage(m, protoAtoms.EventAdmin._readMessage);
          msg.admins.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AccessGetEventRefereesPayload = {
  /**
   * Serializes AccessGetEventRefereesPayload to protobuf.
   */
  encode: function(msg) {
    return AccessGetEventRefereesPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetEventRefereesPayload from protobuf.
   */
  decode: function(bytes) {
    return AccessGetEventRefereesPayload._readMessage(
      AccessGetEventRefereesPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AccessGetEventRefereesPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AccessGetEventRefereesResponse = {
  /**
   * Serializes AccessGetEventRefereesResponse to protobuf.
   */
  encode: function(msg) {
    return AccessGetEventRefereesResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetEventRefereesResponse from protobuf.
   */
  decode: function(bytes) {
    return AccessGetEventRefereesResponse._readMessage(
      AccessGetEventRefereesResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AccessGetEventRefereesResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      referees: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.referees?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.referees,
        protoAtoms.EventReferee._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.EventReferee.initialize();
          reader.readMessage(m, protoAtoms.EventReferee._readMessage);
          msg.referees.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AccessGetSuperadminFlagPayload = {
  /**
   * Serializes AccessGetSuperadminFlagPayload to protobuf.
   */
  encode: function(msg) {
    return AccessGetSuperadminFlagPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetSuperadminFlagPayload from protobuf.
   */
  decode: function(bytes) {
    return AccessGetSuperadminFlagPayload._readMessage(
      AccessGetSuperadminFlagPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AccessGetSuperadminFlagPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.personId) {
      writer.writeInt32(1, msg.personId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.personId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AccessGetSuperadminFlagResponse = {
  /**
   * Serializes AccessGetSuperadminFlagResponse to protobuf.
   */
  encode: function(msg) {
    return AccessGetSuperadminFlagResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetSuperadminFlagResponse from protobuf.
   */
  decode: function(bytes) {
    return AccessGetSuperadminFlagResponse._readMessage(
      AccessGetSuperadminFlagResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AccessGetSuperadminFlagResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      isAdmin: false,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.isAdmin) {
      writer.writeBool(1, msg.isAdmin);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.isAdmin = reader.readBool();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AccessGetOwnedEventIdsPayload = {
  /**
   * Serializes AccessGetOwnedEventIdsPayload to protobuf.
   */
  encode: function(msg) {
    return AccessGetOwnedEventIdsPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetOwnedEventIdsPayload from protobuf.
   */
  decode: function(bytes) {
    return AccessGetOwnedEventIdsPayload._readMessage(
      AccessGetOwnedEventIdsPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AccessGetOwnedEventIdsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.personId) {
      writer.writeInt32(1, msg.personId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.personId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AccessGetOwnedEventIdsResponse = {
  /**
   * Serializes AccessGetOwnedEventIdsResponse to protobuf.
   */
  encode: function(msg) {
    return AccessGetOwnedEventIdsResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetOwnedEventIdsResponse from protobuf.
   */
  decode: function(bytes) {
    return AccessGetOwnedEventIdsResponse._readMessage(
      AccessGetOwnedEventIdsResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AccessGetOwnedEventIdsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventIds: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventIds?.length) {
      writer.writePackedInt32(1, msg.eventIds);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          if (reader.isDelimited()) {
            msg.eventIds.push(...reader.readPackedInt32());
          } else {
            msg.eventIds.push(reader.readInt32());
          }
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AccessAddRuleForPersonPayload = {
  /**
   * Serializes AccessAddRuleForPersonPayload to protobuf.
   */
  encode: function(msg) {
    return AccessAddRuleForPersonPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessAddRuleForPersonPayload from protobuf.
   */
  decode: function(bytes) {
    return AccessAddRuleForPersonPayload._readMessage(
      AccessAddRuleForPersonPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AccessAddRuleForPersonPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ruleName: "",
      ruleValue: 0,
      personId: 0,
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.ruleName) {
      writer.writeString(1, msg.ruleName);
    }
    if (msg.ruleValue) {
      writer.writeInt32(2, msg.ruleValue);
    }
    if (msg.personId) {
      writer.writeInt32(3, msg.personId);
    }
    if (msg.eventId) {
      writer.writeInt32(4, msg.eventId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.ruleName = reader.readString();
          break;
        }
        case 2: {
          msg.ruleValue = reader.readInt32();
          break;
        }
        case 3: {
          msg.personId = reader.readInt32();
          break;
        }
        case 4: {
          msg.eventId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AccessAddRuleForPersonResponse = {
  /**
   * Serializes AccessAddRuleForPersonResponse to protobuf.
   */
  encode: function(msg) {
    return AccessAddRuleForPersonResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessAddRuleForPersonResponse from protobuf.
   */
  decode: function(bytes) {
    return AccessAddRuleForPersonResponse._readMessage(
      AccessAddRuleForPersonResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AccessAddRuleForPersonResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ruleId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.ruleId) {
      writer.writeInt32(1, msg.ruleId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.ruleId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AccessDeleteRuleForPersonPayload = {
  /**
   * Serializes AccessDeleteRuleForPersonPayload to protobuf.
   */
  encode: function(msg) {
    return AccessDeleteRuleForPersonPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessDeleteRuleForPersonPayload from protobuf.
   */
  decode: function(bytes) {
    return AccessDeleteRuleForPersonPayload._readMessage(
      AccessDeleteRuleForPersonPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AccessDeleteRuleForPersonPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ruleId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.ruleId) {
      writer.writeInt32(1, msg.ruleId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.ruleId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PersonsCreateAccountPayload = {
  /**
   * Serializes PersonsCreateAccountPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsCreateAccountPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsCreateAccountPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsCreateAccountPayload._readMessage(
      PersonsCreateAccountPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonsCreateAccountPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      email: "",
      password: "",
      title: "",
      city: "",
      phone: "",
      tenhouId: "",
      country: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.email) {
      writer.writeString(1, msg.email);
    }
    if (msg.password) {
      writer.writeString(2, msg.password);
    }
    if (msg.title) {
      writer.writeString(3, msg.title);
    }
    if (msg.city) {
      writer.writeString(4, msg.city);
    }
    if (msg.phone) {
      writer.writeString(5, msg.phone);
    }
    if (msg.tenhouId) {
      writer.writeString(6, msg.tenhouId);
    }
    if (msg.country) {
      writer.writeString(7, msg.country);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.email = reader.readString();
          break;
        }
        case 2: {
          msg.password = reader.readString();
          break;
        }
        case 3: {
          msg.title = reader.readString();
          break;
        }
        case 4: {
          msg.city = reader.readString();
          break;
        }
        case 5: {
          msg.phone = reader.readString();
          break;
        }
        case 6: {
          msg.tenhouId = reader.readString();
          break;
        }
        case 7: {
          msg.country = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PersonsCreateAccountResponse = {
  /**
   * Serializes PersonsCreateAccountResponse to protobuf.
   */
  encode: function(msg) {
    return PersonsCreateAccountResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsCreateAccountResponse from protobuf.
   */
  decode: function(bytes) {
    return PersonsCreateAccountResponse._readMessage(
      PersonsCreateAccountResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonsCreateAccountResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.personId) {
      writer.writeInt32(1, msg.personId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.personId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PersonsUpdatePersonalInfoPayload = {
  /**
   * Serializes PersonsUpdatePersonalInfoPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsUpdatePersonalInfoPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsUpdatePersonalInfoPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsUpdatePersonalInfoPayload._readMessage(
      PersonsUpdatePersonalInfoPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonsUpdatePersonalInfoPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      title: "",
      country: "",
      city: "",
      email: "",
      phone: "",
      tenhouId: "",
      hasAvatar: false,
      avatarData: "",
      msNickname: void 0,
      msFriendId: void 0,
      msAccountId: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.id) {
      writer.writeInt32(1, msg.id);
    }
    if (msg.title) {
      writer.writeString(2, msg.title);
    }
    if (msg.country) {
      writer.writeString(3, msg.country);
    }
    if (msg.city) {
      writer.writeString(4, msg.city);
    }
    if (msg.email) {
      writer.writeString(5, msg.email);
    }
    if (msg.phone) {
      writer.writeString(6, msg.phone);
    }
    if (msg.tenhouId) {
      writer.writeString(7, msg.tenhouId);
    }
    if (msg.hasAvatar) {
      writer.writeBool(8, msg.hasAvatar);
    }
    if (msg.avatarData) {
      writer.writeString(9, msg.avatarData);
    }
    if (msg.msNickname != void 0) {
      writer.writeString(10, msg.msNickname);
    }
    if (msg.msFriendId != void 0) {
      writer.writeInt32(11, msg.msFriendId);
    }
    if (msg.msAccountId != void 0) {
      writer.writeInt32(12, msg.msAccountId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.id = reader.readInt32();
          break;
        }
        case 2: {
          msg.title = reader.readString();
          break;
        }
        case 3: {
          msg.country = reader.readString();
          break;
        }
        case 4: {
          msg.city = reader.readString();
          break;
        }
        case 5: {
          msg.email = reader.readString();
          break;
        }
        case 6: {
          msg.phone = reader.readString();
          break;
        }
        case 7: {
          msg.tenhouId = reader.readString();
          break;
        }
        case 8: {
          msg.hasAvatar = reader.readBool();
          break;
        }
        case 9: {
          msg.avatarData = reader.readString();
          break;
        }
        case 10: {
          msg.msNickname = reader.readString();
          break;
        }
        case 11: {
          msg.msFriendId = reader.readInt32();
          break;
        }
        case 12: {
          msg.msAccountId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PersonsGetPersonalInfoPayload = {
  /**
   * Serializes PersonsGetPersonalInfoPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsGetPersonalInfoPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsGetPersonalInfoPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsGetPersonalInfoPayload._readMessage(
      PersonsGetPersonalInfoPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonsGetPersonalInfoPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ids: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.ids?.length) {
      writer.writePackedInt32(1, msg.ids);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          if (reader.isDelimited()) {
            msg.ids.push(...reader.readPackedInt32());
          } else {
            msg.ids.push(reader.readInt32());
          }
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PersonsGetPersonalInfoResponse = {
  /**
   * Serializes PersonsGetPersonalInfoResponse to protobuf.
   */
  encode: function(msg) {
    return PersonsGetPersonalInfoResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsGetPersonalInfoResponse from protobuf.
   */
  decode: function(bytes) {
    return PersonsGetPersonalInfoResponse._readMessage(
      PersonsGetPersonalInfoResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonsGetPersonalInfoResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      people: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.people?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.people,
        protoAtoms.PersonEx._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.PersonEx.initialize();
          reader.readMessage(m, protoAtoms.PersonEx._readMessage);
          msg.people.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PersonsFindByTenhouIdsPayload = {
  /**
   * Serializes PersonsFindByTenhouIdsPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsFindByTenhouIdsPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsFindByTenhouIdsPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsFindByTenhouIdsPayload._readMessage(
      PersonsFindByTenhouIdsPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonsFindByTenhouIdsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ids: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.ids?.length) {
      writer.writeRepeatedString(1, msg.ids);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.ids.push(reader.readString());
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PersonsFindByMajsoulIdsPayload = {
  /**
   * Serializes PersonsFindByMajsoulIdsPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsFindByMajsoulIdsPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsFindByMajsoulIdsPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsFindByMajsoulIdsPayload._readMessage(
      PersonsFindByMajsoulIdsPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonsFindByMajsoulIdsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ids: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.ids?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.ids,
        protoAtoms.MajsoulSearchEx._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.MajsoulSearchEx.initialize();
          reader.readMessage(m, protoAtoms.MajsoulSearchEx._readMessage);
          msg.ids.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PersonsFindByTenhouIdsResponse = {
  /**
   * Serializes PersonsFindByTenhouIdsResponse to protobuf.
   */
  encode: function(msg) {
    return PersonsFindByTenhouIdsResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsFindByTenhouIdsResponse from protobuf.
   */
  decode: function(bytes) {
    return PersonsFindByTenhouIdsResponse._readMessage(
      PersonsFindByTenhouIdsResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonsFindByTenhouIdsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      people: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.people?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.people,
        protoAtoms.PersonEx._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.PersonEx.initialize();
          reader.readMessage(m, protoAtoms.PersonEx._readMessage);
          msg.people.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PersonsFindByTitlePayload = {
  /**
   * Serializes PersonsFindByTitlePayload to protobuf.
   */
  encode: function(msg) {
    return PersonsFindByTitlePayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsFindByTitlePayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsFindByTitlePayload._readMessage(
      PersonsFindByTitlePayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonsFindByTitlePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      query: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.query) {
      writer.writeString(1, msg.query);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.query = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PersonsFindByTitleResponse = {
  /**
   * Serializes PersonsFindByTitleResponse to protobuf.
   */
  encode: function(msg) {
    return PersonsFindByTitleResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsFindByTitleResponse from protobuf.
   */
  decode: function(bytes) {
    return PersonsFindByTitleResponse._readMessage(
      PersonsFindByTitleResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonsFindByTitleResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      people: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.people?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.people,
        protoAtoms.Person._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.Person.initialize();
          reader.readMessage(m, protoAtoms.Person._readMessage);
          msg.people.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const DepersonalizePayload = {
  /**
   * Serializes DepersonalizePayload to protobuf.
   */
  encode: function(_msg) {
    return new Uint8Array();
  },
  /**
   * Deserializes DepersonalizePayload from protobuf.
   */
  decode: function(_bytes) {
    return {};
  },
  /**
   * Initializes DepersonalizePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(_msg, writer) {
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(_msg, _reader) {
    return _msg;
  }
};
export const PersonsGetMajsoulNicknamesPayload = {
  /**
   * Serializes PersonsGetMajsoulNicknamesPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsGetMajsoulNicknamesPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsGetMajsoulNicknamesPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsGetMajsoulNicknamesPayload._readMessage(
      PersonsGetMajsoulNicknamesPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonsGetMajsoulNicknamesPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ids: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.ids?.length) {
      writer.writePackedInt32(1, msg.ids);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          if (reader.isDelimited()) {
            msg.ids.push(...reader.readPackedInt32());
          } else {
            msg.ids.push(reader.readInt32());
          }
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PersonsGetMajsoulNicknamesResponse = {
  /**
   * Serializes PersonsGetMajsoulNicknamesResponse to protobuf.
   */
  encode: function(msg) {
    return PersonsGetMajsoulNicknamesResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsGetMajsoulNicknamesResponse from protobuf.
   */
  decode: function(bytes) {
    return PersonsGetMajsoulNicknamesResponse._readMessage(
      PersonsGetMajsoulNicknamesResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonsGetMajsoulNicknamesResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      mapping: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.mapping?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.mapping,
        protoAtoms.MajsoulPersonMapping._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.MajsoulPersonMapping.initialize();
          reader.readMessage(m, protoAtoms.MajsoulPersonMapping._readMessage);
          msg.mapping.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PersonsGetNotificationsSettingsPayload = {
  /**
   * Serializes PersonsGetNotificationsSettingsPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsGetNotificationsSettingsPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsGetNotificationsSettingsPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsGetNotificationsSettingsPayload._readMessage(
      PersonsGetNotificationsSettingsPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonsGetNotificationsSettingsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.personId) {
      writer.writeInt32(1, msg.personId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.personId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PersonsGetNotificationsSettingsResponse = {
  /**
   * Serializes PersonsGetNotificationsSettingsResponse to protobuf.
   */
  encode: function(msg) {
    return PersonsGetNotificationsSettingsResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsGetNotificationsSettingsResponse from protobuf.
   */
  decode: function(bytes) {
    return PersonsGetNotificationsSettingsResponse._readMessage(
      PersonsGetNotificationsSettingsResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonsGetNotificationsSettingsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      telegramId: "",
      notifications: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.telegramId) {
      writer.writeString(1, msg.telegramId);
    }
    if (msg.notifications) {
      writer.writeString(2, msg.notifications);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.telegramId = reader.readString();
          break;
        }
        case 2: {
          msg.notifications = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PersonsSetNotificationsSettingsPayload = {
  /**
   * Serializes PersonsSetNotificationsSettingsPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsSetNotificationsSettingsPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsSetNotificationsSettingsPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsSetNotificationsSettingsPayload._readMessage(
      PersonsSetNotificationsSettingsPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonsSetNotificationsSettingsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      telegramId: "",
      notifications: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.personId) {
      writer.writeInt32(1, msg.personId);
    }
    if (msg.telegramId) {
      writer.writeString(2, msg.telegramId);
    }
    if (msg.notifications) {
      writer.writeString(3, msg.notifications);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.personId = reader.readInt32();
          break;
        }
        case 2: {
          msg.telegramId = reader.readString();
          break;
        }
        case 3: {
          msg.notifications = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AuthRequestRegistrationPayloadJSON = {
  /**
   * Serializes AuthRequestRegistrationPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      AuthRequestRegistrationPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes AuthRequestRegistrationPayload from JSON.
   */
  decode: function(json) {
    return AuthRequestRegistrationPayloadJSON._readMessage(
      AuthRequestRegistrationPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AuthRequestRegistrationPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      email: "",
      title: "",
      password: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.email) {
      json["email"] = msg.email;
    }
    if (msg.title) {
      json["title"] = msg.title;
    }
    if (msg.password) {
      json["password"] = msg.password;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _email_ = json["email"];
    if (_email_) {
      msg.email = _email_;
    }
    const _title_ = json["title"];
    if (_title_) {
      msg.title = _title_;
    }
    const _password_ = json["password"];
    if (_password_) {
      msg.password = _password_;
    }
    return msg;
  }
};
export const AuthRequestRegistrationResponseJSON = {
  /**
   * Serializes AuthRequestRegistrationResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      AuthRequestRegistrationResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes AuthRequestRegistrationResponse from JSON.
   */
  decode: function(json) {
    return AuthRequestRegistrationResponseJSON._readMessage(
      AuthRequestRegistrationResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AuthRequestRegistrationResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      approvalCode: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.approvalCode) {
      json["approvalCode"] = msg.approvalCode;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _approvalCode_ = json["approvalCode"] ?? json["approval_code"];
    if (_approvalCode_) {
      msg.approvalCode = _approvalCode_;
    }
    return msg;
  }
};
export const AuthApproveRegistrationPayloadJSON = {
  /**
   * Serializes AuthApproveRegistrationPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      AuthApproveRegistrationPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes AuthApproveRegistrationPayload from JSON.
   */
  decode: function(json) {
    return AuthApproveRegistrationPayloadJSON._readMessage(
      AuthApproveRegistrationPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AuthApproveRegistrationPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      approvalCode: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.approvalCode) {
      json["approvalCode"] = msg.approvalCode;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _approvalCode_ = json["approvalCode"] ?? json["approval_code"];
    if (_approvalCode_) {
      msg.approvalCode = _approvalCode_;
    }
    return msg;
  }
};
export const AuthApproveRegistrationResponseJSON = {
  /**
   * Serializes AuthApproveRegistrationResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      AuthApproveRegistrationResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes AuthApproveRegistrationResponse from JSON.
   */
  decode: function(json) {
    return AuthApproveRegistrationResponseJSON._readMessage(
      AuthApproveRegistrationResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AuthApproveRegistrationResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.personId) {
      json["personId"] = msg.personId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _personId_ = json["personId"] ?? json["person_id"];
    if (_personId_) {
      msg.personId = protoscript.parseNumber(_personId_);
    }
    return msg;
  }
};
export const AuthAuthorizePayloadJSON = {
  /**
   * Serializes AuthAuthorizePayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(AuthAuthorizePayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes AuthAuthorizePayload from JSON.
   */
  decode: function(json) {
    return AuthAuthorizePayloadJSON._readMessage(
      AuthAuthorizePayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AuthAuthorizePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      email: "",
      password: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.email) {
      json["email"] = msg.email;
    }
    if (msg.password) {
      json["password"] = msg.password;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _email_ = json["email"];
    if (_email_) {
      msg.email = _email_;
    }
    const _password_ = json["password"];
    if (_password_) {
      msg.password = _password_;
    }
    return msg;
  }
};
export const AuthAuthorizeResponseJSON = {
  /**
   * Serializes AuthAuthorizeResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(AuthAuthorizeResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes AuthAuthorizeResponse from JSON.
   */
  decode: function(json) {
    return AuthAuthorizeResponseJSON._readMessage(
      AuthAuthorizeResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AuthAuthorizeResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      authToken: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.personId) {
      json["personId"] = msg.personId;
    }
    if (msg.authToken) {
      json["authToken"] = msg.authToken;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _personId_ = json["personId"] ?? json["person_id"];
    if (_personId_) {
      msg.personId = protoscript.parseNumber(_personId_);
    }
    const _authToken_ = json["authToken"] ?? json["auth_token"];
    if (_authToken_) {
      msg.authToken = _authToken_;
    }
    return msg;
  }
};
export const AuthQuickAuthorizePayloadJSON = {
  /**
   * Serializes AuthQuickAuthorizePayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(AuthQuickAuthorizePayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes AuthQuickAuthorizePayload from JSON.
   */
  decode: function(json) {
    return AuthQuickAuthorizePayloadJSON._readMessage(
      AuthQuickAuthorizePayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AuthQuickAuthorizePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      authToken: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.personId) {
      json["personId"] = msg.personId;
    }
    if (msg.authToken) {
      json["authToken"] = msg.authToken;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _personId_ = json["personId"] ?? json["person_id"];
    if (_personId_) {
      msg.personId = protoscript.parseNumber(_personId_);
    }
    const _authToken_ = json["authToken"] ?? json["auth_token"];
    if (_authToken_) {
      msg.authToken = _authToken_;
    }
    return msg;
  }
};
export const AuthQuickAuthorizeResponseJSON = {
  /**
   * Serializes AuthQuickAuthorizeResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(AuthQuickAuthorizeResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes AuthQuickAuthorizeResponse from JSON.
   */
  decode: function(json) {
    return AuthQuickAuthorizeResponseJSON._readMessage(
      AuthQuickAuthorizeResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AuthQuickAuthorizeResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      authSuccess: false,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.authSuccess) {
      json["authSuccess"] = msg.authSuccess;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _authSuccess_ = json["authSuccess"] ?? json["auth_success"];
    if (_authSuccess_) {
      msg.authSuccess = _authSuccess_;
    }
    return msg;
  }
};
export const AuthMePayloadJSON = {
  /**
   * Serializes AuthMePayload to JSON.
   */
  encode: function(_msg) {
    return "{}";
  },
  /**
   * Deserializes AuthMePayload from JSON.
   */
  decode: function(_json) {
    return {};
  },
  /**
   * Initializes AuthMePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(_msg) {
    return {};
  },
  /**
   * @private
   */
  _readMessage: function(msg, _json) {
    return msg;
  }
};
export const AuthMeResponseJSON = {
  /**
   * Serializes AuthMeResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(AuthMeResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes AuthMeResponse from JSON.
   */
  decode: function(json) {
    return AuthMeResponseJSON._readMessage(
      AuthMeResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AuthMeResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      country: "",
      city: "",
      email: "",
      phone: "",
      tenhouId: "",
      title: "",
      hasAvatar: false,
      lastUpdate: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.personId) {
      json["personId"] = msg.personId;
    }
    if (msg.country) {
      json["country"] = msg.country;
    }
    if (msg.city) {
      json["city"] = msg.city;
    }
    if (msg.email) {
      json["email"] = msg.email;
    }
    if (msg.phone) {
      json["phone"] = msg.phone;
    }
    if (msg.tenhouId) {
      json["tenhouId"] = msg.tenhouId;
    }
    if (msg.title) {
      json["title"] = msg.title;
    }
    if (msg.hasAvatar) {
      json["hasAvatar"] = msg.hasAvatar;
    }
    if (msg.lastUpdate) {
      json["lastUpdate"] = msg.lastUpdate;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _personId_ = json["personId"] ?? json["person_id"];
    if (_personId_) {
      msg.personId = protoscript.parseNumber(_personId_);
    }
    const _country_ = json["country"];
    if (_country_) {
      msg.country = _country_;
    }
    const _city_ = json["city"];
    if (_city_) {
      msg.city = _city_;
    }
    const _email_ = json["email"];
    if (_email_) {
      msg.email = _email_;
    }
    const _phone_ = json["phone"];
    if (_phone_) {
      msg.phone = _phone_;
    }
    const _tenhouId_ = json["tenhouId"] ?? json["tenhou_id"];
    if (_tenhouId_) {
      msg.tenhouId = _tenhouId_;
    }
    const _title_ = json["title"];
    if (_title_) {
      msg.title = _title_;
    }
    const _hasAvatar_ = json["hasAvatar"] ?? json["has_avatar"];
    if (_hasAvatar_) {
      msg.hasAvatar = _hasAvatar_;
    }
    const _lastUpdate_ = json["lastUpdate"] ?? json["last_update"];
    if (_lastUpdate_) {
      msg.lastUpdate = _lastUpdate_;
    }
    return msg;
  }
};
export const AuthChangePasswordPayloadJSON = {
  /**
   * Serializes AuthChangePasswordPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(AuthChangePasswordPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes AuthChangePasswordPayload from JSON.
   */
  decode: function(json) {
    return AuthChangePasswordPayloadJSON._readMessage(
      AuthChangePasswordPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AuthChangePasswordPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      email: "",
      password: "",
      newPassword: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.email) {
      json["email"] = msg.email;
    }
    if (msg.password) {
      json["password"] = msg.password;
    }
    if (msg.newPassword) {
      json["newPassword"] = msg.newPassword;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _email_ = json["email"];
    if (_email_) {
      msg.email = _email_;
    }
    const _password_ = json["password"];
    if (_password_) {
      msg.password = _password_;
    }
    const _newPassword_ = json["newPassword"] ?? json["new_password"];
    if (_newPassword_) {
      msg.newPassword = _newPassword_;
    }
    return msg;
  }
};
export const AuthChangePasswordResponseJSON = {
  /**
   * Serializes AuthChangePasswordResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(AuthChangePasswordResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes AuthChangePasswordResponse from JSON.
   */
  decode: function(json) {
    return AuthChangePasswordResponseJSON._readMessage(
      AuthChangePasswordResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AuthChangePasswordResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      authToken: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.authToken) {
      json["authToken"] = msg.authToken;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _authToken_ = json["authToken"] ?? json["auth_token"];
    if (_authToken_) {
      msg.authToken = _authToken_;
    }
    return msg;
  }
};
export const AuthRequestResetPasswordPayloadJSON = {
  /**
   * Serializes AuthRequestResetPasswordPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      AuthRequestResetPasswordPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes AuthRequestResetPasswordPayload from JSON.
   */
  decode: function(json) {
    return AuthRequestResetPasswordPayloadJSON._readMessage(
      AuthRequestResetPasswordPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AuthRequestResetPasswordPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      email: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.email) {
      json["email"] = msg.email;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _email_ = json["email"];
    if (_email_) {
      msg.email = _email_;
    }
    return msg;
  }
};
export const AuthRequestResetPasswordResponseJSON = {
  /**
   * Serializes AuthRequestResetPasswordResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      AuthRequestResetPasswordResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes AuthRequestResetPasswordResponse from JSON.
   */
  decode: function(json) {
    return AuthRequestResetPasswordResponseJSON._readMessage(
      AuthRequestResetPasswordResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AuthRequestResetPasswordResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      resetToken: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.resetToken) {
      json["resetToken"] = msg.resetToken;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _resetToken_ = json["resetToken"] ?? json["reset_token"];
    if (_resetToken_) {
      msg.resetToken = _resetToken_;
    }
    return msg;
  }
};
export const AuthApproveResetPasswordPayloadJSON = {
  /**
   * Serializes AuthApproveResetPasswordPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      AuthApproveResetPasswordPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes AuthApproveResetPasswordPayload from JSON.
   */
  decode: function(json) {
    return AuthApproveResetPasswordPayloadJSON._readMessage(
      AuthApproveResetPasswordPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AuthApproveResetPasswordPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      email: "",
      resetToken: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.email) {
      json["email"] = msg.email;
    }
    if (msg.resetToken) {
      json["resetToken"] = msg.resetToken;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _email_ = json["email"];
    if (_email_) {
      msg.email = _email_;
    }
    const _resetToken_ = json["resetToken"] ?? json["reset_token"];
    if (_resetToken_) {
      msg.resetToken = _resetToken_;
    }
    return msg;
  }
};
export const AuthApproveResetPasswordResponseJSON = {
  /**
   * Serializes AuthApproveResetPasswordResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      AuthApproveResetPasswordResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes AuthApproveResetPasswordResponse from JSON.
   */
  decode: function(json) {
    return AuthApproveResetPasswordResponseJSON._readMessage(
      AuthApproveResetPasswordResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AuthApproveResetPasswordResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      newTmpPassword: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.newTmpPassword) {
      json["newTmpPassword"] = msg.newTmpPassword;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _newTmpPassword_ = json["newTmpPassword"] ?? json["new_tmp_password"];
    if (_newTmpPassword_) {
      msg.newTmpPassword = _newTmpPassword_;
    }
    return msg;
  }
};
export const AccessGetEventAdminsPayloadJSON = {
  /**
   * Serializes AccessGetEventAdminsPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(AccessGetEventAdminsPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes AccessGetEventAdminsPayload from JSON.
   */
  decode: function(json) {
    return AccessGetEventAdminsPayloadJSON._readMessage(
      AccessGetEventAdminsPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AccessGetEventAdminsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    return msg;
  }
};
export const AccessGetEventAdminsResponseJSON = {
  /**
   * Serializes AccessGetEventAdminsResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(AccessGetEventAdminsResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes AccessGetEventAdminsResponse from JSON.
   */
  decode: function(json) {
    return AccessGetEventAdminsResponseJSON._readMessage(
      AccessGetEventAdminsResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AccessGetEventAdminsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      admins: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.admins?.length) {
      json["admins"] = msg.admins.map(protoAtoms.EventAdminJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _admins_ = json["admins"];
    if (_admins_) {
      for (const item of _admins_) {
        const m = protoAtoms.EventAdminJSON.initialize();
        protoAtoms.EventAdminJSON._readMessage(m, item);
        msg.admins.push(m);
      }
    }
    return msg;
  }
};
export const AccessGetEventRefereesPayloadJSON = {
  /**
   * Serializes AccessGetEventRefereesPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(AccessGetEventRefereesPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes AccessGetEventRefereesPayload from JSON.
   */
  decode: function(json) {
    return AccessGetEventRefereesPayloadJSON._readMessage(
      AccessGetEventRefereesPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AccessGetEventRefereesPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    return msg;
  }
};
export const AccessGetEventRefereesResponseJSON = {
  /**
   * Serializes AccessGetEventRefereesResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      AccessGetEventRefereesResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes AccessGetEventRefereesResponse from JSON.
   */
  decode: function(json) {
    return AccessGetEventRefereesResponseJSON._readMessage(
      AccessGetEventRefereesResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AccessGetEventRefereesResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      referees: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.referees?.length) {
      json["referees"] = msg.referees.map(
        protoAtoms.EventRefereeJSON._writeMessage
      );
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _referees_ = json["referees"];
    if (_referees_) {
      for (const item of _referees_) {
        const m = protoAtoms.EventRefereeJSON.initialize();
        protoAtoms.EventRefereeJSON._readMessage(m, item);
        msg.referees.push(m);
      }
    }
    return msg;
  }
};
export const AccessGetSuperadminFlagPayloadJSON = {
  /**
   * Serializes AccessGetSuperadminFlagPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      AccessGetSuperadminFlagPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes AccessGetSuperadminFlagPayload from JSON.
   */
  decode: function(json) {
    return AccessGetSuperadminFlagPayloadJSON._readMessage(
      AccessGetSuperadminFlagPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AccessGetSuperadminFlagPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.personId) {
      json["personId"] = msg.personId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _personId_ = json["personId"] ?? json["person_id"];
    if (_personId_) {
      msg.personId = protoscript.parseNumber(_personId_);
    }
    return msg;
  }
};
export const AccessGetSuperadminFlagResponseJSON = {
  /**
   * Serializes AccessGetSuperadminFlagResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      AccessGetSuperadminFlagResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes AccessGetSuperadminFlagResponse from JSON.
   */
  decode: function(json) {
    return AccessGetSuperadminFlagResponseJSON._readMessage(
      AccessGetSuperadminFlagResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AccessGetSuperadminFlagResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      isAdmin: false,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.isAdmin) {
      json["isAdmin"] = msg.isAdmin;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _isAdmin_ = json["isAdmin"] ?? json["is_admin"];
    if (_isAdmin_) {
      msg.isAdmin = _isAdmin_;
    }
    return msg;
  }
};
export const AccessGetOwnedEventIdsPayloadJSON = {
  /**
   * Serializes AccessGetOwnedEventIdsPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(AccessGetOwnedEventIdsPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes AccessGetOwnedEventIdsPayload from JSON.
   */
  decode: function(json) {
    return AccessGetOwnedEventIdsPayloadJSON._readMessage(
      AccessGetOwnedEventIdsPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AccessGetOwnedEventIdsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.personId) {
      json["personId"] = msg.personId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _personId_ = json["personId"] ?? json["person_id"];
    if (_personId_) {
      msg.personId = protoscript.parseNumber(_personId_);
    }
    return msg;
  }
};
export const AccessGetOwnedEventIdsResponseJSON = {
  /**
   * Serializes AccessGetOwnedEventIdsResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      AccessGetOwnedEventIdsResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes AccessGetOwnedEventIdsResponse from JSON.
   */
  decode: function(json) {
    return AccessGetOwnedEventIdsResponseJSON._readMessage(
      AccessGetOwnedEventIdsResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AccessGetOwnedEventIdsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventIds: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventIds?.length) {
      json["eventIds"] = msg.eventIds;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventIds_ = json["eventIds"] ?? json["event_ids"];
    if (_eventIds_) {
      msg.eventIds = _eventIds_.map(protoscript.parseNumber);
    }
    return msg;
  }
};
export const AccessAddRuleForPersonPayloadJSON = {
  /**
   * Serializes AccessAddRuleForPersonPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(AccessAddRuleForPersonPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes AccessAddRuleForPersonPayload from JSON.
   */
  decode: function(json) {
    return AccessAddRuleForPersonPayloadJSON._readMessage(
      AccessAddRuleForPersonPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AccessAddRuleForPersonPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ruleName: "",
      ruleValue: 0,
      personId: 0,
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.ruleName) {
      json["ruleName"] = msg.ruleName;
    }
    if (msg.ruleValue) {
      json["ruleValue"] = msg.ruleValue;
    }
    if (msg.personId) {
      json["personId"] = msg.personId;
    }
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _ruleName_ = json["ruleName"] ?? json["rule_name"];
    if (_ruleName_) {
      msg.ruleName = _ruleName_;
    }
    const _ruleValue_ = json["ruleValue"] ?? json["rule_value"];
    if (_ruleValue_) {
      msg.ruleValue = protoscript.parseNumber(_ruleValue_);
    }
    const _personId_ = json["personId"] ?? json["person_id"];
    if (_personId_) {
      msg.personId = protoscript.parseNumber(_personId_);
    }
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    return msg;
  }
};
export const AccessAddRuleForPersonResponseJSON = {
  /**
   * Serializes AccessAddRuleForPersonResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      AccessAddRuleForPersonResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes AccessAddRuleForPersonResponse from JSON.
   */
  decode: function(json) {
    return AccessAddRuleForPersonResponseJSON._readMessage(
      AccessAddRuleForPersonResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AccessAddRuleForPersonResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ruleId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.ruleId) {
      json["ruleId"] = msg.ruleId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _ruleId_ = json["ruleId"] ?? json["rule_id"];
    if (_ruleId_) {
      msg.ruleId = protoscript.parseNumber(_ruleId_);
    }
    return msg;
  }
};
export const AccessDeleteRuleForPersonPayloadJSON = {
  /**
   * Serializes AccessDeleteRuleForPersonPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      AccessDeleteRuleForPersonPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes AccessDeleteRuleForPersonPayload from JSON.
   */
  decode: function(json) {
    return AccessDeleteRuleForPersonPayloadJSON._readMessage(
      AccessDeleteRuleForPersonPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AccessDeleteRuleForPersonPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ruleId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.ruleId) {
      json["ruleId"] = msg.ruleId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _ruleId_ = json["ruleId"] ?? json["rule_id"];
    if (_ruleId_) {
      msg.ruleId = protoscript.parseNumber(_ruleId_);
    }
    return msg;
  }
};
export const PersonsCreateAccountPayloadJSON = {
  /**
   * Serializes PersonsCreateAccountPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PersonsCreateAccountPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes PersonsCreateAccountPayload from JSON.
   */
  decode: function(json) {
    return PersonsCreateAccountPayloadJSON._readMessage(
      PersonsCreateAccountPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonsCreateAccountPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      email: "",
      password: "",
      title: "",
      city: "",
      phone: "",
      tenhouId: "",
      country: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.email) {
      json["email"] = msg.email;
    }
    if (msg.password) {
      json["password"] = msg.password;
    }
    if (msg.title) {
      json["title"] = msg.title;
    }
    if (msg.city) {
      json["city"] = msg.city;
    }
    if (msg.phone) {
      json["phone"] = msg.phone;
    }
    if (msg.tenhouId) {
      json["tenhouId"] = msg.tenhouId;
    }
    if (msg.country) {
      json["country"] = msg.country;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _email_ = json["email"];
    if (_email_) {
      msg.email = _email_;
    }
    const _password_ = json["password"];
    if (_password_) {
      msg.password = _password_;
    }
    const _title_ = json["title"];
    if (_title_) {
      msg.title = _title_;
    }
    const _city_ = json["city"];
    if (_city_) {
      msg.city = _city_;
    }
    const _phone_ = json["phone"];
    if (_phone_) {
      msg.phone = _phone_;
    }
    const _tenhouId_ = json["tenhouId"] ?? json["tenhou_id"];
    if (_tenhouId_) {
      msg.tenhouId = _tenhouId_;
    }
    const _country_ = json["country"];
    if (_country_) {
      msg.country = _country_;
    }
    return msg;
  }
};
export const PersonsCreateAccountResponseJSON = {
  /**
   * Serializes PersonsCreateAccountResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PersonsCreateAccountResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes PersonsCreateAccountResponse from JSON.
   */
  decode: function(json) {
    return PersonsCreateAccountResponseJSON._readMessage(
      PersonsCreateAccountResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonsCreateAccountResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.personId) {
      json["personId"] = msg.personId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _personId_ = json["personId"] ?? json["person_id"];
    if (_personId_) {
      msg.personId = protoscript.parseNumber(_personId_);
    }
    return msg;
  }
};
export const PersonsUpdatePersonalInfoPayloadJSON = {
  /**
   * Serializes PersonsUpdatePersonalInfoPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      PersonsUpdatePersonalInfoPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes PersonsUpdatePersonalInfoPayload from JSON.
   */
  decode: function(json) {
    return PersonsUpdatePersonalInfoPayloadJSON._readMessage(
      PersonsUpdatePersonalInfoPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonsUpdatePersonalInfoPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      title: "",
      country: "",
      city: "",
      email: "",
      phone: "",
      tenhouId: "",
      hasAvatar: false,
      avatarData: "",
      msNickname: void 0,
      msFriendId: void 0,
      msAccountId: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.id) {
      json["id"] = msg.id;
    }
    if (msg.title) {
      json["title"] = msg.title;
    }
    if (msg.country) {
      json["country"] = msg.country;
    }
    if (msg.city) {
      json["city"] = msg.city;
    }
    if (msg.email) {
      json["email"] = msg.email;
    }
    if (msg.phone) {
      json["phone"] = msg.phone;
    }
    if (msg.tenhouId) {
      json["tenhouId"] = msg.tenhouId;
    }
    if (msg.hasAvatar) {
      json["hasAvatar"] = msg.hasAvatar;
    }
    if (msg.avatarData) {
      json["avatarData"] = msg.avatarData;
    }
    if (msg.msNickname != void 0) {
      json["msNickname"] = msg.msNickname;
    }
    if (msg.msFriendId != void 0) {
      json["msFriendId"] = msg.msFriendId;
    }
    if (msg.msAccountId != void 0) {
      json["msAccountId"] = msg.msAccountId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _id_ = json["id"];
    if (_id_) {
      msg.id = protoscript.parseNumber(_id_);
    }
    const _title_ = json["title"];
    if (_title_) {
      msg.title = _title_;
    }
    const _country_ = json["country"];
    if (_country_) {
      msg.country = _country_;
    }
    const _city_ = json["city"];
    if (_city_) {
      msg.city = _city_;
    }
    const _email_ = json["email"];
    if (_email_) {
      msg.email = _email_;
    }
    const _phone_ = json["phone"];
    if (_phone_) {
      msg.phone = _phone_;
    }
    const _tenhouId_ = json["tenhouId"] ?? json["tenhou_id"];
    if (_tenhouId_) {
      msg.tenhouId = _tenhouId_;
    }
    const _hasAvatar_ = json["hasAvatar"] ?? json["has_avatar"];
    if (_hasAvatar_) {
      msg.hasAvatar = _hasAvatar_;
    }
    const _avatarData_ = json["avatarData"] ?? json["avatar_data"];
    if (_avatarData_) {
      msg.avatarData = _avatarData_;
    }
    const _msNickname_ = json["msNickname"] ?? json["ms_nickname"];
    if (_msNickname_) {
      msg.msNickname = _msNickname_;
    }
    const _msFriendId_ = json["msFriendId"] ?? json["ms_friend_id"];
    if (_msFriendId_) {
      msg.msFriendId = protoscript.parseNumber(_msFriendId_);
    }
    const _msAccountId_ = json["msAccountId"] ?? json["ms_account_id"];
    if (_msAccountId_) {
      msg.msAccountId = protoscript.parseNumber(_msAccountId_);
    }
    return msg;
  }
};
export const PersonsGetPersonalInfoPayloadJSON = {
  /**
   * Serializes PersonsGetPersonalInfoPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PersonsGetPersonalInfoPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes PersonsGetPersonalInfoPayload from JSON.
   */
  decode: function(json) {
    return PersonsGetPersonalInfoPayloadJSON._readMessage(
      PersonsGetPersonalInfoPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonsGetPersonalInfoPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ids: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.ids?.length) {
      json["ids"] = msg.ids;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _ids_ = json["ids"];
    if (_ids_) {
      msg.ids = _ids_.map(protoscript.parseNumber);
    }
    return msg;
  }
};
export const PersonsGetPersonalInfoResponseJSON = {
  /**
   * Serializes PersonsGetPersonalInfoResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      PersonsGetPersonalInfoResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes PersonsGetPersonalInfoResponse from JSON.
   */
  decode: function(json) {
    return PersonsGetPersonalInfoResponseJSON._readMessage(
      PersonsGetPersonalInfoResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonsGetPersonalInfoResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      people: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.people?.length) {
      json["people"] = msg.people.map(protoAtoms.PersonExJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _people_ = json["people"];
    if (_people_) {
      for (const item of _people_) {
        const m = protoAtoms.PersonExJSON.initialize();
        protoAtoms.PersonExJSON._readMessage(m, item);
        msg.people.push(m);
      }
    }
    return msg;
  }
};
export const PersonsFindByTenhouIdsPayloadJSON = {
  /**
   * Serializes PersonsFindByTenhouIdsPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PersonsFindByTenhouIdsPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes PersonsFindByTenhouIdsPayload from JSON.
   */
  decode: function(json) {
    return PersonsFindByTenhouIdsPayloadJSON._readMessage(
      PersonsFindByTenhouIdsPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonsFindByTenhouIdsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ids: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.ids?.length) {
      json["ids"] = msg.ids;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _ids_ = json["ids"];
    if (_ids_) {
      msg.ids = _ids_;
    }
    return msg;
  }
};
export const PersonsFindByMajsoulIdsPayloadJSON = {
  /**
   * Serializes PersonsFindByMajsoulIdsPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      PersonsFindByMajsoulIdsPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes PersonsFindByMajsoulIdsPayload from JSON.
   */
  decode: function(json) {
    return PersonsFindByMajsoulIdsPayloadJSON._readMessage(
      PersonsFindByMajsoulIdsPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonsFindByMajsoulIdsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ids: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.ids?.length) {
      json["ids"] = msg.ids.map(protoAtoms.MajsoulSearchExJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _ids_ = json["ids"];
    if (_ids_) {
      for (const item of _ids_) {
        const m = protoAtoms.MajsoulSearchExJSON.initialize();
        protoAtoms.MajsoulSearchExJSON._readMessage(m, item);
        msg.ids.push(m);
      }
    }
    return msg;
  }
};
export const PersonsFindByTenhouIdsResponseJSON = {
  /**
   * Serializes PersonsFindByTenhouIdsResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      PersonsFindByTenhouIdsResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes PersonsFindByTenhouIdsResponse from JSON.
   */
  decode: function(json) {
    return PersonsFindByTenhouIdsResponseJSON._readMessage(
      PersonsFindByTenhouIdsResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonsFindByTenhouIdsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      people: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.people?.length) {
      json["people"] = msg.people.map(protoAtoms.PersonExJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _people_ = json["people"];
    if (_people_) {
      for (const item of _people_) {
        const m = protoAtoms.PersonExJSON.initialize();
        protoAtoms.PersonExJSON._readMessage(m, item);
        msg.people.push(m);
      }
    }
    return msg;
  }
};
export const PersonsFindByTitlePayloadJSON = {
  /**
   * Serializes PersonsFindByTitlePayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PersonsFindByTitlePayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes PersonsFindByTitlePayload from JSON.
   */
  decode: function(json) {
    return PersonsFindByTitlePayloadJSON._readMessage(
      PersonsFindByTitlePayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonsFindByTitlePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      query: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.query) {
      json["query"] = msg.query;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _query_ = json["query"];
    if (_query_) {
      msg.query = _query_;
    }
    return msg;
  }
};
export const PersonsFindByTitleResponseJSON = {
  /**
   * Serializes PersonsFindByTitleResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PersonsFindByTitleResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes PersonsFindByTitleResponse from JSON.
   */
  decode: function(json) {
    return PersonsFindByTitleResponseJSON._readMessage(
      PersonsFindByTitleResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonsFindByTitleResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      people: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.people?.length) {
      json["people"] = msg.people.map(protoAtoms.PersonJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _people_ = json["people"];
    if (_people_) {
      for (const item of _people_) {
        const m = protoAtoms.PersonJSON.initialize();
        protoAtoms.PersonJSON._readMessage(m, item);
        msg.people.push(m);
      }
    }
    return msg;
  }
};
export const DepersonalizePayloadJSON = {
  /**
   * Serializes DepersonalizePayload to JSON.
   */
  encode: function(_msg) {
    return "{}";
  },
  /**
   * Deserializes DepersonalizePayload from JSON.
   */
  decode: function(_json) {
    return {};
  },
  /**
   * Initializes DepersonalizePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(_msg) {
    return {};
  },
  /**
   * @private
   */
  _readMessage: function(msg, _json) {
    return msg;
  }
};
export const PersonsGetMajsoulNicknamesPayloadJSON = {
  /**
   * Serializes PersonsGetMajsoulNicknamesPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      PersonsGetMajsoulNicknamesPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes PersonsGetMajsoulNicknamesPayload from JSON.
   */
  decode: function(json) {
    return PersonsGetMajsoulNicknamesPayloadJSON._readMessage(
      PersonsGetMajsoulNicknamesPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonsGetMajsoulNicknamesPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ids: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.ids?.length) {
      json["ids"] = msg.ids;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _ids_ = json["ids"];
    if (_ids_) {
      msg.ids = _ids_.map(protoscript.parseNumber);
    }
    return msg;
  }
};
export const PersonsGetMajsoulNicknamesResponseJSON = {
  /**
   * Serializes PersonsGetMajsoulNicknamesResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      PersonsGetMajsoulNicknamesResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes PersonsGetMajsoulNicknamesResponse from JSON.
   */
  decode: function(json) {
    return PersonsGetMajsoulNicknamesResponseJSON._readMessage(
      PersonsGetMajsoulNicknamesResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonsGetMajsoulNicknamesResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      mapping: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.mapping?.length) {
      json["mapping"] = msg.mapping.map(
        protoAtoms.MajsoulPersonMappingJSON._writeMessage
      );
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _mapping_ = json["mapping"];
    if (_mapping_) {
      for (const item of _mapping_) {
        const m = protoAtoms.MajsoulPersonMappingJSON.initialize();
        protoAtoms.MajsoulPersonMappingJSON._readMessage(m, item);
        msg.mapping.push(m);
      }
    }
    return msg;
  }
};
export const PersonsGetNotificationsSettingsPayloadJSON = {
  /**
   * Serializes PersonsGetNotificationsSettingsPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      PersonsGetNotificationsSettingsPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes PersonsGetNotificationsSettingsPayload from JSON.
   */
  decode: function(json) {
    return PersonsGetNotificationsSettingsPayloadJSON._readMessage(
      PersonsGetNotificationsSettingsPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonsGetNotificationsSettingsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.personId) {
      json["personId"] = msg.personId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _personId_ = json["personId"] ?? json["person_id"];
    if (_personId_) {
      msg.personId = protoscript.parseNumber(_personId_);
    }
    return msg;
  }
};
export const PersonsGetNotificationsSettingsResponseJSON = {
  /**
   * Serializes PersonsGetNotificationsSettingsResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      PersonsGetNotificationsSettingsResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes PersonsGetNotificationsSettingsResponse from JSON.
   */
  decode: function(json) {
    return PersonsGetNotificationsSettingsResponseJSON._readMessage(
      PersonsGetNotificationsSettingsResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonsGetNotificationsSettingsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      telegramId: "",
      notifications: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.telegramId) {
      json["telegramId"] = msg.telegramId;
    }
    if (msg.notifications) {
      json["notifications"] = msg.notifications;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _telegramId_ = json["telegramId"] ?? json["telegram_id"];
    if (_telegramId_) {
      msg.telegramId = _telegramId_;
    }
    const _notifications_ = json["notifications"];
    if (_notifications_) {
      msg.notifications = _notifications_;
    }
    return msg;
  }
};
export const PersonsSetNotificationsSettingsPayloadJSON = {
  /**
   * Serializes PersonsSetNotificationsSettingsPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      PersonsSetNotificationsSettingsPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes PersonsSetNotificationsSettingsPayload from JSON.
   */
  decode: function(json) {
    return PersonsSetNotificationsSettingsPayloadJSON._readMessage(
      PersonsSetNotificationsSettingsPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonsSetNotificationsSettingsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      telegramId: "",
      notifications: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.personId) {
      json["personId"] = msg.personId;
    }
    if (msg.telegramId) {
      json["telegramId"] = msg.telegramId;
    }
    if (msg.notifications) {
      json["notifications"] = msg.notifications;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _personId_ = json["personId"] ?? json["person_id"];
    if (_personId_) {
      msg.personId = protoscript.parseNumber(_personId_);
    }
    const _telegramId_ = json["telegramId"] ?? json["telegram_id"];
    if (_telegramId_) {
      msg.telegramId = _telegramId_;
    }
    const _notifications_ = json["notifications"];
    if (_notifications_) {
      msg.notifications = _notifications_;
    }
    return msg;
  }
};
