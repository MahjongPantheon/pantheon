# Rules support review: #778

Issue: https://github.com/MahjongPantheon/pantheon/issues/778

## Behavior and acceptance criteria

- Added `CorrectSessionSeating` to the Mimir Twirp contract and generated clients.
  Administrators and referees can correct active offline sessions in nonfinished
  events after play has started. Finished/prefinished/cancelled sessions, online
  events and tournament tables awaiting the timer are rejected.
- The request contains the exact permutation of real session players and the
  expected next-round token from a fresh overview. Missing/stale tokens, duplicate
  players, foreign players and the sanma ghost are rejected.
- A refreshed session write lock serializes correction against round entry,
  cancellation, undo, extra time and completion. Bulk finalization, seating reset
  and scoring rebuild use ordered session write locks and refreshed states.
- Replay starts from a clone of the first round's saved preceding state (or the
  current state for an empty session), changes initial seating, then uses the
  existing payment/progression primitive for every recorded outcome. It retains
  IDs, participants, hand values/yaku, timestamps and outcome order. Rebuilt
  snapshots support subsequent undo and historical payment display.
- Historical `lastHandStarted` and `prematurelyFinished` decisions are copied from
  the original next snapshot/final state. Replay never consults the clock, the
  restarted event timer or later extra time. Scores, current dealer, round,
  honba, pot, chips, yakitori, chombo and pao are recalculated by normal rules.
- Any corrected history reaching an ending condition, including at its final
  hand, is rejected before managed entities are changed. Otherwise all snapshots,
  current state, seat orders and the rotated token commit in one transaction.
  No round-entry notification, result/history finalization or cron work is emitted.
- Forseti Games Control loads fresh seats/token on opening the dialog, swaps only
  real participants, disables repeated submissions, explains outcome ownership,
  displays rejection errors and refreshes the table after success. Successful
  correction closes before refresh so a failed refresh cannot invite a retry.
- Sanma retains its three real seats and the ghost's stored North position.

## Assumptions and questions for product review

The user authorized reasonable assumptions while unavailable. These are recorded
for review rather than blocking the implementation:

1. Recorded outcomes belong to the named players. Correction changes their
   starting winds and recalculates payments/progression. Should there also be a
   separate operation to remap outcomes entered using incorrect seat labels?
2. Correction targets active sessions. Is correction of finished sessions also
   required? Such a flow would need explicit result/history/statistics rebuilding
   and a policy for subsequent games; it is outside this change.
3. A replay that would naturally end is rejected atomically, even at the final
   recorded hand. Explicit automatic finalization is not part of this operation.
4. Missing historical snapshots are rejected because reconstructing timer and
   initial ancillary state from defaults would lose information.
5. Replay uses the event's current ruleset, as ordinary re-entry does. Per-round
   ruleset snapshots do not exist. A requirement to freeze historical rule
   configuration would need a separate storage/product decision.

## Validation

All application checks use root `./run` with
`COMPOSE_PROJECT_NAME=pantheon-rules-check-778`. The parent verified the actual
Mimir source bind is `/home/storage/projects/pantheon/tmp/rules-778/Mimir` at
`/var/www/html/Mimir`; other service containers belong to the same isolated
development Compose project. The primary checkout and previous issue's databases
are not used.

- Root protocol generator completed and dependencies were refreshed; Mimir's
  watcher was restarted to reload generated descriptors.
- Common protobuf lint retains the exact existing 71 diagnostics; no new findings.
- Focused replay tests cover every outcome, explicit dealer-dependent scores,
  multi-ron carried-pot priority, sanma tsumo, draw progression, yakitori seed
  flags, deterministic repeated correction, historical timers and terminal guards.
- PostgreSQL tests pass: preserved outcomes/IDs/timestamps and undo, rollback after
  a real flush, and blocking round/undo/extra-time/completion competitors that
  re-read the corrected state. They use unique local event fixtures in the unit DB.
- Forseti dialog tests pass for seat swapping, fresh overview/token, repeated-click
  prevention, stale-token rejection, failed overview loading and successful save
  followed by failed table refresh. API contract tests cover the exact request.
- Root i18n extract/compile completed for Forseti. Catalog additions are limited
  to eight new messages; Russian translations are supplied, other locales retain
  English fallback. Every preexisting compiled translation entry is unchanged.
- Supplemental React Doctor changed-scope scan: 86/100, equal to baseline, no new
  diagnostics across seven files in the final scan. Parent log:
  `/tmp/pantheon-rules-778-react-doctor-final.log`.
