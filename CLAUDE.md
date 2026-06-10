# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Further Documentation

`.github/instructions/` contains a detailed wiki (41 pages) covering each service, data
models, API references, seating/scoring algorithms, auth, CI/CD, and deployment in depth.
Consult it for anything beyond the high-level summary below — e.g.
`12_Mimir_-_Game_Management_Service.instructions.md`, `15_Seating_Algorithms.instructions.md`,
`18_Authentication_System.instructions.md`, `33_Mimir_Data_Models.instructions.md`,
`34_Frey_Data_Models.instructions.md`, `36_API_Reference.instructions.md`.

## Project Overview

Mahjong Pantheon is a containerized microservices platform for managing Japanese Riichi
Mahjong tournaments and club sessions: real-time game recording, ratings, statistics,
seating generation, and admin tools. It's organized as 4 React frontends and 7 backend
services, all running in Docker/Podman containers and communicating via Twirp RPC over
Protocol Buffers.

### Services

| Service | Role | Stack |
|---------|------|-------|
| **Tyr** | Mobile player assistant (game recording) | React + Vite SPA |
| **Forseti** | Admin control panel | React + Vite SPA |
| **Sigrun** | Public statistics viewer | React + Express SSR |
| **Bragi** | Landing pages | React + Express SSR |
| **Mimir** | Game management API (events, sessions, rounds, seating, scoring, achievements) | PHP 8.3 + Twirp |
| **Frey** | User management API (auth, profiles, access control) | Node.js 20 + Twirp + Kysely |
| **Hugin** | Prometheus metrics collection | PHP 8.3 |
| **Gullveig** | Avatar storage | PHP 8.3 |
| **Meili** | Supporting service | PHP 8.3 |
| **Skirnir** | Telegram bot notifications | Node.js 20 + Grammy |
| **Hermod** | Outbound email (DKIM-signed) | Postfix + OpenDKIM |
| **Fenrir** | E2E test runner | Playwright |

Infrastructure: PostgreSQL (databases `mimir`, `frey2`, `hugin`), Redis (Frey caching),
Memcached (Mimir caching), Nginx reverse proxy on `*.pantheon.local` / `*.pantheon.internal`.

### Service ownership and cross-service calls

- **Frey** owns identity: `person`, `person_access`, `majsoul_platform_account`, `registrant`.
- **Mimir** owns game data: `event`, `session`, `round`, `player_history`, `player_registration`.
- Mimir stores `player_id` foreign keys only — it never duplicates user data. When it needs
  user details it calls `Frey::GetPersonalInfo()` (and similar) over Twirp RPC, with results
  cached in Redis (`Frey/app/helpers/cache/`).
- All services report timing metrics to Hugin's `/addMetric` endpoint.
- Mimir notifies Skirnir (Telegram), Frey calls Hermod (email) and Gullveig (avatars).

### RPC / Protocol Buffers

- Service contracts are defined in `Common/proto/*.proto` (Twirp + protobuf).
- `make proto_gen` regenerates PHP server stubs (`Common/generated/`) and TypeScript
  client stubs (`Common/tsclients/`), then reinstalls deps.
- **Never hand-edit generated code** — change the `.proto` files and regenerate.
- Mimir's RPC entry point is `Mimir/src/TwirpServer.php` (implements the generated `Mimir`
  interface); requests are routed to controllers in `Mimir/src/controllers/`, which use
  primitives in `Mimir/src/primitives/` for DB access.
- Frey's RPC entry point is `Frey/app/server.ts` / `Frey/app/frey.ts`, which dispatches to
  model functions in `Frey/app/models/` (`auth.ts`, `persons.ts`, `access.ts`). Frey uses
  Kysely for the DB layer; migrations live in `Frey/app/database/migrations/`.

## Development Setup

