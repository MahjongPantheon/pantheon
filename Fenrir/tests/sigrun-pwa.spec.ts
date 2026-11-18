import { createServer, request } from 'node:http';
import { test, expect } from '@playwright/test';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

test('PWA-001: Visitor can reload Sigrun online and open its cached shell offline', async ({
  page,
  context,
}) => {
  test.setTimeout(90_000);
  const target = new URL(process.env.SIGRUN_URL!);
  // A loopback origin enables real service workers over HTTP in the local stack.
  const proxy = createServer((req, res) => {
    const upstream = request(
      new URL(req.url ?? '/', target),
      { method: req.method, headers: { ...req.headers, host: target.host } },
      (response) => {
        res.writeHead(response.statusCode ?? 502, response.headers);
        response.pipe(res);
      }
    );
    upstream.on('error', () => {
      res.writeHead(502);
      res.end();
    });
    req.pipe(upstream);
  });
  await new Promise<void>((resolve) => {
    proxy.listen(0, '127.0.0.1', resolve);
  });
  const address = proxy.address();
  if (!address || typeof address === 'string') throw new Error('Missing proxy address');
  const origin = `http://127.0.0.1:${address.port}`;
  const hydrationErrors: string[] = [];
  page.on('pageerror', (error) => {
    if (/React error #(418|419|423)|hydrat|server.*Suspense/i.test(error.message)) {
      hydrationErrors.push(error.message);
    }
  });
  const hasServerData = () => page.evaluate(() => 'initialData' in window);
  try {
    const first = await page.goto(`${origin}/`);
    expect(first?.ok()).toBe(true);
    test.skip(!(await hasServerData()), 'Requires a production SSR build of Sigrun');
    await expect(page.getByTestId('sigrun-events-page')).toBeVisible();
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
            once: true,
          });
        });
      }
    });

    const online = await page.reload();
    expect(online?.fromServiceWorker()).toBe(true);
    expect(await hasServerData()).toBe(true);
    await expect(page.getByTestId('sigrun-events-page')).toBeVisible();

    await context.setOffline(true);
    const offline = await page.goto(`${origin}/page/2`);
    expect(offline?.ok()).toBe(true);
    expect(offline?.fromServiceWorker()).toBe(true);
    expect(await hasServerData()).toBe(false);
    await expect(page.getByTestId('sigrun-events-page')).toBeVisible();

    await context.setOffline(false);
    await page.reload();
    expect(await hasServerData()).toBe(true);
    await expect(page.getByTestId('sigrun-events-page')).toBeVisible();
    expect(hydrationErrors).toEqual([]);
  } finally {
    await context.setOffline(false);
    proxy.closeAllConnections();
    await new Promise<void>((resolve) => {
      proxy.close(() => resolve());
    });
  }
});
