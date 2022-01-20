use std::collections::HashMap;
use mio::Token;
use serde_json::Value;
use crate::{GameDataResponse, GenericResponseResult, RegDataResponse, STATUS_OK, WebSocket, WebSocketEvent};

pub(crate) fn run(ws: &mut WebSocket, sessions: &mut HashMap<Token, String>, token: Token, val: GenericResponseResult) {
  match val {
    GenericResponseResult::GameData { game_hash, data }  => handle_game_data(game_hash, data, sessions, ws),
    GenericResponseResult::RegData { game_hash } => handle_reg_data(game_hash, token, sessions, ws)
  }
}

fn handle_game_data(game_hash: String, data: Value, sessions: &mut HashMap<Token, String>, ws: &mut WebSocket) {
  for peer in ws.get_connected().unwrap() {
    match sessions.get(&peer) {
      Some(hash) => if hash.eq(&game_hash) {
        let d = GameDataResponse { status: STATUS_OK, data: &data };
        let response = WebSocketEvent::TextMessage(serde_json::to_string(&d).unwrap());
        ws.send((peer, response));
      },
      None => {}
    }
  }
}

fn handle_reg_data(game_hash: String, token: Token, sessions: &mut HashMap<Token, String>, ws: &mut WebSocket) {
  sessions.insert(token, String::from(game_hash));
  for peer in ws.get_connected().unwrap() {
    let data = RegDataResponse { status: STATUS_OK };
    let response = WebSocketEvent::TextMessage(serde_json::to_string(&data).unwrap());
    ws.send((peer, response));
  }
}
