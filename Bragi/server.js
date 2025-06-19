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
    res.send(`User-agent: *\n` + `Allow: /\n` + `Sitemap: https://${env.ROOT_HOST}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', (req, res) => {
    const urls = [
      `https://${env.ROOT_HOST}/en`,
      `https://${env.ROOT_HOST}/en/about`,
      `https://${env.ROOT_HOST}/en/codeOfConduct`,
      `https://${env.ROOT_HOST}/en/getStarted`,
      `https://${env.ROOT_HOST}/en/forPlayers`,
      `https://${env.ROOT_HOST}/en/forHosts`,
      `https://${env.ROOT_HOST}/en/reports`,
      `https://${env.ROOT_HOST}/en/seatings`,
      `https://${env.ROOT_HOST}/ru`,
      `https://${env.ROOT_HOST}/ru/about`,
      `https://${env.ROOT_HOST}/ru/codeOfConduct`,
      `https://${env.ROOT_HOST}/ru/getStarted`,
      `https://${env.ROOT_HOST}/ru/forPlayers`,
      `https://${env.ROOT_HOST}/ru/forHosts`,
      `https://${env.ROOT_HOST}/ru/howToPlay`,
      `https://${env.ROOT_HOST}/ru/yakuList`,
      `https://${env.ROOT_HOST}/ru/forHosts`,
      `https://${env.ROOT_HOST}/ru/reports`,
      `https://${env.ROOT_HOST}/ru/seatings`,
    ];
    fs.readFile('./lastbuild.txt', { encoding: 'utf-8' }, (err, lastUpdate) => {
      if (err) {
        const date = new Date();
        lastUpdate = date.getFullYear() + '-'
          + date.getMonth().toString().padStart(2, '0')
          + '-' + date.getDate().toString().padStart(2, '0');
      }
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((url) => `<url>
    <loc>${url}</loc>
    <lastmod>${lastUpdate.trim()}</lastmod>
    <changefreq>weekly</changefreq>
  </url>
`)}
</urlset>`);
    });
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
