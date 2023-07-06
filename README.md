## Mahjong Pantheon: automated statistics & assistance for japanese riichi mahjong sessions.

![](https://img.shields.io/github/actions/workflow/status/MahjongPantheon/pantheon/build.yml?branch=master&style=for-the-badge)
![](https://img.shields.io/github/license/MahjongPantheon/pantheon?style=for-the-badge)

Pantheon project consists of some submodules, each of those might be installed standalone (see instructions in folder 
of each submodule). To quickly run Pantheon locally using Docker, read further.

You may use github issues for error reports and feature requests. Pull requests are especially welcome :)

- Support chat (EN): https://discord.gg/U5qBkexfEQ
- Support chat (RU): https://t.me/pantheon_support

### Production build

Clone the pantheon repository to your own server. Make sure repo folder is not accessible for the outer world.

To deploy pantheon on your own VPS or personal environment on production mode:

1. Make sure you have GNU Make installed on your system. Also one of the following should be installed:
   - Docker with compose plugin - to run containers via docker runtime
   - Podman-docker wrapper and podman-compose - to run containers over kubernetes setup.
     - If you're using podman, please make sure you have `ip_tables` module inserted into your kernel on the host. Otherwise, containers will fail to start.
2. Create new environment config file `Env/.env.production`. There are examples in `Env` folder. Fill the file with proper settings for your setup.
3. Fill new environment file with proper values, mostly it's about hosts, where you want the services to be accessible from the outer internet. Please note: setting up Nginx or any other reverse proxy is your responsibility. You may refer to `nginx-reverse-proxy.example.conf` file for basic nginx setup.
4. Set up your reverse proxy, add SSL certificates (optionally). Point your reverse proxy entry points to following ports:
   1. Game API (Mimir) to port 4001 
   2. User API (Frey) to port 4004 
   3. Ratings service (Sigrun) to port 4002 
   4. Mobile assistant (Tyr) to port 4103 
   5. Admin panel (Forseti) to port 4107
   6. System logger and statistics system (Hugin) to port 4010
   7. (optional) System monitoring (Munin) to port 4011
   8. (optional) PgAdmin4 host to port 5632
5. Run `make pull` to fetch fresh containers from registry.
6. Run `make prod_start` to start containers
7. Run the following command: `make prod_compile`. This will build all static files for Tyr/Forseti/Sigrun and Sigrun server.
8. If you're making a fresh setup, run `make bootstrap_admin` to bootstrap a super-administrator account (admin@localhost.localdomain with password 123456). Don't do this on database that already has users!
9. Basically, you're done :)

To update code on production server you will need to do the following:

**Quick way**

Use `make prod_update` to fetch all changes from master branch. Please note that your setup and intentions must meet the following requirements:

- You use git-based version of code (cloned repository)
- You want to use code from master branch (please note - master is not always stable!)
- You don't have any changes is your working copy (except `Sigrun-dist/server.js` - this file is a result of `prod_compile`). If there are any changes, they will be discarded. You can check changes in your working copy using `git status` command. Production environment config is excluded from git, so it's guaranteed to be left untouched.

**Long way**

Basically these are the same commands that are done inside `make prod_update` but performed one-by-one for better control.

1. Get new code from the repository (e.g. run `git fetch && git checkout origin/master` in repo folder)
2. Pull new containers using `make pull`
3. Restart containers with `make prod_restart` (please use this exact command, otherwise email service will be started with wrong environment settings)
4. Run `make prod_compile` to build newer versions of the static code.

If you ever change the environment variables in your current `Env/.env.production` file, you should also restart the containers using `make prod_restart`. After that,
if `VITE_*` variables have been changed, you should also run `make prod_compile` for changes to take effect.

Please note that db and pgadmin containers are not restarted during `make prod_restart`. To stop these containers as well, use `make prod_stop_all`. This is rarely needed, though.

#### Email agent

Pantheon provides container with pre-installed email agent (Hermod). If you want to send emails signed with DKIM, you will need to place your private keys
to `Hermod/opendkim_keys` folder. Also following setting are required: 
- Some unique key in `MAIL_ACTION_KEY` variable in your environment config.
- Mailer root host in `ALLOWED_SENDER_DOMAINS` variable in your environment config. Mailer address also will be set to `noreply@[allowed domain]`.

#### HTTPS

You may use `bin/letsencrypt-scripts` and `nginx-reverse-proxy.example.conf` as an example and reference to set up your SSL certificates using Let's Encrypt. 
If you're not intending to use https, please disable corresponding directives in your reverse proxy nginx config.

#### Setting up database backups

Pantheon provides built-in database backups using git. By default, it just stores database dump as new commits in `/var/lib/postgresql/backup` folder
of the `Database` container (you can get to shell using `make shell_db`). If you want to set up some remote backups, you should do the following:

- Set the `BACKUP_GIT_REMOTE` variable in your environment config to point to your backup remote repository. There is an example included in the env file.
- Go to `Database` folder and call `make backup_dump_pubkey` command to get ssh public key.
- Add this key to trusted keys in your account in Github, Gitlab or wherever your remote repository will reside.
- Restart the containers with `make prod_restart`

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

Make sure you have Docker and Docker Compose installed and daemon running on your system. For debugging, please make sure all the php extensions are
installed as well, see Dockerfile for a complete list. 

_Note: on some linux distros almost every docker-related command should be run as root. If nothing happens, or error
is displayed, try adding `sudo` before `make`._

1. Run `make dev` to build and start all containers, install dependencies for all projects, run database migrations and start webpack dev servers for Tyr and Forseti.
2. After everything is build, you can use `make logs` and `make php_logs` in each subsystem folder to view logs in real-time. Also you may use `make shell` to get
to container shell, if you want to. Notice that killing php-fpm, postgres or nginx will ruin the container entirely.
3. You can use `make pantheon_stop` to stop all containers (without deleting the data) and `make kill` to stop the container AND clean images (e.g. this will remove all db data).

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
  - Mimir database port: `5432`
  - Mimir database user: `mimir`
  - Mimir database password: `pgpass`
  - Frey database host: `db`
  - Frey database port: `5432`
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
