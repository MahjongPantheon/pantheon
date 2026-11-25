# Issue #826: abortive draws except triple ron

Issue: https://github.com/MahjongPantheon/pantheon/issues/826

## Behavior and acceptance

- Forseti offers Disabled, All, and All except triple ron. Selection persists in
  event configuration, survives reload/copy, and follows preset/reset changes.
- Sigrun displays the same mode in the read-only public rules page, including SSR.
- Tyr permits three ron winners in the new mode and with abortives disabled.
  All retains the two-winner cap; atamahane retains a single winner; sanma permits
  no more than two real winners. Selected winners remain removable.
- Three-winner hand entry advances one tab per touch button. The linked hand and
  title carousels previously advanced twice, skipping the middle of three tabs;
  one synchronized advance now handles both directions.
- PreviewRound and AddRound enforce the same policy for new manual submissions.
  Existing multiron settlement handles all winners, dealer continuation, honba and
  riichi. Generic replay/import validation and stored round accounting are unchanged.
- Existing events and presets retain their behavior: absent/false
  `allowTripleRonWithAbortives` means All when `withAbortives` is true. No database
  migration is needed because rules are stored as JSON and the protocol field is
  an ordinary boolean. The new flag is ignored when abortives are disabled.
- Protocol source adds field 47; generated clients come from root `./run proto-gen`.
- Fenrir SETTINGS-003 covers saved modes, public display, triple winner selection,
  preview and saved scores. Existing smoke helpers now select All explicitly and advance hands with the
  precise Next tab button, checking both the active title and hand.

## Assumptions and review questions

The issue asks for a third option without more product detail. The implementation
uses the requested label All except triple ron. Existing events/presets are not
opted into the new mode. Atamahane takes precedence over multiple ron regardless
of the abortive-draw setting. Other abortive draws continue to use the existing
Abortive draw outcome.

Pantheon records outcomes, not tile-by-tile declarations. A generic abortive draw
record does not identify its physical cause, so the server cannot distinguish
triple-ron aborts from other aborts. This change governs selectable/submitted ron
winners; it does not infer abort causes or implement the planned tile engine.

No user clarification was requested because the batch instructions authorize
reasonable assumptions while the user is unavailable.

## Validation

Validation uses isolated Compose project `pantheon-rules-check-826`, whose source
mounts were independently inspected for Mimir, Forseti, Tyr, Sigrun and Fenrir:
all point to `/home/storage/projects/pantheon/tmp/rules-826/<Service>`. Full suites
run serially because concurrent scans can trigger API test timeouts.

Commands below use `COMPOSE_PROJECT_NAME=pantheon-rules-check-826` from the root.

| Check | Actual result | Logs |
| --- | --- | --- |
| `./run proto-gen` (parent) | Passed; Mimir watcher restarted to reload descriptors | Parent setup record |
| `./run task Common lint` (parent) | 71 pre-existing diagnostics, normalized output identical to base; no added diagnostics | Parent baseline comparison |
| `./run lint Mimir Forseti Tyr Sigrun Fenrir` plus focused recheck | All affected lint, format and type checks pass | `tmp/lint_826_summary.log`, `tmp/lint_826_recheck.log`, `tmp/<service>_{oxlint,oxfmt,typecheck}.log` |
| `./run test Forseti Tyr Sigrun`, then `./run test Tyr` after the carousel fix | Forseti 354, Tyr 475, Sigrun 284 tests passed; all coverage thresholds pass | `tmp/{forseti,tyr,sigrun}_test.log` |
| `./run lint Forseti` and `./run test Forseti` after extracting outcome settings | Passed; 354 tests across 38 files; coverage 93.47% statements, 85.07% branches, 90.70% functions, 94.39% lines | `tmp/lint_826_forseti_refactor.log`, `tmp/forseti_test.log` |
| `npx react-doctor@latest --verbose --scope changed` from `Forseti` (supplemental host scan) | Exit 0; five files scanned; “No issues found”; empty diagnostics; displayed score 81/100 | `tmp/react_doctor_826_forseti_final.log` |
| `./run test Mimir` initial run | Production API/cron checks passed; 1,056 tests passed, 12 skipped; eight new tests had incorrect preview/error expectations, subsequently corrected | `tmp/mimir_test.log` |
| `./run exec Mimir env TEST=true pnpm exec vitest run src/tests/abortiveDrawPolicyApi.test.ts src/helpers/roundValidation.test.ts` | Final focused API/helper tests: 35 passed | `tmp/mimir_826_focused.log` |
| `./run e2e dev --grep SETTINGS-003 --retries=0`, then prepared `./run task Fenrir run --grep SETTINGS-003 --retries=0` after fixture/carousel fixes | Final Chromium run: 1 passed, no retries (27.3 seconds) | `tmp/e2e_826_settings_final.log` |
| `./run i18n extract Forseti Sigrun` and `./run i18n compile Forseti Sigrun` | Exit 0; new labels generated, Russian supplied; no existing translation entries changed or removed | `tmp/i18n_826_{extract,compile}.log` |

The extractor reports an existing nonliteral `_t` argument in
`Forseti/app/helpers/lastRound.test.ts:290`. Generated occurrence/date churn was
removed. Forseti retains all 585 existing entries per locale and adds three;
Sigrun retains all 431 entries per locale and adds four.

The new Doctor giant-component warning was removed by extracting the related
Atamahane, abortive-draw and Nagashi controls into `RoundOutcomeSettings`. Both
form subscriptions moved with the controls; labels, test IDs and rendered layout
are unchanged. Root Forseti extraction/compilation was rerun after the move,
updating references for ten messages. All six compiled catalogs are byte-for-byte
identical to their values before this refactor. The final changed-scope Doctor
report has zero diagnostics, although its displayed score remains 81/100.

Final aggregate Mimir coverage, existing smoke regressions and production SSR
verification remain for the parent's final batch
validation. The required full Tyr rerun after the carousel fix passes all 475
tests; the synchronous three-tab regression and the real browser flow both prove
that each next/previous action advances exactly one winner hand.

Existing extractor diagnostics and Common lint baseline are the only known
validation caveats. No product requirement is blocked. The startup-only migration
snapshot churn was restored and is excluded from this issue.
