# SMOKE-006: Administrator and players can complete a two-table tournament with random, Swiss, and interval seating

## Purpose

Verify a basic eight-player tournament from creation and registration in Forseti through three generated seatings, simultaneous table starts, hand recording in Tyr, administrator cancellation and approval, and publication in Sigrun. After three approved seatings, six games must be recorded and every player must have three played games in the rating table.

## Scope

Forseti tournament settings, seating generation, timer, round cancellation, and session approval; Tyr assigned tables and round recording; Sigrun recent games, game details, and ratings; Frey authentication and event permissions; Mimir tournament, seating, timer, replay, and scoring APIs.

## Preconditions

- The development stack is running. `FORSETI_URL`, `TYR_URL`, `SIGRUN_URL`, and `FREY_URL` use the configured `.pantheon.local` endpoints. Development databases have consistent event IDs and permission rules.
- Create nine fresh ordinary accounts independently for every attempt and retry, following [SMOKE-004](smoke-004-create-event-with-users.md): one administrator and eight players A–H. Retain unique display names, credentials, and person IDs. No player has an ongoing session in another event.
- Keep the Forseti administrator, each of the two Tyr table recorders, and anonymous Sigrun visitor in separate fresh browser contexts. Pantheon applications share domain cookies, so separate tabs in one context do not isolate these roles.
- The administrator creates this event and therefore has its game-management and player-registration permissions. The Tyr recorders are ordinary registered players, not event administrators.
- Use the UI for event creation, registration, seating generation, timer start, hand entry, cancellation, and approval. API fixture setup is limited to account creation. Do not seed seating, start games, insert/cancel rounds, or approve results through direct API calls.
- This is one independent, long-running testcase. It must not depend on SMOKE-004 or SMOKE-005 having run. See the timeout requirements below before implementation.

## Test data

| Input                  | Value or generation rule                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| Event title            | `TEST SMOKE-006 <new UUID>`; retain the TEST marker to suppress notifications                          |
| Event type             | Tournament                                                                                             |
| Accounts               | Fresh administrator plus players A–H; unique six-letter name suffixes and `<new UUID>@test.com` emails |
| Password               | `SomeStrongPassword123321`                                                                             |
| Timezone               | `Europe/Moscow`                                                                                        |
| Registered players     | Exactly A–H, all included in seating; administrator is not a participant                               |
| Seatings               | 1: Random seating; 2: Swiss seating; 3: Interval seating                                               |
| Interval               | Step 2: select `1-3-5-7`, rather than the default step 1                                               |
| Tables per seating     | Exactly two, each with four distinct registered players                                                |
| Tyr recorder selection | Choose one assigned player from each table after each seating has been generated                       |

### Event configuration

