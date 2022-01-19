#[derive(Clone, Debug)]
pub enum StatusCode {
    NormalClosure,
    GoingAway,
    ProtocolError,
    UnsupportedData,
    NoStatusRcvd,
    AbnormalClosure,
    InvalidFramePayloadData,
    PolicyViolation,
    MessageTooBig,
    MandatoryExt,
    InternalServerError,
    TlsHandshake,
    Custom(u16),
}

impl From<u16> for StatusCode {
    fn from(status: u16) -> StatusCode {
        match status {
            1000 => StatusCode::NormalClosure,
            1001 => StatusCode::GoingAway,
            1002 => StatusCode::ProtocolError,
            1003 => StatusCode::UnsupportedData,
            1005 => StatusCode::NoStatusRcvd,
            1006 => StatusCode::AbnormalClosure,
            1007 => StatusCode::InvalidFramePayloadData,
            1008 => StatusCode::PolicyViolation,
            1009 => StatusCode::MessageTooBig,
            1010 => StatusCode::MandatoryExt,
            1011 => StatusCode::InternalServerError,
            1015 => StatusCode::TlsHandshake,
            code => StatusCode::Custom(code),
        }
    }
}

impl From<StatusCode> for u16 {
    fn from(status: StatusCode) -> u16 {
        match status {
            StatusCode::NormalClosure => 1000,
            StatusCode::GoingAway => 1001,
            StatusCode::ProtocolError => 1002,
            StatusCode::UnsupportedData => 1003,
            StatusCode::NoStatusRcvd => 1005,
            StatusCode::AbnormalClosure => 1006,
            StatusCode::InvalidFramePayloadData => 1007,
            StatusCode::PolicyViolation => 1008,
            StatusCode::MessageTooBig => 1009,
            StatusCode::MandatoryExt => 1010,
            StatusCode::InternalServerError => 1011,
            StatusCode::TlsHandshake => 1015,
            StatusCode::Custom(code) => code,
        }
    }
}

impl<'a> From<StatusCode> for &'a str {
    fn from(status: StatusCode) -> &'a str {
        match status {
            StatusCode::NormalClosure => "Normal Closure",
            StatusCode::GoingAway => "Going Away",
            StatusCode::ProtocolError => "Protocol error",
            StatusCode::UnsupportedData => "Unsupported Data",
            StatusCode::NoStatusRcvd => "No Status Rcvd",
            StatusCode::AbnormalClosure => "Abnormal Closure",
            StatusCode::InvalidFramePayloadData => "Invalid frame payload data",
            StatusCode::PolicyViolation => "Policy Violation",
            StatusCode::MessageTooBig => "Message Too Big",
            StatusCode::MandatoryExt => "Mandatory Ext.",
            StatusCode::InternalServerError => "Internal Server Error",
            StatusCode::TlsHandshake => "TLS handshake",
            StatusCode::Custom(..) => "",
        }
    }
}
