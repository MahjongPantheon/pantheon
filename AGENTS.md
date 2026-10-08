# Coding guidance for Pantheon

This file applies to the whole repository. Use the nearest service README and Makefile for details; the root README describes the development environment and `docs/technical/terminology.md` defines domain terms.

## Project map

Pantheon is a set of services, not one application. `Mimir` owns game, event, tournament, rating, and statistics data; `Frey` owns authentication, personal data, and access rules. Both expose Twirp APIs defined in `Common/proto`. The user interfaces are `Tyr` (mobile game recording), `Forseti` (administration and profiles), `Sigrun` (ratings and game views), and `Bragi` (landing pages). `Skirnir` sends real-time bot notifications. `Hugin` collects monitoring data and frontend errors, `Gullveig` stores uploaded files, and `Meili` provides geographic data. `Hermod` is the mail service; `Database` and `Redis` provide storage and caching; `Fenrir` holds Playwright end-to-end tests.

## General rules

- Follow `.editorconfig`: UTF-8, LF, final newline, two-space indentation except four spaces for PHP. For PHP, follow the service's configured PSR-2 PHP_CodeSniffer standard.
- Make changes in the owning service. Keep service boundaries intact: use the existing Twirp contracts for cross-service calls and update the relevant caller and provider together when a contract changes.
- Treat `Common/proto/*.proto` as the source of truth for API messages and methods. After editing a protocol, run `make proto_gen` from the root for the TypeScript clients in `Common/tsclients/proto`. That target does not generate PHP classes in `Common/generated`; for Hugin's PHP contract, run `protoc -I Common --php_out=Common/generated --plugin=protoc-gen-twirp_php=Common/Backend/bin/protoc-gen-twirp_php --twirp_php_out=Common/generated proto/hugin.proto` from the root with a repository-compatible `protoc`. Never hand-edit generated protocol code.
- Use the existing `pnpm-lock.yaml` in each TypeScript service and `composer.lock` in each PHP service when changing dependencies. Do not introduce another package manager's lockfile.
- Keep secrets and machine-specific settings out of commits. Use the `Env` examples and the service environment files for local configuration; production environment files, private mail keys, database exports, coverage, `node_modules`, `vendor`, and build outputs are not source code.
- Preserve existing translations. Text shown to users belongs in the service's `app/i18n` flow; use `make i18n_extract` and `make i18n_compile` at the root when changing translatable messages in Tyr, Forseti, Sigrun, or Bragi. Review generated translation changes before committing.
- Add or update a focused test for behavior changes where the owning service has a test suite. Use the domain terms in `docs/technical/terminology.md` consistently, especially event, session, round, registration, and sign-up.

## Service-specific directions

| Path | Where to change code and what to preserve |
| --- | --- |
| `Mimir/` | TypeScript Twirp game backend. API handlers are in `src/mimir.ts`; business logic lives in `src/models`, `src/services`, `src/helpers`, and MikroORM `src/entities`. Put schema changes in `src/migrations`, not in database initialization SQL for an existing installation. Keep scoring, ruleset, seating, and replay behavior covered by the nearby Jest tests. |
| `Frey/` | TypeScript Twirp identity backend. `app/frey.ts` binds API methods to `app/models`; authentication, rights, cache, and mail helpers are in `app/helpers`. Put schema changes in `app/database/migrations` and cover authorization and personal-data changes with its Jest tests. |
| `Tyr/` | React/Vite mobile game assistant. UI is in `app/components`, state in `app/store`, external effects in `app/services`, and shared calculations in `app/helpers`. Keep scoring and game-state behavior aligned with Mimir; run its Vitest tests for such changes. |
| `Forseti/` | React/Vite administration and profile SPA. Place screens in `app/pages`, reusable UI in `app/components`, and backend calls in `app/services`. Preserve permission checks when changing event, player, or admin workflows. |
| `Sigrun/` | React/Vite server-rendered public ratings and statistics site. Work in `app/pages`, `app/components`, and `app/services`; check both browser and server rendering when changing code used by `app/server.tsx`. |
| `Bragi/` | React/Vite server-rendered landing site. Page copy is mostly in `app/pages/*.mdx`; shared UI is in `app/components`. Check both browser and server rendering for shared components. |
| `Skirnir/` | TypeScript Telegram notification service. Its entry point is `app/server.ts`; preserve the notification API and queue/rate-limit behavior when editing delivery logic. |
| `Hugin/` | PHP monitoring and error collection. Code is under `src`, HTTP entry points under `www`, and schema changes under `data/migrations`. Preserve the privacy boundary described in its README: analytics must remain depersonalized. |
| `Gullveig/` | PHP file and avatar storage. Controllers are in `src/controllers` and public entry points in `www`; check upload and file-serving behavior when changing storage paths or validation. |
| `Meili/` | PHP GeoIP provider. Its API code is in `src/controllers`; geographic data and lookup tools are under `bin`. Keep IP-derived defaults and API response shapes compatible with callers. |
| `Fenrir/` | Playwright end-to-end tests in `tests/*.spec.ts`; shared helpers are in `tests/utils`. Follow `playwright.config.ts` and use the root `make e2e_dev` flow against a running development stack. |
| `Hermod/` | Mail container configuration and scripts. Treat `opendkim_keys` as private material; test changes through mail flows in Frey and the development `make dump_last_mail` command. |
| `Database/` | PostgreSQL initialization, backup, and migration support. Existing schemas evolve through the owning service's migrations (Frey, Mimir, Hugin); use initialization SQL for fresh database setup. Treat import, restore, and cleanup commands as data-changing operations. |
| `Redis/` | Redis image and entrypoint configuration. Check effects on Frey/Mimir caches when changing it. |
| `Common/` | Shared protobuf contracts, generated clients, storage helpers, common images, and reverse-proxy configuration. Run `make -C Common lint` for `.proto` edits and check all affected services after shared changes. |

## Validation and workflow

- Run lint, format, and type checks through the **root Makefile** against the development containers: `make <service>_oxlint <service>_oxfmt <service>_typecheck` from the repository root, using lowercase service names (for example, `make forseti_oxlint forseti_oxfmt forseti_typecheck`). For broad changes, run `make lint`. The root recipes redirect output to `tmp/<service>_*.log`; inspect those logs and do not rely on the terminal exit status alone, because a missing container can be reported without failing its wrapper target. Do not substitute `make -C <Service> ...` host checks for these container checks.
- For PHP services, use the root targets `make hugin_lint hugin_analyze`, `make gullveig_lint gullveig_analyze`, or `make meili_lint meili_analyze`; these run PHP_CodeSniffer and PHPStan in the owning container. Check PHP behavior with the service's available tests or an affected integration flow.
- The root `make test` target runs tests for Tyr, Frey, and Mimir through their containers. Forseti, Sigrun, and Bragi have service Vitest targets, but are not included in root `make test`; check whether a service actually has test files before treating a Vitest run as meaningful. Fenrir runs Playwright through `make -C Fenrir container_run` or the root e2e targets. Use the owning root checks first for a focused change, then `make lint` for broad changes when the development stack is available. Hugin's analyzer also needs the PHP protobuf classes in `Common/generated`; missing generated classes are a setup failure, not a reason to suppress analyzer errors.
- Database migrations and integration/e2e tests require the development containers and databases described in `README.md`. Do not assume a local typecheck or unit test proves cross-service behavior. Use `make e2e_dev` for a full user flow when it is affected.
- Avoid `make kill`, `make prod_update`, database restore/import, and migration-from-v1 targets during routine validation: these can remove images, discard changes, or replace data. Check `git status` after generators or builds so only intended source and generated contract files remain in the change.
