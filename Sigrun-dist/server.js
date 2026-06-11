/*  Sigrun: rating tables and statistics frontend
 *  Copyright (C) 2023  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import process from 'node:process';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (fs.existsSync('./node_modules')) {
  Promise.all([import('express'), import('dotenv')]).then(([express, dotenv]) => {
    const out = dotenv.default.config({
      path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
    })?.parsed;

    const app = express.default();
    const PORT = out?.PORT ?? process.env.PORT ?? 4102;
    createServer(app, out).then((app) =>
      app.listen(PORT, () => {
        console.log('http://localhost:' + PORT);
      })
    );

    console.log(`Worker ${process.pid} started`);
  });
} else {
  import('http').then((http) => {
    const server = http.createServer(() => {});
    const port = parseInt(process.env.PORT ?? '4102');
    server.listen(port, 'localhost', () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log('Dummy server started. Waiting for deps to be installed...');
    });
  });
}

export async function createServer(app, env) {
  const resolve = (p) => path.resolve(__dirname, p);

  app.use((await import('compression')).default());
  app.use((await import('cookie-parser')).default());
  app.use(
    (await import('serve-static')).default(resolve('dist/client'), {
      index: false,
    })
  );
  app.use((await import('express')).json());

  app.get('/robots.txt', (req, res) => {
    res.send(`User-agent: *\nAllow: /\n\nUser-agent: MJ12bot\nDisallow: /\n`);
  });

  app.get('/eid:eventId', (req, res) => {
    res.redirect(301, `${env.EXTERNAL_SIGRUN_URL}/event/${req.params.eventId}/info`);
  });

  app.get('/eid:eventId/add-online', (req, res) => {
    res.redirect(301, `${env.EXTERNAL_SIGRUN_URL}/event/${req.params.eventId}/info`);
  });

  app.get('/eid:eventId/last', (req, res) => {
    res.redirect(301, `${env.EXTERNAL_SIGRUN_URL}/event/${req.params.eventId}/games`);
  });

  app.get('/eid:eventId/last/page/:page', (req, res) => {
    res.redirect(
      301,
      `${env.EXTERNAL_SIGRUN_URL}/event/${req.params.eventId}/games/page/${req.params.page}`
    );
  });

  app.get('/eid:eventId/stat', (req, res) => {
    res.redirect(301, `${env.EXTERNAL_SIGRUN_URL}/event/${req.params.eventId}/order/rating`);
  });

  app.get('/eid:eventId/stat/team', (req, res) => {
    res.redirect(301, `${env.EXTERNAL_SIGRUN_URL}/event/${req.params.eventId}/order/team`);
  });

  app.get('/eid:eventId/user/:playerId', (req, res) => {
    res.redirect(
      301,
      `${env.EXTERNAL_SIGRUN_URL}/event/${req.params.eventId}/player/${req.params.playerId}`
    );
  });

  app.get('/eid:eventId/game/:gameHash', (req, res) => {
    res.redirect(
      301,
      `${env.EXTERNAL_SIGRUN_URL}/event/${req.params.eventId}/game/${req.params.gameHash}`
    );
  });

  app.get('/eid:eventId/timer', (req, res) => {
    res.redirect(301, `${env.EXTERNAL_SIGRUN_URL}/event/${req.params.eventId}/timer`);
  });

  app.get('/eid:eventId/achievements', (req, res) => {
    res.redirect(301, `${env.EXTERNAL_SIGRUN_URL}/event/${req.params.eventId}/achievements`);
  });

  app.get('/eid:eventId/achievements/:achievement', (req, res) => {
    res.redirect(301, `${env.EXTERNAL_SIGRUN_URL}/event/${req.params.eventId}/achievements`);
  });

  app.use('*', async (req, res) => {
    const url = req.baseUrl;

    const template = fs.readFileSync(resolve('dist/client/index.html'), 'utf-8');
    const render = (await import('./dist/server/server.js')).SSRRender;

    render(url, req.cookies).then(({ cookies, helmet, appHtml, serverData }) => {
      const html = template
        .replace(`<!--app-head-->`, helmet)
        .replace(`<!--app-html-->`, appHtml)
        .replace(`<!--app-server-data-->`, serverData);
      res.status(200);
      res.set({ 'Content-Type': 'text/html' });
      for (let name in cookies.add) {
        res.cookie(name, cookies.add[name], {
          domain: env.VITE_COOKIE_DOMAIN,
          expires: new Date(Date.now() + 365 * 24 * 3600 * 1000),
        });
      }
      for (let name of cookies.remove) {
        res.clearCookie(name, {
          domain: env.VITE_COOKIE_DOMAIN,
          expires: new Date(Date.now() + 365 * 24 * 3600 * 1000),
        });
      }
      res.end(html);
    });
  });

  return app;
}
