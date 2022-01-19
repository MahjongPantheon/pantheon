mod ws_essentials;
mod ws_lib;
extern crate mio;
extern crate http_muncher;
extern crate sha1;
extern crate rustc_serialize;
extern crate bytes;
extern crate byteorder;
#[macro_use]
extern crate log;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate env_logger;

use std::collections::HashMap;
use std::net::SocketAddr;
use mio::Token;
use serde_json::Value;
use ws_lib::interface::*;

#[derive(Deserialize)]
#[serde(tag = "t", content = "d")]
enum GenericResponseResult {
  RegData { gamehash: String },
  GameData { gamehash: String, data: serde_json::Value }
}

#[derive(Serialize)]
struct GameDataResponse<'a> {
  status: String,
  data: &'a serde_json::Value
}

#[derive(Serialize)]
struct RegDataResponse {
  status: String
}

fn main() {
  env_logger::init().unwrap();

  let mut ws = WebSocket::new("0.0.0.0:4006".parse::<SocketAddr>().unwrap());
  let mut sessions: HashMap<Token, String> = HashMap::new();

  loop {
    match ws.next() {
      (tok, WebSocketEvent::Connect) => {
        println!("connected peer: {:?}", tok);
      },

      (tok, WebSocketEvent::TextMessage(msg)) => {
        let data: Result<GenericResponseResult, _> = serde_json::from_str(msg.as_str());
        match data {
          Ok(val) => match val {
            GenericResponseResult::GameData { gamehash, data }  => {
              println!("Game data: {} {}", gamehash, data);
              for peer in ws.get_connected().unwrap() {
                match sessions.get(&peer) {
                  Some(hash) => if hash.eq(&gamehash) {
                    let d = GameDataResponse { status: String::from("ok!"), data: &data };
                    let response = WebSocketEvent::TextMessage(serde_json::to_string(&d).unwrap());
                    ws.send((peer, response));
                  },
                  None => {}
                }
              }
            },
            GenericResponseResult::RegData { gamehash } => {
              println!("Hash: {}", gamehash);
              sessions.insert(tok, String::from(gamehash));
              println!("Sessions: {:?}", sessions);
              for peer in ws.get_connected().unwrap() {
                let data = RegDataResponse { status: String::from("ok!") };
                let response = WebSocketEvent::TextMessage(serde_json::to_string(&data).unwrap());
                ws.send((peer, response));
              }
            }
          },
          Err(e) => println!("Failed to parse JSON: {}", msg)
        }



      },

      (tok, WebSocketEvent::BinaryMessage(msg)) => {
        // println!("msg from {:?}", tok);
        let response = WebSocketEvent::BinaryMessage(msg.clone());
        ws.send((tok, response));
      },

      _ => {}
    }
  }
}
