## Subsystems of Pantheon

Checked against the current codebase on 18 October 2026. Paths below are repository-relative. Use the [root coding guidance](../../AGENTS.md), [root README](../../README.md), and owning service Makefile for validation commands.

Pantheon is a set of services, not one application. `Mimir` owns game, event, tournament, rating, and statistics data; `Frey` owns authentication, personal data, and access rules. Both expose Twirp APIs defined in `Common/proto`. The user interfaces are `Tyr` (mobile game recording), `Forseti` (administration and profiles), `Sigrun` (ratings and game views), and `Bragi` (landing pages). `Skirnir` sends real-time bot notifications and optional external-tracker requests. `Hugin` collects monitoring data and frontend errors, `Gullveig` stores uploaded files, and `Meili` provides geographic data. `Hermod` is the mail service; `Database` and `Redis` provide storage and caching; `Fenrir` holds Playwright end-to-end tests.

## Description of subsystems

| Path | Where to change code and what to preserve |
| --- | --- |
| `Mimir/` | TypeScript Twirp game backend. API handlers are in `src/mimir.ts`; business logic lives in `src/models`, `src/services`, `src/helpers`, and MikroORM `src/entities`. Put schema changes in `src/migrations`, not in database initialization SQL for an existing installation. Keep scoring, ruleset, seating, and replay behavior covered by the nearby Vitest tests. |
| `Frey/` | TypeScript Twirp identity backend. `app/frey.ts` binds API methods to `app/models`; authentication, rights, cache, and mail helpers are in `app/helpers`. Put schema changes in `app/database/migrations` and cover authorization and personal-data changes with its Vitest tests. |
| `Tyr/` | React/Vite mobile game assistant. UI is in `app/components`, state in `app/store`, external effects in `app/services`, and shared calculations in `app/helpers`. Keep scoring and game-state behavior aligned with Mimir; run its Vitest tests for such changes. |
| `Forseti/` | React/Vite administration and profile SPA. Place screens in `app/pages`, reusable UI in `app/components`, and backend calls in `app/services`. Preserve permission checks when changing event, player, or admin workflows. |
| `Sigrun/` | React/Vite server-rendered public ratings and statistics site. Work in `app/pages`, `app/components`, and `app/services`; check both browser and server rendering when changing code used by `app/server.tsx`. |
| `Bragi/` | React/Vite server-rendered landing site. Page copy is mostly in `app/pages/*.mdx`; shared UI is in `app/components`. Check both browser and server rendering for shared components. |
| `Skirnir/` | TypeScript Telegram notification service. Its entry point is `app/server.ts`; preserve the notification API and queue/rate-limit behavior when editing delivery logic. |
| `Hugin/` | TypeScript monitoring and error collection with Kysely/PostgreSQL, shared Redis metrics and four nginx-balanced workers. HTTP/Twirp routes are in `src/app.ts`, ingestion in `src/ingest.ts`, reporting/rollups in `src/reports.ts` and `src/aggregation.ts`, and schema migrations in `src/migrations`. Preserve the privacy boundary described in its README: analytics must remain depersonalized. |
| `Gullveig/` | TypeScript file and avatar storage. The upload server is in `src/server.ts`, HTTP handling in `src/app.ts`, and image processing in `src/avatars.ts`; Nginx serves stored avatars and `www/static` fonts. Check upload and file-serving behavior when changing storage paths or validation. |
| `Meili/` | TypeScript GeoIP provider. HTTP handling is in `src/app.ts`, database lookup in `src/geoip.ts`, and compatible country/timezone lists in `src/data`. Each of four production workers reads `bin/GeoLite2-City.mmdb` once; Nginx balances requests between them. Keep IP-derived defaults and API response shapes compatible with callers. |
| `Fenrir/` | Playwright end-to-end tests in `tests/*.spec.ts`; shared helpers are in `tests/utils`. Follow `playwright.config.ts` and use the root `make e2e_dev` flow against a running development stack. |
| `Hermod/` | TypeScript mail HTTP service (`src/app.ts`), local Postfix submission and MIME dumps (`src/mail.ts`), plus Postfix/OpenDKIM container configuration and scripts. Treat `opendkim_keys` as private material; test changes through mail flows in Frey and the development `make dump_last_mail` command. |
| `Database/` | Standalone Alpine/PostgreSQL image, initialization, Bash backup notifications, and migration support. Existing schemas evolve through the owning service's migrations (Frey, Mimir, Hugin); use initialization SQL for fresh database setup. Treat import, restore, and cleanup commands as data-changing operations. |
| `Redis/` | Standalone Alpine/Redis image and entrypoint configuration. Check effects on Frey/Mimir caches when changing it. |
| `Common/` | Shared protobuf contracts, generated clients, storage helpers, the shared Node image in `Common/ContainerBase` (`pantheon-container-base-v4`), and reverse-proxy configuration. Run `make -C Common lint` for `.proto` edits and check all affected services after shared changes. |

### Mimir specifics

