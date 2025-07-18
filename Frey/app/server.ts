import { createServer, IncomingMessage } from "http";
import { createTwirpServer, Middleware } from "twirpscript";
import { createFrey } from "./clients/proto/frey.pb";
import { FreyClient } from "./frey";
import { db } from "./db";
import { env } from "./helpers/env";
import { Context } from "./context";

export const freyHandler = [createFrey(new FreyClient(db))];

function fillRequestVars(): Middleware<Context, IncomingMessage> {
  return async (req, ctx, next) => {
    ctx.locale = "en"; // TODO
    ctx.authToken = req.headers["X-Auth-Token"]?.toString() ?? null;
    ctx.personId =
      parseInt(req.headers["X-Current-Person-Id"]?.toString() ?? "") || null;
    ctx.currentEventId =
      parseInt(req.headers["X-Current-Event-Id"]?.toString() ?? "") || null;

    return next();
  };
}

const app = createTwirpServer<Context, typeof freyHandler, IncomingMessage>(
  freyHandler,
).use(fillRequestVars());

createServer(app).listen(env.port, () =>
  console.log(`Server listening on port ${env.port}`),
);
