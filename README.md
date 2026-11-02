## Mahjong Pantheon: automated statistics & assistance for japanese riichi mahjong sessions.

![](https://img.shields.io/github/actions/workflow/status/MahjongPantheon/pantheon/build.yml?branch=master&style=for-the-badge)
![](https://img.shields.io/github/license/MahjongPantheon/pantheon?style=for-the-badge)

You may use github issues for error reports and feature requests. Pull requests are especially welcome :)

- Support chat (EN): https://discord.gg/U5qBkexfEQ
- Support chat (RU): https://t.me/pantheon_support

Pantheon can be run in production or in development mode. Please don't use development build for your production setup.

### Container workflows

Docker Compose owns startup, process supervision and logs. `bin/pantheon` is
our Bash entry point for lifecycle, checks and helpers. Host requirements are
Bash 4+ and Docker with Compose and BuildKit. Node.js, pnpm, gettext and test tools
run inside containers, including the infrastructure regression tests.
`bin/pantheon help` lists commands; `bin/pantheon task SERVICE help` lists owning
service tasks. Makefiles and Just are no longer used.

Enable shell completion for `./run` and `bin/pantheon` with:

```sh
./run completion install bash
# Or:
./run completion install zsh
```

The installer stores a completion script under
`${XDG_DATA_HOME:-$HOME/.local/share}/pantheon/completions` and adds one source
line to `~/.bashrc` or `${ZDOTDIR:-$HOME}/.zshrc`. Repeating installation updates
the script without duplicating that line. Restart your shell or use the source
command printed by the installer. Rerun installation after moving the checkout.
For manual setup, `./run completion bash` or `./run completion zsh` prints the
script. Completion suggests commands, operations, services and owning service
tasks without contacting containers. An optional final `RC_FILE` argument to
`completion install SHELL` selects another startup file;
`PANTHEON_COMPLETION_DIR` overrides the installation directory.

There are three explicit modes:

| Mode | Application files | Processes |
| --- | --- | --- |
| `dev` | Mounted working tree | Vite and TypeScript watchers |
| `image` | Compiled release images | Production workers |
| `source` | Mounted source and output directories | Compile in containers, then run production workers |

`compose.yaml` owns shared topology, host HTTP ports and persistent data.
Select exactly one of `compose.dev.yaml`, `compose.image.yaml` or
`compose.source.yaml`. `compose.local.yaml` adds the local hostname proxy;
`compose.build.yaml` adds production image builds. Never combine execution-mode
overlays. `docker-compose-{amd64,arm64}.yml` and
`docker-compose-production.yml` are compatibility entry points using Compose
`include`; the runner uses `-f` layers directly. Direct users of the old ARM64
entry point inherit `CONTAINER_ARCH=arm64` from its include environment.

Both architectures share the same configuration. The runner detects architecture
and Docker/Podman once; override `CONTAINER_ARCH`, `CONTAINER_COMMAND` or
`PANTHEON_COMPOSE_PROVIDER` when needed. Docker Compose is the validated baseline.
Podman requires a Compose provider supporting the selected features; the old
entry points additionally need `include`, and image mode needs volume subdirectory
mounts. Check your provider with the configuration validation described below.

`tools` enables pgAdmin; `monitoring` enables Grafana, cAdvisor, the PostgreSQL
exporter and Dozzle; `e2e` enables Fenrir. For example:

```sh
COMPOSE_PROFILES=tools,monitoring bin/pantheon dev
```

All modes retain the `pantheon` project, network, published ports and existing
named data volumes. Switching modes reuses databases and uploads and can apply
migrations. It never deletes named volumes. Use a disposable database setup for
experiments requiring clean data; changing only the project name is insufficient
for parallel stacks because this installation retains its fixed subnet and host
ports. The local proxy owns port 80, so stop any competing host proxy first.

### Production build

For server prerequisites, external reverse proxy, TLS and mail configuration,
see [Production Setup Guide](docs/technical/production-setup.md).
Create the ignored `Env/.env.production` from an Env example and configure your
public URLs. Keep private DKIM keys on the host in `Hermod/opendkim_keys`.

```sh
bin/pantheon prod start <commit-tag>  # Obtain missing images and start
```

Production startup validates configuration, checks image availability, initializes
runtime dependency directories, starts containers, streams application logs while
waiting for readiness, then warms Sigrun and Bragi with six requests each. There
is no fixed startup deadline; dependency or migration failures, stopped containers,
and failed Supervisor programs fail startup. Ctrl+C stops waiting without deleting
data. Static Tyr and Forseti bundles need no runtime dependency installation.
Other services install locked dependencies in the persistent `services_modules`
volume; source migration and cron tools for Frey/Mimir remain available. Missing
packages require registry/Git access. Existing dependency and cache volumes are
preserved. BuildKit caches stay outside the resulting image layers.

```sh
bin/pantheon prod pull <tag>                  # Fetch without changing containers
bin/pantheon prod recreate <tag>              # Adopt selected images/config; wait; warm up
bin/pantheon prod restart                    # Restart existing containers; wait; warm up
bin/pantheon prod update <tag>                # Pull, recreate applications, wait, warm up
bin/pantheon prod warmup
bin/pantheon prod status
bin/pantheon prod logs
bin/pantheon prod stop                       # Stop applications, retain infrastructure
bin/pantheon prod down                       # Stop/remove stack, retain data volumes
```

`restart` restarts existing containers; `recreate` adopts selected images and
configuration. Updates leave PostgreSQL and other infrastructure running;
`start` applies infrastructure configuration changes too. Specify the same tag
for each operation. `latest` is the default; commit tags are preferable for
repeatable deployments. Commands do not update the Git checkout.

Changing public `VITE_*` or other environment settings requires recreation.
Image builds defer public frontend settings to `/runtime-env.js` at startup;
all `VITE_*` values are public and must never contain secrets.

On a fresh database, `bin/pantheon bootstrap-admin` creates the default administrator
(`admin@localhost.localdomain`, password `123456`). Change its email and reset its
password immediately through Forseti.

#### Testing production images locally

```sh
bin/pantheon local-prod registry <tag>        # Pull the selected GHCR release and start
bin/pantheon local-prod build                 # Build working tree, then start
bin/pantheon local-prod local                 # Start the complete existing local build
bin/pantheon build-images            # Build images without changing containers
bin/pantheon dev                             # Return to development
```

Local builds use `local-production`; override the tag with a positional argument
or `PROD_LOCAL_TAG`. Incomplete local image sets fail before
switching the running stack; **there is no fallback to another tag**. A build
failure also leaves the running stack in place. Local and CI builds use the same
production Dockerfile stages. Development stages omit application compilation.
CI publishes release commit tags and separate `development`/`dev-<commit>` tooling
tags; its base image dependency is pinned to the same commit.

Local production defaults to `Env/.env.e2e`, including local test credentials and
enabled fixture APIs. It is unsuitable for public deployment. Override with
`PROD_LOCAL_ENV=.env.custom`. The local proxy is managed by Compose and replaces
the old standalone proxy automatically. Add these hosts to `/etc/hosts`:

```text
127.0.0.1 bragi.pantheon.internal forseti.pantheon.internal sigrun.pantheon.internal tyr.pantheon.internal
127.0.0.1 frey.pantheon.internal mimir.pantheon.internal hugin.pantheon.internal gullveig.pantheon.internal
127.0.0.1 hermod.pantheon.internal skirnir.pantheon.internal meili.pantheon.internal
```

Open `http://bragi.pantheon.internal`, `http://forseti.pantheon.internal`,
`http://sigrun.pantheon.internal` or `http://tyr.pantheon.internal`.
`.pantheon.local` routes to development watchers; `.pantheon.internal` routes to
production workers. HTTP supports normal application/SSR checks; PWA testing
requires local HTTPS. Rebuild after changing application code in image mode.

#### Production compiled from mounted sources

This preserves the older server compilation workflow as a separate mode:

```sh
bin/pantheon source-prod start               # Tooling images, source deps/migrations,
                                     # compilation, production workers, warmup
bin/pantheon source-prod compile             # Recompile an existing source-mode stack
bin/pantheon source-prod logs
```

Source mode defaults to `Env/.env.production`. It mounts service sources,
`Common`, and `*-dist` directories, refreshes locked source dependencies and local
clients on recompilation, compiles with each service's existing
`tasks.sh build`/`tasks.sh prebuild` commands, then recreates workers after successful compilation.
`compile` rejects image-mode containers. Installations remain locked at startup.
Unlike image builds, compilation writes host build outputs and may refresh their
runtime dependencies. Run `start` again after configuration or Dockerfile changes.
Use `PANTHEON_LOCAL=true ENV_FILENAME=.env.e2e` for a local source-mode setup.
Image deployments never call this workflow.

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

Run `bin/pantheon build-base` to rebuild the shared base, then `bin/pantheon dev --detach` to rebuild dependent service images and recreate their containers. Run the **Build project artifacts & containers** workflow manually in GitHub Actions to rebuild the shared base and application images for both AMD64 and ARM64. Existing running containers retain their previous runtime until recreated.

#### Email agent

Pantheon provides container with pre-installed email agent (Hermod). If you want to send emails signed with DKIM, you will need to place your private keys
to `Hermod/opendkim_keys` folder. Also following setting are required:

- Some unique key in `MAIL_ACTION_KEY` variable in your environment config.
- Mailer root host in `ALLOWED_SENDER_DOMAINS` variable in your environment config. Mailer address also will be set to `noreply@[allowed domain]`.

#### HTTPS

You may use `bin/letsencrypt-scripts` and `nginx-reverse-proxy.example.conf` as an example and reference to set up your SSL certificates using Let's Encrypt.
If you're not intending to use https, please disable corresponding directives in your reverse proxy nginx config.

#### Setting up database backups

Pantheon provides built-in database backups using git. By default, it stores database dump as new commits in `/var/lib/postgresql/backup` folder
of the `Database` container (you can get to shell using `bin/pantheon shell Database`). If you want to set up some remote backups, you should do the following:

- Set the `BACKUP_GIT_REMOTE` variable in your environment config to point to your backup remote repository. There is an example included in the env file.
- From the repository root, call `bin/pantheon backup pubkey` command to get ssh public key.
- Add this key to trusted keys in your account in Github, Gitlab or wherever your remote repository will reside.
- Apply the database configuration with `bin/pantheon prod start`

Every 15 minutes the database dump is made. You may view history of backups using `bin/pantheon backup history` from the repository root. To rollback your
database to previous state you may use either included pgadmin4 container (running at 5632 port) or the one-liner command from the repository root:
`bin/pantheon backup restore 1234567`, where `1234567` should be replaced with target commit hash (which can be found using `bin/pantheon backup history` command).
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

- If the port is not used, everything should work as is. Please note that in this case Pantheon development environment will use port 80, and no other service using that port can be started until `bin/pantheon stop` is run.
- Otherwise, please refer to `Common/ReverseProxy/external-proxy.example.conf` file for a list of hosts configuration (for nginx). For other web servers, please use equivalent instructions. Modify configuration of your currently running web server to allow requests pass to the services from your local browser.
- If there is some external nginx running inside docker container on your local machine, you can use `Common/ReverseProxy/nginx.conf` file to add pantheon configuration there. You'll also need to add the container to `pantheon_internal_net` docker network.

#### Installing and running

```sh
bin/pantheon dev                     # Prepare, start, watch and stream logs
bin/pantheon dev --detach            # Prepare/start detached; wait for readiness
bin/pantheon logs
bin/pantheon shell Frey
bin/pantheon stop                    # Remove containers; preserve named data
```

One command builds development tooling if needed, installs locked shared/service
dependencies, migrates databases and starts all watchers. Foreground startup
streams container logs from preparation onward; Ctrl+C stops the stack. Detached
startup returns after application healthchecks pass. Both modes print a bordered
readiness message with links to Tyr, Sigrun and Forseti once all 11 applications
are healthy. Foreground logs continue after the message. Watchers run under Supervisor
inside containers, with grouped signal handling, so restarting a container also
restarts its watcher. `bin/pantheon restart-watcher frey` restarts Frey's watcher.

Local frontend/backend environment files are prepared from
`Env/.env.development`; optional `Env/.env.development.local` values are appended.
Normal startup never rewrites lockfiles. Use `bin/pantheon deps --update [SERVICE...]`
when intentionally updating dependency manifests/lockfiles. `bin/pantheon deps` performs
locked installation. Development startup reinstalls only the local `tsclients`
package, so generated clients and removed files stay current. Registry packages
are reused from the shared pnpm store; registry metadata also persists in that
volume. Missing packages or metadata are fetched when necessary, without forcing
a reinstall of the complete dependency tree. Fenrir's optional browser dependencies are installed in the
e2e flow. `bin/pantheon build-base` rebuilds shared tooling. Rebuild dependent images
after base changes.

`bin/pantheon lint` checks formatting without writing and runs at most two checks
concurrently (`LINT_JOBS=4` overrides this). It finishes independent checks after
failures, keeps per-service `tmp` logs and returns failure for missing containers.
`bin/pantheon format` applies formatting; `bin/pantheon autofix` also applies lint fixes.
`bin/pantheon check frey` runs service checks, while `bin/pantheon check` runs all checks and tests.
Fenrir's checks belong to its optional e2e flow. `bin/pantheon infra-test` checks runtime
startup behavior and renders all modes/architectures without starting the stack.
It runs Node regression tests and JSON validation in the shared tooling image.
No host Node.js or Python installation is required.

To create an event and fill it with some data, run `bin/pantheon seed`, `bin/pantheon seed big-event` or `bin/pantheon seed tournament` (with `sudo` if required). Note that users are
re-seeded on each command run. To log in as one of the created users, you may need the id and client hash emitted in the console. Note that dump is output in development mode only.
Created users' data is saved to temporary file inside Frey container, so you may also access this data using `bin/pantheon dump-users`.

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

- If you change the protocols, you should run `bin/pantheon proto-gen` in root repo folder to regenerate all protocol related code.
- You always should change the proto files and never should change the generated code by hand.

#### Upgrade to Mimir v2 and Frey v2

Please see UPDATE.md for details.

#### Service tests

Run `bin/pantheon test` from the root to execute every existing service suite: Tyr,
Frey, Mimir, Gullveig, Meili, Hermod, Hugin, Forseti, Sigrun and Bragi. The runner
attempts all suites even after a failure and returns a failing exit status if
any suite fails or its container is missing. `bin/pantheon test --verbose` covers the same
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
environment is running (`bin/pantheon dev`) and use `bin/pantheon e2e dev` command in separate terminal window. Note that it will run tests against
development build, so no SSR is tested locally. This starts only Fenrir with the development environment; it does not rebuild or recreate the application services.

To test the production images and their startup behavior, follow [Testing production images locally](#testing-production-images-locally).
For the existing source-mounted production-bundle e2e flow, stop development and run:

```
bin/pantheon e2e prepare
PANTHEON_STACK_MODE=source bin/pantheon e2e run
```

The production-build flow uses `Env/.env.e2e` and `.pantheon.internal` hosts. The `.pantheon.local` hosts proxy development servers and require `bin/pantheon dev`.
For account-backed cases, configure an existing fixture superadmin in the ignored `Fenrir/.env.e2e.local` file as described in [Fenrir's README](Fenrir/README.md).
GitHub CI bootstraps the default administrator in its fresh test database and uses it only to create ordinary fixture accounts through Frey's guarded e2e API.

Remember to remove all the files created during the run before committing changes.

#### Email agent

Pantheon provides container with pre-installed email agent (Hermod). You can view last sent email in CLI using `bin/pantheon dump-last-mail` command.
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
  - For dev mode, when running podman in rootless mode (which is default), make sure you set `net.ipv4.ip_unprivileged_port_start=80` in your `/etc/sysctl.conf` to allow binding on port 80, otherwise reverse proxy won't be able to start when you run `bin/pantheon dev`.

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
`bin/pantheon check` (with `sudo` if required) before sending your pull request. To fix all code style issues automatically
run `bin/pantheon autofix` (also `sudo` may be required).

To create a PR fro existing issue using Codex, use `Use $github-issue-branch for issue #123` prompt.

### External services

One may want to use Pantheon API in some own external service. Please make sure you have protoc v3.21.9-r0 so generated
binary code matches our protocol version.

### License

All Pantheon code except protocol files is licensed under the GNU GPL v3 License. See the LICENSE file for details.
Protocol files are licensed under the Apache License, Version 2.0. See the LICENSE file in Common/proto folder for details.
