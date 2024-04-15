/*  Bragi: Pantheon landing pages
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
import { exec } from 'child_process';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (fs.existsSync('./node_modules')) {
  Promise.all([
    import('express'), import('dotenv')
  ]).then(([express, dotenv]) => {
    const out = dotenv.default.config({
      path: process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development'
    })?.parsed;

    const app = express.default();
    const PORT = out?.PORT ?? 4108;
    createServer(app, out).then((app) =>
      app.listen(PORT, () => {
        console.log('http://localhost:' + PORT);
      })
    );

    console.log(`Worker ${process.pid} started`);
  })
} else {
  import('http').then((http) => {
    const server = http.createServer(() => {
    });
    server.listen(4108, 'localhost', () => {
      console.log(`Server is running on http://localhost:4108`);
      console.log('Dummy server started. Waiting for deps to be installed...');
    });
  })
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
    res.send(`User-agent: *\n` + `Allow: /\n`);
  });

  app.get('/sitemap.xml', (req, res) => {
    const urls = [
      'https://riichimahjong.org/en',
      'https://riichimahjong.org/en/about',
      'https://riichimahjong.org/en/codeOfConduct',
      'https://riichimahjong.org/en/getStarted',
      'https://riichimahjong.org/en/forPlayers',
      'https://riichimahjong.org/en/forHosts',
      'https://riichimahjong.org/en/reports',
      'https://riichimahjong.org/en/seatings',
      'https://riichimahjong.org/ru',
      'https://riichimahjong.org/ru/about',
      'https://riichimahjong.org/ru/codeOfConduct',
      'https://riichimahjong.org/ru/getStarted',
      'https://riichimahjong.org/ru/forPlayers',
      'https://riichimahjong.org/ru/forHosts',
      'https://riichimahjong.org/ru/howToPlay',
      'https://riichimahjong.org/ru/yakuList',
      'https://riichimahjong.org/ru/forHosts',
      'https://riichimahjong.org/ru/reports',
      'https://riichimahjong.org/ru/seatings',
    ];
    exec('git show | grep Date', (err, out) => {
      const date = new Date(out.replace('Date:').trim());
      const lastUpdate = date.getFullYear() + '-'
        + date.getMonth().toString().padStart(2, '0')
        + '-' + date.getDate().toString().padStart(2, '0');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((url) => `<url>
    <loc>${url}</loc>
    <lastmod>2022-06-04</lastmod>
    <changefreq>weekly</changefreq>
  </url>
`)}
</urlset>`);
      }
    );

  });

  app.use('*', async (req, res) => {
    const url = req.baseUrl;

    const template = fs.readFileSync(
      resolve('dist/client/index.html'),
      'utf-8'
    );
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
          expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)
        });
      }
      for (let name of cookies.remove) {
        res.clearCookie(name, {
          domain: env.VITE_COOKIE_DOMAIN,
          expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)
        });
      }
      res.end(html);
    });
  });

  return app;
}
