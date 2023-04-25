## Mahjong Pantheon: automated statistics & assistance for japanese riichi mahjong sessions.

![](https://img.shields.io/github/actions/workflow/status/MahjongPantheon/pantheon/build.yml?branch=master&style=for-the-badge)
![](https://img.shields.io/github/license/MahjongPantheon/pantheon?style=for-the-badge)

Pantheon project consists of some submodules, each of those might be installed standalone (see instructions in folder 
of each submodule). To quickly run Pantheon locally using Docker, read further.

You may use github issues for error reports and feature requests. Pull requests are especially welcome :)

- Support chat (EN): https://discord.gg/U5qBkexfEQ
- Support chat (RU): https://t.me/pantheon_support

### Production build

To deploy pantheon on your own VPS or personal environment on production mode:

1. Make sure you have Docker, Docker-compose, GNU Make and PHP8+ installed on your system.
2. Create new environment config file in `Common/envs/` folder. There are examples inside. If you just want to build pantheon in production mode locally, use `prebuiltlocal.env` file.
3. Fill new environment file with proper values, mostly it's about hosts, where you want the services to be accessible from the outer internet. Please note: setting up Nginx or any other reverse proxy is your responsibility. Pantheon does not offer any pre-made configs for it.
4. Set up your reverse proxy, add SSL certificates (optionally). Point your reverse proxy entry points to following ports:
   1. Game API (Mimir) to port 4001 
   2. User API (Frey) to port 4004 
   3. Ratings service (Rheda) to port 4002 
   4. Mobile assistant (Tyr) to port 4003 
   5. Admin panel (Forseti) to port 4007 
5. Run the following command: `ENV_FILENAME=yourenv.env make prod_compile`. This will build and run all containers, and also bootstrap an administrator account (admin@localhost.localdomain with password 123456).
6. Basically, you're done :)

### Development environment

Pantheon developer environment works on *nix hosts (mac, linux, *bsd). Windows-based systems 
are not supported (while it still MAY work, it is not tested at all, also you may want to try
using it under WSL in Windows 10+). 

Make sure you have Docker and Docker Compose installed and daemon running on your system. Also Pantheon expects PHP8+ to be 
installed on your host system for some minor needs. For debugging, please make sure all the php extensions are
installed as well, see Dockerfile for a complete list.

_Note: on some linux distros almost every docker-related command should be run as root. If nothing happens, or error
is displayed, try adding `sudo` before `make`._

1. Run `make dev` to build and start all containers, install dependencies for all projects, run database migrations and start webpack dev servers for Tyr and Forseti.
2. After everything is build, you can use `make logs` and `make php_logs` in each subsystem folder to view logs in real-time. Also you may use `make shell` to get
to container shell, if you want to. Notice that killing php-fpm, postgres or nginx will ruin the container entirely. Use Dockerfile to alter their configuration.
3. You can use `make stop` to stop all containers (without deleting the data) and `make kill` to stop the container AND clean images (e.g. this will remove all db data).

To create an event and fill it with some data, run `make seed`, `make seed_bigevent` or `make seed_tournament` (with `sudo` if required). Note that users are
re-seeded on each command run. 

A separate [guide about debugging in PhpStorm IDE](./docs/technical/phpstorm.md) is available.

Default ports for services are:
- 4001 for **Mimir** game management API (http://localhost:4001/)
- 4002 for **Rheda** interface (http://localhost:4002/)
- 4003 for **Tyr** mobile interface (http://localhost:4003/)
- 4004 for **Frey** user management backend (http://localhost:4004/)
- 4007 for **Forseti** management interface (http://localhost:4007/)
- 5532 for PostgreSQL connections - if you want to use external pgAdmin3/4 or any other client to access your databases.
- 5632 for pgAdmin4 container (http://localhost:5632/), which is run for convenience. You will need to setup initial connections using following credentials:
  - PgAdmin login: `dev@riichimahjong.org`
  - Password: `password`
  - Mimir database host: `db`
  - Mimir database port: `5532`
  - Mimir database user: `mimir`
  - Mimir database password: `pgpass`
  - Frey database host: `db`
  - Frey database port: `5532`
  - Frey database user: `frey`
  - Frey database password: `pgpass`

**Mimir** and **Frey** use [twirp](https://github.com/twitchtv/twirp) interface to communicate with other services.
See protocol description files in `Common` folder.

### Pull requests

Any pull request should pass all current code style checks; also all unit tests should pass. Don't forget to run
`make check` (with `sudo` if required) before sending your pull request. To fix all code style issues automatically
(in php code only), run `make autofix` (also `sudo` may be required).
