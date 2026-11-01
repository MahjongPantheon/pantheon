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
5. Run `make prod_pull` to fetch CI-built images from the registry.
6. Run `make prod_start` to start containers. Each Node.js service installs its locked dependencies into volumes before starting. Frey, Mimir, and Hugin then wait for their databases and apply migrations before starting application workers. A failed install or migration stops startup; inspect the service logs before retrying.
7. For a fresh setup, run `make bootstrap_admin` to create the default administrator (`admin@localhost.localdomain`, password `123456`). Change its email and reset its password immediately through Forseti.

Production uses the standalone `docker-compose-production.yml`, with the same network,
HTTP ports and persistent data volumes as the development files. Application code,
compiled bundles, dependency manifests/lockfiles, migrations and scheduled jobs are
inside the images. Application `node_modules` are excluded from the images.
Production Node.js containers share one `services_modules` volume mounted at
`/.pnpm`. Its `store/` directory holds package contents, `cache/pnpm/` holds pnpm
metadata and verification caches, and `modules/` holds separate
dependency trees such as `Mimir/`, `Mimir-dist/`, and `Sigrun-dist/`. Each tree is
mounted at its project's normal `node_modules` path using a volume subdirectory
mount; main and dist dependencies remain isolated. A `dependencies-init` container
creates the directories before application containers start. The production Make
shortcuts run initialization automatically, including updates with `--no-deps`.
This requires Compose and a container runtime that support
[volume subdirectory mounts](https://docs.docker.com/engine/storage/volumes/#mount-a-volume-subdirectory).
The volume is separate from development dependencies and reused on recreation.
Keep `Env/.env.production` and Hermod's DKIM keys on the host. Existing database
and upload volumes are reused.

On every production start, `pnpm install --frozen-lockfile` synchronizes dependencies
before migrations, cron or workers start. Bundles install production dependencies;
Frey/Mimir source installs include development tools required by their CLIs. The
package store, metadata cache and installed dependencies stay in the same
`services_modules` volume. Production installs set `XDG_CACHE_HOME=/.pnpm/cache`
so metadata does not accumulate in each container's home directory.
`node_modules/.pnpm` holds installed packages inside each project's tree.
Old `.pnpm-store` caches within a tree are removed after a successful install.
Previous dependency and cache volumes are left untouched when switching to this
layout; the combined volume is populated from the lockfiles at startup. Development
Compose continues using `pnpmstore01` for its package cache. Synchronization also refreshes
local `Common/tsclients` packages after image updates. Installations need access to
the package registries and Git dependency sources when packages are missing from
the store. Tyr and Forseti serve static bundles and need no runtime install.

Image builds use BuildKit cache mounts for the npm download cache, the pnpm
package store and pnpm metadata. These caches persist in the builder and are
excluded from the resulting image layers. Rebuild the shared base and service
images to remove caches included in older images; runtime volumes cannot remove
files already baked into an image.

To update production, run:

```sh
make prod_update
# Equivalent:
make prod_pull
make prod_restart
```

`prod_restart` recreates application containers with the pulled images and applies
pending migrations. A plain container restart reruns migrations but cannot switch
to a newly pulled image. PostgreSQL and pgAdmin are left running by `prod_restart`.
Use `make prod_start` to apply changes to infrastructure images/configuration too.
`prod_update` does not change your Git checkout; update deployment configuration
files separately when a release changes them.

Set `IMAGE_TAG=<commit SHA>` when pulling and restarting to deploy a specific CI
release, for example `make prod_update IMAGE_TAG=abc123...`. The manually triggered
**Build project artifacts & containers** workflow builds AMD64 and ARM64 in parallel
and publishes commit tags and `latest`. Make detects the host architecture;
standalone Compose users should set `CONTAINER_ARCH=arm64` on ARM hosts.

Changing `Env/.env.production`, including public `VITE_*` settings, requires only
`make prod_restart`. CI builds defer these values to startup: browsers load
`/runtime-env.js` with caching disabled and SSR reads the container environment.
All `VITE_*` variables are public; never put secrets in them. Production requires
no manual dependency installation or application compilation on the server. The
old `prod_compile` and `prod_build_*` targets remain for local source-build diagnostics; use the
existing e2e source-build flow for local production-bundle tests.

Development Compose files continue mounting sources and build outputs. They set
`PANTHEON_MODE=development` and disable production Supervisor workers by default,
so `make dev` uses the existing development servers. Cron tasks run in both modes;
Hugin runs TypeScript job sources in development and compiled jobs in production.
`make e2e_run` explicitly enables production workers for the local `e2e_compile` flow. Development hostnames continue to proxy the
watchers; production hostnames require production workers.

#### Testing production images locally

Run these shortcuts from the repository root:

```sh
make prod_local        # Build all images, stop development, start production + local proxy
make prod_local_build  # Build images only; leave running containers alone
make prod_local_start  # Use local builds, or GHCR latest images, with the local proxy
make dev_local         # Stop the test stack and start normal development servers
```

`prod_local` builds your working copy into the same images CI publishes, including
all eleven applications, PostgreSQL, Redis and the shared base. Build failures stop
the switch before the running stack is stopped. `prod_local_start` validates the
Compose configuration and image availability, builds the proxy, initializes
dependency subdirectories, stops the
existing stack and starts
`docker-compose-production.yml` with startup migrations and cron jobs enabled.
It streams application logs, including pnpm installation progress and errors, to
the terminal while waiting for all eleven applications to report healthy before
starting the local proxy. The entrypoint completes every dependency install and
migration before launching cron or Supervisor. Healthchecks require every
Supervisor program (including cron) to be running and Nginx plus every production
worker to accept connections on IPv4 or IPv6 localhost. The waiter rechecks all
applications until the whole stack is healthy. Installation or migration
failures, stopped/restarting containers, and Supervisor `FATAL`/`STOPPED` programs
fail the Make command. Worker stdout/stderr is included in the streamed logs. There
is no fixed startup deadline: slow installs keep waiting for actual readiness.
Use Compose `ps` and `logs` below to inspect progress, or Ctrl+C to stop waiting.
Once all applications are healthy and the proxy has started, `prod_local_start`
stops following logs and returns to the shell, leaving the containers running.
Use `make prod_local` to rebuild images after startup-script changes;
`prod_local_start` uses existing images and pulls missing registry images without
building applications.
`dev_local` runs the normal development dependency/migration setup and keeps the
development watchers in the foreground, just like `make dev`.

The preferred image tag is `local-production`. If any of the thirteen local images
is missing, startup uses `latest` for the entire stack, pulling missing images from
GHCR before stopping the running stack. Images from different tags are never mixed.
To select prebuilt images explicitly, run `make prod_local_start PROD_LOCAL_TAG=latest`.
Cached images are reused; custom tags also pull missing images from GHCR.
The default environment is `Env/.env.e2e`, which supplies
`.pantheon.internal` URLs and local test credentials, including enabled e2e fixture
APIs. This environment is only for local testing; it is loaded at startup and is
not copied into the images. Architecture detection and Docker/Podman selection
follow the existing root Makefile behavior.

Override the local tag and environment filename when needed, using the same values
for building and starting:

```sh
make prod_local PROD_LOCAL_TAG=my-test PROD_LOCAL_ENV=.env.e2e
```

The local production stack shares the `pantheon` project, ports, subnet and named
volumes with development. Both switching commands stop the existing stack first;
existing database and upload data are reused and pending migrations are applied.
Use a disposable local environment if you need fresh data. Neither command deletes
named volumes. There is no host `make deps` or `make prod_compile` step for the
production images.

Inspect startup with these commands (adjust the tag/environment if overridden):

```sh
ENV_FILENAME=.env.e2e IMAGE_TAG=local-production CONTAINER_ARCH="$(bash bin/get_arch.sh)" \
  docker compose -f docker-compose-production.yml --env-file Env/.env.e2e ps
ENV_FILENAME=.env.e2e IMAGE_TAG=local-production CONTAINER_ARCH="$(bash bin/get_arch.sh)" \
  docker compose -f docker-compose-production.yml --env-file Env/.env.e2e logs --follow --tail=100 \
  frey.pantheon.internal mimir.pantheon.internal hugin.pantheon.internal
ENV_FILENAME=.env.e2e IMAGE_TAG=local-production CONTAINER_ARCH="$(bash bin/get_arch.sh)" \
  docker compose -f docker-compose-production.yml --env-file Env/.env.e2e exec \
  mimir.pantheon.internal supervisorctl status
```

Node.js services install dependencies into their production volumes on startup;
Frey, Mimir and Hugin then apply migrations before starting workers. Check their
logs for install or migration failures. Compose may pull missing third-party
infrastructure images. The application, PostgreSQL and Redis images come from
your local builds. The server
`prod_*` commands such as `prod_start` still select `Env/.env.production`; use the
`prod_local*` shortcuts for this local test setup.

The local reverse proxy starts automatically. Add these entries to your host's
`/etc/hosts` for browser testing:

```text
127.0.0.1 bragi.pantheon.internal forseti.pantheon.internal sigrun.pantheon.internal tyr.pantheon.internal
127.0.0.1 frey.pantheon.internal mimir.pantheon.internal hugin.pantheon.internal gullveig.pantheon.internal
127.0.0.1 hermod.pantheon.internal skirnir.pantheon.internal meili.pantheon.internal
```

Open <http://bragi.pantheon.internal>, <http://forseti.pantheon.internal>,
<http://sigrun.pantheon.internal> or <http://tyr.pantheon.internal>.
Use `.pantheon.internal` hosts: `.pantheon.local` hosts target development servers.
For a quick check without editing `/etc/hosts`, run:

```sh
curl --fail --resolve tyr.pantheon.internal:80:127.0.0.1 http://tyr.pantheon.internal/
curl --fail --resolve tyr.pantheon.internal:80:127.0.0.1 http://tyr.pantheon.internal/runtime-env.js
```

HTTP supports application and SSR checks; testing browser PWA/service-worker
behavior requires local HTTPS. On a fresh local database, `make bootstrap_admin`
creates the default administrator described above.

After changing code, run `make prod_local` again to rebuild the images and restart
the production stack. A plain container restart reruns startup but does not adopt
a newly built image. No source or compiled application folders are mounted into
these containers.

Run `make dev_local` to stop the local production stack and return to development.
To stop without starting development, use `make pantheon_stop`.

#### Frontend PWA updates

Tyr, Forseti, and Sigrun check for a new service worker on startup, when returning
to a visible tab, when reconnecting, and every five minutes while visible and
online. After the new worker has installed its precached assets, the PWA client
reloads the page automatically. Unsaved form input can be lost on this reload.
Failed checks leave the current version running and retry on the next check.

This takes effect after a browser has loaded the updated client code. An already
broken installation may still need a manual reload or its site cache cleared once.

#### Updating container Node.js

The application containers inherit Node.js and npm from Alpine's `nodejs-current` and `npm` packages in `Common/ContainerBase`. Both AMD64 and ARM64 use Alpine's prebuilt packages. pnpm is installed through npm with the `pnpm@12` major-version pin. Service settings and dependency build permissions live in each service's `pnpm-workspace.yaml`; production preparation copies that file alongside `package.json`. Node.js updates follow the selected Alpine branch; update the Alpine base tag when moving to a newer branch. Fenrir has a separate image and runtime.

Run `make container_base` to rebuild the shared base, or `make container` to rebuild it along with the dependent service images and recreate their containers. Run the **Build project artifacts & containers** workflow manually in GitHub Actions to rebuild the shared base and application images for both AMD64 and ARM64. Existing running containers retain their previous runtime until recreated.

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
127.0.0.1   meili.pantheon.local
127.0.0.1   sigrun.pantheon.local
127.0.0.1   skirnir.pantheon.local
127.0.0.1   tyr.pantheon.local
127.0.0.1   pga.pantheon.local
127.0.0.1   grafana.pantheon.local
127.0.0.1   dozzle.pantheon.local
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
2. Run `make dev` to start all containers, install dependencies for all projects, run database migrations and start development servers.
3. After everything is build, you can use `make logs` and `make php_logs` in each subsystem folder to view logs in real-time. Also you may use `make shell` to get
   to container shell, if you want to. Notice that killing postgres or nginx will ruin the container entirely.
4. You can use `make pantheon_stop` to stop all containers (without deleting the data) and `make kill` to stop the container AND clean images (e.g. this will remove all db data).

The shared Node service image is built from `Common/ContainerBase` and published as
`ghcr.io/mahjongpantheon/pantheon-container-base-v4-{amd64,arm64}:latest`.
`make container_base` builds and loads the tag for the current architecture;
`make container` builds it before rebuilding services. The base owns shared Node
and build tools, the local `user`, nginx runtime directories/logging, and the
default `/entrypoint.sh` command. Service Dockerfiles provide executable entrypoints,
service configuration, folders and additional packages. Database and Redis use
standalone Alpine images; Fenrir retains Ubuntu for Playwright. After changing
the base image, rebuild dependent service images and recreate their containers.

Development dependency installation (`make dev_deps` from the root or inside a service) reuses existing `node_modules` and the shared pnpm store. Local `file:` packages such as `Common/tsclients` are refreshed on each run, including added and removed files. The install uses `--no-frozen-lockfile` so local package manifest changes are also resolved, even when `CI` is set. To reinstall a service from scratch, remove its `node_modules` and run `make dev_deps` again. Production builds and CI prepare source-project dependencies with `make deps` and `--frozen-lockfile`, which fails if manifests and lockfiles differ. Existing `prod_deps` targets continue to prepare runtime dependencies in the built output folders.

Development Vite watchers and lint/format tools exclude generated build, coverage,
cache, temporary, and Playwright report directories. Backend `tsx watch` commands
watch loaded dependencies and ignore dependency/vendor directories; generated
translations and shared API clients remain available for normal source updates.
Root `make lint` defaults to two concurrent checks because each tool can also
use worker threads. Set `LINT_JOBS=1` on slower machines or increase it for CI,
for example `make lint LINT_JOBS=4`.

Please note: if you're using podman, trying to stop a single service container will result in also stopping all containers it depends on. Docker has no such issue.

To create an event and fill it with some data, run `make seed`, `make seed_bigevent` or `make seed_tournament` (with `sudo` if required). Note that users are
re-seeded on each command run. To log in as one of the created users, you may need the id and client hash emitted in the console. Note that dump is output in development mode only.
Created users' data is saved to temporary file inside Frey container, so you may also access this data using `make dump_users`.

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
- http://dozzle.pantheon.local for docker logs viewer.

**Mimir** and **Frey** use [twirp](https://github.com/twitchtv/twirp) interface to communicate with other services.
See protocol description files in `Common` folder.
Please note:

- If you change the protocols, you should run `make proto_gen` in root repo folder to regenerate all protocol related code.
- You always should change the proto files and never should change the generated code by hand.

#### Upgrade to Mimir v2 and Frey v2

Please see UPDATE.md for details.

#### Service tests

Run `make test` from the root to execute every existing service suite: Tyr,
Frey, Mimir, Gullveig, Meili, Hermod, Hugin, Forseti, Sigrun and Bragi. The runner
attempts all suites even after a failure and returns a failing exit status if
any suite fails or its container is missing. `make test_verbose` covers the same
services. Skirnir currently has no test files. GitHub Actions runs
these suites independently of lint results after dependency and migration setup;
Fenrir's lint, formatting, type checks, and Playwright tests run in the separate
e2e workflow. The service-check workflow prepares one shared container
environment for the application services and reports their lint, formatting,
type checks, tests, and overall line coverage per service in the Actions summary
and an updated PR comment. Coverage is collected during the same test run;
missing reports are shown as unavailable. The
`service-check-results` artifact contains individual check logs. Fork PRs receive
the summary and artifact; their read-only token cannot post the comment. The e2e
workflow publishes its own summary and separate updated PR comment with setup,
Fenrir code-check, and Playwright results; logs are in `e2e-check-results` and
`playwright-report`. Both workflows run on pushes and manual dispatches; opening
or reopening a PR does not start another run. Comments are posted when an open
PR exists at reporting time; otherwise results remain in the Actions summary.
Each workflow removes its previous bot report at startup, then publishes fresh
results once its checks finish. Runs for an outdated PR head cannot change the
comments.

#### End-to-end tests

Pantheon services include e2e testing framework based on Playwright. To run it locally, make sure pantheon development
environment is running (`make dev`) and use `make e2e_dev` command in separate terminal window. Note that it will run tests against
development build, so no SSR is tested locally. This starts only Fenrir with the development environment; it does not rebuild or recreate the application services.

To test the production images and their startup behavior, follow [Testing production images locally](#testing-production-images-locally).
For the existing source-mounted production-bundle e2e flow, stop development and run:

```
make e2e_run
make e2e_compile
make e2e
```

The production-build flow uses `Env/.env.e2e` and `.pantheon.internal` hosts. The `.pantheon.local` hosts proxy development servers and require `make dev`.
For account-backed cases, configure an existing fixture superadmin in the ignored `Fenrir/.env.e2e.local` file as described in [Fenrir's README](Fenrir/README.md).
GitHub CI bootstraps the default administrator in its fresh test database and uses it only to create ordinary fixture accounts through Frey's guarded e2e API.

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

To create a PR fro existing issue using Codex, use `Use $github-issue-branch for issue #123` prompt.

### External services

One may want to use Pantheon API in some own external service. Please make sure you have protoc v3.21.9-r0 so generated
binary code matches our protocol version.

### License

All Pantheon code except protocol files is licensed under the GNU GPL v3 License. See the LICENSE file for details.
Protocol files are licensed under the Apache License, Version 2.0. See the LICENSE file in Common/proto folder for details.