Add to `/etc/hosts` (required for the reverse proxy routing):
```
127.0.0.1   bragi.pantheon.local forseti.pantheon.local frey.pantheon.local
127.0.0.1   gullveig.pantheon.local hermod.pantheon.local hugin.pantheon.local
127.0.0.1   mimir.pantheon.local meili.pantheon.local sigrun.pantheon.local
127.0.0.1   skirnir.pantheon.local tyr.pantheon.local pga.pantheon.local
127.0.0.1   grafana.pantheon.local dozzle.pantheon.local
```
Local port 80 must be free (it's used by the dev reverse proxy).

```bash
make pull    # fetch prebuilt containers (or `make container_dev` to build locally)
make dev     # start everything: containers, deps, migrations, Vite dev servers
```

The Makefile auto-detects Docker vs Podman (Docker preferred if both present) and the
host CPU arch (`bin/get_arch.sh`) to pick `docker-compose-{arch}.yml`. On some Linux
distros container commands need `sudo`.

Useful commands:
- `make pantheon_stop` — stop containers, keep data
- `make kill` — **destructive**: removes all containers, volumes, and DB data (asks for confirmation)
- `make seed` / `make seed_bigevent` / `make seed_tournament` — create test data + bootstrap admin (`admin@localhost.localdomain` / `123456`)
- `make dump_users` — view seeded test user credentials
- `make shell_<service>` — shell into a running container (e.g. `make shell_mimir`, `make shell_frey`, `make shell_db`)
- `make logs` / `cd <Service> && make logs` — tail container logs
- `cd Mimir && make enable_debug` / `make disable_debug` — toggle XDebug (port 9001) without restart
- `make dump_last_mail` — view last email sent by Hermod (useful for testing registration/password reset)

## Build, Lint, Test

Always run lint/test from the **root Makefile** unless iterating on a single service.

```bash
make check       # = lint + test; run before sending a PR
make lint         # all services in parallel (-j16): eslint, prettier, tsc, phpcs, phpstan
make test         # unit tests for Tyr, Frey, Mimir
make test_verbose # same, with verbose output
make autofix      # eslint --fix, prettier -w, phpcbf
```

Per-service (run inside the running container):
```bash
cd <Service> && make container_test       # Vitest (Tyr/Forseti/Sigrun/Bragi/Skirnir/Frey) or PHPUnit (Mimir/Hugin/Gullveig/Meili)
cd <Service> && make container_eslint     # TS services
cd <Service> && make container_prettier   # TS services
cd <Service> && make container_typecheck  # TS services
cd Mimir && make container_lint           # PHPCS (PSR-2)
cd Mimir && make container_analyze        # PHPStan (level 8)
```

Or per-service Makefile shortcuts at root, e.g. `make tyr_eslint`, `make frey_typecheck`,
`make mimir_analyze` (output redirected to `tmp/*.log`).

To run a single test, exec into the container shell (`make shell_<service>`) and invoke
the underlying test runner directly (`./node_modules/.bin/vitest run <path>` for TS
services, `php bin/unit.php` / `vendor/bin/phpunit <path>` for Mimir).

### Database migrations

```bash
make migrate              # Mimir (Phinx), Frey (Kysely), Hugin
cd Frey && make container_migrate
```
Mimir migrations: `Mimir/migrations/` (Phinx, config `Mimir/phinx.php`). Frey migrations:
`Frey/app/database/migrations/` (Kysely, TypeScript `up()`/`down()`).

### E2E tests (Fenrir / Playwright)

```bash
make e2e_dev    # against running dev environment (no SSR tested)
# OR, for a production-like build:
make e2e_run && make e2e_compile && make e2e
```
Remove any files created during an E2E run before committing.

### i18n (Russian, Korean, German, Japanese, Chinese)

```bash
make i18n_extract   # extract translatable strings to .pot/.po
make i18n_compile   # compile .po -> .json for runtime (i18n-dialect)
```

## Production

```bash
make pull && make prod_start && make prod_compile   # first-time: also `make bootstrap_admin`
make prod_update     # quick update: fetch master, pull containers, restart, recompile
make prod_restart    # use this (not prod_stop+prod_start) so email service env is correct
```
Config lives in `Env/.env.production` (not in git). Changing `VITE_*` vars requires
`make prod_compile` after `make prod_restart`.

## Notes

- This is a git-based-backup setup: Database container commits dumps every 15 min; rollback
  with `COMMIT=<hash> make backup_restore` from `Database/` (rolls back **both** mimir and
  frey databases).
- Podman users: see README's "Podman notes" for subuid/apparmor/ip_tables caveats —
  stopping one service container stops everything that depends on it (unlike Docker).
