## Subsystems of Pantheon

Checked against the current codebase on 18 October 2026. Paths below are repository-relative. Use the [root coding guidance](../../AGENTS.md), [root README](../../README.md), and owning service Makefile for validation commands.

Pantheon is a set of services, not one application. `Mimir` owns game, event, tournament, rating, and statistics data; `Frey` owns authentication, personal data, and access rules. Both expose Twirp APIs defined in `Common/proto`. The user interfaces are `Tyr` (mobile game recording), `Forseti` (administration and profiles), `Sigrun` (ratings and game views), and `Bragi` (landing pages). `Skirnir` sends real-time bot notifications and optional external-tracker requests. `Hugin` collects monitoring data and frontend errors, `Gullveig` stores uploaded files, and `Meili` provides geographic data. `Hermod` is the mail service; `Database` and `Redis` provide storage and caching; `Fenrir` holds Playwright end-to-end tests.

## Description of subsystems

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
| `Gullveig/` | TypeScript file and avatar storage. The upload server is in `src/server.ts`, HTTP handling in `src/app.ts`, and image processing in `src/avatars.ts`; Nginx serves stored avatars and `www/static` fonts. Check upload and file-serving behavior when changing storage paths or validation. |
| `Meili/` | PHP GeoIP provider. Its API code is in `src/controllers`; geographic data and lookup tools are under `bin`. Keep IP-derived defaults and API response shapes compatible with callers. |
| `Fenrir/` | Playwright end-to-end tests in `tests/*.spec.ts`; shared helpers are in `tests/utils`. Follow `playwright.config.ts` and use the root `make e2e_dev` flow against a running development stack. |
| `Hermod/` | Mail container configuration and scripts. Treat `opendkim_keys` as private material; test changes through mail flows in Frey and the development `make dump_last_mail` command. |
| `Database/` | PostgreSQL initialization, backup, and migration support. Existing schemas evolve through the owning service's migrations (Frey, Mimir, Hugin); use initialization SQL for fresh database setup. Treat import, restore, and cleanup commands as data-changing operations. |
| `Redis/` | Redis image and entrypoint configuration. Check effects on Frey/Mimir caches when changing it. |
| `Common/` | Shared protobuf contracts, generated clients, storage helpers, common images, and reverse-proxy configuration. Run `make -C Common lint` for `.proto` edits and check all affected services after shared changes. |

### Mimir specifics

- For independent asynchronous work, collect promises and await them together. Preserve sequencing where operations depend on prior results; existing code also uses sequential awaits.
- Preserve transaction ownership and the existing `TransactionPropagation.REQUIRED` pattern in models. Inspect the caller before adding a transaction; internal helpers can also be reached from workers or other models. Scheduled workers own their transaction in `cron/runner.ts`.
- Scheduled work is launched by `cron/cron.ts` as separate bounded child processes for achievements, player statistics, scoring, and metrics. See the [Mimir README](../../Mimir/README.md) and `cron/jobs.ts` for advisory-lock and timeout behavior.
- Mimir currently records round outcomes and calculates session payments/progression; it does not run the planned tile-by-tile game engine. See the [rules reference's implementation notes](Riichi_Mahjong_Rules.md#18-current-pantheon-implementation-and-planned-engine).

### Frey specifics

- For independent asynchronous work, collect promises and await them together; preserve required sequencing.
- Keep request handlers lightweight and use the existing Redis cache helpers where appropriate.

### Tyr specifics

- Use redux machinery to reflect behavioral changes
- Use embedded UI framework based on plain React modules and PostCSS conventions to make new components.
- Do not use any server-side rendering and keep the subsystem client-only.

### Forseti specifics

- Use React context to share state and functions to modify the state among the components.
- Use Mantine UI v6 framework as base for new components.
- Do not use any server-side rendering and keep the subsystem client-only.

### Sigrun specifics

- Use React context to share state and functions to modify the state among the components.
- Use Mantine UI v7 and the existing Emotion integration for new components. `@mantine/ssr` still has a v6 dependency; that does not make Sigrun a Mantine v6 application. See [its package manifest](../../Sigrun/package.json).
- All components are expected to render on both server and client, unless the contrary is required.
- The normal Vite development flow is client-rendered. Validate SSR using the built client/server bundles through `server.js` and `app/server.tsx`; use the root README's production-build e2e flow for integration coverage.

### Bragi specifics

- Bragi uses Mantine UI v6, unlike Sigrun. See [its package manifest](../../Bragi/package.json).
- Preserve MDX page content and the built SSR flow in `server.js` and `app/server.tsx` when changing shared UI.

### Shared contracts and validation

- `Common/proto/*.proto` is the API source of truth. `make proto_gen` at the root regenerates TypeScript clients and refreshes development dependencies; it does not generate Hugin's PHP classes. Use the PHP generation command in [AGENTS.md](../../AGENTS.md) for Hugin contract changes.
- Use root container check targets and inspect `tmp/<service>_*.log`, since the wrappers can report a missing container without a failing status. `make -C Common lint` is the protobuf-specific check.
- Root `make test` covers Tyr (Vitest), Frey (Jest), and Mimir (Jest plus its test server/build check). Forseti, Sigrun, and Bragi have separate Vitest targets; first check whether relevant test files exist. Fenrir provides Playwright integration tests.

### Fenrir test cases

- Describe new or changed end-to-end scenarios in `Fenrir/testcases/` using `template.md`. Use one file per case, a stable ID, and a title describing the actor, outcome, and relevant condition. See that folder's README and examples.
- Specify purpose, service scope, preconditions (including permissions), test data, an action/expected-result table, and cleanup or isolation. Use observable, specific results and Pantheon domain terminology. Distinguish current automated coverage from proposed additional assertions.
- Implement each case as an independent `test()` in `Fenrir/tests/*.spec.ts`. Include the case ID in the test title and link the description to the implementing file and test title. Keep descriptions and implementations synchronized. Before creating a test for a supplied case, search the existing specs and case index for its ID and equivalent behavior. Update the matching test instead of duplicating it; preserve established IDs and assign an unused ID only to a new case.
- Translate each expected result into an assertion. Use `test.step()` for meaningful stages of longer journeys, roles/labels or stable test IDs for locators, and awaited Playwright assertions. Wait for UI conditions or browser events rather than fixed sleeps; register new-tab listeners before triggering navigation.
- Exercise the real Pantheon services involved in the described integration and assert the final user-visible outcome. Keep smoke checks separate from cases proving persisted data, permissions, scoring, or cross-service behavior.
- Create or seed required data independently of other tests. Give each attempt unique mutable data, including retries, and document cleanup or retention. Browser isolation does not isolate shared databases or mailboxes. Match email to the case's recipient; while using the current unfiltered `getLastMail()` helper, prevent competing email-producing tests from running concurrently.
- Preserve the failure-screenshot helper and configured reporting. Validate implementation changes through root `make fenrir_oxlint fenrir_oxfmt fenrir_typecheck`, inspect `tmp/fenrir_*.log`, and run affected flows with `make e2e_dev` against the development stack. This development flow does not validate SSR; use the root README's production-build e2e flow when SSR is part of the case.
