## Fenrir: Pantheon e2e testing tool

Goals:

- e2e testing
- performance testing
- try to set things on fire as much as possible

Fenrir uses Playwright as testing framework.

#### Account-backed test setup

SMOKE-004 creates nine fresh ordinary accounts through Frey before browser actions. On the development stack, configure `FREY_URL` with its `.pantheon.local` URL. The helper uses `RequestRegistration` and `ApproveRegistration` with Frey's development confirmation codes, without requiring superadmin credentials or sending email.

Alternatively, provide both `E2E_SUPERADMIN_EMAIL` and `E2E_SUPERADMIN_PASSWORD` for an existing Frey superadmin through the Fenrir process environment or an ignored `Fenrir/.env.e2e.local` file. This selects the guarded `E2eCreateAccounts` RPC and requires Frey to run with `E2E_TEST_MODE=1`. Playwright reads the local file when run from the Fenrir directory, including inside the container; exported environment variables take precedence. Do not put credentials in tracked environment files. Incomplete or invalid credentials fail explicitly; setup does not bootstrap or grant superadmin rights. Without credentials, setup requires a `.pantheon.local` Frey URL and actual development confirmation codes.

Follow the root README's development `make e2e_dev` flow. To run only this case inside the running Fenrir container, enter it with `make -C Fenrir shell`, then run from `/var/www/html/Fenrir`:

```sh
CI=true ./node_modules/.bin/playwright test tests/events.spec.ts --grep SMOKE-004
```

The test uses a fresh ordinary account as the event administrator. Accounts and the uniquely named TEST event are retained in the test environment. See [the case description](testcases/smoke-004-create-event-with-users.md) for assertions and coverage limits.

#### Legend

Fenrir plays a key role during the events of Ragnarök, where he is foretold to assist in setting the world aflame, resulting in the collapse of humanity and society.
