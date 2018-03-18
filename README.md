## Mahjong Pantheon: automated statistics & assistance for japanese riichi mahjong sessions.

[![Build Status](https://travis-ci.org/MahjongPantheon/pantheon.svg?branch=master)](https://travis-ci.org/MahjongPantheon/pantheon)

Pantheon project consists of some submodules, each of those might be installed standalone (see instructions in folder 
of each submodule). To quickly run Pantheon locally using Docker, read further.

Join our [Gitter chat](https://gitter.im/MahjongPantheon/Lobby) for news, announcements and developer conversations.

Also use our [Bug tracker](https://pantheon.myjetbrains.com/youtrack/issues/PANTHEON) for error reports and feature requests.

### Preparations

Pantheon developer environment works on *nix hosts (mac, linux, *bsd). Windows-based systems 
are not supported (while it still MAY work, it is not tested at all, also you may want to try
using it under WSL in Windows 10+). 

Make sure you have Docker installed and daemon running on your system. Also Pantheon expects PHP7+ to be 
installed on your host system for some minor needs.

### Running containers

_Note: on some linux distros almost every docker-related command should be run as root. If nothing happens, or error
is displayed, try adding `sudo` before `make`._

1. `make container` to build a pantheon container (this should be done every time Dockerfile is changed).
2. `make run` to run the container and do all preparations inside of it (this should be done after each container shutdown).
3. `make dev` to install dependencies for all projects, run database migrations and start all servers.
4. Now you can use `make logs` and `make php_logs` to view all logs in real-time. Also you may use `make shell` to get
to container shell, if you want to. Notice that killing php-fpm, postgres or nginx will ruin the container entirely.
Use Dockerfile to alter their configuration.

To create new empty event, run `make empty_event` - and you will be able to access event with printed link. Admin
password for every generated empty event is `password`.
To create an event and fill it with some data, run `make seed` or `make seed_tournament` (with `sudo` if required). 
Note: this command will perform a full cleanup of data!

Default ports for services are:
- 4001 for **Mimir** JSON RPC API
- 4002 for **Rheda** interface (http://localhost:4002/)
- 4003 for **Tyr** mobile interface (http://localhost:4003/)
- 4004 for **Frey** user management backend, also JSON RPC (http://localhost:4004/)
- 5532 for PostgreSQL connections - use pgAdmin3/4 or any other client to access your databases.

### Pull requests

Any pull request should pass all current code style checks; also all unit tests should pass. Don't forget to run
`make check` (with `sudo` if required) before sending your pull request. To fix all code style issues automatically
(in php code only), run `make autofix` (also `sudo` may be required).
