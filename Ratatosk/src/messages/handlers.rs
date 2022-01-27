use std::collections::HashMap;
use mio::Token;
use serde_json::Value;
use crate::{GameDataResponse, GenericResponseResult, RegDataResponse, ROUND_DATA, REGISTER_RESULTS, STATUS_OK, WebSocket, WebSocketEvent, NOTIFICATION, NotificationResponse};

pub(crate) fn run(ws: &mut WebSocket, sessions: &mut HashMap<Token, String>, events: &mut HashMap<Token, u32>, token: Token, val: GenericResponseResult) {
  match val {
    GenericResponseResult::GameState { game_hash, data }
      => handle_game_data(game_hash, data, sessions, ws),
    GenericResponseResult::Register { game_hash, event_id }
      => handle_reg_data(game_hash, event_id, token, sessions, events, ws),
    GenericResponseResult::Notification { event_id, localized_notification }
      => handle_notification(localized_notification, event_id, events, ws),
  }
}

fn handle_game_data(
  game_hash: String,
  data: Value,
  sessions: &mut HashMap<Token, String>,
  ws: &mut WebSocket
) {
  if cfg!(debug_assertions) {
    println!("[Ratatosk] Got game data: {} @ {}", game_hash, data);
  }
  for peer in ws.get_connected().unwrap() {
    match sessions.get(&peer) {
      Some(hash) => if hash.eq(&game_hash) {
        let d = GameDataResponse { t: ROUND_DATA, status: STATUS_OK, data: &data };
        let response = WebSocketEvent::TextMessage(serde_json::to_string(&d).unwrap());
        if cfg!(debug_assertions) {
          println!("[Ratatosk] Sending game data: {} @ {}", peer.0, data);
        }
        ws.send((peer, response));
      },
      None => {}
    }
  }
}

fn handle_reg_data(
  game_hash: String,
  event_id: u32,
  token: Token,
  sessions: &mut HashMap<Token, String>,
  events: &mut HashMap<Token, u32>,
  ws: &mut WebSocket
) {
  if cfg!(debug_assertions) {
    println!("[Ratatosk] Got reg data: {}", game_hash);
  }
  sessions.insert(token, String::from(game_hash));
  events.insert(token, event_id);
  for peer in ws.get_connected().unwrap() {
    let data = RegDataResponse { t: REGISTER_RESULTS, status: STATUS_OK };
    let response = WebSocketEvent::TextMessage(serde_json::to_string(&data).unwrap());
    ws.send((peer, response));
  }
}

fn handle_notification(
  localized_notification: Value,
  event_id: u32,
  events: &HashMap<Token, u32>,
  ws: &mut WebSocket
) {
  if cfg!(debug_assertions) {
    println!("[Ratatosk] Got notification: {}", localized_notification);
  }
  for peer in ws.get_connected().unwrap() {
    match events.get(&peer) {
      Some(eid) => {
        if *eid == event_id {
          let data = NotificationResponse { t: NOTIFICATION, localized_notification: &localized_notification };
          let response = WebSocketEvent::TextMessage(serde_json::to_string(&data).unwrap());
          ws.send((peer, response));
        }
      },
      None => {}
    }
  }
}
