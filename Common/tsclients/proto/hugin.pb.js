import * as protoscript from "protoscript";
import { JSONrequest, PBrequest } from "twirpscript";
export { MIN_SUPPORTED_VERSION_0_0_56 } from "twirpscript";
export async function GetLastDay(getLastDayPayload, config) {
  const response = await PBrequest(
    "/common.Hugin/GetLastDay",
    GetLastDayPayload.encode(getLastDayPayload),
    config
  );
  return GetLastDayResponse.decode(response);
}
export async function GetLastMonth(getLastMonthPayload, config) {
  const response = await PBrequest(
    "/common.Hugin/GetLastMonth",
    GetLastMonthPayload.encode(getLastMonthPayload),
    config
  );
  return GetLastMonthResponse.decode(response);
}
export async function GetLastYear(getLastYearPayload, config) {
  const response = await PBrequest(
    "/common.Hugin/GetLastYear",
    GetLastYearPayload.encode(getLastYearPayload),
    config
  );
  return GetLastYearResponse.decode(response);
}
export async function GetLastDayJSON(getLastDayPayload, config) {
  const response = await JSONrequest(
    "/common.Hugin/GetLastDay",
    GetLastDayPayloadJSON.encode(getLastDayPayload),
    config
  );
  return GetLastDayResponseJSON.decode(response);
}
export async function GetLastMonthJSON(getLastMonthPayload, config) {
  const response = await JSONrequest(
    "/common.Hugin/GetLastMonth",
    GetLastMonthPayloadJSON.encode(getLastMonthPayload),
    config
  );
  return GetLastMonthResponseJSON.decode(response);
}
export async function GetLastYearJSON(getLastYearPayload, config) {
  const response = await JSONrequest(
    "/common.Hugin/GetLastYear",
    GetLastYearPayloadJSON.encode(getLastYearPayload),
    config
  );
  return GetLastYearResponseJSON.decode(response);
}
export function createHugin(service) {
  return {
    name: "common.Hugin",
    methods: {
      GetLastDay: {
        name: "GetLastDay",
        handler: service.GetLastDay,
        input: { protobuf: GetLastDayPayload, json: GetLastDayPayloadJSON },
        output: { protobuf: GetLastDayResponse, json: GetLastDayResponseJSON }
      },
      GetLastMonth: {
        name: "GetLastMonth",
        handler: service.GetLastMonth,
        input: { protobuf: GetLastMonthPayload, json: GetLastMonthPayloadJSON },
        output: {
          protobuf: GetLastMonthResponse,
          json: GetLastMonthResponseJSON
        }
      },
      GetLastYear: {
        name: "GetLastYear",
        handler: service.GetLastYear,
        input: { protobuf: GetLastYearPayload, json: GetLastYearPayloadJSON },
        output: {
          protobuf: GetLastYearResponse,
          json: GetLastYearResponseJSON
        }
      }
    }
  };
}
export const GetLastDayPayload = {
  /**
   * Serializes GetLastDayPayload to protobuf.
   */
  encode: function(_msg) {
    return new Uint8Array();
  },
  /**
   * Deserializes GetLastDayPayload from protobuf.
   */
  decode: function(_bytes) {
    return {};
  },
  /**
   * Initializes GetLastDayPayload with all fields set to their default value.
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
export const GetLastDayResponse = {
  /**
   * Serializes GetLastDayResponse to protobuf.
   */
  encode: function(msg) {
    return GetLastDayResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GetLastDayResponse from protobuf.
   */
  decode: function(bytes) {
    return GetLastDayResponse._readMessage(
      GetLastDayResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GetLastDayResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      data: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.data?.length) {
      writer.writeRepeatedMessage(1, msg.data, HuginData._writeMessage);
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
          const m = HuginData.initialize();
          reader.readMessage(m, HuginData._readMessage);
          msg.data.push(m);
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
export const GetLastMonthPayload = {
  /**
   * Serializes GetLastMonthPayload to protobuf.
   */
  encode: function(_msg) {
    return new Uint8Array();
  },
  /**
   * Deserializes GetLastMonthPayload from protobuf.
   */
  decode: function(_bytes) {
    return {};
  },
  /**
   * Initializes GetLastMonthPayload with all fields set to their default value.
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
export const GetLastMonthResponse = {
  /**
   * Serializes GetLastMonthResponse to protobuf.
   */
  encode: function(msg) {
    return GetLastMonthResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GetLastMonthResponse from protobuf.
   */
  decode: function(bytes) {
    return GetLastMonthResponse._readMessage(
      GetLastMonthResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GetLastMonthResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      data: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.data?.length) {
      writer.writeRepeatedMessage(1, msg.data, HuginData._writeMessage);
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
          const m = HuginData.initialize();
          reader.readMessage(m, HuginData._readMessage);
          msg.data.push(m);
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
export const GetLastYearPayload = {
  /**
   * Serializes GetLastYearPayload to protobuf.
   */
  encode: function(_msg) {
    return new Uint8Array();
  },
  /**
   * Deserializes GetLastYearPayload from protobuf.
   */
  decode: function(_bytes) {
    return {};
  },
  /**
   * Initializes GetLastYearPayload with all fields set to their default value.
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
export const GetLastYearResponse = {
  /**
   * Serializes GetLastYearResponse to protobuf.
   */
  encode: function(msg) {
    return GetLastYearResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GetLastYearResponse from protobuf.
   */
  decode: function(bytes) {
    return GetLastYearResponse._readMessage(
      GetLastYearResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GetLastYearResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      data: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.data?.length) {
      writer.writeRepeatedMessage(1, msg.data, HuginData._writeMessage);
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
          const m = HuginData.initialize();
          reader.readMessage(m, HuginData._readMessage);
          msg.data.push(m);
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
export const HuginData = {
  /**
   * Serializes HuginData to protobuf.
   */
  encode: function(msg) {
    return HuginData._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes HuginData from protobuf.
   */
  decode: function(bytes) {
    return HuginData._readMessage(
      HuginData.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes HuginData with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      datetime: "",
      eventCount: 0,
      uniqCount: 0,
      siteId: "",
      country: "",
      city: "",
      browser: "",
      os: "",
      device: "",
      screen: "",
      language: "",
      eventType: "",
      hostname: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.datetime) {
      writer.writeString(1, msg.datetime);
    }
    if (msg.eventCount) {
      writer.writeInt32(2, msg.eventCount);
    }
    if (msg.uniqCount) {
      writer.writeInt32(3, msg.uniqCount);
    }
    if (msg.siteId) {
      writer.writeString(4, msg.siteId);
    }
    if (msg.country) {
      writer.writeString(5, msg.country);
    }
    if (msg.city) {
      writer.writeString(6, msg.city);
    }
    if (msg.browser) {
      writer.writeString(7, msg.browser);
    }
    if (msg.os) {
      writer.writeString(8, msg.os);
    }
    if (msg.device) {
      writer.writeString(9, msg.device);
    }
    if (msg.screen) {
      writer.writeString(10, msg.screen);
    }
    if (msg.language) {
      writer.writeString(11, msg.language);
    }
    if (msg.eventType) {
      writer.writeString(12, msg.eventType);
    }
    if (msg.hostname) {
      writer.writeString(13, msg.hostname);
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
          msg.datetime = reader.readString();
          break;
        }
        case 2: {
          msg.eventCount = reader.readInt32();
          break;
        }
        case 3: {
          msg.uniqCount = reader.readInt32();
          break;
        }
        case 4: {
          msg.siteId = reader.readString();
          break;
        }
        case 5: {
          msg.country = reader.readString();
          break;
        }
        case 6: {
          msg.city = reader.readString();
          break;
        }
        case 7: {
          msg.browser = reader.readString();
          break;
        }
        case 8: {
          msg.os = reader.readString();
          break;
        }
        case 9: {
          msg.device = reader.readString();
          break;
        }
        case 10: {
          msg.screen = reader.readString();
          break;
        }
        case 11: {
          msg.language = reader.readString();
          break;
        }
        case 12: {
          msg.eventType = reader.readString();
          break;
        }
        case 13: {
          msg.hostname = reader.readString();
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
export const GetLastDayPayloadJSON = {
  /**
   * Serializes GetLastDayPayload to JSON.
   */
  encode: function(_msg) {
    return "{}";
  },
  /**
   * Deserializes GetLastDayPayload from JSON.
   */
  decode: function(_json) {
    return {};
  },
  /**
   * Initializes GetLastDayPayload with all fields set to their default value.
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
export const GetLastDayResponseJSON = {
  /**
   * Serializes GetLastDayResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GetLastDayResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes GetLastDayResponse from JSON.
   */
  decode: function(json) {
    return GetLastDayResponseJSON._readMessage(
      GetLastDayResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GetLastDayResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      data: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.data?.length) {
      json["data"] = msg.data.map(HuginDataJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _data_ = json["data"];
    if (_data_) {
      for (const item of _data_) {
        const m = HuginDataJSON.initialize();
        HuginDataJSON._readMessage(m, item);
        msg.data.push(m);
      }
    }
    return msg;
  }
};
export const GetLastMonthPayloadJSON = {
  /**
   * Serializes GetLastMonthPayload to JSON.
   */
  encode: function(_msg) {
    return "{}";
  },
  /**
   * Deserializes GetLastMonthPayload from JSON.
   */
  decode: function(_json) {
    return {};
  },
  /**
   * Initializes GetLastMonthPayload with all fields set to their default value.
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
export const GetLastMonthResponseJSON = {
  /**
   * Serializes GetLastMonthResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GetLastMonthResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes GetLastMonthResponse from JSON.
   */
  decode: function(json) {
    return GetLastMonthResponseJSON._readMessage(
      GetLastMonthResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GetLastMonthResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      data: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.data?.length) {
      json["data"] = msg.data.map(HuginDataJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _data_ = json["data"];
    if (_data_) {
      for (const item of _data_) {
        const m = HuginDataJSON.initialize();
        HuginDataJSON._readMessage(m, item);
        msg.data.push(m);
      }
    }
    return msg;
  }
};
export const GetLastYearPayloadJSON = {
  /**
   * Serializes GetLastYearPayload to JSON.
   */
  encode: function(_msg) {
    return "{}";
  },
  /**
   * Deserializes GetLastYearPayload from JSON.
   */
  decode: function(_json) {
    return {};
  },
  /**
   * Initializes GetLastYearPayload with all fields set to their default value.
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
export const GetLastYearResponseJSON = {
  /**
   * Serializes GetLastYearResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GetLastYearResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes GetLastYearResponse from JSON.
   */
  decode: function(json) {
    return GetLastYearResponseJSON._readMessage(
      GetLastYearResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GetLastYearResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      data: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.data?.length) {
      json["data"] = msg.data.map(HuginDataJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _data_ = json["data"];
    if (_data_) {
      for (const item of _data_) {
        const m = HuginDataJSON.initialize();
        HuginDataJSON._readMessage(m, item);
        msg.data.push(m);
      }
    }
    return msg;
  }
};
export const HuginDataJSON = {
  /**
   * Serializes HuginData to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(HuginDataJSON._writeMessage(msg));
  },
  /**
   * Deserializes HuginData from JSON.
   */
  decode: function(json) {
    return HuginDataJSON._readMessage(
      HuginDataJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes HuginData with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      datetime: "",
      eventCount: 0,
      uniqCount: 0,
      siteId: "",
      country: "",
      city: "",
      browser: "",
      os: "",
      device: "",
      screen: "",
      language: "",
      eventType: "",
      hostname: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.datetime) {
      json["datetime"] = msg.datetime;
    }
    if (msg.eventCount) {
      json["eventCount"] = msg.eventCount;
    }
    if (msg.uniqCount) {
      json["uniqCount"] = msg.uniqCount;
    }
    if (msg.siteId) {
      json["siteId"] = msg.siteId;
    }
    if (msg.country) {
      json["country"] = msg.country;
    }
    if (msg.city) {
      json["city"] = msg.city;
    }
    if (msg.browser) {
      json["browser"] = msg.browser;
    }
    if (msg.os) {
      json["os"] = msg.os;
    }
    if (msg.device) {
      json["device"] = msg.device;
    }
    if (msg.screen) {
      json["screen"] = msg.screen;
    }
    if (msg.language) {
      json["language"] = msg.language;
    }
    if (msg.eventType) {
      json["eventType"] = msg.eventType;
    }
    if (msg.hostname) {
      json["hostname"] = msg.hostname;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _datetime_ = json["datetime"];
    if (_datetime_) {
      msg.datetime = _datetime_;
    }
    const _eventCount_ = json["eventCount"] ?? json["event_count"];
    if (_eventCount_) {
      msg.eventCount = protoscript.parseNumber(_eventCount_);
    }
    const _uniqCount_ = json["uniqCount"] ?? json["uniq_count"];
    if (_uniqCount_) {
      msg.uniqCount = protoscript.parseNumber(_uniqCount_);
    }
    const _siteId_ = json["siteId"] ?? json["site_id"];
    if (_siteId_) {
      msg.siteId = _siteId_;
    }
    const _country_ = json["country"];
    if (_country_) {
      msg.country = _country_;
    }
    const _city_ = json["city"];
    if (_city_) {
      msg.city = _city_;
    }
    const _browser_ = json["browser"];
    if (_browser_) {
      msg.browser = _browser_;
    }
    const _os_ = json["os"];
    if (_os_) {
      msg.os = _os_;
    }
    const _device_ = json["device"];
    if (_device_) {
      msg.device = _device_;
    }
    const _screen_ = json["screen"];
    if (_screen_) {
      msg.screen = _screen_;
    }
    const _language_ = json["language"];
    if (_language_) {
      msg.language = _language_;
    }
    const _eventType_ = json["eventType"] ?? json["event_type"];
    if (_eventType_) {
      msg.eventType = _eventType_;
    }
    const _hostname_ = json["hostname"];
    if (_hostname_) {
      msg.hostname = _hostname_;
    }
    return msg;
  }
};
