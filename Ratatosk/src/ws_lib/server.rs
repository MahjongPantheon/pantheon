use std::collections::HashMap;
use std::sync::mpsc;
use log::{error, trace};

use mio::*;
use mio::tcp::*;

use crate::ws_lib::client::WebSocketClient;
use crate::ws_lib::interface::{WebSocketEvent, WebSocketInternalMessage};

pub const SERVER_TOKEN: Token = Token(0);

pub struct WebSocketServer {
    pub socket: TcpListener,
    tx: mpsc::Sender<(Token,WebSocketEvent)>,
    clients: HashMap<Token, WebSocketClient>,
    token_counter: usize
}

impl WebSocketServer {
    pub fn new(socket: TcpListener, tx: mpsc::Sender<(Token,WebSocketEvent)>) -> WebSocketServer {
        WebSocketServer {
            socket,
            tx,
            token_counter: 1,
            clients: HashMap::new()
        }
    }

    fn add_client(&mut self, client_socket: TcpStream, tx: mpsc::Sender<(Token,WebSocketEvent)>,
                  event_loop_tx: Sender<WebSocketInternalMessage>) -> Token {
        let new_token = Token(self.token_counter);
        self.token_counter += 1;

        self.clients.insert(new_token, WebSocketClient::new(client_socket, new_token, tx.clone(), event_loop_tx));
        new_token
    }

    pub fn get_peers(&self) -> Vec<Token> {
        self.clients.keys().cloned().collect::<Vec<_>>()
    }

    fn remove_client(&mut self, tkn: &Token) -> Option<WebSocketClient> {
        self.clients.remove(tkn)
    }

    pub fn send_message(&mut self, msg: (Token,WebSocketEvent)) {
        let (tkn, message) = msg;
        let client = self.clients.get_mut(&tkn).unwrap();
        if let Err(e) = client.send_message(message) {
            error!("Error while sending msg to client: {}", e);
        }
        // TODO: return Result here
    }
}

impl Handler for WebSocketServer {
    type Timeout = usize;
    type Message = WebSocketInternalMessage;

  fn ready(&mut self, event_loop: &mut EventLoop<WebSocketServer>, token: Token, events: EventSet) {
      if events.is_readable() {
          match token {
              SERVER_TOKEN => {
                  let client_socket = match self.socket.accept() {
                      Ok(Some((sock, _))) => sock,
                      Ok(None) => unreachable!(),
                      Err(e) => {
                          error!("Accept error: {}", e);
                          return;
                      }
                  };

                  let tx = self.tx.clone();
                  let new_token = self.add_client(client_socket, tx, event_loop.channel());

                  event_loop.register(&self.clients[&new_token].socket,
                                      new_token, EventSet::readable(),
                                      PollOpt::edge() | PollOpt::oneshot()).unwrap();
              },
        token => {
                  let client = self.clients.get_mut(&token).unwrap();
                  client.read();
                  event_loop.reregister(&client.socket, token, client.interest,
                                        PollOpt::edge() | PollOpt::oneshot()).unwrap();
              }
          }
      }

      if events.is_writable() {
          let client = self.clients.get_mut(&token).unwrap();
          client.write();
          event_loop.reregister(&client.socket, token, client.interest,
                                PollOpt::edge() | PollOpt::oneshot()).unwrap();
      }

      if events.is_hup() {
          // Close connection
          let client = self.remove_client(&token).unwrap();
          event_loop.deregister(&client.socket).expect("Can't deregister socket");
          trace!("{:?} hang up connection", token);
      }
  }

  fn notify(&mut self, event_loop: &mut EventLoop<WebSocketServer>, msg: WebSocketInternalMessage) {
      match msg {
          WebSocketInternalMessage::Reregister(tkn) => {
              let client = self.clients.get(&tkn).unwrap();
              event_loop.reregister(&client.socket, tkn, client.interest,
                                    PollOpt::edge() | PollOpt::oneshot()).unwrap();
          },
          WebSocketInternalMessage::SendMessage(msg) => {
              self.send_message(msg);
          },
          WebSocketInternalMessage::GetPeers(tx) => {
              tx.send(self.get_peers()).expect("Can't send data to socket");
          }
      }
  }
}
