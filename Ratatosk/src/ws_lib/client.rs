use std::collections::HashMap;
use std::fmt;
use std::sync::mpsc;
use std::rc::Rc;
use std::cell::RefCell;

use mio::*;
use mio::tcp::*;
use http_muncher::Parser;
use rustc_serialize::base64::{ToBase64, STANDARD};
use sha1::Sha1;
use bytes::{Buf, ByteBuf};
use byteorder::{ByteOrder, BigEndian};
use log::{error, trace};

use crate::ws_essentials::{BufferedFrameReader, Frame, OpCode, ParseError, StatusCode};
use crate::ws_lib::http::HttpParser;
use crate::ws_lib::interface::{WebSocketEvent, WebSocketInternalMessage};

const WEBSOCKET_KEY: &'static [u8] = b"258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

fn gen_key(key: &str) -> String {
  let mut m = Sha1::new();
  let mut buf = [0u8; 20];

  m.update(key.as_bytes());
  m.update(WEBSOCKET_KEY);

  m.output(&mut buf);

  return buf.to_base64(STANDARD);
}

enum ClientState {
  AwaitingHandshake(RefCell<Parser<HttpParser>>),
  HandshakeResponse,
  Connected,
  // In the closing state we do no reads, but send the queued frames.
  Closing,
}

enum ClientError {
  ProtocolError
}

pub struct WebSocketClient {
  pub socket: TcpStream,
  pub interest: EventSet,
  headers: Rc<RefCell<HashMap<String, String>>>,
  state: ClientState,
  outgoing: Vec<Frame>,
  outgoing_bytes: ByteBuf,
  tx: mpsc::Sender<(Token, WebSocketEvent)>,
  event_loop_tx: Sender<WebSocketInternalMessage>,
  token: Token,
  frame_reader: BufferedFrameReader,
}

impl WebSocketClient {
  pub fn new(socket: TcpStream, token: Token, server_sink: mpsc::Sender<(Token, WebSocketEvent)>,
             event_loop_sink: Sender<WebSocketInternalMessage>) -> WebSocketClient {
    let headers = Rc::new(RefCell::new(HashMap::new()));

    WebSocketClient {
      socket,
      headers: headers.clone(),
      interest: EventSet::readable(),
      state: ClientState::AwaitingHandshake(RefCell::new(Parser::request(HttpParser {
        current_key: None,
        headers: headers.clone(),
      }))),
      outgoing: Vec::new(),
      outgoing_bytes: ByteBuf::none(),
      tx: server_sink,
      event_loop_tx: event_loop_sink,
      token,
      frame_reader: BufferedFrameReader::new(),
    }
  }

  fn notify(&mut self, msg: WebSocketEvent) {
    self.tx.send((self.token, msg)).expect("Can't send data to socket");
  }

  pub fn send_message(&mut self, msg: WebSocketEvent) -> Result<(), String> {
    let frame = match msg {
      WebSocketEvent::TextMessage(data) => Some(Frame::from(data)),
      WebSocketEvent::BinaryMessage(data) => Some(Frame::from(data)),
      WebSocketEvent::Close(status_code) => {
        // Change the client's state to "closing" if we've received a "Close" message.
        self.state = ClientState::Closing;
        Some(Frame::close(status_code))
      },
      WebSocketEvent::Ping(ref payload) => Some(Frame::ping(&*payload)),
      _ => None
    };

    if frame.is_none() {
      return Err("Wrong message type to send".to_string());
    }

    self.outgoing.push(frame.unwrap());

    if self.interest.is_readable() {
      trace!("{:?} sending {} frames, switching to write", self.token, self.outgoing.len());

      self.interest.insert(EventSet::writable());
      self.interest.remove(EventSet::readable());

      self.event_loop_tx.send(WebSocketInternalMessage::Reregister(self.token))
        .map_err(|e| e.to_string())?;
    }

    Ok(())
  }

  fn close_with_status(&mut self, status: StatusCode) {
    self.outgoing.push(Frame::close(status));
    self.state = ClientState::Closing;
  }

