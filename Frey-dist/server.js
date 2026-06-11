"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// app/server.ts
var server_exports = {};
__export(server_exports, {
  freyHandler: () => freyHandler
});
module.exports = __toCommonJS(server_exports);
var import_http = require("http");
var import_twirpscript6 = require("twirpscript");
var import_simple_node_logger = require("simple-node-logger");

// node_modules/.pnpm/tsclients@file+..+Common+tsclients_80d37d40e687b699f703f7914fcd6978/node_modules/tsclients/proto/frey.pb.ts
var protoscript2 = __toESM(require("protoscript"), 1);
var import_twirpscript = require("twirpscript");
var import_twirpscript2 = require("twirpscript");

// node_modules/.pnpm/tsclients@file+..+Common+tsclients_80d37d40e687b699f703f7914fcd6978/node_modules/tsclients/proto/atoms.pb.ts
var protoscript = __toESM(require("protoscript"), 1);
var EventAdmin = {
  /**
   * Serializes EventAdmin to protobuf.
   */
  encode: function(msg) {
    return EventAdmin._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventAdmin from protobuf.
   */
  decode: function(bytes) {
    return EventAdmin._readMessage(
      EventAdmin.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventAdmin with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ruleId: 0,
      personId: 0,
      personName: "",
      hasAvatar: false,
      lastUpdate: "",
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
    if (msg.personId) {
      writer.writeInt32(2, msg.personId);
    }
    if (msg.personName) {
      writer.writeString(3, msg.personName);
    }
    if (msg.hasAvatar) {
      writer.writeBool(4, msg.hasAvatar);
    }
    if (msg.lastUpdate) {
      writer.writeString(5, msg.lastUpdate);
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
        case 2: {
          msg.personId = reader.readInt32();
          break;
        }
        case 3: {
          msg.personName = reader.readString();
          break;
        }
        case 4: {
          msg.hasAvatar = reader.readBool();
          break;
        }
        case 5: {
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
var EventReferee = {
  /**
   * Serializes EventReferee to protobuf.
   */
  encode: function(msg) {
    return EventReferee._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventReferee from protobuf.
   */
  decode: function(bytes) {
    return EventReferee._readMessage(
      EventReferee.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventReferee with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ruleId: 0,
      personId: 0,
      personName: "",
      hasAvatar: false,
      lastUpdate: "",
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
    if (msg.personId) {
      writer.writeInt32(2, msg.personId);
    }
    if (msg.personName) {
      writer.writeString(3, msg.personName);
    }
    if (msg.hasAvatar) {
      writer.writeBool(4, msg.hasAvatar);
    }
    if (msg.lastUpdate) {
      writer.writeString(5, msg.lastUpdate);
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
        case 2: {
          msg.personId = reader.readInt32();
          break;
        }
        case 3: {
          msg.personName = reader.readString();
          break;
        }
        case 4: {
          msg.hasAvatar = reader.readBool();
          break;
        }
        case 5: {
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
var Person = {
  /**
   * Serializes Person to protobuf.
   */
  encode: function(msg) {
    return Person._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes Person from protobuf.
   */
  decode: function(bytes) {
    return Person._readMessage(
      Person.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes Person with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      city: "",
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
    if (msg.id) {
      writer.writeInt32(1, msg.id);
    }
    if (msg.city) {
      writer.writeString(2, msg.city);
    }
    if (msg.tenhouId) {
      writer.writeString(3, msg.tenhouId);
    }
    if (msg.title) {
      writer.writeString(4, msg.title);
    }
    if (msg.hasAvatar) {
      writer.writeBool(5, msg.hasAvatar);
    }
    if (msg.lastUpdate) {
      writer.writeString(6, msg.lastUpdate);
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
          msg.city = reader.readString();
          break;
        }
        case 3: {
          msg.tenhouId = reader.readString();
          break;
        }
        case 4: {
          msg.title = reader.readString();
          break;
        }
        case 5: {
          msg.hasAvatar = reader.readBool();
          break;
        }
        case 6: {
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
var PersonEx = {
  /**
   * Serializes PersonEx to protobuf.
   */
  encode: function(msg) {
    return PersonEx._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonEx from protobuf.
   */
  decode: function(bytes) {
    return PersonEx._readMessage(
      PersonEx.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PersonEx with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      city: "",
      tenhouId: "",
      title: "",
      country: "",
      email: "",
      phone: "",
      hasAvatar: false,
      lastUpdate: "",
      msNickname: "",
      msAccountId: 0,
      telegramId: "",
      notifications: "",
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
    if (msg.city) {
      writer.writeString(2, msg.city);
    }
    if (msg.tenhouId) {
      writer.writeString(3, msg.tenhouId);
    }
    if (msg.title) {
      writer.writeString(4, msg.title);
    }
    if (msg.country) {
      writer.writeString(5, msg.country);
    }
    if (msg.email) {
      writer.writeString(6, msg.email);
    }
    if (msg.phone) {
      writer.writeString(7, msg.phone);
    }
    if (msg.hasAvatar) {
      writer.writeBool(9, msg.hasAvatar);
    }
    if (msg.lastUpdate) {
      writer.writeString(10, msg.lastUpdate);
    }
    if (msg.msNickname) {
      writer.writeString(11, msg.msNickname);
    }
    if (msg.msAccountId) {
      writer.writeInt32(12, msg.msAccountId);
    }
    if (msg.telegramId) {
      writer.writeString(13, msg.telegramId);
    }
    if (msg.notifications) {
      writer.writeString(14, msg.notifications);
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
          msg.city = reader.readString();
          break;
        }
        case 3: {
          msg.tenhouId = reader.readString();
          break;
        }
        case 4: {
          msg.title = reader.readString();
          break;
        }
        case 5: {
          msg.country = reader.readString();
          break;
        }
        case 6: {
          msg.email = reader.readString();
          break;
        }
        case 7: {
          msg.phone = reader.readString();
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
        case 11: {
          msg.msNickname = reader.readString();
          break;
        }
        case 12: {
          msg.msAccountId = reader.readInt32();
          break;
        }
        case 13: {
          msg.telegramId = reader.readString();
          break;
        }
        case 14: {
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
var MajsoulSearchEx = {
  /**
   * Serializes MajsoulSearchEx to protobuf.
   */
  encode: function(msg) {
    return MajsoulSearchEx._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes MajsoulSearchEx from protobuf.
   */
  decode: function(bytes) {
    return MajsoulSearchEx._readMessage(
      MajsoulSearchEx.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes MajsoulSearchEx with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      nickname: "",
      accountId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.nickname) {
      writer.writeString(1, msg.nickname);
    }
    if (msg.accountId) {
      writer.writeInt32(2, msg.accountId);
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
          msg.nickname = reader.readString();
          break;
        }
        case 2: {
          msg.accountId = reader.readInt32();
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
var MajsoulPersonMapping = {
  /**
   * Serializes MajsoulPersonMapping to protobuf.
   */
  encode: function(msg) {
    return MajsoulPersonMapping._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes MajsoulPersonMapping from protobuf.
   */
  decode: function(bytes) {
    return MajsoulPersonMapping._readMessage(
      MajsoulPersonMapping.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes MajsoulPersonMapping with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      nickname: "",
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
    if (msg.nickname) {
      writer.writeString(2, msg.nickname);
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
          msg.nickname = reader.readString();
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
var GenericSuccessResponse = {
  /**
   * Serializes GenericSuccessResponse to protobuf.
   */
  encode: function(msg) {
    return GenericSuccessResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GenericSuccessResponse from protobuf.
   */
  decode: function(bytes) {
    return GenericSuccessResponse._readMessage(
      GenericSuccessResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GenericSuccessResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      success: false,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.success) {
      writer.writeBool(1, msg.success);
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
          msg.success = reader.readBool();
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
var EventAdminJSON = {
  /**
   * Serializes EventAdmin to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventAdminJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventAdmin from JSON.
   */
  decode: function(json) {
    return EventAdminJSON._readMessage(
      EventAdminJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventAdmin with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ruleId: 0,
      personId: 0,
      personName: "",
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
    if (msg.ruleId) {
      json["ruleId"] = msg.ruleId;
    }
    if (msg.personId) {
      json["personId"] = msg.personId;
    }
    if (msg.personName) {
      json["personName"] = msg.personName;
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
    const _ruleId_ = json["ruleId"] ?? json["rule_id"];
    if (_ruleId_) {
      msg.ruleId = protoscript.parseNumber(_ruleId_);
    }
    const _personId_ = json["personId"] ?? json["person_id"];
    if (_personId_) {
      msg.personId = protoscript.parseNumber(_personId_);
    }
    const _personName_ = json["personName"] ?? json["person_name"];
    if (_personName_) {
      msg.personName = _personName_;
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
var EventRefereeJSON = {
  /**
   * Serializes EventReferee to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventRefereeJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventReferee from JSON.
   */
  decode: function(json) {
    return EventRefereeJSON._readMessage(
      EventRefereeJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventReferee with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ruleId: 0,
      personId: 0,
      personName: "",
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
    if (msg.ruleId) {
      json["ruleId"] = msg.ruleId;
    }
    if (msg.personId) {
      json["personId"] = msg.personId;
    }
    if (msg.personName) {
      json["personName"] = msg.personName;
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
    const _ruleId_ = json["ruleId"] ?? json["rule_id"];
    if (_ruleId_) {
      msg.ruleId = protoscript.parseNumber(_ruleId_);
    }
    const _personId_ = json["personId"] ?? json["person_id"];
    if (_personId_) {
      msg.personId = protoscript.parseNumber(_personId_);
    }
    const _personName_ = json["personName"] ?? json["person_name"];
    if (_personName_) {
      msg.personName = _personName_;
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
var PersonJSON = {
  /**
   * Serializes Person to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PersonJSON._writeMessage(msg));
  },
  /**
   * Deserializes Person from JSON.
   */
  decode: function(json) {
    return PersonJSON._readMessage(PersonJSON.initialize(), JSON.parse(json));
  },
  /**
   * Initializes Person with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      city: "",
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
    if (msg.id) {
      json["id"] = msg.id;
    }
    if (msg.city) {
      json["city"] = msg.city;
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
    const _id_ = json["id"];
    if (_id_) {
      msg.id = protoscript.parseNumber(_id_);
    }
    const _city_ = json["city"];
    if (_city_) {
      msg.city = _city_;
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
var PersonExJSON = {
  /**
   * Serializes PersonEx to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PersonExJSON._writeMessage(msg));
  },
  /**
   * Deserializes PersonEx from JSON.
   */
  decode: function(json) {
    return PersonExJSON._readMessage(
      PersonExJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PersonEx with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      city: "",
      tenhouId: "",
      title: "",
      country: "",
      email: "",
      phone: "",
      hasAvatar: false,
      lastUpdate: "",
      msNickname: "",
      msAccountId: 0,
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
    if (msg.id) {
      json["id"] = msg.id;
    }
    if (msg.city) {
      json["city"] = msg.city;
    }
    if (msg.tenhouId) {
      json["tenhouId"] = msg.tenhouId;
    }
    if (msg.title) {
      json["title"] = msg.title;
    }
    if (msg.country) {
      json["country"] = msg.country;
    }
    if (msg.email) {
      json["email"] = msg.email;
    }
    if (msg.phone) {
      json["phone"] = msg.phone;
    }
    if (msg.hasAvatar) {
      json["hasAvatar"] = msg.hasAvatar;
    }
    if (msg.lastUpdate) {
      json["lastUpdate"] = msg.lastUpdate;
    }
    if (msg.msNickname) {
      json["msNickname"] = msg.msNickname;
    }
    if (msg.msAccountId) {
      json["msAccountId"] = msg.msAccountId;
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
    const _id_ = json["id"];
    if (_id_) {
      msg.id = protoscript.parseNumber(_id_);
    }
    const _city_ = json["city"];
    if (_city_) {
      msg.city = _city_;
    }
    const _tenhouId_ = json["tenhouId"] ?? json["tenhou_id"];
    if (_tenhouId_) {
      msg.tenhouId = _tenhouId_;
    }
    const _title_ = json["title"];
    if (_title_) {
      msg.title = _title_;
    }
    const _country_ = json["country"];
    if (_country_) {
      msg.country = _country_;
    }
    const _email_ = json["email"];
    if (_email_) {
      msg.email = _email_;
    }
    const _phone_ = json["phone"];
    if (_phone_) {
      msg.phone = _phone_;
    }
    const _hasAvatar_ = json["hasAvatar"] ?? json["has_avatar"];
    if (_hasAvatar_) {
      msg.hasAvatar = _hasAvatar_;
    }
    const _lastUpdate_ = json["lastUpdate"] ?? json["last_update"];
    if (_lastUpdate_) {
      msg.lastUpdate = _lastUpdate_;
    }
    const _msNickname_ = json["msNickname"] ?? json["ms_nickname"];
    if (_msNickname_) {
      msg.msNickname = _msNickname_;
    }
    const _msAccountId_ = json["msAccountId"] ?? json["ms_account_id"];
    if (_msAccountId_) {
      msg.msAccountId = protoscript.parseNumber(_msAccountId_);
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
var MajsoulSearchExJSON = {
  /**
   * Serializes MajsoulSearchEx to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(MajsoulSearchExJSON._writeMessage(msg));
  },
  /**
   * Deserializes MajsoulSearchEx from JSON.
   */
  decode: function(json) {
    return MajsoulSearchExJSON._readMessage(
      MajsoulSearchExJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes MajsoulSearchEx with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      nickname: "",
      accountId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.nickname) {
      json["nickname"] = msg.nickname;
    }
    if (msg.accountId) {
      json["accountId"] = msg.accountId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _nickname_ = json["nickname"];
    if (_nickname_) {
      msg.nickname = _nickname_;
    }
    const _accountId_ = json["accountId"] ?? json["account_id"];
    if (_accountId_) {
      msg.accountId = protoscript.parseNumber(_accountId_);
    }
    return msg;
  }
};
var MajsoulPersonMappingJSON = {
  /**
   * Serializes MajsoulPersonMapping to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(MajsoulPersonMappingJSON._writeMessage(msg));
  },
  /**
   * Deserializes MajsoulPersonMapping from JSON.
   */
  decode: function(json) {
    return MajsoulPersonMappingJSON._readMessage(
      MajsoulPersonMappingJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes MajsoulPersonMapping with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      personId: 0,
      nickname: "",
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
    if (msg.nickname) {
      json["nickname"] = msg.nickname;
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
    const _nickname_ = json["nickname"];
    if (_nickname_) {
      msg.nickname = _nickname_;
    }
    return msg;
  }
};
var GenericSuccessResponseJSON = {
  /**
   * Serializes GenericSuccessResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GenericSuccessResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes GenericSuccessResponse from JSON.
   */
  decode: function(json) {
    return GenericSuccessResponseJSON._readMessage(
      GenericSuccessResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GenericSuccessResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      success: false,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.success) {
      json["success"] = msg.success;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _success_ = json["success"];
    if (_success_) {
      msg.success = _success_;
    }
    return msg;
  }
};

// node_modules/.pnpm/tsclients@file+..+Common+tsclients_80d37d40e687b699f703f7914fcd6978/node_modules/tsclients/proto/frey.pb.ts
function createFrey(service) {
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
          protobuf: GenericSuccessResponse,
          json: GenericSuccessResponseJSON
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
          protobuf: GenericSuccessResponse,
          json: GenericSuccessResponseJSON
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
          protobuf: GenericSuccessResponse,
          json: GenericSuccessResponseJSON
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
          protobuf: GenericSuccessResponse,
          json: GenericSuccessResponseJSON
        }
      }
    }
  };
}
var AuthRequestRegistrationPayload = {
  /**
   * Serializes AuthRequestRegistrationPayload to protobuf.
   */
  encode: function(msg) {
    return AuthRequestRegistrationPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthRequestRegistrationPayload from protobuf.
   */
  decode: function(bytes) {
    return AuthRequestRegistrationPayload._readMessage(
      AuthRequestRegistrationPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AuthRequestRegistrationResponse = {
  /**
   * Serializes AuthRequestRegistrationResponse to protobuf.
   */
  encode: function(msg) {
    return AuthRequestRegistrationResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthRequestRegistrationResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthRequestRegistrationResponse._readMessage(
      AuthRequestRegistrationResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AuthApproveRegistrationPayload = {
  /**
   * Serializes AuthApproveRegistrationPayload to protobuf.
   */
  encode: function(msg) {
    return AuthApproveRegistrationPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthApproveRegistrationPayload from protobuf.
   */
  decode: function(bytes) {
    return AuthApproveRegistrationPayload._readMessage(
      AuthApproveRegistrationPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AuthApproveRegistrationResponse = {
  /**
   * Serializes AuthApproveRegistrationResponse to protobuf.
   */
  encode: function(msg) {
    return AuthApproveRegistrationResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthApproveRegistrationResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthApproveRegistrationResponse._readMessage(
      AuthApproveRegistrationResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AuthAuthorizePayload = {
  /**
   * Serializes AuthAuthorizePayload to protobuf.
   */
  encode: function(msg) {
    return AuthAuthorizePayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthAuthorizePayload from protobuf.
   */
  decode: function(bytes) {
    return AuthAuthorizePayload._readMessage(
      AuthAuthorizePayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AuthAuthorizeResponse = {
  /**
   * Serializes AuthAuthorizeResponse to protobuf.
   */
  encode: function(msg) {
    return AuthAuthorizeResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthAuthorizeResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthAuthorizeResponse._readMessage(
      AuthAuthorizeResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AuthQuickAuthorizePayload = {
  /**
   * Serializes AuthQuickAuthorizePayload to protobuf.
   */
  encode: function(msg) {
    return AuthQuickAuthorizePayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthQuickAuthorizePayload from protobuf.
   */
  decode: function(bytes) {
    return AuthQuickAuthorizePayload._readMessage(
      AuthQuickAuthorizePayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AuthQuickAuthorizeResponse = {
  /**
   * Serializes AuthQuickAuthorizeResponse to protobuf.
   */
  encode: function(msg) {
    return AuthQuickAuthorizeResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthQuickAuthorizeResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthQuickAuthorizeResponse._readMessage(
      AuthQuickAuthorizeResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AuthMePayload = {
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
var AuthMeResponse = {
  /**
   * Serializes AuthMeResponse to protobuf.
   */
  encode: function(msg) {
    return AuthMeResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthMeResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthMeResponse._readMessage(
      AuthMeResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AuthChangePasswordPayload = {
  /**
   * Serializes AuthChangePasswordPayload to protobuf.
   */
  encode: function(msg) {
    return AuthChangePasswordPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthChangePasswordPayload from protobuf.
   */
  decode: function(bytes) {
    return AuthChangePasswordPayload._readMessage(
      AuthChangePasswordPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AuthChangePasswordResponse = {
  /**
   * Serializes AuthChangePasswordResponse to protobuf.
   */
  encode: function(msg) {
    return AuthChangePasswordResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthChangePasswordResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthChangePasswordResponse._readMessage(
      AuthChangePasswordResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AuthRequestResetPasswordPayload = {
  /**
   * Serializes AuthRequestResetPasswordPayload to protobuf.
   */
  encode: function(msg) {
    return AuthRequestResetPasswordPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthRequestResetPasswordPayload from protobuf.
   */
  decode: function(bytes) {
    return AuthRequestResetPasswordPayload._readMessage(
      AuthRequestResetPasswordPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AuthRequestResetPasswordResponse = {
  /**
   * Serializes AuthRequestResetPasswordResponse to protobuf.
   */
  encode: function(msg) {
    return AuthRequestResetPasswordResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthRequestResetPasswordResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthRequestResetPasswordResponse._readMessage(
      AuthRequestResetPasswordResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AuthApproveResetPasswordPayload = {
  /**
   * Serializes AuthApproveResetPasswordPayload to protobuf.
   */
  encode: function(msg) {
    return AuthApproveResetPasswordPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthApproveResetPasswordPayload from protobuf.
   */
  decode: function(bytes) {
    return AuthApproveResetPasswordPayload._readMessage(
      AuthApproveResetPasswordPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AuthApproveResetPasswordResponse = {
  /**
   * Serializes AuthApproveResetPasswordResponse to protobuf.
   */
  encode: function(msg) {
    return AuthApproveResetPasswordResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AuthApproveResetPasswordResponse from protobuf.
   */
  decode: function(bytes) {
    return AuthApproveResetPasswordResponse._readMessage(
      AuthApproveResetPasswordResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AccessGetEventAdminsPayload = {
  /**
   * Serializes AccessGetEventAdminsPayload to protobuf.
   */
  encode: function(msg) {
    return AccessGetEventAdminsPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetEventAdminsPayload from protobuf.
   */
  decode: function(bytes) {
    return AccessGetEventAdminsPayload._readMessage(
      AccessGetEventAdminsPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AccessGetEventAdminsResponse = {
  /**
   * Serializes AccessGetEventAdminsResponse to protobuf.
   */
  encode: function(msg) {
    return AccessGetEventAdminsResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetEventAdminsResponse from protobuf.
   */
  decode: function(bytes) {
    return AccessGetEventAdminsResponse._readMessage(
      AccessGetEventAdminsResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
        EventAdmin._writeMessage
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
          const m = EventAdmin.initialize();
          reader.readMessage(m, EventAdmin._readMessage);
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
var AccessGetEventRefereesPayload = {
  /**
   * Serializes AccessGetEventRefereesPayload to protobuf.
   */
  encode: function(msg) {
    return AccessGetEventRefereesPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetEventRefereesPayload from protobuf.
   */
  decode: function(bytes) {
    return AccessGetEventRefereesPayload._readMessage(
      AccessGetEventRefereesPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AccessGetEventRefereesResponse = {
  /**
   * Serializes AccessGetEventRefereesResponse to protobuf.
   */
  encode: function(msg) {
    return AccessGetEventRefereesResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetEventRefereesResponse from protobuf.
   */
  decode: function(bytes) {
    return AccessGetEventRefereesResponse._readMessage(
      AccessGetEventRefereesResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
        EventReferee._writeMessage
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
          const m = EventReferee.initialize();
          reader.readMessage(m, EventReferee._readMessage);
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
var AccessGetSuperadminFlagPayload = {
  /**
   * Serializes AccessGetSuperadminFlagPayload to protobuf.
   */
  encode: function(msg) {
    return AccessGetSuperadminFlagPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetSuperadminFlagPayload from protobuf.
   */
  decode: function(bytes) {
    return AccessGetSuperadminFlagPayload._readMessage(
      AccessGetSuperadminFlagPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AccessGetSuperadminFlagResponse = {
  /**
   * Serializes AccessGetSuperadminFlagResponse to protobuf.
   */
  encode: function(msg) {
    return AccessGetSuperadminFlagResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetSuperadminFlagResponse from protobuf.
   */
  decode: function(bytes) {
    return AccessGetSuperadminFlagResponse._readMessage(
      AccessGetSuperadminFlagResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AccessGetOwnedEventIdsPayload = {
  /**
   * Serializes AccessGetOwnedEventIdsPayload to protobuf.
   */
  encode: function(msg) {
    return AccessGetOwnedEventIdsPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetOwnedEventIdsPayload from protobuf.
   */
  decode: function(bytes) {
    return AccessGetOwnedEventIdsPayload._readMessage(
      AccessGetOwnedEventIdsPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AccessGetOwnedEventIdsResponse = {
  /**
   * Serializes AccessGetOwnedEventIdsResponse to protobuf.
   */
  encode: function(msg) {
    return AccessGetOwnedEventIdsResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetOwnedEventIdsResponse from protobuf.
   */
  decode: function(bytes) {
    return AccessGetOwnedEventIdsResponse._readMessage(
      AccessGetOwnedEventIdsResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AccessAddRuleForPersonPayload = {
  /**
   * Serializes AccessAddRuleForPersonPayload to protobuf.
   */
  encode: function(msg) {
    return AccessAddRuleForPersonPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessAddRuleForPersonPayload from protobuf.
   */
  decode: function(bytes) {
    return AccessAddRuleForPersonPayload._readMessage(
      AccessAddRuleForPersonPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AccessAddRuleForPersonResponse = {
  /**
   * Serializes AccessAddRuleForPersonResponse to protobuf.
   */
  encode: function(msg) {
    return AccessAddRuleForPersonResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessAddRuleForPersonResponse from protobuf.
   */
  decode: function(bytes) {
    return AccessAddRuleForPersonResponse._readMessage(
      AccessAddRuleForPersonResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AccessDeleteRuleForPersonPayload = {
  /**
   * Serializes AccessDeleteRuleForPersonPayload to protobuf.
   */
  encode: function(msg) {
    return AccessDeleteRuleForPersonPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessDeleteRuleForPersonPayload from protobuf.
   */
  decode: function(bytes) {
    return AccessDeleteRuleForPersonPayload._readMessage(
      AccessDeleteRuleForPersonPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var PersonsCreateAccountPayload = {
  /**
   * Serializes PersonsCreateAccountPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsCreateAccountPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsCreateAccountPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsCreateAccountPayload._readMessage(
      PersonsCreateAccountPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var PersonsCreateAccountResponse = {
  /**
   * Serializes PersonsCreateAccountResponse to protobuf.
   */
  encode: function(msg) {
    return PersonsCreateAccountResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsCreateAccountResponse from protobuf.
   */
  decode: function(bytes) {
    return PersonsCreateAccountResponse._readMessage(
      PersonsCreateAccountResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var PersonsUpdatePersonalInfoPayload = {
  /**
   * Serializes PersonsUpdatePersonalInfoPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsUpdatePersonalInfoPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsUpdatePersonalInfoPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsUpdatePersonalInfoPayload._readMessage(
      PersonsUpdatePersonalInfoPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var PersonsGetPersonalInfoPayload = {
  /**
   * Serializes PersonsGetPersonalInfoPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsGetPersonalInfoPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsGetPersonalInfoPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsGetPersonalInfoPayload._readMessage(
      PersonsGetPersonalInfoPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var PersonsGetPersonalInfoResponse = {
  /**
   * Serializes PersonsGetPersonalInfoResponse to protobuf.
   */
  encode: function(msg) {
    return PersonsGetPersonalInfoResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsGetPersonalInfoResponse from protobuf.
   */
  decode: function(bytes) {
    return PersonsGetPersonalInfoResponse._readMessage(
      PersonsGetPersonalInfoResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
        PersonEx._writeMessage
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
          const m = PersonEx.initialize();
          reader.readMessage(m, PersonEx._readMessage);
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
var PersonsFindByTenhouIdsPayload = {
  /**
   * Serializes PersonsFindByTenhouIdsPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsFindByTenhouIdsPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsFindByTenhouIdsPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsFindByTenhouIdsPayload._readMessage(
      PersonsFindByTenhouIdsPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var PersonsFindByMajsoulIdsPayload = {
  /**
   * Serializes PersonsFindByMajsoulIdsPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsFindByMajsoulIdsPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsFindByMajsoulIdsPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsFindByMajsoulIdsPayload._readMessage(
      PersonsFindByMajsoulIdsPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
        MajsoulSearchEx._writeMessage
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
          const m = MajsoulSearchEx.initialize();
          reader.readMessage(m, MajsoulSearchEx._readMessage);
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
var PersonsFindByTenhouIdsResponse = {
  /**
   * Serializes PersonsFindByTenhouIdsResponse to protobuf.
   */
  encode: function(msg) {
    return PersonsFindByTenhouIdsResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsFindByTenhouIdsResponse from protobuf.
   */
  decode: function(bytes) {
    return PersonsFindByTenhouIdsResponse._readMessage(
      PersonsFindByTenhouIdsResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
        PersonEx._writeMessage
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
          const m = PersonEx.initialize();
          reader.readMessage(m, PersonEx._readMessage);
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
var PersonsFindByTitlePayload = {
  /**
   * Serializes PersonsFindByTitlePayload to protobuf.
   */
  encode: function(msg) {
    return PersonsFindByTitlePayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsFindByTitlePayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsFindByTitlePayload._readMessage(
      PersonsFindByTitlePayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var PersonsFindByTitleResponse = {
  /**
   * Serializes PersonsFindByTitleResponse to protobuf.
   */
  encode: function(msg) {
    return PersonsFindByTitleResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsFindByTitleResponse from protobuf.
   */
  decode: function(bytes) {
    return PersonsFindByTitleResponse._readMessage(
      PersonsFindByTitleResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
        Person._writeMessage
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
          const m = Person.initialize();
          reader.readMessage(m, Person._readMessage);
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
var DepersonalizePayload = {
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
var PersonsGetMajsoulNicknamesPayload = {
  /**
   * Serializes PersonsGetMajsoulNicknamesPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsGetMajsoulNicknamesPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsGetMajsoulNicknamesPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsGetMajsoulNicknamesPayload._readMessage(
      PersonsGetMajsoulNicknamesPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var PersonsGetMajsoulNicknamesResponse = {
  /**
   * Serializes PersonsGetMajsoulNicknamesResponse to protobuf.
   */
  encode: function(msg) {
    return PersonsGetMajsoulNicknamesResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsGetMajsoulNicknamesResponse from protobuf.
   */
  decode: function(bytes) {
    return PersonsGetMajsoulNicknamesResponse._readMessage(
      PersonsGetMajsoulNicknamesResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
        MajsoulPersonMapping._writeMessage
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
          const m = MajsoulPersonMapping.initialize();
          reader.readMessage(m, MajsoulPersonMapping._readMessage);
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
var PersonsGetNotificationsSettingsPayload = {
  /**
   * Serializes PersonsGetNotificationsSettingsPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsGetNotificationsSettingsPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsGetNotificationsSettingsPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsGetNotificationsSettingsPayload._readMessage(
      PersonsGetNotificationsSettingsPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var PersonsGetNotificationsSettingsResponse = {
  /**
   * Serializes PersonsGetNotificationsSettingsResponse to protobuf.
   */
  encode: function(msg) {
    return PersonsGetNotificationsSettingsResponse._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsGetNotificationsSettingsResponse from protobuf.
   */
  decode: function(bytes) {
    return PersonsGetNotificationsSettingsResponse._readMessage(
      PersonsGetNotificationsSettingsResponse.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var PersonsSetNotificationsSettingsPayload = {
  /**
   * Serializes PersonsSetNotificationsSettingsPayload to protobuf.
   */
  encode: function(msg) {
    return PersonsSetNotificationsSettingsPayload._writeMessage(
      msg,
      new protoscript2.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PersonsSetNotificationsSettingsPayload from protobuf.
   */
  decode: function(bytes) {
    return PersonsSetNotificationsSettingsPayload._readMessage(
      PersonsSetNotificationsSettingsPayload.initialize(),
      new protoscript2.BinaryReader(bytes)
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
var AuthRequestRegistrationPayloadJSON = {
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
var AuthRequestRegistrationResponseJSON = {
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
var AuthApproveRegistrationPayloadJSON = {
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
var AuthApproveRegistrationResponseJSON = {
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
      msg.personId = protoscript2.parseNumber(_personId_);
    }
    return msg;
  }
};
var AuthAuthorizePayloadJSON = {
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
var AuthAuthorizeResponseJSON = {
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
      msg.personId = protoscript2.parseNumber(_personId_);
    }
    const _authToken_ = json["authToken"] ?? json["auth_token"];
    if (_authToken_) {
      msg.authToken = _authToken_;
    }
    return msg;
  }
};
var AuthQuickAuthorizePayloadJSON = {
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
      msg.personId = protoscript2.parseNumber(_personId_);
    }
    const _authToken_ = json["authToken"] ?? json["auth_token"];
    if (_authToken_) {
      msg.authToken = _authToken_;
    }
    return msg;
  }
};
var AuthQuickAuthorizeResponseJSON = {
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
var AuthMePayloadJSON = {
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
var AuthMeResponseJSON = {
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
      msg.personId = protoscript2.parseNumber(_personId_);
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
var AuthChangePasswordPayloadJSON = {
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
var AuthChangePasswordResponseJSON = {
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
var AuthRequestResetPasswordPayloadJSON = {
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
var AuthRequestResetPasswordResponseJSON = {
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
var AuthApproveResetPasswordPayloadJSON = {
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
var AuthApproveResetPasswordResponseJSON = {
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
var AccessGetEventAdminsPayloadJSON = {
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
      msg.eventId = protoscript2.parseNumber(_eventId_);
    }
    return msg;
  }
};
var AccessGetEventAdminsResponseJSON = {
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
      json["admins"] = msg.admins.map(EventAdminJSON._writeMessage);
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
        const m = EventAdminJSON.initialize();
        EventAdminJSON._readMessage(m, item);
        msg.admins.push(m);
      }
    }
    return msg;
  }
};
var AccessGetEventRefereesPayloadJSON = {
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
      msg.eventId = protoscript2.parseNumber(_eventId_);
    }
    return msg;
  }
};
var AccessGetEventRefereesResponseJSON = {
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
        EventRefereeJSON._writeMessage
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
        const m = EventRefereeJSON.initialize();
        EventRefereeJSON._readMessage(m, item);
        msg.referees.push(m);
      }
    }
    return msg;
  }
};
var AccessGetSuperadminFlagPayloadJSON = {
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
      msg.personId = protoscript2.parseNumber(_personId_);
    }
    return msg;
  }
};
var AccessGetSuperadminFlagResponseJSON = {
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
var AccessGetOwnedEventIdsPayloadJSON = {
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
      msg.personId = protoscript2.parseNumber(_personId_);
    }
    return msg;
  }
};
var AccessGetOwnedEventIdsResponseJSON = {
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
      msg.eventIds = _eventIds_.map(protoscript2.parseNumber);
    }
    return msg;
  }
};
var AccessAddRuleForPersonPayloadJSON = {
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
      msg.ruleValue = protoscript2.parseNumber(_ruleValue_);
    }
    const _personId_ = json["personId"] ?? json["person_id"];
    if (_personId_) {
      msg.personId = protoscript2.parseNumber(_personId_);
    }
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript2.parseNumber(_eventId_);
    }
    return msg;
  }
};
var AccessAddRuleForPersonResponseJSON = {
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
      msg.ruleId = protoscript2.parseNumber(_ruleId_);
    }
    return msg;
  }
};
var AccessDeleteRuleForPersonPayloadJSON = {
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
      msg.ruleId = protoscript2.parseNumber(_ruleId_);
    }
    return msg;
  }
};
var PersonsCreateAccountPayloadJSON = {
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
var PersonsCreateAccountResponseJSON = {
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
      msg.personId = protoscript2.parseNumber(_personId_);
    }
    return msg;
  }
};
var PersonsUpdatePersonalInfoPayloadJSON = {
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
      msg.id = protoscript2.parseNumber(_id_);
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
      msg.msFriendId = protoscript2.parseNumber(_msFriendId_);
    }
    const _msAccountId_ = json["msAccountId"] ?? json["ms_account_id"];
    if (_msAccountId_) {
      msg.msAccountId = protoscript2.parseNumber(_msAccountId_);
    }
    return msg;
  }
};
var PersonsGetPersonalInfoPayloadJSON = {
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
      msg.ids = _ids_.map(protoscript2.parseNumber);
    }
    return msg;
  }
};
var PersonsGetPersonalInfoResponseJSON = {
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
      json["people"] = msg.people.map(PersonExJSON._writeMessage);
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
        const m = PersonExJSON.initialize();
        PersonExJSON._readMessage(m, item);
        msg.people.push(m);
      }
    }
    return msg;
  }
};
var PersonsFindByTenhouIdsPayloadJSON = {
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
var PersonsFindByMajsoulIdsPayloadJSON = {
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
      json["ids"] = msg.ids.map(MajsoulSearchExJSON._writeMessage);
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
        const m = MajsoulSearchExJSON.initialize();
        MajsoulSearchExJSON._readMessage(m, item);
        msg.ids.push(m);
      }
    }
    return msg;
  }
};
var PersonsFindByTenhouIdsResponseJSON = {
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
      json["people"] = msg.people.map(PersonExJSON._writeMessage);
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
        const m = PersonExJSON.initialize();
        PersonExJSON._readMessage(m, item);
        msg.people.push(m);
      }
    }
    return msg;
  }
};
var PersonsFindByTitlePayloadJSON = {
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
var PersonsFindByTitleResponseJSON = {
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
      json["people"] = msg.people.map(PersonJSON._writeMessage);
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
        const m = PersonJSON.initialize();
        PersonJSON._readMessage(m, item);
        msg.people.push(m);
      }
    }
    return msg;
  }
};
var DepersonalizePayloadJSON = {
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
var PersonsGetMajsoulNicknamesPayloadJSON = {
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
      msg.ids = _ids_.map(protoscript2.parseNumber);
    }
    return msg;
  }
};
var PersonsGetMajsoulNicknamesResponseJSON = {
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
        MajsoulPersonMappingJSON._writeMessage
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
        const m = MajsoulPersonMappingJSON.initialize();
        MajsoulPersonMappingJSON._readMessage(m, item);
        msg.mapping.push(m);
      }
    }
    return msg;
  }
};
var PersonsGetNotificationsSettingsPayloadJSON = {
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
      msg.personId = protoscript2.parseNumber(_personId_);
    }
    return msg;
  }
};
var PersonsGetNotificationsSettingsResponseJSON = {
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
var PersonsSetNotificationsSettingsPayloadJSON = {
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
      msg.personId = protoscript2.parseNumber(_personId_);
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

// app/helpers/cache/schema.ts
var getSuperadminCacheKey = (personId) => `frey:superadmin:${personId}`;
var getPersonalInfoCacheKey = (personId) => `frey:personal_info:${personId}`;
var getNotificationSettingsCacheKey = (personId) => `frey:notification_settings:${personId}`;

// app/helpers/errors.ts
var import_twirpscript3 = require("twirpscript");
var NotFoundError = class extends import_twirpscript3.TwirpError {
  constructor(message) {
    super({
      code: "not_found",
      msg: message
    });
  }
};
var DataMalformedError = class extends import_twirpscript3.TwirpError {
  constructor(message) {
    super({
      code: "malformed",
      msg: message
    });
  }
};
var ExistsError = class extends import_twirpscript3.TwirpError {
  constructor(message) {
    super({
      code: "already_exists",
      msg: message
    });
  }
};
var ActionNotAllowedError = class extends import_twirpscript3.TwirpError {
  constructor(message) {
    super({
      code: "permission_denied",
      msg: message
    });
  }
};
var InvalidInputError = class extends import_twirpscript3.TwirpError {
  constructor(message) {
    super({
      code: "invalid_argument",
      msg: message
    });
  }
};
function wrapErrorObject(e) {
  if (e instanceof import_twirpscript3.TwirpError) {
    return e;
  }
  return new import_twirpscript3.TwirpError({
    msg: e.message,
    code: "internal",
    meta: { originalError: e.message + e.stack }
  });
}
async function wrapError(promise) {
  try {
    return await promise;
  } catch (e) {
    throw wrapErrorObject(e);
  }
}

// app/helpers/auth.ts
var import_bcrypt = __toESM(require("bcrypt"));

// app/helpers/crypto.ts
var import_crypto = require("crypto");
function sha384(input) {
  return (0, import_crypto.createHash)("sha3-384").update(input).digest("hex");
}
function md5(input) {
  return (0, import_crypto.createHash)("md5").update(input).digest("hex");
}
function sha1(input) {
  return (0, import_crypto.createHash)("sha1").update(input).digest("hex");
}
function base64encode(input) {
  return Buffer.from(input, "utf8").toString("base64");
}
function chunks(input, size = 76) {
  const c = [];
  let strIndex = 0;
  for (let nextIndex = 0; strIndex < input.length; nextIndex++) {
    c[nextIndex] = input.slice(strIndex, strIndex += size);
  }
  return c;
}
function calcPasswordStrength(password) {
  const hasLatinSymbols = password.match(/[a-z]/);
  const hasUppercaseLatinSymbols = password.match(/[A-Z]/);
  const hasDigits = password.match(/[0-9]/);
  const hasPunctuation = password.match(/[-@#$%^&*(),\.\/\\"']/);
  const hasOtherSymbols = password.replace(/[-a-z0-9@#$%^&*(),\./\\"']/g, "").length > 0;
  return Math.ceil(password.length / 2) * (hasDigits ? 2 : 1) * (hasUppercaseLatinSymbols ? 2 : 1) * (hasPunctuation ? 2 : 1) * (hasOtherSymbols ? 2 : 1) * (hasLatinSymbols ? 2 : 1);
}

// app/helpers/auth.ts
var makeClientHash = (password, salt) => {
  return sha384(password + salt);
};
var verifyHash = async (clientHash, authHash) => {
  authHash = authHash.replace("$2y$", "$2a$");
  return new Promise((resolve, reject) => {
    import_bcrypt.default.compare(clientHash, authHash, function(_, res) {
      if (res) {
        resolve();
      } else {
        reject(new InvalidInputError("Password check failed"));
      }
    });
  });
};
var makeHashes = async (password) => {
  const salt = (/* @__PURE__ */ new Date()).getUTCMilliseconds().toString();
  const saltHashed = sha1(salt);
  const clientHash = makeClientHash(password, saltHashed);
  return import_bcrypt.default.hash(clientHash, 2).then((hash) => {
    return { hash, salt: saltHashed, clientHash };
  });
};

// app/models/access.ts
async function addRuleForPerson(db, redisClient, context, payload) {
  const eventAdmins = await getEventAdmins(db, { eventId: payload.eventId });
  const isSuperadmin = context.personId && (await getSuperadminFlag(db, redisClient, { personId: context.personId })).isAdmin;
  const isEventAdmin = context.personId && eventAdmins.admins.filter((admin) => admin.personId === context.personId).length > 0;
  const regData = await db.selectFrom("person").where("id", "=", context.personId).selectAll().execute();
  if (regData.length === 0) {
    throw new NotFoundError("Person is not known ot the system");
  }
  await verifyHash(context.authToken ?? "", regData[0].auth_hash);
  if (payload.ruleName === "ADMIN_EVENT" /* ADMIN_EVENT */ && context.personId !== null && payload.eventId !== -1) {
    if (context.personId === payload.personId) {
      if (eventAdmins.admins.length > 0) {
        throw new ActionNotAllowedError(
          "You are not allowed to add yourself to administrators in this event"
        );
      }
    } else {
      if (!isEventAdmin && !isSuperadmin) {
        throw new ActionNotAllowedError("You are not allowed to add administrators in this event");
      }
    }
  } else if (payload.ruleName === "REFEREE_FOR_EVENT" /* REFEREE_FOR_EVENT */) {
    if (!isEventAdmin && !isSuperadmin) {
      throw new ActionNotAllowedError("You are not allowed to add referees in this event");
    }
  } else {
    if (!isSuperadmin) {
      throw new ActionNotAllowedError("Unknown rule to add");
    }
  }
  const existingRules = await db.selectFrom("person_access").selectAll().where(
    (qb) => qb.and([qb("event_id", "=", payload.eventId), qb("person_id", "=", payload.personId)])
  ).execute();
  if (existingRules.filter((rule) => rule.acl_name === payload.ruleName).length > 0) {
    throw new ExistsError("This rule already exists");
  }
  const value = {
    acl_name: payload.ruleName,
    acl_value: payload.ruleValue,
    event_id: payload.eventId,
    person_id: payload.personId
  };
  const result = await db.insertInto("person_access").values(value).returning("id").execute();
  return { ruleId: result[0].id };
}
async function deleteRuleForPerson(db, redisClient, context, payload) {
  const rule = await db.selectFrom("person_access").selectAll().where("id", "=", payload.ruleId).execute();
  if (rule.length === 0) {
    throw new NotFoundError("Rule does not exist");
  }
  const eventAdmins = rule[0].event_id === -1 ? { admins: [] } : await getEventAdmins(db, { eventId: rule[0].event_id });
  const isSuperadmin = context.personId && (await getSuperadminFlag(db, redisClient, { personId: context.personId })).isAdmin;
  const isEventAdmin = context.personId && eventAdmins.admins.filter((admin) => admin.personId === context.personId).length > 0;
  const regData = await db.selectFrom("person").where("id", "=", context.personId).selectAll().execute();
  if (regData.length === 0) {
    throw new NotFoundError("Person is not known ot the system");
  }
  await verifyHash(context.authToken ?? "", regData[0].auth_hash);
  if (rule[0].acl_name === "ADMIN_EVENT" /* ADMIN_EVENT */ && context.personId !== null && rule[0].event_id !== -1) {
    if (context.personId === rule[0].person_id) {
      throw new ActionNotAllowedError(
        "You are not allowed to remove yourself from administrators in this event"
      );
    } else {
      if (!isEventAdmin && !isSuperadmin) {
        throw new ActionNotAllowedError(
          "You are not allowed to remove administrators from this event"
        );
      }
    }
  } else if (rule[0].acl_name === "REFEREE_FOR_EVENT" /* REFEREE_FOR_EVENT */) {
    if (!isEventAdmin && !isSuperadmin) {
      throw new ActionNotAllowedError("You are not allowed to remove referees from this event");
    }
  } else {
    if (!isSuperadmin) {
      throw new ActionNotAllowedError("Unknown rule to remove");
    }
  }
  await db.deleteFrom("person_access").where("id", "=", payload.ruleId).execute();
  return { success: true };
}
async function getSuperadminFlag(db, redisClient, payload) {
  const cached = await redisClient.get(
    getSuperadminCacheKey(payload.personId),
    null
  );
  if (cached !== null) {
    return { isAdmin: cached };
  }
  const result = await db.selectFrom("person").where("id", "=", payload.personId).select(["is_superadmin", "auth_hash"]).execute();
  const response = result.length > 0 && !!result[0].is_superadmin;
  if (result.length > 0) {
    await redisClient.set(getSuperadminCacheKey(payload.personId), response);
  }
  return { isAdmin: response };
}
async function getEventAdmins(db, payload) {
  const result = await db.selectFrom("person_access").leftJoin("person", "person.id", "person_access.person_id").where(
    (qb) => qb.and([
      qb("event_id", "=", payload.eventId),
      qb("acl_name", "=", "ADMIN_EVENT" /* ADMIN_EVENT */),
      qb("acl_value", "=", 1)
    ])
  ).selectAll("person_access").select(["person.last_update", "person.has_avatar", "person.title"]).execute();
  return {
    admins: result.map((r) => ({
      ruleId: r.id ?? 0,
      personId: r.person_id,
      personName: r.title ?? "",
      lastUpdate: (r.last_update ? new Date(r.last_update) : /* @__PURE__ */ new Date()).toISOString(),
      hasAvatar: r.has_avatar === 1
    }))
  };
}
async function getEventReferees(db, payload) {
  const result = await db.selectFrom("person_access").leftJoin("person", "person.id", "person_access.person_id").where(
    (qb) => qb.and([
      qb("event_id", "=", payload.eventId),
      qb("acl_name", "=", "REFEREE_FOR_EVENT" /* REFEREE_FOR_EVENT */),
      qb("acl_value", "=", 1)
    ])
  ).selectAll().execute();
  return {
    referees: result.map((r) => ({
      ruleId: r.id ?? 0,
      personId: r.person_id,
      personName: r.title ?? "",
      lastUpdate: (r.last_update ? new Date(r.last_update) : /* @__PURE__ */ new Date()).toISOString(),
      hasAvatar: r.has_avatar === 1
    }))
  };
}
async function getOwnedEventIds(db, redisClient, context, accessGetOwnedEventIdsPayload) {
  const isSuperAdmin = (await getSuperadminFlag(db, redisClient, {
    personId: context.personId ?? 0
  })).isAdmin;
  const result = isSuperAdmin ? await db.selectFrom("person_access").select("event_id").distinct().execute() : await db.selectFrom("person_access").where(
    (qb) => qb.and([
      qb("person_id", "=", accessGetOwnedEventIdsPayload.personId),
      qb("acl_name", "in", ["ADMIN_EVENT" /* ADMIN_EVENT */, "REFEREE_FOR_EVENT" /* REFEREE_FOR_EVENT */]),
      qb("acl_value", "=", 1)
    ])
  ).select("event_id").execute();
  const isNumber = (n) => typeof n === "number";
  return {
    eventIds: result.map((e) => e.event_id).filter(isNumber)
  };
}

// app/helpers/email.ts
var emailRe = /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/;

// app/helpers/mailer.ts
var import_uuid = require("uuid");

// app/helpers/env.ts
var import_dotenv = __toESM(require("dotenv"));
var development = process.env.NODE_ENV !== "production";
var data = import_dotenv.default.config({
  path: development ? ".env.development" : ".env.production"
})?.parsed ?? {};
process.env.TZ = data.TZ ?? "UTC";
var env = {
  development,
  port: parseInt(process.env.PORT ?? data.PORT ?? "4004"),
  db: {
    host: process.env.DB_FREY_HOST ?? data.DB_FREY_HOST ?? "db.pantheon.internal",
    username: process.env.DB_FREY_USER ?? data.DB_FREY_USER ?? "frey2",
    password: process.env.DB_FREY_PASSWORD ?? data.DB_FREY_PASSWORD ?? "pgpass",
    dbname: process.env.DB_FREY_NAME ?? data.DB_FREY_NAME ?? "frey2",
    port: parseInt(data.DB_FREY_PORT ?? "5432")
  },
  redis: {
    host: data.DB_FREY_REDIS_HOST ?? "redis.pantheon.internal",
    port: parseInt(data.DB_FREY_REDIS_PORT ?? "6379"),
    username: data.DB_FREY_REDIS_USER ?? "redis",
    password: data.DB_FREY_REDIS_PASSWORD ?? "redispass"
  },
  mailer: {
    remoteUrl: data.HERMOD_URL_INTERNAL ?? "hermod.pantheon.internal",
    remoteActionKey: data.MAIL_ACTION_KEY,
    mailerAddr: "noreply@" + (data.ALLOWED_SENDER_DOMAINS ?? "pantheon.local"),
    guiUrl: data.FORSETI_URL
  },
  cookieDomain: data.COOKIE_DOMAIN,
  gullveigUrl: data.GULLVEIG_URL_INTERNAL,
  mimirUrl: process.env.MIMIR_URL_INTERNAL ?? data.MIMIR_URL_INTERNAL,
  huginUrl: process.env.HUGIN_URL_INTERNAL ?? data.HUGIN_URL_INTERNAL,
  forsetiUrl: process.env.FORSETI_URL ?? data.FORSETI_URL,
  userinfoHook: data.USERINFO_HOOK ?? null,
  userinfoHookApiKey: data.USERINFO_HOOK_API_KEY ?? "",
  internalQuerySecret: process.env.INTERNAL_QUERY_SECRET ?? data.INTERNAL_QUERY_SECRET ?? ""
};
console.log("[Frey] Running with env", env);

// app/helpers/mailer.ts
async function _send(to, subject, message, headers, additionalParams) {
  const boundary = md5((0, import_uuid.v4)() + Date.now().toString());
  const additionalHeaders = {
    ...headers,
    "Content-Type": 'multipart/alternative; boundary="' + boundary + '"'
  };
  const content = message.replace(/https:\/\/(\S+)/gi, '<a href="$&">$&</a>').replaceAll("\n", "<br />");
  const htmlContent = `<html><head><meta charset='UTF-8'><title>${subject}</title></head><body>${content}</body></html>`;
  const chunkedContent = chunks(base64encode(message));
  const chunkedHtmlContent = chunks(base64encode(htmlContent));
  const subj = "=?utf-8?B?" + base64encode(subject) + "?=";
  const body = `--${boundary}\r
Content-Type: text/plain; charset=UTF-8\r
Content-Transfer-Encoding: base64\r
\r
` + chunkedContent.join("\n") + `\r
--${boundary}\r
Content-Type: text/html; charset=UTF-8\r
Content-Transfer-Encoding: base64\r
\r
` + chunkedHtmlContent.join("\n") + `\r
--${boundary}--`;
  return fetch(env.mailer.remoteUrl, {
    method: "POST",
    body: new URLSearchParams({
      actionkey: env.mailer.remoteActionKey ?? "",
      data: base64encode(JSON.stringify([to, subj, body, additionalHeaders, additionalParams]))
    })
  }).catch((err) => {
    console.error(err);
    throw err;
  });
}
async function sendAlreadyRegisteredMail(signupEmail) {
  return _send(
    signupEmail,
    "Pantheon: your email is already registered",
    `Hello!

  You (or someone else) had just attempted to register an email that we already have in our database.

  If it was you, please login to the system instead. You can use password recovery if you can't remember your password.

  If it wasn't you, you may safely ignore this message.

  Sincerely yours,
  Pantheon support team
  `,
    {
      "MIME-Version": "1.0",
      "List-Unsubscribe": env.mailer.mailerAddr,
      "X-Mailer": "PantheonNotifier/2.0"
    },
    '-F "Pantheon mail service" -f ' + env.mailer.mailerAddr
  );
}
async function sendSignupMail(signupEmail, regLink) {
  return _send(
    signupEmail,
    "Pantheon: confirm your registration",
    `Hello!

  You have just registered your account in the Pantheon system,
  please follow next link to confirm your registration:

  ${env.mailer.guiUrl + regLink}

  If you didn't attempt to register, you can safely ignore this message.

  Sincerely yours,
  Pantheon support team
  `,
    {
      "MIME-Version": "1.0",
      "List-Unsubscribe": env.mailer.mailerAddr,
      "X-Mailer": "PantheonNotifier/2.0"
    },
    '-F "Pantheon mail service" -f ' + env.mailer.mailerAddr
  );
}
async function sendPasswordRecovery(approvalToken, emailSanitized) {
  const link = env.mailer.guiUrl + "/profile/resetPasswordConfirm/" + base64encode(approvalToken + "@@@" + emailSanitized);
  const message = `Hello!

  You have just requested password recovery for your account
in the Pantheon system. Please follow next link to reset your password:

  ${link}

  If you didn't attempt to recover password, you can safely ignore this message.

  Sincerely yours,
  Pantheon support team
  `;
  return _send(
    emailSanitized,
    "Pantheon: password recovery request",
    message,
    {
      "MIME-Version": "1.0",
      "List-Unsubscribe": env.mailer.mailerAddr,
      "X-Mailer": "PantheonNotifier/2.0"
    },
    '-F "Pantheon mail service" -f ' + env.mailer.mailerAddr
  );
}

// app/helpers/cache/personalData.ts
var getCachedPersonalData = async (db, redisClient, id) => {
  const cached = await redisClient.get(getPersonalInfoCacheKey(id), null);
  if (cached !== null) {
    return cached;
  }
  const data2 = await db.selectFrom("person").leftJoin("majsoul_platform_account", "majsoul_platform_account.person_id", "person.id").where("person.id", "=", id).selectAll("person").select([
    "majsoul_platform_account.person_id",
    "majsoul_platform_account.account_id",
    "majsoul_platform_account.friend_id",
    "majsoul_platform_account.nickname"
  ]).execute();
  await redisClient.set(getPersonalInfoCacheKey(id), data2);
  return data2;
};

// app/models/auth.ts
async function authorize(db, payload) {
  const personData = await db.selectFrom("person").where("email", "=", payload.email).select(["auth_salt", "auth_hash", "id"]).execute();
  if (personData.length === 0) {
    throw new NotFoundError("Person not found in database");
  }
  const authToken = makeClientHash(payload.password, personData[0].auth_salt);
  await verifyHash(authToken, personData[0].auth_hash);
  await db.updateTable("person").set({ last_login: (/* @__PURE__ */ new Date()).toISOString() }).where("id", "=", personData[0].id).execute();
  return { personId: personData[0].id, authToken };
}
async function approveRegistration(db, payload) {
  const regData = await db.selectFrom("registrant").where("approval_code", "=", payload.approvalCode).selectAll().execute();
  if (regData.length === 0) {
    throw new InvalidInputError("Approval code is invalid");
  }
  const personData = await db.selectFrom("person").where("email", "=", regData[0].email).select(["id"]).execute();
  if (personData.length > 0) {
    throw new ExistsError("Email is already registered");
  }
  const ret = await db.insertInto("person").values({
    email: regData[0].email,
    auth_salt: regData[0].auth_salt,
    auth_hash: regData[0].auth_hash,
    title: regData[0].title,
    disabled: 0,
    country: ""
  }).returning("id").execute();
  await db.deleteFrom("registrant").where("approval_code", "=", payload.approvalCode).execute();
  return { personId: ret[0].id };
}
async function approveResetPassword(db, redisClient, payload) {
  const regData = await db.selectFrom("person").where("email", "=", payload.email).selectAll().execute();
  if (regData.length === 0) {
    throw new NotFoundError("Email is not known to the system");
  }
  if (payload.resetToken === "" || regData[0].auth_reset_token !== payload.resetToken) {
    throw new InvalidInputError("Password reset approval code is incorrect.");
  }
  const newPassword = sha1(payload.email + Date.now().toString()).slice(0, 8);
  const tokens = await makeHashes(newPassword);
  const promises = [];
  promises.push(
    db.updateTable("person").set({
      email: regData[0].email,
      auth_salt: tokens.salt,
      auth_hash: tokens.hash
    }).where("id", "=", regData[0].id).execute()
  );
  promises.push(redisClient.remove(getPersonalInfoCacheKey(regData[0].id)));
  await Promise.all(promises);
  return { newTmpPassword: newPassword };
}
async function changePassword(db, redisClient, payload) {
  const regData = await db.selectFrom("person").where("email", "=", payload.email).selectAll().execute();
  if (regData.length === 0) {
    throw new NotFoundError("Email is not known to the system");
  }
  await verifyHash(makeClientHash(payload.password, regData[0].auth_salt), regData[0].auth_hash);
  if (calcPasswordStrength(payload.newPassword) < 14) {
    throw new InvalidInputError("Password is too weak");
  }
  const tokens = await makeHashes(payload.newPassword);
  const promises = [];
  promises.push(
    db.updateTable("person").set({
      email: regData[0].email,
      auth_salt: tokens.salt,
      auth_hash: tokens.hash
    }).where("id", "=", regData[0].id).execute()
  );
  promises.push(redisClient.remove(getPersonalInfoCacheKey(regData[0].id)));
  await Promise.all(promises);
  return { authToken: tokens.clientHash };
}
async function me(db, redisClient, context) {
  if (!context.personId || !context.authToken) {
    throw new ActionNotAllowedError("Should be logged in to use this function");
  }
  const data2 = await getCachedPersonalData(db, redisClient, context.personId);
  if (data2.length === 0) {
    throw new NotFoundError("Person is not known to the system");
  }
  const [personData] = data2;
  await verifyHash(context.authToken, personData.auth_hash);
  return {
    personId: context.personId,
    country: personData.country,
    city: personData.city ?? "",
    email: personData.email,
    phone: personData.phone ?? "",
    tenhouId: personData.tenhou_id ?? "",
    title: personData.title,
    hasAvatar: !!personData.has_avatar,
    lastUpdate: personData.last_update ?? ""
  };
}
async function quickAuthorize(db, redisClient, payload) {
  const personData = await getCachedPersonalData(db, redisClient, payload.personId);
  if (personData.length === 0) {
    throw new NotFoundError("Person is not known to the system");
  }
  await verifyHash(payload.authToken, personData[0].auth_hash);
  if (!personData[0].last_login || (/* @__PURE__ */ new Date()).getTime() - new Date(personData[0].last_login).getTime() > 1e3 * 60 * 60 * 24) {
    await db.updateTable("person").set({ last_login: (/* @__PURE__ */ new Date()).toISOString() }).where("id", "=", personData[0].id).execute();
  }
  return { authSuccess: true };
}
async function requestRegistration(db, payload) {
  if (!emailRe.test(payload.email)) {
    throw new DataMalformedError("Email address is malformed");
  }
  if (calcPasswordStrength(payload.password) < 14) {
    throw new InvalidInputError("Password is too weak");
  }
  const alreadyRegistered = (await db.selectFrom("person").where("email", "=", payload.email).select("id").execute()).length > 0;
  if (alreadyRegistered) {
    if (env.development) {
      throw new ExistsError("Already registered");
    } else {
      await sendAlreadyRegisteredMail(payload.email);
      return { approvalCode: "" };
    }
  }
  const tokens = await makeHashes(payload.password);
  const approvalCode = sha1(payload.email + Date.now().toString());
  await db.insertInto("registrant").values({
    email: payload.email,
    auth_salt: tokens.salt,
    auth_hash: tokens.hash,
    title: payload.title,
    approval_code: approvalCode
  }).execute();
  if (!env.development) {
    await sendSignupMail(payload.email, "/profile/confirm/" + approvalCode);
    return { approvalCode: "" };
  }
  return { approvalCode };
}
async function requestResetPassword(db, redisClient, payload) {
  const result = await db.selectFrom("person").where("email", "=", payload.email).select("id").execute();
  if (result.length === 0) {
    throw new NotFoundError("Email in not known to auth system");
  }
  const token = sha1(payload.email + Date.now().toString());
  const promises = [];
  promises.push(
    db.updateTable("person").set({ auth_reset_token: token }).where("id", "=", result[0].id).execute()
  );
  promises.push(redisClient.remove(getPersonalInfoCacheKey(result[0].id)));
  if (!env.development) {
    promises.push(sendPasswordRecovery(token, payload.email));
    await Promise.all(promises);
    return { resetToken: "" };
  }
  await Promise.all(promises);
  return { resetToken: token };
}

// app/models/persons.ts
var import_promises = require("fs/promises");
var import_kysely = require("kysely");

// node_modules/.pnpm/tsclients@file+..+Common+tsclients_80d37d40e687b699f703f7914fcd6978/node_modules/tsclients/proto/mimir.pb.ts
var protoscript3 = __toESM(require("protoscript"), 1);
var import_twirpscript4 = require("twirpscript");
var import_twirpscript5 = require("twirpscript");
async function ClearStatCache(clearStatCachePayload, config) {
  const response = await (0, import_twirpscript4.PBrequest)(
    "/common.Mimir/ClearStatCache",
    ClearStatCachePayload.encode(clearStatCachePayload),
    config
  );
  return GenericSuccessResponse.decode(response);
}
var ClearStatCachePayload = {
  /**
   * Serializes ClearStatCachePayload to protobuf.
   */
  encode: function(msg) {
    return ClearStatCachePayload._writeMessage(
      msg,
      new protoscript3.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes ClearStatCachePayload from protobuf.
   */
  decode: function(bytes) {
    return ClearStatCachePayload._readMessage(
      ClearStatCachePayload.initialize(),
      new protoscript3.BinaryReader(bytes)
    );
  },
  /**
   * Initializes ClearStatCachePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.playerId) {
      writer.writeInt32(1, msg.playerId);
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
          msg.playerId = reader.readInt32();
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

// app/helpers/mimir.ts
async function clearStatCache(personId) {
  if (process.env.NODE_ENV !== "test") {
    await ClearStatCache({ playerId: personId }, { baseURL: env.mimirUrl, prefix: "/v2" });
  }
}

// app/models/persons.ts
async function createAccount(db, redisClient, personsCreateAccountPayload, context) {
  if (personsCreateAccountPayload.email.length === 0 || personsCreateAccountPayload.title.length === 0 || personsCreateAccountPayload.password.length === 0) {
    throw new DataMalformedError("Some of required field are empty");
  }
  if (!emailRe.test(personsCreateAccountPayload.email)) {
    throw new DataMalformedError("Email address is malformed");
  }
  if (!context.isInternalQuery && (!context.personId || !(await getSuperadminFlag(db, redisClient, { personId: context.personId })).isAdmin)) {
    throw new ActionNotAllowedError("This action is not allowed");
  }
  const duplicates = await db.selectFrom("person").where("email", "=", personsCreateAccountPayload.email).select(({ fn }) => fn.count("id").as("count")).execute();
  if (Number(duplicates[0].count) > 0) {
    throw new ExistsError("This account is already registered");
  }
  const hashes = await makeHashes(personsCreateAccountPayload.password);
  const value = {
    auth_hash: hashes.hash,
    auth_salt: hashes.salt,
    city: personsCreateAccountPayload.city,
    country: personsCreateAccountPayload.country,
    disabled: 0,
    last_update: (/* @__PURE__ */ new Date()).toISOString(),
    email: personsCreateAccountPayload.email,
    phone: personsCreateAccountPayload.phone,
    tenhou_id: personsCreateAccountPayload.tenhouId,
    title: personsCreateAccountPayload.title
  };
  const result = await db.insertInto("person").values(value).returning("id").execute();
  if (env.development) {
    await (0, import_promises.writeFile)(
      "/tmp/dump_users.txt",
      "==> User created: " + JSON.stringify(
        {
          id: result[0].id,
          email: personsCreateAccountPayload.email,
          impersonateUrl: `${env.forsetiUrl}/profile/impersonate/${result[0].id}/${hashes.clientHash}`
        },
        void 0,
        "  "
      ),
      { flag: "a+" }
    );
    if (context.isInternalQuery) {
      await (0, import_promises.writeFile)(
        "/tmp/admin_creds.json",
        JSON.stringify({ id: Number(result[0].id), hash: hashes.clientHash })
      );
    }
  }
  return { personId: Number(result[0].id) };
}
async function depersonalizeAccount(db, redisClient, context) {
  if (context.personId === null || context.authToken === null) {
    throw new ActionNotAllowedError("Should be logged in to depersonalize");
  }
  const result = await db.selectFrom("person").where("id", "=", context.personId).selectAll().execute();
  if (result.length === 0) {
    throw new NotFoundError("Person not found in database");
  }
  await verifyHash(context.authToken, result[0].auth_hash);
  const city = "";
  const country = "";
  const title = "[Deleted account #" + context.personId + "]";
  const tenhouId = "";
  const phone = "";
  const promises = [];
  if (env.userinfoHook) {
    promises.push(
      fetch(env.userinfoHook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": env.userinfoHookApiKey
        },
        body: JSON.stringify({
          city,
          country,
          title,
          person_id: context.personId,
          tenhou_id: tenhouId
        })
      })
    );
  }
  if (env.gullveigUrl) {
    promises.push(
      fetch(env.gullveigUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: context.personId,
          avatar: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
          // empty image
        })
      })
    );
  }
  promises.push(clearStatCache(context.personId));
  promises.push(
    db.updateTable("person").set({
      country,
      city,
      title,
      tenhou_id: "",
      phone,
      has_avatar: 0,
      telegram_id: "",
      auth_hash: "",
      auth_salt: "",
      auth_reset_token: ""
    }).where("id", "=", context.personId).execute()
  );
  promises.push(redisClient.remove(getPersonalInfoCacheKey(context.personId)));
  await Promise.all(promises);
  return { success: true };
}
async function findByMajsoulAccountId(db, payload, context) {
  const soulAccounts = await db.selectFrom("majsoul_platform_account").where(
    "nickname",
    "in",
    payload.ids.map((i) => i.nickname)
  ).selectAll().execute();
  const accById = soulAccounts.reduce(
    (acc, r) => {
      acc[r.person_id] = r;
      return acc;
    },
    {}
  );
  const [persons, currentPerson, rights] = await Promise.all([
    db.selectFrom("person").where(
      "id",
      "in",
      soulAccounts.map((r) => r.person_id)
    ).selectAll().execute(),
    db.selectFrom("person").where("id", "=", context.personId).selectAll().execute(),
    db.selectFrom("person_access").where("person_id", "=", context.personId).selectAll().execute()
  ]);
  let withPrivateData = false;
  if (currentPerson[0]?.is_superadmin || rights.filter((e) => e.acl_name === "GET_PERSONAL_INFO_WITH_PRIVATE_DATA" /* GET_PERSONAL_INFO_WITH_PRIVATE_DATA */).length > 0) {
    await verifyHash(context.authToken ?? "", currentPerson[0]?.auth_hash);
    withPrivateData = true;
  }
  return {
    people: persons.map((r) => ({
      id: r.id,
      city: r.city ?? "",
      tenhouId: r.tenhou_id ?? "",
      title: r.title,
      country: r.country,
      email: withPrivateData ? r.email : "",
      phone: withPrivateData ? r.phone ?? "" : "",
      hasAvatar: r.has_avatar === 1,
      lastUpdate: (r.last_update ? new Date(r.last_update) : /* @__PURE__ */ new Date()).toISOString(),
      msNickname: accById[r.id].nickname,
      msAccountId: accById[r.id].account_id,
      telegramId: r.telegram_id ?? "",
      notifications: r.notifications ?? ""
    }))
  };
}
async function findByTenhouIds(db, payload, context) {
  const [persons, currentPerson, rights] = await Promise.all([
    db.selectFrom("person").leftJoin("majsoul_platform_account", "majsoul_platform_account.person_id", "person.id").where("person.tenhou_id", "in", payload.ids).selectAll("person").select([
      "majsoul_platform_account.person_id",
      "majsoul_platform_account.account_id",
      "majsoul_platform_account.friend_id",
      "majsoul_platform_account.nickname"
    ]).execute(),
    db.selectFrom("person").where("id", "=", context.personId).selectAll().execute(),
    db.selectFrom("person_access").where("person_id", "=", context.personId).selectAll().execute()
  ]);
  let withPrivateData = false;
  if (currentPerson[0]?.is_superadmin || rights.filter((e) => e.acl_name === "GET_PERSONAL_INFO_WITH_PRIVATE_DATA" /* GET_PERSONAL_INFO_WITH_PRIVATE_DATA */).length > 0) {
    await verifyHash(context.authToken ?? "", currentPerson[0]?.auth_hash);
    withPrivateData = true;
  }
  return {
    people: persons.map((r) => ({
      id: r.id ?? 0,
      city: r.city ?? "",
      tenhouId: r.tenhou_id ?? "",
      title: r.title,
      country: r.country,
      email: withPrivateData ? r.email : "",
      phone: withPrivateData ? r.phone ?? "" : "",
      hasAvatar: r.has_avatar === 1,
      lastUpdate: (r.last_update ? new Date(r.last_update) : /* @__PURE__ */ new Date()).toISOString(),
      msNickname: r.nickname ?? "",
      msAccountId: r.account_id ?? 0,
      telegramId: r.telegram_id ?? "",
      notifications: r.notifications ?? ""
    }))
  };
}
async function findByTitle(db, payload) {
  const persons = await db.selectFrom("person").selectAll().where(
    (eb) => eb(
      import_kysely.sql`to_tsvector('simple', coalesce(title, ''))`,
      "@@",
      import_kysely.sql`to_tsquery('simple', ${eb.val(
        payload.query.split(" ").map((w) => w + ":*").join(" & ")
      )})`
    )
  ).selectAll().limit(10).execute();
  return {
    people: persons.map((r) => ({
      id: r.id ?? 0,
      city: r.city ?? "",
      tenhouId: r.tenhou_id ?? "",
      title: r.title,
      hasAvatar: r.has_avatar === 1,
      lastUpdate: (r.last_update ? new Date(r.last_update) : /* @__PURE__ */ new Date()).toISOString()
    }))
  };
}
async function getMajsoulNicknames(db, payload) {
  const result = await db.selectFrom("majsoul_platform_account").where("person_id", "in", payload.ids).select(["nickname", "person_id"]).execute();
  return {
    mapping: result.map((item) => ({
      personId: item.person_id,
      nickname: item.nickname
    }))
  };
}
async function getNotificationsSettings(db, redisClient, payload) {
  let data2 = await redisClient.get(
    getNotificationSettingsCacheKey(payload.personId),
    null
  );
  if (data2 === null) {
    const result = await db.selectFrom("person").where("id", "=", payload.personId).selectAll().execute();
    data2 = {
      telegramId: result[0].telegram_id ?? "",
      notifications: result[0].notifications ?? ""
    };
    await redisClient.set(getNotificationSettingsCacheKey(payload.personId), data2);
  }
  return data2;
}
async function getPersonData(db, redisClient, ids) {
  if (ids.length === 1) {
    return getCachedPersonalData(db, redisClient, ids[0]);
  }
  return db.selectFrom("person").leftJoin("majsoul_platform_account", "majsoul_platform_account.person_id", "person.id").where("person.id", "in", ids).selectAll("person").select([
    "majsoul_platform_account.person_id",
    "majsoul_platform_account.account_id",
    "majsoul_platform_account.friend_id",
    "majsoul_platform_account.nickname"
  ]).execute();
}
async function getPersonalInfo(db, redisClient, payload, context) {
  const [data2, currentPersonData, rights] = await Promise.all([
    getPersonData(db, redisClient, payload.ids),
    getCachedPersonalData(db, redisClient, context.personId ?? 0),
    db.selectFrom("person_access").where("person_id", "=", context.personId).selectAll().execute()
  ]);
  let withPrivateData = false;
  if (currentPersonData[0]?.is_superadmin || rights.filter((e) => e.acl_name === "GET_PERSONAL_INFO_WITH_PRIVATE_DATA" /* GET_PERSONAL_INFO_WITH_PRIVATE_DATA */).length > 0) {
    await verifyHash(context.authToken ?? "", currentPersonData[0]?.auth_hash);
    withPrivateData = true;
  }
  return {
    people: data2.map((r) => ({
      id: r.id ?? 0,
      city: r.city ?? "",
      tenhouId: r.tenhou_id ?? "",
      title: r.title,
      country: r.country,
      email: withPrivateData ? r.email : "",
      phone: withPrivateData ? r.phone ?? "" : "",
      hasAvatar: r.has_avatar === 1,
      lastUpdate: (r.last_update ? new Date(r.last_update) : /* @__PURE__ */ new Date()).toISOString(),
      msNickname: r.nickname ?? "",
      msAccountId: r.account_id ?? 0,
      telegramId: r.telegram_id ?? "",
      notifications: r.notifications ?? ""
    }))
  };
}
async function setNotificationsSettings(db, redisClient, payload, context) {
  if (!context.personId || !context.authToken) {
    throw new ActionNotAllowedError("Should be logged in to use this function");
  }
  const data2 = await getCachedPersonalData(db, redisClient, payload.personId);
  if (data2.length === 0) {
    throw new NotFoundError("Person is not known to the system");
  }
  const isSuperadmin = (await getSuperadminFlag(db, redisClient, { personId: context.personId })).isAdmin;
  if (payload.personId !== context.personId && !isSuperadmin) {
    throw new ActionNotAllowedError("You can only update your own settings");
  }
  const [personData] = data2;
  if (!isSuperadmin) {
    await verifyHash(context.authToken, personData.auth_hash);
  }
  await Promise.all([
    db.updateTable("person").set({
      telegram_id: payload.telegramId,
      notifications: payload.notifications
    }).where("id", "=", payload.personId).execute(),
    redisClient.remove(getNotificationSettingsCacheKey(payload.personId))
  ]);
  return { success: true };
}
async function updatePersonalInfo(db, redisClient, payload, context) {
  if (payload.title.length === 0) {
    throw new DataMalformedError("Some of required field are empty");
  }
  const isSuperadmin = (await getSuperadminFlag(db, redisClient, { personId: context.personId ?? -1 })).isAdmin;
  if (context.personId !== payload.id && !isSuperadmin) {
    throw new ActionNotAllowedError("This action is not allowed");
  }
  const promises = [];
  if (env.userinfoHook) {
    promises.push(
      fetch(env.userinfoHook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": env.userinfoHookApiKey
        },
        body: JSON.stringify({
          email: payload.email,
          city: payload.city,
          country: payload.country,
          title: payload.title,
          person_id: context.personId,
          tenhou_id: payload.tenhouId
        })
      })
    );
  }
  if (env.gullveigUrl) {
    promises.push(
      fetch(env.gullveigUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: context.personId,
          avatar: payload.avatarData
        })
      })
    );
  }
  if (context.personId) {
    promises.push(clearStatCache(context.personId));
  }
  const value = {
    city: payload.city,
    country: payload.country,
    has_avatar: payload.hasAvatar ? 1 : 0,
    phone: payload.phone,
    tenhou_id: payload.tenhouId,
    title: payload.title
  };
  if (isSuperadmin) {
    if (payload.email.length === 0) {
      throw new DataMalformedError("Some of required field are empty");
    }
    value.email = payload.email;
  }
  promises.push(db.updateTable("person").set(value).where("id", "=", payload.id).execute());
  const soulAcc = await db.selectFrom("majsoul_platform_account").where("person_id", "=", payload.id).selectAll().execute();
  const msValue = {
    ...soulAcc.length > 0 ? soulAcc[0] : {}
  };
  if (payload.msAccountId != null && payload.msAccountId != -1) {
    msValue.account_id = payload.msAccountId;
  }
  if (payload.msFriendId != null && payload.msFriendId != -1) {
    msValue.friend_id = payload.msFriendId;
  }
  if (payload.msNickname != null) {
    msValue.nickname = payload.msNickname;
  }
  if (msValue.account_id !== void 0 && msValue.friend_id !== void 0 && msValue.nickname !== void 0) {
    msValue.person_id = payload.id;
    msValue.friend_id ??= 0;
    msValue.nickname ??= "";
    msValue.account_id ??= 0;
    if (soulAcc.length > 0) {
      promises.push(
        db.updateTable("majsoul_platform_account").set(msValue).where("person_id", "=", payload.id).execute()
      );
    } else {
      promises.push(
        db.insertInto("majsoul_platform_account").values(msValue).execute()
      );
    }
  }
  promises.push(redisClient.remove(getPersonalInfoCacheKey(payload.id)));
  await Promise.all(promises);
  return { success: true };
}

// app/frey.ts
var freyClient = {
  async AddRuleForPerson(accessAddRuleForPersonPayload, context) {
    return wrapError(
      addRuleForPerson(context.db, context.redisClient, context, accessAddRuleForPersonPayload)
    );
  },
  async ApproveRegistration(authApproveRegistrationPayload, context) {
    return wrapError(approveRegistration(context.db, authApproveRegistrationPayload));
  },
  async ApproveResetPassword(authApproveResetPasswordPayload, context) {
    return wrapError(
      approveResetPassword(context.db, context.redisClient, authApproveResetPasswordPayload)
    );
  },
  async Authorize(authAuthorizePayload, context) {
    return wrapError(authorize(context.db, authAuthorizePayload));
  },
  async ChangePassword(authChangePasswordPayload, context) {
    return wrapError(changePassword(context.db, context.redisClient, authChangePasswordPayload));
  },
  async CreateAccount(personsCreateAccountPayload, context) {
    return wrapError(
      createAccount(context.db, context.redisClient, personsCreateAccountPayload, context)
    );
  },
  async DeleteRuleForPerson(accessDeleteRuleForPersonPayload, context) {
    return wrapError(
      deleteRuleForPerson(
        context.db,
        context.redisClient,
        context,
        accessDeleteRuleForPersonPayload
      )
    );
  },
  async DepersonalizeAccount(_depersonalizePayload, context) {
    return wrapError(depersonalizeAccount(context.db, context.redisClient, context));
  },
  async FindByMajsoulAccountId(personsFindByMajsoulIdsPayload, context) {
    return wrapError(findByMajsoulAccountId(context.db, personsFindByMajsoulIdsPayload, context));
  },
  async FindByTenhouIds(personsFindByTenhouIdsPayload, context) {
    return wrapError(findByTenhouIds(context.db, personsFindByTenhouIdsPayload, context));
  },
  async FindByTitle(personsFindByTitlePayload, context) {
    return wrapError(findByTitle(context.db, personsFindByTitlePayload));
  },
  async GetEventAdmins(accessGetEventAdminsPayload, context) {
    return wrapError(getEventAdmins(context.db, accessGetEventAdminsPayload));
  },
  async GetEventReferees(accessGetEventRefereesPayload, context) {
    return wrapError(getEventReferees(context.db, accessGetEventRefereesPayload));
  },
  async GetMajsoulNicknames(personsGetMajsoulNicknamesPayload, context) {
    return wrapError(getMajsoulNicknames(context.db, personsGetMajsoulNicknamesPayload));
  },
  async GetNotificationsSettings(personsGetNotificationsSettingsPayload, context) {
    return wrapError(
      getNotificationsSettings(
        context.db,
        context.redisClient,
        personsGetNotificationsSettingsPayload
      )
    );
  },
  async GetOwnedEventIds(accessGetOwnedEventIdsPayload, context) {
    return wrapError(
      getOwnedEventIds(context.db, context.redisClient, context, accessGetOwnedEventIdsPayload)
    );
  },
  async GetPersonalInfo(personsGetPersonalInfoPayload, context) {
    return wrapError(
      getPersonalInfo(context.db, context.redisClient, personsGetPersonalInfoPayload, context)
    );
  },
  async GetSuperadminFlag(accessGetSuperadminFlagPayload, context) {
    return wrapError(
      getSuperadminFlag(context.db, context.redisClient, accessGetSuperadminFlagPayload)
    );
  },
  async Me(_, context) {
    return wrapError(me(context.db, context.redisClient, context));
  },
  async QuickAuthorize(authQuickAuthorizePayload, context) {
    return wrapError(quickAuthorize(context.db, context.redisClient, authQuickAuthorizePayload));
  },
  async RequestRegistration(authRequestRegistrationPayload, context) {
    return wrapError(requestRegistration(context.db, authRequestRegistrationPayload));
  },
  async RequestResetPassword(authRequestResetPasswordPayload, context) {
    return wrapError(
      requestResetPassword(context.db, context.redisClient, authRequestResetPasswordPayload)
    );
  },
  async SetNotificationsSettings(personsSetNotificationsSettingsPayload, context) {
    return wrapError(
      setNotificationsSettings(
        context.db,
        context.redisClient,
        personsSetNotificationsSettingsPayload,
        context
      )
    );
  },
  async UpdatePersonalInfo(personsUpdatePersonalInfoPayload, context) {
    return wrapError(
      updatePersonalInfo(context.db, context.redisClient, personsUpdatePersonalInfoPayload, context)
    );
  }
};

// ../Common/storage.ts
var AUTH_TOKEN_KEY = "auth";
var PERSON_ID_KEY = "pid";
var EVENT_ID_KEY = "eid";
var LANG_KEY = "lng";
var SESSION_KEY = "sid";
var THEME_KEY = "thm";
var DIMMED_KEY = "dim";
var THVAR_KEY = "thv";
var SINGLE_DEVICE_MODE_KEY = "sdm";
var Storage = class {
  strategy;
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  getAuthToken() {
    return this.get(AUTH_TOKEN_KEY, "string");
  }
  getPersonId() {
    return this.get(PERSON_ID_KEY, "int");
  }
  getEventId() {
    return this.get(EVENT_ID_KEY, "int");
  }
  getSessionId() {
    return this.get(SESSION_KEY, "string");
  }
  getLang() {
    return this.get(LANG_KEY, "string");
  }
  getTheme() {
    return this.get(THEME_KEY, "string");
  }
  getDimmed() {
    return !!this.get(DIMMED_KEY, "int");
  }
  getThemeVariant() {
    return this.get(THVAR_KEY, "string");
  }
  getSingleDeviceMode() {
    return !!this.get(SINGLE_DEVICE_MODE_KEY, "int");
  }
  setAuthToken(token) {
    this.set(AUTH_TOKEN_KEY, "string", token);
    return this;
  }
  setPersonId(id) {
    this.set(PERSON_ID_KEY, "int", id);
    return this;
  }
  setEventId(id) {
    this.set(EVENT_ID_KEY, "int", id);
    return this;
  }
  setSessionId(id) {
    this.set(SESSION_KEY, "string", id);
    return this;
  }
  setLang(lang) {
    this.set(LANG_KEY, "string", lang);
    return this;
  }
  setTheme(theme) {
    this.set(THEME_KEY, "string", theme);
    return this;
  }
  setDimmed(dimmed) {
    this.set(DIMMED_KEY, "int", dimmed ? 1 : 0);
    return this;
  }
  setThemeVariant(variant) {
    this.set(THVAR_KEY, "string", variant);
    return this;
  }
  setSingleDeviceMode(enabled) {
    if (enabled) {
      this.set(SINGLE_DEVICE_MODE_KEY, "int", 1);
    } else {
      this.deleteSingleDeviceMode();
    }
    return this;
  }
  deleteAuthToken() {
    this.delete(AUTH_TOKEN_KEY);
    return this;
  }
  deletePersonId() {
    this.delete(PERSON_ID_KEY);
    return this;
  }
  deleteEventId() {
    this.delete(EVENT_ID_KEY);
    return this;
  }
  deleteSessionId() {
    this.delete(SESSION_KEY);
    return this;
  }
  deleteLang() {
    this.delete(LANG_KEY);
    return this;
  }
  deleteTheme() {
    this.delete(THEME_KEY);
    return this;
  }
  deleteSingleDeviceMode() {
    this.delete(SINGLE_DEVICE_MODE_KEY);
    return this;
  }
  deleteThemeVariant() {
    this.delete(THVAR_KEY);
    return this;
  }
  get(key, type) {
    return this.strategy?.get(key, type);
  }
  set(key, type, value) {
    this.strategy?.set(key, type, value);
  }
  delete(key) {
    this.strategy?.delete(key);
  }
  clear() {
    this.strategy?.clear();
  }
};

// ../Common/storageStrategyServer.ts
var StorageStrategyServer = class {
  _cookies = {};
  _cookiesAdd = {};
  _cookiesRemove = [];
  fill(cookies) {
    this._cookies = cookies;
  }
  getCookies() {
    return {
      add: this._cookiesAdd,
      remove: this._cookiesRemove
    };
  }
  get(key, type) {
    if (this._cookies[key] === void 0) {
      return null;
    }
    return type === "int" ? parseInt(this._cookies[key], 10) : this._cookies[key].toString();
  }
  set(key, type, value) {
    this._cookies[key] = value;
    this._cookiesAdd[key] = value;
  }
  delete(key) {
    this._cookiesRemove.push(key);
    delete this._cookies[key];
  }
  clear() {
    this._cookiesRemove = Object.keys(this._cookies);
    this._cookies = {};
  }
};

// app/helpers/cookies.ts
function parseCookies(request) {
  const list = {};
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(`;`).forEach(function(cookie) {
    const [_name, ...rest] = cookie.split(`=`);
    const name = _name?.trim();
    if (!name) return;
    const value = rest.join(`=`).trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });
  return list;
}

// app/middleware/requestVars.ts
var import_accept_language = __toESM(require("accept-language"));
import_accept_language.default.languages(["en-US", "de-DE", "ru-RU"]);
function fillRequestVars() {
  return async (req, ctx, next) => {
    const storage = new Storage();
    const strategy = new StorageStrategyServer();
    strategy.fill(parseCookies(req));
    storage.setStrategy(strategy);
    ctx.locale = storage.getLang() ?? import_accept_language.default.get(req.headers["Accept-Language".toLowerCase()] ?? "en-US") ?? "en";
    ctx.authToken = req.headers["X-Auth-Token".toLowerCase()]?.toString() ?? storage.getAuthToken() ?? null;
    ctx.personId = (parseInt(req.headers["X-Current-Person-Id".toLowerCase()]?.toString() ?? "") || null) ?? storage.getPersonId() ?? null;
    ctx.currentEventId = (parseInt(req.headers["X-Current-Event-Id".toLowerCase()]?.toString() ?? "") || null) ?? storage.getEventId() ?? null;
    ctx.isInternalQuery = req.headers["X-Internal-Query-Secret".toLowerCase()]?.toString() === env.internalQuerySecret;
    return next();
  };
}

// app/database/db.ts
var import_pg = require("pg");
var import_kysely2 = require("kysely");

// app/helpers/cache/RedisClient.ts
var import_redis = require("redis");
var RedisClient = class {
  // Same redis client can't be both worker, publisher and consumer, so we use several connections
  clientBase;
  clientPub;
  clientSub;
  constructor(username, password, host = "localhost", port = 6379) {
    this.clientBase = (0, import_redis.createClient)({
      url: `redis://${username}:${password}@${host}:${port}`
    });
    this.clientPub = (0, import_redis.createClient)({
      url: `redis://${username}:${password}@${host}:${port}`
    });
    this.clientSub = (0, import_redis.createClient)({
      url: `redis://${username}:${password}@${host}:${port}`
    });
  }
  async connect() {
    await this.clientBase.connect();
    await this.clientPub.connect();
    await this.clientSub.connect();
  }
  async disconnect() {
    await this.clientBase.disconnect();
    await this.clientPub.disconnect();
    await this.clientSub.disconnect();
  }
  async rPop(key) {
    const val = await this.clientBase.rPop(key);
    if (!val) {
      throw new Error("rpop: Empty value read");
    }
    return JSON.parse(val);
  }
  async publish(channel, data2) {
    return this.clientPub.publish(channel, JSON.stringify(data2));
  }
  async subscribe(channel, onData) {
    const listener = (data2) => {
      onData(JSON.parse(data2));
    };
    await this.clientSub.subscribe(channel, listener);
    return async () => await this.clientSub.unsubscribe(channel, listener);
  }
  async decr(key) {
    const res = await this.clientPub.decr(key);
    if (res < 0) {
      await this.clientBase.set(key, 0);
      return 0;
    }
    return res;
  }
  async get(key, onNotFound) {
    const val = await this.clientBase.get(key);
    if (!val) {
      if (onNotFound !== void 0) {
        return onNotFound;
      }
      throw new Error("get: Empty value read");
    }
    return JSON.parse(val);
  }
  async hGetAll(key) {
    const values = await this.clientBase.hGetAll(key);
    if (!values) {
      throw new Error("hGetAll: Empty value read");
    }
    return Object.fromEntries(
      Object.entries(values).map(([k, value]) => [k, JSON.parse(value)])
    );
  }
  async hGet(key, hashkey) {
    const v = await this.clientBase.hGet(key, hashkey);
    if (!v) {
      throw new Error("hGet: Empty value read");
    }
    return JSON.parse(v);
  }
  async hLen(key) {
    return this.clientBase.hLen(key);
  }
  async hSet(key, hashkey, value, ttl = 0) {
    await this.clientBase.hSet(key, hashkey, JSON.stringify(value));
    if (ttl > 0) {
      await this.clientPub.hExpire(key, hashkey, ttl);
    }
  }
  async hSetNX(key, hashkey, value) {
    await this.clientBase.hSetNX(key, hashkey, JSON.stringify(value));
  }
  async hDel(key, hashkey) {
    await this.clientBase.hDel(key, hashkey);
  }
  async incr(key) {
    return this.clientBase.incr(key);
  }
  async lPush(key, value) {
    await this.clientBase.lPush(key, JSON.stringify(value));
  }
  async lRem(key, value) {
    await this.clientBase.lRem(key, 0, JSON.stringify(value));
  }
  async lPos(key, value) {
    return await this.clientBase.lPos(key, JSON.stringify(value));
  }
  async remove(key) {
    return this.clientBase.del(key).then((r) => r > 0);
  }
  async set(key, val, ttl = 60 * 10) {
    return this.clientBase.set(key, JSON.stringify(val), { EX: ttl }).then((r) => r !== null);
  }
};
var RedisClientMock = class {
  _data = {};
  _queues = {};
  _queueListeners = {};
  _channelListeners = {};
  async connect() {
    return Promise.resolve();
  }
  async disconnect() {
    return Promise.resolve();
  }
  async incr(key) {
    if (!this._data[key]) {
      this._data[key] = "0";
    }
    const newVal = parseInt(this._data[key], 10) + 1;
    this._data[key] = newVal.toString();
    return Promise.resolve(newVal);
  }
  async decr(key) {
    if (!this._data[key]) {
      this._data[key] = "0";
    }
    const newVal = parseInt(this._data[key], 10) - 1;
    this._data[key] = (newVal < 0 ? 0 : newVal).toString();
    return Promise.resolve(newVal);
  }
  async publish(channel, data2) {
    if (!this._channelListeners[channel]) {
      return Promise.resolve(0);
    }
    return Promise.all(
      this._channelListeners[channel].map((listener) => {
        return listener(data2);
      })
    ).then((t) => t.length);
  }
  async subscribe(channel, onData) {
    if (!this._channelListeners[channel]) {
      this._channelListeners[channel] = [];
    }
    this._channelListeners[channel].push((data2) => {
      onData(data2);
      return Promise.resolve();
    });
    return Promise.resolve(() => {
      this._channelListeners[channel] = this._channelListeners[channel].filter((l) => l !== onData);
      return Promise.resolve();
    });
  }
  async get(key, onNotFound) {
    if (this._data[key] === void 0) {
      if (onNotFound !== void 0) {
        return Promise.resolve(onNotFound);
      }
      return Promise.reject(new Error("Key not found"));
    }
    return Promise.resolve(JSON.parse(this._data[key]));
  }
  async set(key, val) {
    const updated = this._data[key] !== void 0;
    this._data[key] = JSON.stringify(val);
    return Promise.resolve(!updated);
  }
  async remove(key) {
    const exists = this._data[key] !== void 0;
    delete this._data[key];
    return Promise.resolve(exists);
  }
  async hGet(key, hashkey) {
    if (this._data[key] === void 0) {
      return Promise.reject(new Error("Key not found"));
    }
    const data2 = JSON.parse(this._data[key]);
    if (data2[hashkey] === void 0) {
      return Promise.reject(new Error("Key not found"));
    }
    return data2[hashkey];
  }
  async hLen(key) {
    if (this._data[key] === void 0) {
      return Promise.resolve(0);
    }
    const data2 = JSON.parse(this._data[key]);
    return Promise.resolve(Object.keys(data2).length);
  }
  async hGetAll(key) {
    if (this._data[key] === void 0) {
      return Promise.reject(new Error("Key not found"));
    }
    return Promise.resolve(
      Object.fromEntries(
        Object.entries(JSON.parse(this._data[key])).map(([k, value]) => [
          k,
          value
        ])
      )
    );
  }
  async hSet(key, hashkey, value) {
    const hash = this._data[key] !== void 0 ? JSON.parse(this._data[key]) : {};
    hash[hashkey] = value;
    this._data[key] = JSON.stringify(hash);
    return Promise.resolve();
  }
  async hSetNX(key, hashkey, value) {
    const hash = this._data[key] !== void 0 ? JSON.parse(this._data[key]) : {};
    if (hash[hashkey] !== void 0) {
      return Promise.reject(new Error("Key exists"));
    }
    hash[hashkey] = value;
    this._data[key] = JSON.stringify(hash);
    return Promise.resolve();
  }
  async hDel(key, hashkey) {
    if (this._data[key] !== void 0) {
      const hash = JSON.parse(this._data[key]);
      delete hash[hashkey];
      this._data[key] = JSON.stringify(hash);
    }
    return Promise.resolve();
  }
  async rPop(key) {
    return new Promise((resolve, reject) => {
      const cb = (val) => {
        this._queueListeners[key] = this._queueListeners[key].filter((cbq) => cb !== cbq);
        if (!val) {
          reject("Empty value");
        } else {
          resolve(JSON.parse(val));
        }
      };
      if (!this._queueListeners[key]) {
        this._queueListeners[key] = [];
      }
      this._queueListeners[key].push(cb);
      if (this._queues[key] && this._queues[key].length > 0) {
        this._queueListeners[key]?.shift()?.(this._queues[key].pop());
      }
    });
  }
  async lPush(key, value) {
    this._queues[key] ??= [];
    this._queues[key].push(JSON.stringify(value));
    return new Promise((resolve) => {
      setTimeout(() => {
        this._queueListeners[key]?.shift()?.(this._queues[key].pop());
        resolve();
      }, 0);
    });
  }
  async lRem(key, value) {
    this._queues[key] ??= [];
    this._queues[key] = this._queues[key].filter((v) => v !== JSON.stringify(value));
  }
  async lPos(key, value) {
    this._queues[key] ??= [];
    const idx = this._queues[key].indexOf(JSON.stringify(value));
    if (idx !== -1) {
      return Promise.resolve(null);
    } else {
      return Promise.resolve(idx);
    }
  }
};

// app/database/db.ts
function createDbConstructor(mock) {
  let db;
  return () => {
    db ??= new import_kysely2.Kysely({
      dialect: new import_kysely2.PostgresDialect({
        pool: new import_pg.Pool({
          database: mock ? "frey2_unit" : env.db.dbname,
          host: env.db.host,
          user: env.db.username,
          password: env.db.password,
          port: env.db.port,
          max: 10
        })
      }),
      log(event) {
        if (!env.development || process.env.NODE_ENV === "test" && process.env.TEST_VERBOSE !== "true") {
          return;
        }
        if (event.level === "error") {
          console.error("Query failed : ", {
            durationMs: event.queryDurationMillis,
            error: event.error,
            sql: event.query.sql,
            params: event.query.parameters
          });
        } else {
          console.log("Query executed : ", {
            durationMs: event.queryDurationMillis,
            sql: event.query.sql,
            params: event.query.parameters
          });
        }
      }
    });
    return db;
  };
}
function createRedisConstructor(mock) {
  let redisClient;
  return async () => {
    if (!redisClient) {
      if (mock) {
        redisClient = new RedisClientMock();
      } else {
        redisClient = new RedisClient(
          env.redis.username,
          env.redis.password,
          env.redis.host,
          env.redis.port
        );
      }
    }
    await redisClient.connect();
    return redisClient;
  };
}

// app/middleware/storages.ts
function storages(db, redis) {
  return async (req, ctx, next) => {
    ctx.db = db;
    ctx.redisClient = redis;
    return next();
  };
}

// app/middleware/metrics.ts
function metrics() {
  return async (req, ctx, next) => {
    const time = performance.now();
    const result = await next();
    const duration = performance.now() - time;
    await wrapError(
      fetch(env.huginUrl + "/addMetric", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          {
            m: "method_exec_duration_" + req.url?.replace("/v2/common.Frey/", ""),
            v: duration,
            s: "frey"
          }
        ])
      })
    );
    return result;
  };
}

// app/server.ts
var freyHandler = [createFrey(freyClient)];
var dbConstructor = createDbConstructor();
var redisConstructor = createRedisConstructor();
var logger = (0, import_simple_node_logger.createSimpleLogger)("/var/log/frey.log");
redisConstructor().then((redis) => {
  const app = (0, import_twirpscript6.createTwirpServer)(freyHandler, {
    debug: env.development,
    prefix: "/v2"
  }).use(fillRequestVars()).use(storages(dbConstructor(), redis)).use(metrics());
  app.on("requestReceived", (ctx) => {
    logger.info("Request received ", ctx.method?.name ?? "Unknown");
  });
  app.on("responseSent", (ctx) => {
    logger.info("Response sent ", ctx.method?.name ?? "Unknown");
  });
  app.on("error", (ctx, err) => {
    logger.error("Request errored ", ctx.method?.name ?? "Unknown", err);
  });
  (0, import_http.createServer)(app).listen(env.port, () => console.log(`Server listening on port ${env.port}`));
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  logger.error("Uncaught exception: ", origin, wrapErrorObject(err));
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  freyHandler
});
