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

### Legend

**Mimir** is a figure in Norse mythology renowned for his knowledge and wisdom. See wikipedia for details :)
