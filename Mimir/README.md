## Mimir: game storage

![Mimir](www/mimirhires.png?raw=true 'Mimir')

**Mimir** is a backend for [Tyr](https://github.com/MahjongPantheon/pantheon/tree/master/Tyr) (mobile assistant),
[Forseti](https://github.com/MahjongPantheon/pantheon/tree/master/Forseti) (user profile and administration service), and
[Sigrun](https://github.com/MahjongPantheon/pantheon/tree/master/Sigrun) (rating tables and visualizations).
Mimir provides storage of game information for japanese (riichi) mahjong sessions.

### Features

We needed a simple but stateful API for gaming assistance in aspects like:

- Storing game log for an offline game.
- Automated scoring and game log sanity checking (for offline games).
- Fetching game logs from online mahjong services.
- Keeping players' gameplay history and make some interesting statistics for their games.
- Automating creating and performing of online and offline tournaments.
- And many more...

### Developer information

We accept any help with developing, testing and improving our system, so please feel free to create issues or send
pull requests for missing functionality.

Run `make container_test` from this directory to seed the test database and run the tests with
combined coverage from Vitest and the separate Twirp test server. The server captures its executed sources and flushes its V8 coverage
before teardown. Both processes use Vitest's V8-to-Istanbul AST converter and source maps;
nyc merges their source coverage. Generated tsx module helpers are excluded, and
function/branch locations are aligned by their original source nodes so the same code
is counted once across the two transforms.
The combined console summary, `coverage/index.html`, `coverage/lcov.info`, and
`coverage/coverage-final.json` include both processes. The separate reports remain in
`coverage/vitest` and `coverage/server` for inspection. Coverage is cleared before each run,
and failed tests still return a failing exit status after report generation.

The combined report must reach at least 85% for lines, statements, functions, and
branches. Coverage tooling regression tests run before the suite and verify that
source alignment preserves counters and rejects ambiguous mappings.

The `test_verbose` and `test_noserver` targets retain their existing debugging behavior without
generating the combined report. The coverage target starts and stops its own test server.

The normal test target also builds the production server and runs it from an isolated
directory against the seeded test database. This checks that the deployed bundle can
read an event without TypeScript sources. Deploy both `server.js` and `metadata.json`;
the latter contains the ORM metadata generated from the source entities during the build.
Register new entities in `src/mikro-orm.config.ts` so they are included in the bundle and its metadata.

### Retry-safe mutations

`CreateEvent` and `StartGame` require a client-generated `request_id`. Generate it once
per logical submission and reuse it on retries. Keys are scoped to the authenticated
caller and RPC method. A reused key with different parameters is rejected.

`GetSessionOverview` returns the persisted `next_round_token`. Send it as `round_token`
to `AddRound`; every accepted round, including chombo, rotates it. Repeated overview
reads do not rotate the token. Undo, extra-time changes, cancellation, definalization,
and forced completion invalidate outstanding tokens. Clients refresh the overview after successful round
submission or a stale-token conflict. A delayed retry returns its original response,
which may describe an older session state.

PostgreSQL transaction advisory locks serialize requests sharing a key. Operation
receipts in `rpc_operation` commit with business writes and survive undo; they have
no automatic expiration. Deleting receipts removes replay protection for old requests.
The frontend keeps pending keys in session storage across ambiguous failures and
reloads, and clears them after success or a definitive token conflict. Authentication
failures retain the pending key so reauthentication cannot cause duplicate creation.

Apply `Migration20261021000000` before deploying the updated server and clients. It
backfills existing sessions with distinct tokens. Updated clients are required for
these three write RPCs. Event-creation retries resume the initial Frey permission
grant using the saved event ID. Other external notifications retain their existing
failure semantics; database idempotency does not make remote calls transactional.

### Scheduled workers

Supervisor runs `cron/cron.ts`, a scheduler with no database or Redis connections.
Every minute it launches a separate Node process for each of `achievements`,
`playerStats`, `scoring`, and `metrics`. Each process initializes its own services, executes
one bounded batch, closes its services, and exits. Business handlers accept a
repository; `cron/runner.ts` owns initialization, transactions, and cleanup.

The scheduler skips a job type while its previous child is still running. A
PostgreSQL transaction advisory lock also excludes workers of the same type
across scheduler processes and containers. Lock identifiers in `cron/jobs.ts`
must remain stable across deployments. Different job types can run concurrently.
Results and completed queue entries commit together. Failed batches remain queued
for the next tick; all started operations settle before rollback begins.

Each execution has a five-minute deadline, including startup and cleanup. The
scheduler sends SIGTERM at the deadline and SIGKILL after a five-second grace
period, and waits for child closure before permitting another execution. Shutdown
stops scheduling and terminates active children. PostgreSQL releases their locks
when their transactions end or their connections close. Supervisor allows fifteen
seconds for shutdown and terminates the process group as a fallback.

Workers log JSON records with job name, status, processed count, and duration;
the scheduler also logs child exit codes, signals, and timeouts. Missed ticks are
skipped, not replayed; queued rebuilds remain in PostgreSQL. Metrics requests have
a thirty-second HTTP timeout. To run one execution manually from Mimir:
`pnpm exec tsx cron/worker.ts achievements` (use the normal environment; this
processes queued jobs in its configured database).

### Legend

**Mimir** is a figure in Norse mythology renowned for his knowledge and wisdom. See wikipedia for details :)

### Development sample data

From the repository root, run `make seed` for a 12-player club rating (36 sessions),
`make seed_tournament` for a 16-player tournament (16 sessions), or
`make seed_bigevent` for a 128-player tournament (256 sessions).
These commands require running development Mimir, Frey, and database containers.
They reject production and test environments and ask you to type `yes` before
changing data. They delete **all data in the configured Mimir database**, recreate
it through migrations, bootstrap the default development administrator in Frey,
and create sample accounts through the real Frey API. Existing Frey player
accounts are preserved; each run creates a new set of accounts with unique emails.
The administrator has email `admin@localhost.localdomain` and password `123456`.

Each event includes registrations, completed sessions with ten rounds each,
hand records, results, and cumulative player history. Every session includes ron,
tsumo, draw, abort, chombo, nagashi, and multiron. Winning hands reuse selected
TestSeeder samples with calculated yaku/dora han and explicit fu components.
A custom development ruleset enables abortive draws, nagashi, and reverse-mangan
chombo payments. SessionState calculates scores, honba, riichi pots, and round
progression; sessions continue until South 4 has ended. Each event includes
compatible 5-, 6-, 8-, 11-, and 13-han combinations, plus single natural yakuman
(kokushi ron and suuankou tsumo). Fu is zero for limit hands and yakuman because
it does not affect their payments. Counted yakuman is enabled for 13-han hands;
natural yakuman uses the API convention of `han = -1`. All player IDs come from
Frey. The administrator receives event administration rights. Statistics and
achievements are populated by the usual cron jobs, as with TestSeeder.
Sample players also use password `123456`; their emails and IDs are recorded
in `/tmp/dump_users.txt` inside the Frey container. The command prints the event URL.

The corresponding `container_seed`, `container_seed_tournament`, and
`container_seed_bigevent` targets in Mimir also ask for confirmation, but expect
that `make bootstrap_admin` has already been run from the root. These commands
are for disposable development databases only. A failed run can leave partial
sample data in Frey; rerun the command to reset Mimir and create fresh samples.

### Individual yakuhai

Apply `Migration20261024000000` before deploying individual wind and dragon yaku.
It enables IDs 48–58 in existing events that allow legacy Yakuhai. IDs 13–16
remain valid for historical hands. The event ruleset selects separate wind/dragon
names or aggregated Yakuhai ×1–×4 for Tyr entry and new online imports. Existing imported hands are unchanged.

Apply `Migration20261025000000` to keep all existing events in aggregated mode.
Ruleset presets default to separate names (`useAggregatedYakuhai = false`).
Forseti’s Create event page defaults tournaments to aggregated yakuhai and local
or online events to separate names. Admins can change the checkbox manually.
No historical hands are rewritten.

### Tobi ruleset setting

Apply `Migration20261027000000` before deploying the updated server and clients.
It renames the stored `withButtobi` rule to `withTobi`, preserving each event's
setting. The protobuf field keeps number 14; JSON clients must use `withTobi`.
With tobi enabled, riichi requires at least 1,000 points before the round's payments.

### Registration local IDs

Apply `Migration20261029000000` before deploying the local-ID registration fix.
It enforces one registration per `(event_id, player_id)`. Before adding the unique
constraint, it automatically deletes duplicate registrations, keeping the row with
the highest registration ID for each pair. That row's local ID, replacement,
seating flag, and team name are preserved together. Deleted rows cannot be restored
by rolling the migration down. The cleanup and constraint creation run under a
table lock in the migration transaction.

Local-ID saves now update existing registrations in one transaction, support swaps, and reject unknown players,
duplicate mappings, invalid IDs, and IDs owned by omitted players. They preserve
registration IDs and other registration fields.

Team-name saves also preserve registration identity and all other fields. They
reject unknown or repeated players and existing duplicate registrations. Both
forms refresh registration data after saving, so switching tabs retains the saved
values.
