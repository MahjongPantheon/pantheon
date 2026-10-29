## Fenrir: Pantheon e2e testing tool

Goals:

- e2e testing
- performance testing
- try to set things on fire as much as possible

CI retries failed tests twice to collect diagnostics, but a test that passes only
on retry still fails the run (`failOnFlakyTests`). The workflow and results table
therefore report flaky tests as failures.

Fenrir uses Playwright as testing framework.

#### Debugging with Playwright UI

With the development stack and Fenrir container running, execute from the repository root:

```sh
make e2e_ui
```

Open [http://localhost:4011](http://localhost:4011) in your host browser and keep the command running. Use the localhost URL so browser features such as service workers have a secure context. No custom hostname, hosts-file entry, HTTPS setup, or external reverse proxy is needed.

Select a test (for example, filter by `SMOKE-004`), press its run button, and inspect the action timeline, DOM snapshots, source, network requests, and errors. Enable the eye icon to rerun tests when their source changes. Tests and their browsers execute inside Fenrir, so the host browser does not need to resolve the service domains. UI runs use one worker and no retries. They create test data just like normal E2E runs.

Press Ctrl+C in the terminal to stop the UI server. You can also use `make -C Fenrir container_ui` from the host, or `make ui` from `/var/www/html/Fenrir` inside the container. The UI uses port 4017 inside Fenrir and the Nginx/WebSocket proxy to container port 80, published at host `127.0.0.1:4011`. The target copies the mounted proxy configuration into Ubuntu Nginx's `conf.d` directory, validates it, and reloads Nginx before starting Playwright. This also fixes existing containers whose image copied the configuration into the unused `http.d` directory. The Compose mapping publishes container port 80 at host port 4011; recreate an existing Fenrir container if it still publishes the previous host port. Run only one UI server at a time; no desktop display or X server is required.

If Fenrir is not running, start only its container against the already-running development stack:

```sh
ENV_FILENAME=.env.e2e docker compose -f docker-compose-amd64.yml --profile e2e up -d --no-deps fenrir.pantheon.internal
```

Use `docker-compose-arm64.yml` on ARM. For missing dependencies or browser executables, run `make -C Fenrir container_deps`. Starting UI mode does not rebuild services or automatically run the test suite.

See [Playwright's UI Mode documentation](https://playwright.dev/docs/test-ui-mode) for the debugging controls.

#### Account-backed test setup

SMOKE-004, SMOKE-005, and SMOKE-006 each create nine fresh ordinary accounts through Frey before browser actions. On the development stack, configure `FREY_URL` with its `.pantheon.local` URL. The helper uses `RequestRegistration` and `ApproveRegistration` with Frey's development confirmation codes, without requiring superadmin credentials or sending email.

Alternatively, provide both `E2E_SUPERADMIN_EMAIL` and `E2E_SUPERADMIN_PASSWORD` for an existing Frey superadmin through the Fenrir process environment or an ignored `Fenrir/.env.e2e.local` file. This selects the guarded `E2eCreateAccounts` RPC and requires Frey to run with `E2E_TEST_MODE=1`. Playwright reads the local file when run from the Fenrir directory, including inside the container; exported environment variables take precedence. Do not put credentials in tracked environment files. Incomplete or invalid credentials fail explicitly; setup does not bootstrap or grant superadmin rights. Without credentials, setup requires a `.pantheon.local` Frey URL and actual development confirmation codes.

The CI production-build flow uses `.pantheon.internal` hosts from `Env/.env.e2e`. Its workflow bootstraps the default administrator in the fresh CI database, writes its fixture credentials to the ignored local file, and selects the guarded API path. Browser actions still use newly created ordinary accounts. Production server builds receive the e2e configuration as their runtime `.env.production` file. Development runs use `Env/.env.development` and the already-running `.pantheon.local` services instead.

Follow the root README's development `make e2e_dev` flow. To run only this case inside the running Fenrir container, enter it with `make -C Fenrir shell`, then run from `/var/www/html/Fenrir`:

```sh
CI=true ./node_modules/.bin/playwright test tests/events.spec.ts --grep SMOKE-004
```

SMOKE-005 follows the same account setup, records a complete local session in Tyr, and compares the finished results with Sigrun. Run it with `CI=true ./node_modules/.bin/playwright test tests/local-session.spec.ts --grep SMOKE-005`; see [its case description](testcases/smoke-005-local-session-round-outcomes.md) for the round sequence and score checkpoints.

SMOKE-006 records six tournament games across random, Swiss, and interval seatings, including all 46 yaku, timer start, round cancellation, and administrator approval. Each game receives a randomly assigned small hand subset without replacement; the six subsets together cover all yaku. The report records the hand plan. Tyr's complete log is checked once immediately before each game's final hand, and Sigrun logs use a single collection comparison. Its per-attempt timeout is 60 minutes, with 30-second action and tournament-transition waits. Run it with `CI=true ./node_modules/.bin/playwright test tests/tournament.spec.ts --grep SMOKE-006`; see [its case description](testcases/smoke-006-basic-tournament-seatings.md).

The tests use a fresh ordinary account as the event administrator. Accounts and the uniquely named TEST event are retained in the test environment. See [the case description](testcases/smoke-004-create-event-with-users.md) for assertions and coverage limits.

SMOKE-005 has a 30-minute per-attempt timeout. Both scenarios use the [compatible hand catalogue](testcases/smoke-hand-catalogue.md) and explicit score fixtures, with varied fu/dora and complete yaku coverage per event. These budgets also apply in Playwright UI; individual missing controls still fail within their bounded action/assertion waits.

#### Legend

Fenrir plays a key role during the events of Ragnarök, where he is foretold to assist in setting the world aflame, resulting in the collapse of humanity and society.
