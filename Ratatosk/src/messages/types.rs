use serde_json::Value;

pub(crate) const STATUS_OK: &str = "ok";
pub(crate) const REGISTER_RESULTS: &str = "REGISTER_RESULTS";
pub(crate) const ROUND_DATA: &str = "ROUND_DATA";

#[derive(Deserialize)]
#[serde(tag = "t", content = "d")]
pub(crate) enum GenericResponseResult {
  Register { game_hash: String },
  GameState { game_hash: String, data: Value }
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
