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

extern crate env_logger;
use std::net::SocketAddr;
use ws_lib::interface::*;

fn main() {
  env_logger::init().unwrap();

  let mut ws = WebSocket::new("0.0.0.0:4006".parse::<SocketAddr>().unwrap());

  loop {
    match ws.next() {
      (tok, WebSocketEvent::Connect) => {
        println!("connected peer: {:?}", tok);
      },

      (tok, WebSocketEvent::TextMessage(msg)) => {
        for peer in ws.get_connected().unwrap() {
          if peer != tok {
            println!("-> relaying to peer {:?}", peer);

            let response = WebSocketEvent::TextMessage(msg.clone());
            ws.send((peer, response));
          }
        }
      },

      (tok, WebSocketEvent::BinaryMessage(msg)) => {
        println!("msg from {:?}", tok);
        let response = WebSocketEvent::BinaryMessage(msg.clone());
        ws.send((tok, response));
      },

      _ => {}
    }
  }
}
