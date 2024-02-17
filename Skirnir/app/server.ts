import fs from 'node:fs';
import process from 'node:process';
import type { Bot } from 'grammy';

// Module-scoped queue, acceptable because bot process must be single.
const queue: Array<{ id: string; message: string }> = [];
let isRunning = false;

// Need to add artificial delay to meet telegram antiflood requirements (around ~30rps)
function _sendNext(bot: Bot) {
  if (queue.length === 0) {
    isRunning = false;
    return;
  }

  isRunning = true;
  const { id, message } = queue.shift()!;
  bot?.api
    .sendMessage(id, message, {
      parse_mode: 'HTML',
    })
    .catch((e) => console.error('Rejected sendMessage: ', e));

  setTimeout(() => _sendNext(bot), 100);
}

function sendQueued(ids: string[], message: string, bot: Bot) {
  ids.forEach((id) => {
    queue.push({ id, message });
  });
  if (!isRunning) {
    _sendNext(bot);
  }
}

if (fs.existsSync('./node_modules')) {
  Promise.all([import('express'), import('dotenv'), import('grammy')]).then(
    ([express, dotenv, grammy]) => {
      const out = dotenv.default.config({
        path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
      })?.parsed;

      const TOKEN = out?.BOT_TOKEN ?? '';
      let bot: Bot;

      if (!TOKEN) {
        console.warn('Empty BOT_TOKEN: Skirnir bot not starting');
      } else {
        bot = new grammy.Bot(TOKEN);

        bot.command('start', (ctx) => {
          const link = `${process.env.FORSETI_URL}/profile/notifications/tg/${ctx.from?.id}`;
          const message =
            'Welcome to pantheon bot. Please follow next link to register your telegram account to Pantheon:\n\n' +
            `<a href="${link}">${link}</a>` +
            '\n\n' +
            `You'll receive all Pantheon notifications in this bot after the registration is complete.`;
          ctx.reply(message, { parse_mode: 'HTML' });
        });

        // bot.on('message', (ctx) => {
        //   ctx.reply('Got another message!');
        //   ctx.reply('Your id is ' + ctx.from.id);
        // });
        bot.start();
      }

      const app = express.default();
      const PORT = out?.SKIRNIR_PORT ? parseInt(out.SKIRNIR_PORT, 10) : 4115;

      app.use(express.json());

      app.use('*', async (req, res) => {
        const { to, message }: { to: string[]; message: string } = req.body;
        if (to && message) {
          sendQueued(to, message, bot);
          res.status(200).end();
        } else {
          res.send('Method not found').status(400).end();
        }
      });

      app.listen(PORT, 'localhost', () => {
        console.log('http://localhost:' + PORT);
      });

      console.log(`Worker ${process.pid} started`);
    }
  );
} else {
  import('http').then((http) => {
    const server = http.createServer(() => {});
    server.listen(4115, 'localhost', () => {
      console.log(`Server is running on http://localhost:4115`);
      console.log('Dummy server started. Waiting for deps to be installed...');
    });
  });
}
