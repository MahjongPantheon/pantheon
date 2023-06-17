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
3. Fill new environment file with proper values, mostly it's about hosts, where you want the services to be accessible from the outer internet. Please note: setting up Nginx or any other reverse proxy is your responsibility. You may refer to `nginx-reverse-proxy.example.conf` file for basic nginx setup and use `prebuilt.reverse-proxy.env` environment config as a reference.
4. Set up your reverse proxy, add SSL certificates (optionally). Point your reverse proxy entry points to following ports:
   1. Game API (Mimir) to port 4001 
   2. User API (Frey) to port 4004 
   3. Ratings service (Sigrun) to port 4002 
   4. Mobile assistant (Tyr) to port 4103 
   5. Admin panel (Forseti) to port 4107 
5. Modify Sigrun configuration file in `Sigrun/.env.production` to match your server settings.
6. Run the following command: `ENV_FILENAME=yourenv.env make prod_compile`. This will build and run all containers.
7. If you're making a fresh setup, run `make bootstrap_admin` to bootstrap a super-administrator account (admin@localhost.localdomain with password 123456).
8. Review config files of Frey and Mimir - probably you might want to create your local configs for better manageability. You can make `config/local/` folders in each subsystem and add there local configs.
9. Copy configuration file for Sigrun from `Sigrun/.env.production` to `Sigrun-dist/.env.production`. Note that config files whould be the same, otherwise expect side-effects.
10. Basically, you're done :)

#### Email agent

Pantheon provides container with pre-installed email agent (Hermod). If you want to send emails signed with DKIM, you will need to place your private keys
to `Hermod/opendkim_keys` folder. Also following setting are required: 
- Some unique key in `MAIL_ACTION_KEY` variable environment file in `Common/envs/` folder to prevent unauthorized access.
- Mailer root host in `ALLOWED_SENDER_DOMAINS` variable environment file in `Common/envs/` folder.
- `mailer.mailer_addr` variable in your Frey config to set proper mailer address to send emails from.

#### Setting up database backups

Pantheon provides built-in database backups using git. By default, it just stores database dump as new commits in `/var/lib/postgresql/backup` folder
of the `Database` container (you can get to shell using `make shell_db`). If you want to set up some remote backups, you should do the following:

- Ensure containers are not running
- Set the `BACKUP_GIT_REMOTE` variable in your environment config to point to your backup remote repository. There is an example included in the env file.
- Go to `Database` folder and call `make backup_dump_pubkey` command to get ssh public key.
- Add this key to trusted keys in your account in Github, Gitlab or wherever your remote repository will reside.
- Start the containers

Every 15 minutes the database dump is made. You may view history of backups using `make backup_show_history` in `Database` folder. To rollback your
database to previous state you may use either included pgadmin4 container (running at 5632 port) or the one-liner command from the `Database` folder:
`COMMIT=1234567 make backup_restore`, where `1234567` should be replaced with target commit hash (which can be found using `make backup_show_history` command). 
Please note that one-liner will rollback both mimir and frey databases!

Please note that backups will consume quite much disk space. To clean up some space you may consider deleting the `/var/lib/postgresql/backup/.git` directory
and changing the `BACKUP_GIT_REMOTE` variable, followed by containers restart.

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
- 4002 for **Sigrun** public interface (http://localhost:4002/)
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

#### Email agent

Pantheon provides container with pre-installed email agent (Hermod). You can view last sent email in CLI using `make dump_last_mail` command.
This is useful to test registration and password recovery, because emails sent from the developer environment will most likely be rejected
by target email relay (e.g. gmail rejects it in 100% of cases).

### Pull requests

Any pull request should pass all current code style checks; also all unit tests should pass. Don't forget to run
`make check` (with `sudo` if required) before sending your pull request. To fix all code style issues automatically
(in php code only), run `make autofix` (also `sudo` may be required).

### External services

One may want to use Pantheon API in some own external service. Please make sure you have protoc v3.21.9-r0 so generated
binary code matches our protocol version. 