  pub fn write(&mut self) {
    match self.state {
      ClientState::HandshakeResponse => self.write_handshake(),
      ClientState::Connected | ClientState::Closing => self.write_frames(),
      _ => {}
    }
  }

  fn write_handshake(&mut self) {
    let response_key = gen_key(&*self.headers.borrow().get("Sec-WebSocket-Key").unwrap());
    let response = fmt::format(format_args!("HTTP/1.1 101 Switching Protocols\r\n\
                                                 Connection: Upgrade\r\n\
                                                 Sec-WebSocket-Accept: {}\r\n\
                                                 Upgrade: websocket\r\n\r\n", response_key));
    self.socket.try_write(response.as_bytes()).unwrap();

    // Change the state
    self.state = ClientState::Connected;

    // Send the connection event
    self.notify(WebSocketEvent::Connect);

    self.interest.remove(EventSet::writable());
    self.interest.insert(EventSet::readable());
  }

  fn serialize_frames(&mut self) -> Vec<u8> {
    // FIXME: calculate capacity
    let mut out_buf = Vec::new();
    {
      for frame in self.outgoing.iter() {
        if let Err(e) = frame.write(&mut out_buf) {
          println!("error on write: {}", e);
        }
      }
    }
    out_buf
  }

  fn write_frames(&mut self) {
    loop {
      // First, we fill the byte buffer by serializing frames.
      if !self.outgoing_bytes.has_remaining() {
        if self.outgoing.len() > 0 {
          trace!("{:?} has {} more frames to send in queue", self.token, self.outgoing.len());
          let out_buf = self.serialize_frames();
          self.outgoing_bytes = ByteBuf::from_slice(&*out_buf);
          self.outgoing.clear();
        } else {
          // Buffer is exhausted and we have no more frames to send out.
          trace!("{:?} wrote all bytes; switching to reading", self.token);
          if let ClientState::Closing = self.state {
            trace!("{:?} closing connection", self.token);
            self.socket.shutdown(Shutdown::Write).expect("Can't shutdown socket");
          }
          self.interest.remove(EventSet::writable());
          self.interest.insert(EventSet::readable());
          break;
        }
      }

      // As long as we have something to send, we're writing bytes from the buffer to the socket.
      match self.socket.try_write_buf(&mut self.outgoing_bytes) {
        Ok(Some(write_bytes)) => {
          trace!("{:?} wrote {} bytes, remaining: {}", self.token, write_bytes, self.outgoing_bytes.remaining());
        }
        Ok(None) => {
          // This write call would block
          break;
        }
        Err(e) => {
          // Write error - close this connnection immediately
          error!("{:?} Error occured while writing bytes: {}", self.token, e);
          self.interest.remove(EventSet::writable());
          self.interest.insert(EventSet::hup());
          break;
        }
      }
    }
  }

  pub fn read(&mut self) {
    match self.state {
      ClientState::AwaitingHandshake(_) => self.read_handshake(),
      ClientState::Connected => {
        self.read_frame();

        // Write any buffered outgoing frames
        if self.outgoing.len() > 0 {
          trace!("{:?} read resulted in {} outgoing frames, switching to write", self.token, self.outgoing.len());
          self.interest.remove(EventSet::readable());
          self.interest.insert(EventSet::writable());
        }
      }
      ClientState::Closing => self.read_close(),
      _ => {}
    }
  }

  fn read_close(&mut self) {
    let mut buf = ByteBuf::mut_with_capacity(2048);

    match self.socket.try_read_buf(&mut buf) {
      Ok(Some(0)) => {
        // Remote end has closed connection, we can close it now, too.
        self.interest.remove(EventSet::readable());
        self.interest.insert(EventSet::hup());
        return;
      }
      _ => {}
    }
  }

