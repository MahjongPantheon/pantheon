# Coding guidance for Pantheon

This file applies to the whole repository. Use the nearest service README and Makefile for details; the root README describes the development environment and `docs/technical/terminology.md` defines domain terms.

Before applying changes, consult the relevant documents in `.codex/knowledge_base`, including [the service port reference](.codex/knowledge_base/Pantheon_Service_Ports.md). For networking, service URLs, proxies, containers, development servers, tests, or debugging changes, check that reference against the affected configuration and update it when port assignments change. Treat `docker-compose-amd64.yml` as the source of truth for Compose port mappings and keep ARM64 mappings aligned.

## General rules

- Follow `.editorconfig`: UTF-8, LF, final newline, two-space indentation.
- Make changes in the owning service. Keep service boundaries intact: use the existing Twirp contracts for cross-service calls and update the relevant caller and provider together when a contract changes.
- Treat `Common/proto/*.proto` as the source of truth for API messages and methods. After editing a protocol, run `make proto_gen` from the root for the TypeScript clients in `Common/tsclients/proto`. Never hand-edit generated protocol code.
- Use the existing `pnpm-lock.yaml` in each TypeScript service when changing dependencies. Do not introduce another package manager's lockfile.
- Keep secrets and machine-specific settings out of commits. Use the `Env` examples and the service environment files for local configuration; production environment files, private mail keys, database exports, coverage, `node_modules`, `vendor`, and build outputs are not source code.
- Preserve existing translations. Text shown to users belongs in the service's `app/i18n` flow; use `make i18n_extract` and `make i18n_compile` at the root when changing translatable messages in Tyr, Forseti, Sigrun, or Bragi. Review generated translation changes before committing.
- Add or update a focused test for behavior changes where the owning service has a test suite. Use the domain terms in `docs/technical/terminology.md` consistently, especially event, session, round, registration, and sign-up.

## Validation and workflow

- Prefix every commit created by Codex with `[codex]` (for example, `[codex] Fix event registration validation`).

- Run lint, format, and type checks through the **root Makefile** against the development containers: `make <service>_oxlint <service>_oxfmt <service>_typecheck` from the repository root, using lowercase service names (for example, `make forseti_oxlint forseti_oxfmt forseti_typecheck`). For broad changes, run `make lint`. The root recipes redirect output to `tmp/<service>_*.log`; inspect those logs and do not rely on the terminal exit status alone, because a missing container can be reported without failing its wrapper target. Do not substitute `make -C <Service> ...` host checks for these container checks.
- Run unit tests from the repository root with `make test` (Tyr, Frey, Mimir, Gullveig, Meili, Hermod, and Hugin); use `make test_verbose` when individual test names and failure details are needed. Forseti, Sigrun, and Bragi have service Vitest targets, but are not included in root `make test`; check whether a service actually has test files before treating a Vitest run as meaningful. Fenrir runs Playwright through `make -C Fenrir container_run` or the root e2e targets. Use the owning root checks first for a focused change, then `make lint` for broad changes when the development stack is available.
- Database migrations and integration/e2e tests require the development containers and databases described in `README.md`. Do not assume a local typecheck or unit test proves cross-service behavior. Use `make e2e_dev` for a full user flow when it is affected.
- Avoid `make kill`, `make prod_update`, database restore/import, and migration-from-v1 targets during routine validation: these can remove images, discard changes, or replace data. Check `git status` after generators or builds so only intended source and generated contract files remain in the change.
