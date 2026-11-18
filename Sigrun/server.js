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
// Set before dynamically importing the SSR bundles built by CI.
globalThis.__PANTHEON_ENV__ = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => key.startsWith('VITE_'))
);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (
  process.argv[1] &&
  ['', '.js'].some(
    (extension) => path.resolve(process.argv[1] + extension) === fileURLToPath(import.meta.url)
  )
) {
  if (fs.existsSync('./node_modules')) {
    Promise.all([import('express'), import('dotenv')]).then(([express, dotenv]) => {
      const out = {
        ...dotenv.default.config({
          path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
        })?.parsed,
        ...process.env,
      };

      const app = express.default();
      const PORT = process.env.PORT ?? out?.PORT ?? 4102;
      createServer(app, out).then((server) =>
        server.listen(PORT, () => {
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
}

function integerSetting(env, name, fallback, minimum = 1) {
  const value = Number(env[name] ?? fallback);
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new Error(`Invalid ${name}`);
  }
  return value;
}

export function createSsrHandler(render, template, env = {}) {
  const limit = integerSetting(env, 'SIGRUN_SSR_CONCURRENCY', 4);
  const queueLimit = integerSetting(env, 'SIGRUN_SSR_QUEUE_SIZE', 8, 0);
  const timeout = integerSetting(env, 'SIGRUN_SSR_TIMEOUT_MS', 10000);
  let active = 0;
  const waiting = new Set();
  const release = () => {
    active--;
    const next = waiting.values().next().value;
    if (next) next();
  };
  const acquire = (signal) => {
    signal.throwIfAborted();
    if (active < limit) {
      active++;
      return Promise.resolve(release);
    }
    if (waiting.size >= queueLimit) {
      return Promise.reject(Object.assign(new Error('SSR queue full'), { status: 503 }));
    }
    return new Promise((resolve, reject) => {
      const ready = () => {
        waiting.delete(ready);
        signal.removeEventListener('abort', abort);
        active++;
        resolve(release);
      };
      const abort = () => {
        waiting.delete(ready);
        reject(signal.reason);
      };
      waiting.add(ready);
      signal.addEventListener('abort', abort, { once: true });
    });
  };

  return async (req, res, next) => {
    const controller = new AbortController();
    const { signal } = controller;
    const deadline = Date.now() + timeout;
    const expire = () =>
      controller.abort(new DOMException('SSR deadline exceeded', 'TimeoutError'));
    const checkBudget = () => {
      if (Date.now() >= deadline) expire();
      signal.throwIfAborted();
    };
    const disconnected = () => {
      if (!res.writableEnded)
        controller.abort(new DOMException('Client disconnected', 'AbortError'));
    };
    req.once('aborted', disconnected);
    res.once('close', disconnected);
    const timer = setTimeout(expire, timeout);
    let onAbort;
    try {
      const release = await acquire(signal);
      // Keep the slot until the actual work settles, even if an uncooperative
      // renderer ignores cancellation and the HTTP response has already ended.
      const work = Promise.resolve()
        .then(() => {
          checkBudget();
          return render(req.originalUrl, req.cookies, { signal });
        })
        .finally(release);
      const aborted = new Promise((_, reject) => {
        onAbort = () => reject(signal.reason);
        signal.addEventListener('abort', onAbort, { once: true });
        if (signal.aborted) onAbort();
      });
      const { cookies, helmet, styles, appHtml, serverData } = await Promise.race([work, aborted]);
      checkBudget();
      const html = template
        .replace(`<!--app-head-->`, helmet)
        // Custom Emotion rules must follow the bundled Mantine stylesheets.
        .replace('</head>', `${styles}</head>`)
        .replace(`<!--app-html-->`, appHtml)
        .replace(`<!--app-server-data-->`, serverData);
      res.status(200).set({ 'Content-Type': 'text/html' });
      for (const name in cookies.add) {
        res.cookie(name, cookies.add[name], {
          domain: env.VITE_COOKIE_DOMAIN,
          expires: new Date(Date.now() + 365 * 24 * 3600 * 1000),
        });
      }
      for (const name of cookies.remove) {
        res.clearCookie(name, {
          domain: env.VITE_COOKIE_DOMAIN,
          expires: new Date(Date.now() + 365 * 24 * 3600 * 1000),
        });
      }
      res.end(html);
    } catch (error) {
      const wasAborted = signal.aborted;
      if (!wasAborted) controller.abort(error);
      if (res.destroyed || res.writableEnded) return;
      if (wasAborted) {
        if (signal.reason?.name === 'TimeoutError') res.status(504).end();
      } else if (error.status === 503) {
        res.status(503).set({ 'Retry-After': '1' }).end();
      } else {
        next(error);
      }
    } finally {
      clearTimeout(timer);
      req.removeListener('aborted', disconnected);
      res.removeListener('close', disconnected);
      if (onAbort) signal.removeEventListener('abort', onAbort);
    }
  };
}

export async function createServer(app, env) {
  const resolve = (p) => path.resolve(__dirname, p);

  let gameApi;
  app.use(async (req, res, next) => {
    const pathname = (req.url ?? '').split('?')[0];
    if (pathname !== '/api/game' && !pathname.startsWith('/api/game/')) {
      return next();
    }
    try {
      gameApi ??= import('./dist/server/gameApi.js').then(({ createGameApi }) =>
        createGameApi({ ...process.env, ...env })
      );
      const handler = await gameApi;
      await handler(req, res, next);
    } catch (error) {
      gameApi = undefined;
      next(error);
    }
  });
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

  const template = fs.readFileSync(resolve('dist/client/index.html'), 'utf-8');
  let renderer;
  app.use(
    createSsrHandler(
      async (...args) => {
        renderer ??= import('./dist/server/server.js');
        return (await renderer).SSRRender(...args);
      },
      template,
      env
    )
  );

  return app;
}