  fn read_frame(&mut self) {
    loop {
      let mut buf = ByteBuf::mut_with_capacity(16384);
      match self.socket.try_read_buf(&mut buf) {
        Err(e) => {
          error!("{:?} Error while reading socket: {:?}", self.token, e);
          self.interest.remove(EventSet::readable());
          self.interest.insert(EventSet::hup());
          return;
        }
        Ok(None) =>
        // Socket buffer has got no more bytes.
          break,
        Ok(Some(0)) => {
          // Remote end has closed connection, we can close it now, too.
          self.interest.remove(EventSet::readable());
          self.interest.insert(EventSet::hup());
          return;
        }
        Ok(Some(read_bytes)) => {
          trace!("{:?} read {} bytes", self.token, read_bytes);
          let mut read_buf = buf.flip();
          let mut frames_cnt = 0;
          loop {
            match self.frame_reader.read(&mut read_buf) {
              Err(err @ ParseError::InvalidOpCode(..)) => {
                error!("{:?} Invalid OpCode: {}", self.token, err);
                self.close_with_status(StatusCode::ProtocolError);
                break;
              }
              Err(e) => {
                error!("{:?} Error while reading frame: {}", self.token, e);
                self.interest.remove(EventSet::readable());
                self.interest.insert(EventSet::hup());
                return;
              }
              Ok(None) => break,
              Ok(Some(frame)) => {
                frames_cnt += 1;

                let (rsv1, rsv2, rsv3) = frame.get_rsv_flags();
                if rsv1 || rsv2 || rsv3 {
                  // Client is trying to negotiate extensions unknown to us - close
                  // the connection with the protocol error status.
                  error!("{:?} got an RSV flag while no extension were negotiated", self.token);
                  self.close_with_status(StatusCode::ProtocolError);
                  return;
                }

                if self.handle_frame(frame).is_err() {
                  self.close_with_status(StatusCode::ProtocolError);
                  return;
                }
              }
            }
          }
          trace!("{:?} parsed {} frames", self.token, frames_cnt);
          read_buf.flip();
        }
      }
    }
  }

  fn handle_frame(&mut self, frame: Frame) -> Result<(), ClientError> {
    match frame.get_opcode() {
      OpCode::TextFrame => {
        let payload = String::from_utf8(frame.into_vec());
        if let Err(e) = payload {
          // Couldn't decode UTF-8, close the connection
          error!("{:?} Utf8 decode error: {}", self.token, e);
          return Err(ClientError::ProtocolError);
        }
        self.notify(WebSocketEvent::TextMessage(payload.unwrap()));
      }
      OpCode::BinaryFrame => {
        self.notify(WebSocketEvent::BinaryMessage(frame.into_vec()));
      }
      OpCode::Ping => {
        if frame.payload().len() > 125 {
          error!("{:?} Control frame length is > 125", self.token);
          return Err(ClientError::ProtocolError);
        } else {
          self.outgoing.push(Frame::pong(&frame));
        }
      }
      OpCode::ConnectionClose => {
        let close_ev = if frame.payload().len() >= 2 {
          let status_code = BigEndian::read_u16(&frame.payload()[0..2]);
          WebSocketEvent::Close(StatusCode::from(status_code))
        } else {
          // No status code has been provided
          WebSocketEvent::Close(StatusCode::Custom(0))
        };
        self.notify(close_ev);

        if let Ok(response) = Frame::close_from(&frame) {
          self.state = ClientState::Closing;
          self.outgoing.push(response);
        } else {
          return Err(ClientError::ProtocolError);
        }
      }
      _ => {}
    }
    Ok(())
  }

  fn read_handshake(&mut self) {
    loop {
      let mut buf = [0; 2048];
      match self.socket.try_read(&mut buf) {
        Err(e) => {
          println!("Error while reading socket: {:?}", e);
          return;
        }
        Ok(None) =>
        // Socket buffer has got no more bytes.
          break,
        Ok(Some(_)) => {
          let is_upgrade = if let ClientState::AwaitingHandshake(ref parser_state) = self.state {
            let mut parser = parser_state.borrow_mut();
            parser.parse(&buf);
            parser.is_upgrade()
          } else { false };

          if is_upgrade {
            // Change the current state
            self.state = ClientState::HandshakeResponse;

            // Change current interest to `Writable`
            self.interest.remove(EventSet::readable());
            self.interest.insert(EventSet::writable());
            break;
          }
        }
      }
    }
  }
}