- For independent asynchronous work, collect promises and await them together. Preserve sequencing where operations depend on prior results; existing code also uses sequential awaits.
- Preserve transaction ownership and the existing `TransactionPropagation.REQUIRED` pattern in models. Inspect the caller before adding a transaction; internal helpers can also be reached from workers or other models. Scheduled workers own their transaction in `cron/runner.ts`.
- Scheduled work is launched by `cron/cron.ts` as separate bounded child processes for achievements, player statistics, scoring, and metrics. See the [Mimir README](../../Mimir/README.md) and `cron/jobs.ts` for advisory-lock and timeout behavior.
- Mimir currently records round outcomes and calculates session payments/progression; it does not run the planned tile-by-tile game engine. See the [rules reference's implementation notes](Riichi_Mahjong_Rules.md#18-current-pantheon-implementation-and-planned-engine).

### Frey specifics

- For independent asynchronous work, collect promises and await them together; preserve required sequencing.
- Keep request handlers lightweight and use the existing Redis cache helpers where appropriate.

### Tyr specifics

- Tyr targets mobile browsers only (phones and tablets), not desktop/PC browsers. Design and validate touch interactions at mobile viewport sizes and orientations. Do not introduce desktop keyboard shortcuts, Escape-key dismissal, or keyboard-driven navigation. Keep touch controls usable while overlays are open, including the bottom bar when selecting a round outcome.
- Use redux machinery to reflect behavioral changes
- Use embedded UI framework based on plain React modules and PostCSS conventions to make new components.
- Do not use any server-side rendering and keep the subsystem client-only.

### Forseti specifics

- Use React context to share state and functions to modify the state among the components.
- Use Mantine UI v9 with React 19 for new components. Import package stylesheets at the client entry point and use CSS Modules or style props; use the local numeric-input adapter for integer form fields.
- Do not use any server-side rendering and keep the subsystem client-only.

### Sigrun specifics

- Use React context to share state and functions to modify the state among the components.
- Use Mantine UI v9 with React 19 and the existing Emotion integration for new components. `app/ThemeProvider.tsx` preserves the previous radius and light-variant colors; SSR uses a fresh Emotion cache per request. See [its package manifest](../../Sigrun/package.json).
- All components are expected to render on both server and client, unless the contrary is required.
- The normal Vite development flow is client-rendered. Validate SSR using the built client/server bundles through `server.js` and `app/server.tsx`; use the root README's production-build e2e flow for integration coverage.

### Bragi specifics

- Bragi uses Mantine UI v6, unlike Sigrun. See [its package manifest](../../Bragi/package.json).
- Preserve MDX page content and the built SSR flow in `server.js` and `app/server.tsx` when changing shared UI.

### Shared contracts and validation

- `Common/proto/*.proto` is the API source of truth. `make proto_gen` at the root regenerates TypeScript clients and refreshes development dependencies, including Hugin's generated Twirp server contract.
- Use root container check targets and inspect `tmp/<service>_*.log`, since the wrappers can report a missing container without a failing status. `make -C Common lint` is the protobuf-specific check.
- Root `make test` and `make test_verbose` cover Tyr, Forseti, Sigrun, Frey, Mimir, Gullveig, Meili, Hermod, and Hugin (Vitest). All suites run even after a failure; the aggregate still fails. Bragi and Skirnir currently have no test files. Fenrir runs its lint, formatting, type checks, and Playwright integration tests through the separate e2e workflow; the service-check reporter excludes it because its container is in the optional `e2e` Compose profile. CI runs service tests after successful dependency/migration setup even when lint fails. All checks share one container environment; `.github/scripts/report-checks.sh` records per-service lint, formatting, type, and test results plus overall line coverage in the Actions summary and a single updated PR comment. All nine unit suites generate `coverage/coverage-summary.json`; the reporter removes old summaries before each run, displays missing/invalid coverage as unavailable, and includes the generated summaries in the check artifact. The e2e workflow publishes its own Actions summary and separate updated PR comment with setup, Fenrir code checks, and Playwright results, including failures and skips; its artifacts are `e2e-check-results` and `playwright-report`. Application check logs are uploaded as `service-check-results`; fork PRs retain the summary/artifact without a comment because their token is read-only.

### Fenrir test cases

- Describe new or changed end-to-end scenarios in `Fenrir/testcases/` using `template.md`. Use one file per case, a stable ID, and a title describing the actor, outcome, and relevant condition. See that folder's README and examples.
- Specify purpose, service scope, preconditions (including permissions), test data, an action/expected-result table, and cleanup or isolation. Use observable, specific results and Pantheon domain terminology. Distinguish current automated coverage from proposed additional assertions.
- Implement each case as an independent `test()` in `Fenrir/tests/*.spec.ts`. Include the case ID in the test title and link the description to the implementing file and test title. Keep descriptions and implementations synchronized. Before creating a test for a supplied case, search the existing specs and case index for its ID and equivalent behavior. Update the matching test instead of duplicating it; preserve established IDs and assign an unused ID only to a new case.
- Translate each expected result into an assertion. Use `test.step()` for meaningful stages of longer journeys, roles/labels or stable test IDs for locators, and awaited Playwright assertions. Wait for UI conditions or browser events rather than fixed sleeps; register new-tab listeners before triggering navigation.
- Exercise the real Pantheon services involved in the described integration and assert the final user-visible outcome. Keep smoke checks separate from cases proving persisted data, permissions, scoring, or cross-service behavior.
- Create or seed required data independently of other tests. Give each attempt unique mutable data, including retries, and document cleanup or retention. Browser isolation does not isolate shared databases or mailboxes. Match email to the case's recipient; while using the current unfiltered `getLastMail()` helper, prevent competing email-producing tests from running concurrently.
- Preserve the failure-screenshot helper and configured reporting. Validate implementation changes through root `make fenrir_oxlint fenrir_oxfmt fenrir_typecheck`, inspect `tmp/fenrir_*.log`, and run affected flows with `make e2e_dev` against the development stack. This development flow does not validate SSR; use the root README's production-build e2e flow when SSR is part of the case.
