# Coding guidance for Pantheon

This file applies to the whole repository. Use the nearest service README and `tasks.sh` for details; the root README describes the development environment and `docs/technical/terminology.md` defines domain terms.

Before applying changes, consult the relevant documents in `.codex/knowledge_base`, including [the service port reference](.codex/knowledge_base/Pantheon_Service_Ports.md). For networking, service URLs, proxies, containers, development servers, tests, or debugging changes, check that reference against the affected configuration and update it when port assignments change. Treat `compose.yaml` as the source of truth for shared port mappings and `compose.dev.yaml` as the source of truth for debugger publications. The mode overlays are shared by both architectures; run `bin/pantheon infra-test` to detect drift. The old architecture-specific filenames are compatibility includes.

## General rules

- Follow `.editorconfig`: UTF-8, LF, final newline, two-space indentation.
- Make changes in the owning service. Keep service boundaries intact: use the existing Twirp contracts for cross-service calls and update the relevant caller and provider together when a contract changes.
- Treat `Common/proto/*.proto` as the source of truth for API messages and methods. After editing a protocol, run `bin/pantheon proto-gen` from the root for the TypeScript clients in `Common/tsclients/proto`. Never hand-edit generated protocol code.
- Use the existing `pnpm-lock.yaml` in each TypeScript service when changing dependencies. Do not introduce another package manager's lockfile.
- Keep secrets and machine-specific settings out of commits. Use the `Env` examples and the service environment files for local configuration; production environment files, private mail keys, database exports, coverage, `node_modules`, `vendor`, and build outputs are not source code.
- Preserve existing translations. Text shown to users belongs in the service's `app/i18n` flow; use `bin/pantheon i18n extract` and `bin/pantheon i18n compile` at the root when changing translatable messages in Tyr, Forseti, Sigrun, or Bragi. Review generated translation changes before committing.
- Add or update a focused test for behavior changes where the owning service has a test suite. Use the domain terms in `docs/technical/terminology.md` consistently, especially event, session, round, registration, and sign-up.

## Validation and workflow

- Prefix every commit created by Codex with `[codex]` (for example, `[codex] Fix event registration validation`).

- Run lint, format, and type checks through the root Bash runner against development containers: `bin/pantheon lint SERVICE` (for example, `bin/pantheon lint Forseti`). For broad changes, run `bin/pantheon lint`. Inspect `tmp/<service>_*.log` alongside the exit status. Missing or stopped containers fail through the shared executor. Use `bin/pantheon task SERVICE TASK` for individual checks; do not substitute host checks for container validation.
- Run unit tests from the repository root with `bin/pantheon test` (Tyr, Frey, Mimir, Gullveig, Meili, Hermod, Hugin, Forseti, Sigrun, and Bragi); use `bin/pantheon test --verbose` when individual test names and failure details are needed. Skirnir currently has no test files and is not included in root `bin/pantheon test`; add its suite to the root list when introducing tests. Root test commands run every listed suite even after an earlier failure, then report failure. Fenrir runs Playwright through `bin/pantheon task Fenrir run` or the root e2e commands. Use the owning root checks first for a focused change, then `bin/pantheon lint` for broad changes when the development stack is available. Container or runner changes also require `bin/pantheon infra-test`; validate startup, proxy routing, and affected execution modes on the development stack. `bin/pantheon` owns lifecycle, service addressing and orchestration; owning service `tasks.sh` files contain application commands. Keep image deployment separate from `source-prod` compilation.
- Database migrations and integration/e2e tests require the development containers and databases described in `README.md`. Do not assume a local typecheck or unit test proves cross-service behavior. Use `bin/pantheon e2e dev` for a full user flow when it is affected.
- Avoid `bin/pantheon maintenance reset`, `bin/pantheon prod update`, database restore/import, and migration-from-v1 targets during routine validation: these can remove images, discard changes, or replace data. Check `git status` after generators or builds so only intended source and generated contract files remain in the change.
