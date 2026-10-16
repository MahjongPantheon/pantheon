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
combined coverage from Jest and the separate Twirp test server. The server flushes its V8 coverage
before teardown; c8 converts it to Istanbul JSON, and nyc merges it with Jest's V8 coverage.
The combined console summary, `coverage/index.html`, `coverage/lcov.info`, and
`coverage/coverage-final.json` include both processes. The separate reports remain in
`coverage/jest` and `coverage/server` for inspection. Coverage is cleared before each run,
and failed tests still return a failing exit status after report generation.

The `test_verbose` and `test_noserver` targets retain their existing debugging behavior without
generating the combined report. The coverage target starts and stops its own test server.

The normal test target also builds the production server and runs it from an isolated
directory against the seeded test database. This checks that the deployed bundle can
read an event without TypeScript sources. Deploy both `server.js` and `metadata.json`;
the latter contains the ORM metadata generated from the source entities during the build.
Register new entities in `src/mikro-orm.config.ts` so they are included in the bundle and its metadata.

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
