# PWA-001: Visitor can reload Sigrun online and open its cached shell offline

## Purpose

Verify that an installed Sigrun service worker preserves SSR on ordinary online
reloads and renders the cached shell offline without React hydration errors.

## Scope

Sigrun's production SSR server, client bootstrap, and generated service worker.
The event list reads public event data from Mimir through Sigrun.

## Preconditions

- A compiled production Sigrun build is running at `SIGRUN_URL` with working SSR.
- No authentication or fixture accounts are required.
- The test proxies that URL through a temporary loopback HTTP listener so
  Chromium permits service workers without a TLS certificate.
- The development Vite server cannot establish SSR behavior; this case explicitly
  skips when the initial document lacks server hydration data.

## Test data

| Input              | Value     |
| ------------------ | --------- |
| Initial event list | `/`       |
| Offline event list | `/page/2` |

## Steps and expected results

| Step | Action                                                                              | Expected result                                                                                                                  |
| ---- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Open the initial event list in a fresh browser context.                             | The document succeeds, includes SSR data, and displays the events page.                                                          |
| 2    | Wait for the service worker to activate and control the page, then reload normally. | The navigation passes through the service worker, retains SSR data, and displays the events page.                                |
| 3    | Disconnect the browser and open another event-list page.                            | The service worker returns a successful cached shell without SSR data, and client rendering displays the events page.            |
| 4    | Reconnect and reload.                                                               | SSR data returns and the events page remains visible. No React hydration or unfinished-Suspense errors occurred during the test. |

## Cleanup and isolation

The Playwright browser context isolates service workers and cache storage. The
loopback listener uses an automatically assigned port, closes in `finally`, and
creates no database records. Browser connectivity is restored even after failure.

## Implementation and coverage

- Status: Implemented.
- Implementation: [sigrun-pwa.spec.ts](../tests/sigrun-pwa.spec.ts),
  `PWA-001: Visitor can reload Sigrun online and open its cached shell offline`.
- Coverage limits: The offline page shell renders, but fetching fresh event data
  while disconnected is outside this case. Other browsers and older deployed
  service workers are outside this browser test; Sigrun's bootstrap unit tests
  cover rendering the older cached shell.
