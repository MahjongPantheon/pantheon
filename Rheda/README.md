## Rheda: visualizer & control panel
![Rheda](www/assets/ico/rhedahires.png?raw=true "Rheda")

[![Build Status](https://travis-ci.org/MahjongPantheon/Rheda.svg?branch=master)](https://travis-ci.org/MahjongPantheon/Rheda)

**Rheda** provides visualization tools and control panel for japanese (riichi) mahjong sessions and events. 

Features:

- Shows last games in detail
- Shows rating table
- May show timer for tournaments, if any timer is set up.
- Show player's statistics for current event/tournament:
  - Rating change history graph
  - 1-4 places percentage
  - Count and value of hands won
  - Some other stats

Administration features:

- Allows starting a tournament session with random or manual seating
- Allows players' enrollment and registration, enrolled players also get their PIN code, which will identify them in [Tyr](https://github.com/MahjongPantheon/Tyr).
- Allows additional penalties for players.
- Shows current state of tournament tables and recently added rounds.
- Allows cancellation of round results, recently added through [Tyr](https://github.com/MahjongPantheon/Tyr).

**Rheda** is a part of [Pantheon](https://github.com/MahjongPantheon) system.

Please use our [Bug tracker](https://pantheon.myjetbrains.com/youtrack/issues/RHEDA) for error reports and feature requests.

### Technologies of Rheda

- Rheda is simple PHP-based multi-page application.
- Written in PHP v5.5+.
- Uses jQuery & Twitter Bootstrap on client side.
- Rheda autodetects mobile clients and sends them mobile-friendly version of content. *Note: Administration features of Rheda are not available from mobile-friendly version.*

### Local installation

- Make sure you run *nix-based OS or VM. Rheda is not tested to run on Windows host.
- To install all dependencies, run `make deps`.
- Edit `config/sysconf.php` and fill in your [Mimir](https://github.com/MahjongPantheon/Mimir) API server url.
- Run `make dev` to start Rheda in development mode. Rheda will listen on port 8001.
- On production environment, set up your web server to use `www` folder as document root. Also it should invoke `www/index.php` as default entry point for every requested path that is not a file or directory.

### Development

- Run `make deps` and then `make dev` to run dev server.
- Use `make lint` to check code style.
- Use `make autofix` to fix all codestyle problems, that can be fixed automatically.
- Remember to use PSR2 coding standards when adding php code.

Please send your issues and pull requests. Any help is appreciated.

### Legend

**Rheda** is Anglo-Saxon goddess, associated with victory and fame. See wikipedia for details :)
