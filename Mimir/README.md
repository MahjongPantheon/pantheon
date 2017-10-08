## Mimir: game storage

![Mimir](www/mimirhires.png?raw=true "Mimir")

**Mimir** is a backend for [Tyr]() and [Rheda](), which provides storage of game information for japanese (riichi) mahjong sessions. 

[![Build Status](https://travis-ci.org/MahjongPantheon/Mimir.svg?branch=master)](https://travis-ci.org/MahjongPantheon/Mimir)

**Mimir** is a part of [Pantheon](https://github.com/MahjongPantheon) system.

Please use our [Bug tracker](https://pantheon.myjetbrains.com/youtrack/issues/MIMIR) for error reports and feature requests.

### Features

We needed a simple but stateful API for gaming assistance in aspects like:
- Storing game log for an offline game.
- Automated scoring and game log sanity checking (for offline games).
- Fetching game logs from online mahjong services.
- Keeping players' gameplay history and make some interesting statistics for their games.
- Automating creating and performing of online and offline tournaments.
- And many more...

### What's inside?

- Mimir uses JSON-RPC to communicate with clients.
- Supported RDBMS are sqlite, mysql (v5.5+) and pgsql (v9.5+), others may work too because of PDO under hood, but only after some little coding (you'll see :) ). Anyway, other RDBMS are not tested at all, use them at your own risk.
- PHP v5.5+ is required to run the API on your own server.
- [Api doc here](APIDOC.md)

### Installation gotchas

- PHP v5.6.x comes with `always_populate_raw_post_data = 0` in default php.ini, and this breaks JSON reply validity, if errors output is not disabled (you should disable it on production anyway! But it will flood your log files with crap :( ). When using this PHP version, you should set `always_populate_raw_post_data = -1` in your ini file.

### Developer information

We accept any help with developing, testing and improving our system, so please feel free to create issues or send pull requests for missing functionality.

To start developing the project, make sure you have installed a database server of your choice, PHP v5.5 or higher and appropriate PDO module.
You also will need standard `make` utility to use following shortcuts.
- Run `make deps` to install dependencies.
- Run php dev server on port 8000: `make dev`
- Use `make req METHOD_NAME [space-separated method args]` to test API methods. Port for the API is hardcoded inside, change it if you run dev server on different port.
- Use `make unit` to run unit tests and `make lint` to check code style.
- Use `make autofix` to fix all codestyle problems, that can be fixed automatically.
- Use `make apidoc` to regenerate api methods documentation file.
- Remember to use PSR2 coding standards when adding php code.
- The DB migrations are implemented using [Phinx](http://docs.phinx.org), see its documentation for details. Also you may run `make init_dev_sqlite` to create empty development DB for local testing purposes.

To generate or recreate sqlite db, run `make init_sqlite`.
To generate sql dump for mysql or pgsql, run `make init_mysql` or `make init_pgsql` - this will echo dump to stdout, so you can redirect the stream into the file you want.

Nginx is the recommended web server to run Mimir. See *nginx.example.com* file for typical installation nginx config.

### Versioning

Mimir uses Semver-like versioning system: *Major*.*Minor*.*Bugfix*
- Major version change occurs when breaking changes are made to the API. 
- Minor version changes when non-breaking fixes and features are implemented.  
- Bugfix version changes when one or several bug fixes are applied, and they do not change any essential system behavior.

Mimir's API protocol version matches Mimir's major and minor version: *Major*.*Minor*
- Clients should pass desired protocol version as X-Api-Version header.
- Mimir response also contains same header with current API protocol version.
- Different major versions of API are not expected to be compatible at all. Client should upgrade or downgrade to match API version.
- Different minor versions are expected to be forward and partially backward compatible. Client may lack some functionality and may not use some of response fields. But it's guaranteed that no existing functionality of any client within single major version could be broken.

### Legend

**Mimir** is a figure in Norse mythology renowned for his knowledge and wisdom. See wikipedia for details :)