- Final `./run lint Mimir`, `./run lint Forseti` and `./run lint Fenrir` pass;
  their `tmp/<service>_{oxlint,oxfmt,typecheck}.log` files were inspected. Final
  `./run task Mimir build` also passes.
- Full `./run test Mimir` produced 1092 passing tests, 12 skips and one failure
  in the new abort-history regression because that process had loaded the
  pre-fix payment reader. It exited 1; this is not reported as a clean aggregate
  pass. A subsequent container run of the final `RoundModel.test.ts` passes all
  17 tests. Combined coverage meets every 85% threshold: lines 96.37%, statements
  92.31%, functions 87.89%, branches 86.36%. Logs:
  `tmp/issue778_mimir_runner_final.log`, `tmp/issue778_roundmodel_final.log`,
  `tmp/issue778_mimir_build_final.log`. An earlier aggregate run's existing
  scoring-test timeout passed in isolation and in the serial rerun.
- Final `./run test Forseti` passes all 367 tests in 39 files. Coverage: lines
  94.41%, statements 93.48%, functions 90.60%, branches 85.02%. Log:
  `tmp/issue778_forseti_runner_final.log`. The preceding run's 365 tests passed
  but missed branch coverage at 84.83%; two meaningful failure/repeated-loading
  cases resolved that threshold without lowering it.
- `./run e2e dev --grep RULES-001 --workers=1 --retries=0` passes: one Chromium
  test, 5.7 seconds (8.3 seconds total). Log: `tmp/issue778_e2e_final.log`.
  This uses the real Frey/Mimir/Forseti services, verifies the exact submitted
  permutation, retained outcomes, persisted scores/progression/token and reload.
  An initial run completed the correction but used the wrong test field name
  `honba`; the corrected assertion uses the contract's `honbaCount`.
- Final `git diff --check` passes. No commit, push, PR, issue comment or primary
  checkout change was made by the implementing worker.

## Follow-up: hydrated hand collections

The combined existing SMOKE-005/SMOKE-006 browser regression exposed a historical
multiron log failure introduced by reusing `SessionState.update` for payments.
Freshly recorded hands are arrays, while ORM-loaded hands are MikroORM
`Collection` instances. Collections support iteration and `map`, but not
`forEach`. The multiron and yakitori loops now use `for...of`. A loaded nonwinning
hand can also have `winnerId = null`; yakitori ignores both null and undefined
instead of creating a phantom `"null"` player entry.

Three PostgreSQL regressions persist and reload double ron, triple ron and
nagashi with yakitori enabled. They assert that the loaded relation is a real
Collection, verify exact payments/scores/yakitori, exercise both `GetAllRounds`
and `GetLastRoundByHash`, and verify unchanged hand IDs and saved session states
even after flushing the read repository.

Validation uses the assembled worktree `/home/ctizen/projects/pantheon/tmp/rules-batch`
with `COMPOSE_PROJECT_NAME=pantheon-rules-batch`. Container inspection confirms
`/home/storage/projects/pantheon/tmp/rules-batch/Mimir` is mounted at
`/var/www/html/Mimir`.

- Focused final command: `./run exec Mimir env TEST=true pnpm exec vitest run
  src/tests/correctSessionSeating.test.ts src/models/tests/RoundModel.test.ts`:
  **26 tests pass in two files**. Log: `tmp/issue778_collection_focused_final.log`.
- `./run lint Mimir` passes lint, formatting and types; generated logs were
  inspected. Runner log: `tmp/issue778_collection_lint.log`.
- `./run test Mimir` passes the production build/smoke checks and full combined
  coverage suite: **1121 tests pass, 12 skip; 87 files pass, one skips**. Coverage
  is lines 96.49%, statements 92.62%, functions 88.52%, branches 86.84%, meeting
  every required threshold. Log: `tmp/issue778_collection_mimir_full.log` (also
  `tmp/mimir_test.log`). This clean assembled-worktree run supersedes the earlier
  independent #778 aggregate limitation documented above.
- `git diff --check` passes. The follow-up changes only `SessionState.ts`, its
  existing PostgreSQL regression file and these review notes. Browser regression
  reruns and the local commit are owned by the parent.

## Remaining support limits

No schema migration, deployment, network/port change or tile-by-tile engine work
is required. The protocol addition requires deploying the updated Mimir before
using the new Forseti action. The product questions above remain review notes.
