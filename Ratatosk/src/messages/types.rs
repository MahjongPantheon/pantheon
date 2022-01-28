use serde_json::Value;

pub(crate) const STATUS_OK: &str = "ok";
pub(crate) const REGISTER_RESULTS: &str = "REGISTER_RESULTS";
pub(crate) const ROUND_DATA: &str = "ROUND_DATA";
pub(crate) const NOTIFICATION: &str = "NOTIFICATION";

#[derive(Deserialize)]
#[serde(tag = "t", content = "d")]
pub(crate) enum GenericIncomingRequest {
  Register { game_hash: String, event_id: u32 },
  GameState { game_hash: String, data: Value },
  Notification { event_id: u32, localized_notification: Value },
}

#[derive(Serialize)]
pub(crate) struct GameDataResponse<'a> {
  pub(crate) t: &'a str,
  pub(crate) status: &'a str,
  pub(crate) data: &'a Value
}

#[derive(Serialize)]
pub(crate) struct RegDataResponse<'a> {
  pub(crate) t: &'a str,
  pub(crate) status: &'a str
}

#[derive(Serialize)]
pub(crate) struct NotificationResponse<'a> {
  pub(crate) t: &'a str,
  pub(crate) localized_notification: &'a Value
}
