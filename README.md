## Mahjong Pantheon: automated statistics & assistance for japanese riichi mahjong sessions.

![](https://img.shields.io/github/actions/workflow/status/MahjongPantheon/pantheon/build.yml?branch=master&style=for-the-badge)
![](https://img.shields.io/github/license/MahjongPantheon/pantheon?style=for-the-badge)

You may use github issues for error reports and feature requests. Pull requests are especially welcome :)

- Support chat (EN): https://discord.gg/U5qBkexfEQ
- Support chat (RU): https://t.me/pantheon_support

Pantheon can be run in production or in development mode. Please don't use development build for your production setup.

### Production build

⚠ For the detailed guide of setting up Pantheon on clean VPS, refer to [Production Setup Guide](./docs/technical/production-setup.md). Brief instructions on production setup are listed below.

Clone the pantheon repository to your own server. Make sure repo folder is not accessible for the outer world.

To deploy pantheon on your own VPS or personal environment on production mode:

1. Make sure you have GNU Make installed on your system. Also one of the following should be installed:
   - [recommended] Docker with compose plugin - to run containers via docker runtime.
   - Podman and podman-compose - to run containers over OCI runtime.
     - Pantheon scripts use docker detection, so if you have both docker and podman installed, docker will be used.
     - Podman has better security and doesn't have privileges problem with dependencies (e.g. you might need to remove `node_modules` as root when using docker).
     - Podman has some gotchas to be considered to run properly. See podman notes below.
2. Create new environment config file `Env/.env.production`. There are examples in `Env` folder. Fill the file with proper settings for your setup.
3. Fill new environment file with proper values, mostly it's about hosts, where you want the services to be accessible from the outer internet. Please note: setting up Nginx or any other reverse proxy is your responsibility. You may refer to `nginx-reverse-proxy.example.conf` file for basic nginx setup.
4. Set up your reverse proxy, add SSL certificates (optionally). Please use included `nginx-reverse-proxy.example.conf` as reference of what host to point where. Note that `*.pantheon.internal` hosts are used to distinguish the services inside container network. Optionally, you can also point PgAdmin4 host to port 5632.
5. Run `make pull` to fetch fresh containers from registry.
   - As an option, you can run `make container` to build containers from scratch, but it's not recommended for production environment.
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

#### Prerequisites

First, please add the following entries to your `/etc/hosts` file so you could access pantheon services locally:
```
127.0.0.1   bragi.pantheon.local
127.0.0.1   forseti.pantheon.local
127.0.0.1   frey.pantheon.local
127.0.0.1   gullveig.pantheon.local
127.0.0.1   hermod.pantheon.local
127.0.0.1   hugin.pantheon.local
127.0.0.1   mimir.pantheon.local
127.0.0.1   sigrun.pantheon.local
127.0.0.1   skirnir.pantheon.local
127.0.0.1   tyr.pantheon.local
127.0.0.1   pga.pantheon.local
127.0.0.1   grafana.pantheon.local
```

Second, make sure your **local port 80** is not used by any other software (like nginx, apache or another web server).
- If the port is not used, everything should work as is. Please note that in this case Pantheon development environment will use port 80, and no other service using that port can be started until `make pantheon_stop` is run.
- Otherwise, please refer to `Common/ReverseProxy/external-proxy.example.conf` file for a list of hosts configuration (for nginx). For other web servers, please use equivalent instructions. Modify configuration of your currently running web server to allow requests pass to the services from your local browser.
- If there is some external nginx running inside docker container on your local machine, you can use `Common/ReverseProxy/nginx.conf` file to add pantheon configuration there. You'll also need to add the container to `pantheon_internal_net` docker network.  

#### Installing and running

Make sure you have Docker, Docker compose plugin and Docker buildx plugin installed and daemon running on your system. For debugging, please make sure all the php extensions are
installed as well, see Dockerfile for a complete list. 

_Note: on some linux distros almost every container-related command should be run as root. If nothing happens, or error
is displayed, try adding `sudo` before `make`._

1. Run `make pull` to fetch all the containers from registry. This is optional, though, it will allow you to skip container build process. 
   - As an option, you can run `make container_dev` to build containers from scratch on you local machine. This may take a long time.
2. Run `make dev` to start all containers, install dependencies for all projects, run database migrations and start webpack dev servers for Tyr and Forseti.
3. After everything is build, you can use `make logs` and `make php_logs` in each subsystem folder to view logs in real-time. Also you may use `make shell` to get
to container shell, if you want to. Notice that killing php-fpm, postgres or nginx will ruin the container entirely.
4. You can use `make pantheon_stop` to stop all containers (without deleting the data) and `make kill` to stop the container AND clean images (e.g. this will remove all db data).

Please note: if you're using podman, trying to stop a single service container will result in also stopping all containers it depends on. Docker has no such issue.

To create an event and fill it with some data, run `make seed`, `make seed_bigevent` or `make seed_tournament` (with `sudo` if required). Note that users are
re-seeded on each command run.

A separate [guide about debugging in PhpStorm IDE](./docs/technical/phpstorm.md) is available.

Local port 5532 will available for PostgreSQL connections - if you want to use external pgAdmin3/4 or any other client to access your databases.

Services will be available at:
- http://mimir.pantheon.local for **Mimir** game management API
- http://sigrun.pantheon.local for **Sigrun** public interface
- http://tyr.pantheon.local for **Tyr** mobile interface
- http://frey.pantheon.local for **Frey** user management backend
- http://forseti.pantheon.local for **Forseti** management interface
- http://pga.pantheon.local for pgAdmin4 service, which is run for convenience. You will need to setup initial connections using following credentials:
  - PgAdmin login: `dev@pantheon.dev`
  - Password: `password`
  - Mimir database host: `db.pantheon.local`
  - Mimir database port: `5432`
  - Mimir database user: `mimir`
  - Mimir database password: `pgpass`
  - Frey database host: `db.pantheon.local`
  - Frey database port: `5432`
  - Frey database user: `frey`
  - Frey database password: `pgpass`
- http://grafana.pantheon.local for grafana monitoring, which is also run for convenience.
  - Login: `admin`
  - Password: `admin` (Grafana will ask to change it on first login)
  - Set up Prometheus data source with `http://hugin.pantheon.internal:9090` as prometheus host
  - Import some dashboards from `Hugin/dashboards` to view the results

**Mimir** and **Frey** use [twirp](https://github.com/twitchtv/twirp) interface to communicate with other services.
See protocol description files in `Common` folder. 
Please note: 
- If you change the protocols, you should run `make proto_gen` in root repo folder to regenerate all protocol related code. 
- You always should change the proto files and never should change the generated code by hand.

#### End-to-end tests

Pantheon services include e2e testing framework based on Playwright. To run it locally, make sure pantheon development
environment is running (`make dev`) and use `make e2e_dev` command in separate terminal window. Note that it will run tests against 
development build, so no SSR is tested locally.

If you want to test full production build locally, you may stop the development environment and use following commands:
```
make e2e_run
make e2e_compile
make e2e
```
Remember to remove all the files created during the run before committing changes.

#### Email agent

Pantheon provides container with pre-installed email agent (Hermod). You can view last sent email in CLI using `make dump_last_mail` command.
This is useful to test registration and password recovery, because emails sent from the developer environment will most likely be rejected
by target email relay (e.g. gmail rejects it in 100% of cases).

#### Notifications agent

Pantheon supports realtime notifications (currently only via Telegram, but Discord may also be added soon).
To use this functionality you should register a bot in Telegram and set its nickname and secret token in Env/.env.production:
```
BOT_TOKEN=yourtoken
VITE_BOT_NICKNAME=bot_nickname
```
After that your users should open the bot, start the conversation and follow the link it sends. After pressing
the confirmation button, bot will be enabled for this particular user.

### Podman notes

- Please make sure you have `ip_tables` module inserted into your kernel on the host. Otherwise, containers will fail to start.
- Trying to stop a single service container will result in also stopping all containers it depends on. Docker has no such issue.
- Setting proper subuid/subgid for current user is recommended: `sudo usermod --add-subuids 100000-165535 --add-subgids 100000-165535 $USER`.
- Podman setup may conflict with apparmor policies. You may want either to disable apparmor service or to allow read-write access to pantheon directory for everybody.
- Podman storage settings may cause errors in overlay management, so you might want to erase the config file: `sudo rm -f /etc/containers/storage.conf`.
- In case of any other problems you might also try resetting podman to system defaults by running `podman system reset -f`. CAUTION: This will delete all running containers, images and volumes.
- Development environment special notes: 
  - For dev mode, when running podman in rootless mode (which is default), make sure you set `net.ipv4.ip_unprivileged_port_start=80` in your `/etc/sysctl.conf` to allow binding on port 80, otherwise reverse proxy won't be able to start when you run `make dev`.

Basic all-in-one script for all the notes above:
```
sudo aa-teardown || true
sudo usermod --add-subuids 100000-165535 --add-subgids 100000-165535 $USER
sudo systemctl disable --now apparmor.service
sudo rm -f /etc/containers/storage.conf || true
podman system reset -f
sudo podman system reset -f
```

### Pull requests

Any pull request should pass all current code style checks; also all unit tests should pass. Don't forget to run
`make check` (with `sudo` if required) before sending your pull request. To fix all code style issues automatically
(in php code only), run `make autofix` (also `sudo` may be required).

### External services

One may want to use Pantheon API in some own external service. Please make sure you have protoc v3.21.9-r0 so generated
binary code matches our protocol version. 
