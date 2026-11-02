## Frey: player authenticity verification & personal info management

![Frey](www/freyhires.png?raw=true 'Frey')

**Frey** is a low-level backend for [Mimir](https://github.com/MahjongPantheon/pantheon/tree/master/Mimir) (storage service),
[Tyr](https://github.com/MahjongPantheon/pantheon/tree/master/Tyr) (mobile assistant),
[Forseti](https://github.com/MahjongPantheon/pantheon/tree/master/Forseti) (user profile and administration service), and
[Sigrun](https://github.com/MahjongPantheon/pantheon/tree/master/Sigrun) (rating tables and visualizations). Frey provides authentication service
and players' personal data storage.

### Features

Frey is a simple authentication service with abilities of personal data storage. This includes:

- Player auth info storage to allow universal log-in within all pantheon services;
- Storage of personal info (like nicknames, avatars, links with social networks, etc).
- ACL abilities: Frey can decide if user can do something or not.
- And many more...

### Developer information

#### Test coverage

`bin/pantheon test Frey` runs Vitest and the external test server with V8 coverage enabled.
The server captures its executed sources and flushes its counters before teardown.
Both processes use Vitest's V8-to-Istanbul AST converter and source maps; `nyc`
merges their source coverage. Generated tsx module helpers are excluded, and
function/branch locations are aligned by their original source nodes so the same
code is counted once across the two transforms. The combined
text, HTML, LCOV, and JSON reports are written to `Frey/coverage/` (open
`coverage/index.html` for the HTML report). Each run clears the previous reports
and preserves Vitest's failing exit status while still reporting coverage.

The debug flows (`bin/pantheon test --verbose Frey` and `bin/pantheon task Frey test-noserver`) continue to run
Vitest directly without collecting server coverage.

The combined report must reach at least 85% for lines, statements, functions, and
branches. Coverage tooling regression tests run before the suite and verify that
source alignment preserves counters and rejects ambiguous mappings.

#### Password recovery and avatar authorization

Password recovery links expire after one hour and are single-use. Requesting a new
link, changing a password, or a superadmin updating the account email invalidates
previous links. Reset tokens are random and only their SHA-256 hashes are stored.
The `20261028-expire-password-reset` migration adds the expiry field and retires
all previously issued reset links. Apply Frey migrations before deploying this code.

Frey sends `INTERNAL_QUERY_SECRET` to Gullveig for avatar uploads. Configure the
same nonempty secret in both services and deploy their updates together; public
clients upload through Frey's authenticated profile API.

#### E2E test data RPCs

The Frey Twirp API at `/v2/common.Frey/` includes `E2eCreateAccounts`,
`E2eRegisterPlayers`, and `E2eUnregisterPlayers`. They are enabled only when
`E2E_TEST_MODE=1`, which is set in `Env/.env.e2e`. Every call also requires the
`X-Current-Person-Id` and `X-Auth-Token` headers of an authenticated Frey
superadmin. The internal-query secret does not grant access to these RPCs.

`E2eCreateAccounts` accepts `people`, a list of 1–100 `PersonsCreateAccountPayload`
records, and returns `personIds` in the same order. Use distinct email addresses
for each test run. `E2eRegisterPlayers` and `E2eUnregisterPlayers` accept an
`eventId` and 1–100 distinct `personIds`. Frey validates the IDs, then calls
Mimir's existing player registration RPC for each person, so Mimir's event rules
still apply. A failure partway through a batch leaves preceding changes in place.

We accept any help with developing, testing and improving our system, so please feel free to create issues or send
pull requests for missing functionality.

### Legend

**Frey** (or Freyr) is a god in Norse mythology associated with sacral kingship and prosperity, with sunshine
and fair weather. See wikipedia for details :)