Use **European Mahjong Association rules** and all explicit scoring settings from [SMOKE-005, Event rules](smoke-005-local-session-round-outcomes.md#event-rules), including the public rating table, 30,000 initial points, simple uma +15,000/+5,000/−5,000/−15,000, oka 0, and the separate 20,000 chombo penalty. Change the event type to Tournament and configure its tournament settings as follows:

| Tournament setting             | Value                                                             |
| ------------------------------ | ----------------------------------------------------------------- |
| Session duration in minutes    | 60; plenty of time to record the hands without waiting for expiry |
| Session ending policy          | “Do not interrupt session until it ends”                          |
| Chombo in last round ends game | Off                                                               |
| Team tournament                | Off                                                               |
| Seating is defined in advance  | Off: generate each seating through Forseti                        |
| Wind shuffle mode              | Random wind shuffle                                               |
| Results visibility             | Public; keep results visible throughout all three seatings        |

Retain other EMA defaults. Verify settings after reopening the saved event. Tournament type supplies automatic seating, synchronous start/end, and the timer; do not turn this into a local event or manually create games in Tyr. Complete games naturally through South 4, without waiting for timer expiry or using force-finish.

### Seating and recorder mapping

Before entering any hands in each seating, capture the two generated table numbers, session hashes, and all eight assigned identities in initial East/South/West/North order from the UI. Use these actual assignments rather than assuming A–D always form table 1 or that previous seat order is retained.

For each individual table, define **P1/P2/P3/P4** as its initially assigned East/South/West/North players. Apply SMOKE-005's round sequence with `A→P1`, `B→P2`, `C→P3`, and `D→P4`. These aliases remain fixed identities throughout that game, even when dealer winds rotate. Select players by identity in Tyr; the recorder's position on screen can differ from initial East.

Log in as one player at each table, open that player's assigned current game, and retain the mapping from its Tyr context to the table/session hash. The two recorders must belong to different tables. Re-evaluate this mapping after Swiss and interval seating: reuse a context only if its logged-in player belongs to the intended new table; otherwise create a fresh context and log in as one of its assigned players. Do not keep recording the previous seating's game.

First seating must offer Random seating, while Swiss and Interval seating are disabled. For later seatings, assert the chosen algorithm's confirmation and successful generation of a new complete assignment. All eight players must appear exactly once in each seating and six distinct session hashes must be retained across the case.

Random seating and wind shuffle are nondeterministic. Equal ratings can also be ordered randomly by the seating backend, and Swiss considers earlier tablemates. Do not hardcode player groups, require the same wind on subsequent games, or require every new table to contain entirely different players. For interval step 2, validate alternating rating positions where ratings distinguish players; tied players may occupy either equivalent position. The case verifies use of all three seating modes, not exhaustive algorithm optimality or a prescribed random result.

### Hands and score checkpoints

At **both tables in all three seatings**, enter all thirteen rounds from [SMOKE-005, Round inputs](smoke-005-local-session-round-outcomes.md#round-inputs), with the P1–P4 mapping above. Use its winning-hand inputs, previews, raw-score checkpoints, dealer progression, honba, and riichi pot assertions. This produces 78 retained rounds across six games. Each table must be independently checked; successful recording at one table does not establish the other table's state.

After R13, each table has the following expected results. Tournament approval, rather than the last hand alone, finalizes these results for Sigrun and the event rating.

| Initial seat identity | Final raw score | Raw-score place | Final rating change after approval |
| --------------------- | --------------- | --------------- | ---------------------------------- |
| P1                    | 32,200          | 2               | +7,200                             |
| P2                    | 30,000          | 3               | −5,000                             |
| P3                    | 19,600          | 4               | −45,400                            |
| P4                    | 38,200          | 1               | +23,200                            |

Retain expected results keyed by person ID and session hash, not by visual row order. For every player, accumulate their approved games' rating changes using their actual seat in each seating. The initial event rating is 0, so the final rating must equal that sum; do not assume one player occupies P1, P2, P3, or P4 three times.

### Cancellation checkpoint

Exercise cancellation once on **table 1 of the first, random seating**, after both tables have saved R3. Capture both tables' UI states and log counts before cancellation.

| Table / moment                                   | P1     | P2     | P3     | P4     | Current round / dealer / honba | Riichi sticks | Saved rounds | Separate chombo penalty |
| ------------------------------------------------ | ------ | ------ | ------ | ------ | ------------------------------ | ------------- | ------------ | ----------------------- |
| Both tables before cancellation: after R3        | 31,000 | 33,000 | 27,000 | 28,000 | East 2 / P2 / 2                | 1             | 3            | 0                       |
| Target table 1 after cancelling R3 and reloading | 29,500 | 32,500 | 28,500 | 29,500 | East 2 / P2 / 1                | 0             | 2            | 0                       |
| Other table 2 after reloading                    | 31,000 | 33,000 | 27,000 | 28,000 | East 2 / P2 / 2                | 1             | 3            | 0                       |
| Target table 1 after entering R3 again           | 31,000 | 33,000 | 27,000 | 28,000 | East 2 / P2 / 2                | 1             | 3            | 0                       |

Use Forseti's **Cancel round** action on the row identified by the target session hash and confirm its dialog. It cancels the latest saved hand, not the whole session. Reload Forseti and both Tyr recorders; reopen the assigned current game if needed. The target session hash and player assignment must stay the same. Its log contains only R1 and R2, and R3's riichi deposit and honba increment are undone. Table 2 is unchanged. Re-enter the same R3 once at table 1, then continue R4–R13 at both tables. The cancelled R3 must not create a duplicate retained hand or alter the final results.

## Steps and expected results

| Step | Action                                                                                                                                                                       | Expected result                                                                                                                                                                                                                                                                                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Create fresh account fixtures. Log in to Forseti as the administrator.                                                                                                       | The administrator's owned-events list is initially empty.                                                                                                                                                                                                                                                                                                         |
| 2    | Create the unique TEST tournament using the EMA template, timezone, scoring settings, and tournament settings above. Save, then open its title in a new tab as in SMOKE-004. | Exactly one new event exists. Saved settings match; its displayed type is Tournament. Full navigation loads the new event's permissions. Retain its event ID.                                                                                                                                                                                                     |
| 3    | Register A–H through Manage players. Ensure all are included in seating, then reload.                                                                                        | Exactly eight registrations persist, with eight distinct IDs. Administrator is absent and no player is excluded from seating.                                                                                                                                                                                                                                     |
| 4    | Open Games control before the first seating.                                                                                                                                 | The tournament is Not started; no current tables exist. Random seating is available. Swiss seating and Interval seating are disabled for the first seating.                                                                                                                                                                                                       |
| 5    | Select Random seating and confirm. Wait for Seating ready. Capture the assignments and hashes.                                                                               | Exactly two new tables are ready to start, each with four distinct players. Their union is exactly A–H; timer has not started.                                                                                                                                                                                                                                    |
| 6    | In two isolated Tyr contexts, log in as one assigned player from each table and select this event/current game.                                                              | Each recorder sees their own assigned table, the correct four players, and 30,000 starting points. While waiting for the timer, Add round is unavailable; players cannot start separate games with New game.                                                                                                                                                      |
| 7    | As administrator, press Start timer and confirm once. Refresh both Tyr views if needed.                                                                                      | One tournament start transitions both tables to Session in progress. Both display an active timer from the same tournament start, East 1, honba 0, pot 0, and available hand-entry controls. Timer values are positive and at most 60 minutes; allow normal polling/clock differences rather than requiring identical rendered seconds.                           |
| 8    | Record R1–R3 through each Tyr recorder, checking previews, table checkpoints, and three saved log entries independently.                                                     | Both tables reach their R3 checkpoint; each remains an active, distinct game. Starting or recording one table does not create an extra table.                                                                                                                                                                                                                     |
| 9    | In Forseti, cancel the last round only on table 1, identified by its retained session hash; confirm. Reload Forseti and both Tyr views.                                      | Target table restores the R2 checkpoint and a two-entry log; table 2 retains its R3 checkpoint and three-entry log. Both retain their original assignments and hashes.                                                                                                                                                                                            |
| 10   | Enter R3 again on table 1. Continue R4–R12 at both tables with the specified hand inputs.                                                                                    | Table 1 has exactly three entries after replacement R3. Both then reach South 4 with exactly twelve saved rounds and the expected R12 scores, honba, pot, and chombo penalty.                                                                                                                                                                                     |
| 11   | Submit R13 at table 1 first. Inspect Games control and anonymous Sigrun Last games before completing table 2.                                                                | Table 1 is Session finished, but not confirmed; table 2 is still in progress. Bulk Approve sessions is not yet available. Neither game is published in Sigrun; event standings have no approved games.                                                                                                                                                            |
| 12   | Submit R13 at table 2. Inspect Games control.                                                                                                                                | Both tables are Session finished, but not confirmed. Tournament stage is Ready to approve and Approve sessions is available. No more hands can be entered in either completed game. Both retain thirteen rounds and final raw scores.                                                                                                                             |
| 13   | Check Sigrun Last games before approval. Return to Forseti, press Approve sessions, and confirm once. Reload Games control.                                                  | Before approval there are still no published games. Approval finalizes both games together; both become Session finished and the tournament returns to Not started for its next seating. No extra sessions or duplicate approval effects occur.                                                                                                                   |
| 14   | Reload Sigrun Last games and visit the rating table for this event.                                                                                                          | Exactly two distinct games appear with the retained hashes, correct players, thirteen rounds each, and the final raw scores/rating changes above. Exactly eight players are listed; each has one played game. Ratings match each player's first approved result.                                                                                                  |
| 15   | In Forseti, select Swiss seating and confirm. Capture the new assignments and two new hashes. Choose/login as one recorder per new table.                                    | Swiss is available after the first approval. A new seating is ready with all eight players assigned exactly once to two tables. Both new hashes differ from the first seating; each Tyr recorder opens their newly assigned game. Hands remain unavailable before the timer starts.                                                                               |
| 16   | Press Start timer once for the Swiss seating. Record R1–R13 at both tables, using their new P1–P4 mappings and checking both games' checkpoints.                             | Both new games start from the same tournament timer action and finish naturally with thirteen rounds each. Both become unconfirmed and Games control becomes Ready to approve. No local New game or force-finish shortcut is used.                                                                                                                                |
| 17   | Before approving Swiss results, reload Sigrun Last games and ratings. Then approve both sessions through Forseti and reload Sigrun.                                          | Before approval, only the two random-seating games are published and each player still has one played game. After approval, exactly four distinct games appear and every player has two played games; ratings equal the sum of their two approved results.                                                                                                        |
| 18   | In Forseti, choose Interval seating, select interval `1-3-5-7` (step 2), and confirm. Capture its assignments and two new hashes. Select/login as one recorder per table.    | Interval is available after the second approval. The selected step is used; all eight players are assigned exactly once to two new tables, with no reuse of previous session hashes. Both Tyr recorders see their current assigned games waiting for the timer.                                                                                                   |
| 19   | Press Start timer once for interval seating. Record R1–R13 independently at both tables, using the current P1–P4 mappings.                                                   | Both games become playable from the same start action and reach their expected final checkpoints with thirteen rounds each. Both are unconfirmed; Ready to approve is shown.                                                                                                                                                                                      |
| 20   | Before approving interval results, reload Sigrun Last games and ratings. Then approve both sessions through Forseti.                                                         | Before approval, Sigrun still has four games and two played games per player. Approval finalizes exactly the two interval games, preserving all earlier results.                                                                                                                                                                                                  |
| 21   | Reload Sigrun Last games and open each game's details through its link. Compare by session hash and person ID.                                                               | Exactly six distinct games exist: two per seating. Their hash set matches the six captured Forseti assignments. Every game contains its assigned four players, thirteen retained rounds, Ron 8 / Tsumo 1 / Draw 2 / Chombo 1 / Nagashi 1, and the expected raw scores and rating changes. The cancelled hand creates neither an extra game nor an extra round.    |
| 22   | Open the event's Sigrun rating table with all-player/default tournament filters. Inspect every player row and reload.                                                        | Exactly A–H are listed, each with Games played = 3, persisting after reload. Each rating equals the sum of that person's three approved rating changes, with deferred chombo counted only in games where they occupied P3. Sum of played-game counts is 24 (six games × four players); sum of ratings is −120,000 (six games × −20,000). Administrator is absent. |

Compare numeric values after normalizing formatting, matching identities rather than row positions. Sigrun's wind badges represent initial seating, not final place. Scope every view and assertion to this event; never use the globally latest game to identify a table. Check both games' results after every approval, not only the final six-game count.

## Timeout and implementation requirements

- When implemented, keep this journey in one `test()` with ID `SMOKE-006` and meaningful `test.step()` stages for setup, each seating, timer start, cancellation, each table's recording, approval, and publication checks.
- Set an explicit **15-minute per-attempt test timeout** (`test.setTimeout(15 * 60_000)`) before fixture creation. This covers six complete games, administrative transitions, reloads, and slower development-container runs. CI retries get independent fixtures and their own full timeout.
- Use a **30-second action timeout** and **30-second assertion/transition timeout** for seating generation, timer propagation, approval, and refreshed cross-service views. Apply action defaults to newly created browser contexts as well as the fixture page. Keep normal field/score assertions bounded; the large overall budget must not allow one missing control to hang for fifteen minutes.
- Wait for UI states or completed UI-triggered requests using awaited Playwright assertions, not fixed sleeps. The 60-minute tournament timer is a gameplay setting, not an instruction to wait that long. Do not shorten it and rely on timer expiry to finish games.
- “Simultaneous start” means one Start timer action starts both assigned sessions together. Hand submissions may be interleaved or entered sequentially through the two independent recorder contexts; they need not race the same browser action.
- Follow SMOKE-005's UI techniques for asynchronous player data, identity-based player selection, hand carousels, game-log checks, and refreshing the current game. Capture failure screenshots for both recorders and the administrator, preserving Fenrir's existing failure-reporting helper.

## Source fixtures and adaptations

- [SMOKE-005](smoke-005-local-session-round-outcomes.md) supplies the account approach, thirteen-round sequence, checkpoints, final scoring, and Sigrun comparisons. Its [implementation](../tests/local-session.spec.ts) is reusable reference coverage, not a prerequisite test to run.
- [Forseti TournamentControls](../../Forseti/app/pages/GamesControl/TournamentControls.tsx) defines first-seating restrictions, the interval selector, Start timer, Ready to approve, and Approve sessions. [TournamentSettings](../../Forseti/app/pages/OwnedEventsEdit/TournamentSettings.tsx) provides duration, ending policy, and generated-seating settings.
- [Forseti GamesList](../../Forseti/app/pages/GamesControl/GamesList.tsx) provides per-session Cancel round and visible session status. [Mimir SessionModel](../../Mimir/src/models/SessionModel.ts) separates prefinished tournament games from finalized games; [EventModel](../../Mimir/src/models/EventModel.ts) lists finished games for publication.
- [Mimir SeatingModel](../../Mimir/src/models/SeatingModel.ts) supplies random/Swiss/interval generation and rating ordering with random tie breaks. This case follows actual UI assignments, preserving validity when random seating or tied standings change.
- [Sigrun RatingTable](../../Sigrun/app/pages/RatingTable.tsx) displays each player's rating and Games played count; [GameListing](../../Sigrun/app/components/GameListing.tsx) supplies per-game results and retained-round logs.

## Cleanup and isolation

Retain this attempt's nine accounts, eight registrations, TEST tournament, six finalized games, and their round records for inspection. Failed attempts may leave an active or unconfirmed seating; retries must create fresh accounts and a new event rather than resume it. Never cancel or approve a table outside this attempt's event and captured session hashes.

Close all extra browser contexts after the attempt. Do not reuse these players in another active testcase. Any later cleanup must be limited to this attempt's data and must not delete unrelated events, registrations, or games.

## Implementation and coverage

- Status: Implemented.
- Implementation: [tests/tournament.spec.ts](../tests/tournament.spec.ts), `SMOKE-006: Administrator and players can complete a two-table tournament with random, Swiss, and interval seating`. Shares the round sequence and UI helpers with SMOKE-005 through [tests/utils/game-flow.ts](../tests/utils/game-flow.ts).
- Coverage limits: Basic individual tournament with eight players, two simultaneous tables, random/Swiss/interval seating, timer gating, one latest-round cancellation, synchronous approval, six published games, and three approved games per player. Timer expiry policies, seating optimality, predefined/team tournaments, substitutions, manual administrator penalties, cancelling an entire session, and definalizing approved games are separate coverage.
