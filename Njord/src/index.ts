import { App, SHARED_COMPRESSOR } from "uWebSockets.js";
const port = parseInt(process.env.PORT ?? "4005", 10);

const app = App()
  .ws("/*", {
    idleTimeout: 32,
    maxBackpressure: 1024,
    compression: SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024,
    open: (ws) => {
      console.log("A WebSocket connected!");
    },
    message: (ws, message, isBinary) => {
      /* Ok is false if backpressure was built up, wait for drain */
      let ok = ws.send(message, isBinary);
    },
    drain: (ws) => {
      console.log("WebSocket backpressure: " + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      console.log("WebSocket closed");
    },
  })
  .get("/*", (res, req) => {
    // plain http
    // TODO: print initial html with all required frontend scripts
    res
      .writeStatus("200 OK")
      .writeHeader("IsExample", "Yes")
      .end("Hello there!");
  })
  .listen(port, (listenSocket) => {
    if (listenSocket) {
      console.log(`Listening to port ${port}`);
    }
  });
