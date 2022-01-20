use serde_json::Value;

pub(crate) const STATUS_OK: &str = "ok";

#[derive(Deserialize)]
#[serde(tag = "t", content = "d")]
pub(crate) enum GenericResponseResult {
  RegData { game_hash: String },
  GameData { game_hash: String, data: Value }
}

#[derive(Serialize)]
pub(crate) struct GameDataResponse<'a> {
  pub(crate) status: &'a str,
  pub(crate) data: &'a Value
}

#[derive(Serialize)]
pub(crate) struct RegDataResponse<'a> {
  pub(crate) status: &'a str
}
