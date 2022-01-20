mod ws_essentials;
mod ws_lib;
mod messages;
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

use std::borrow::BorrowMut;
use std::collections::HashMap;
use std::net::SocketAddr;
use mio::Token;
use ws_lib::interface::*;
use messages::types::*;
use crate::messages::handlers;

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
          Ok(val) => handlers::run(ws.borrow_mut(), sessions.borrow_mut(), tok, val),
          Err(_e) => println!("Failed to parse JSON: {}", msg)
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
