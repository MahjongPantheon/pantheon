## Rheda: visualizer & control panel
![Rheda](www/assets/ico/rhedahires.png?raw=true "Rheda")

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
- Allows players' registration.
- Allows additional penalties for players.
- Shows current state of tournament tables and recently added rounds.
- Allows cancellation of round results, recently added through [Tyr](https://github.com/MahjongPantheon/pantheon/tree/master/Tyr).

Please use our [Bug tracker](https://pantheon.myjetbrains.com/youtrack/issues/RHEDA) for error reports and feature requests.

### Technologies of Rheda

- Rheda is simple PHP-based multi-page application.
- Written in PHP v7.1+.
- Uses jQuery & Twitter Bootstrap on client side.
- Rheda autodetects mobile clients and sends them mobile-friendly version of content. *Note: Administration 
features of Rheda are not available from mobile-friendly version.*

### Standalone installation

- Make sure you run *nix-based OS or VM. Rheda is not tested to run on Windows host.
- To install all dependencies, run `make deps`.
- Edit `config/sysconf.php` and fill in your [Mimir](https://github.com/MahjongPantheon/pantheon/tree/master/Mimir) API server url.
- Set up your web server to use `www` folder as document root. Also it should invoke 
`www/index.php` as default entry point for every requested path that is not a file or directory.

### Legend

**Rheda** is Anglo-Saxon goddess, associated with victory and fame. See wikipedia for details :)
