# Fenrir test-case descriptions

Describe one user outcome per case using [template.md](template.md). Keep a complete journey, such as sign-up, email confirmation, and login, together when those stages prove one outcome.

Use a stable ID and one Markdown file per case, named `<lowercase-id>-<scenario>.md`. Start every Playwright test title with `<ID>: ` so descriptions and reports can be matched. Before implementing a supplied case, search the specs for its ID and check this index for equivalent coverage. Update an existing matching test instead of recreating it. Preserve established IDs and assign an unused ID only to a new case.

| Case                                                   | Purpose                                                                    | Existing implementation                                                                                                                           |
| ------------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [AUTH-001](auth-001-signup-confirm-login.md)           | Sign up, confirm email, and log in                                         | `AUTH-001: Visitor can sign up, confirm their email, and log in` in `tests/register.spec.ts`                                                      |
| [AUTH-002](auth-002-signup-from-tyr.md)                | Open sign-up from Tyr                                                      | `AUTH-002: Visitor can open account sign-up from Tyr` in `tests/register.spec.ts`                                                                 |
| [SMOKE-001](smoke-001-open-sigrun.md)                  | Open the public ratings frontend                                           | `SMOKE-001: Visitor can open Sigrun` in `tests/open.spec.ts`                                                                                      |
| [AUTH-003](auth-003-recovery-from-tyr.md)              | Open password recovery from Tyr                                            | `AUTH-003: Visitor can open password recovery from Tyr` in `tests/register.spec.ts`                                                               |
| [SMOKE-002](smoke-002-open-tyr.md)                     | Open the mobile game assistant                                             | `SMOKE-002: Visitor can open Tyr` in `tests/open.spec.ts`                                                                                         |
| [SMOKE-003](smoke-003-open-forseti.md)                 | Open the administration frontend                                           | `SMOKE-003: Visitor can open Forseti` in `tests/open.spec.ts`                                                                                     |
| [SMOKE-004](smoke-004-create-event-with-users.md)      | Create a local event and register eight players                            | `SMOKE-004: Create a local event and add players there` in `tests/events.spec.ts`                                                                 |
| [SMOKE-005](smoke-005-local-session-round-outcomes.md) | Finish a local session with varied outcomes and compare Tyr/Sigrun results | `SMOKE-005: Registered player can finish a local session and view matching results in Tyr and Sigrun` in `tests/local-session.spec.ts`            |
| [SMOKE-006](smoke-006-basic-tournament-seatings.md)    | Complete a two-table tournament with random, Swiss, and interval seating   | `SMOKE-006: Administrator and players can complete a two-table tournament with random, Swiss, and interval seating` in `tests/tournament.spec.ts` |

SMOKE-005 and SMOKE-006 share the [complete yaku hand catalogue](smoke-hand-catalogue.md) and explicit per-game score fixtures. Each event covers all 46 yaku, compatible combinations, and varied fu/dora; their per-attempt budgets are 30 and 60 minutes respectively.

These descriptions cover all existing tests; improvements and coverage limits are identified separately. AUTH-003 covers navigation to password recovery, not the password-reset journey.

For implementation, follow the Fenrir guidance in [AGENTS.md](../../AGENTS.md). Assert every documented expected result and keep the description aligned with the implementation. Use setup helpers for unrelated prerequisites so cases remain independent.

Run flows from the repository root with `make e2e_dev` against the development stack. See the [root README](../../README.md) for environment setup and the production-build e2e flow. Development e2e runs do not cover SSR.
