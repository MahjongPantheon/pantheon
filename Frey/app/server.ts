import { createServer, IncomingMessage } from 'http';
import { createTwirpServer } from 'twirpscript';
import { createFrey } from './clients/proto/frey.pb';
import { FreyClient } from './frey';
import { db, redisClient } from './db';
import { env } from './helpers/env';
import { Context } from './context';
import { fillRequestVars } from './middleware/requestVars';

export const freyHandler = [createFrey(new FreyClient(db, redisClient))];

const app = createTwirpServer<Context, typeof freyHandler, IncomingMessage>(freyHandler).use(
  fillRequestVars()
);
createServer(app).listen(env.port, () => console.log(`Server listening on port ${env.port}`));
