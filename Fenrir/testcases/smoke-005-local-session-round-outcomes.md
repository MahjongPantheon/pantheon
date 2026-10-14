# SMOKE-005: Registered player can finish a local session and view matching results in Tyr and Sigrun

## Purpose

Verify the journey from creating a local event and registering its players in Forseti to starting a session in Tyr and recording thirteen rounds, including seven varied initial outcomes and six more hands to complete South 4. Verify payments, dealer continuation, honba, riichi carryover, persistence, automatic completion, and matching final results in Tyr and Sigrun through the UI.

## Scope

Forseti event configuration and player registration, Tyr game creation and round recording, Sigrun recent games and game details, Frey authentication and permissions, and Mimir session and scoring APIs.

## Preconditions

- The development stack is running; `FORSETI_URL`, `TYR_URL`, `SIGRUN_URL`, and `FREY_URL` use the configured `.pantheon.local` endpoints.
- Create nine fresh ordinary accounts through Frey before the UI flow, following [SMOKE-004](smoke-004-create-event-with-users.md): one event administrator and eight players labelled A–H. Retain their unique names, emails, passwords, and actual person IDs. These are fixtures for this case, not accounts or an event left by running SMOKE-004.
- Use a fresh browser context for the Forseti administrator and a separate fresh context for Tyr player A. Both initially have no login state. Keep their authentication separate because the applications share cookies across the Pantheon domain. Use a third fresh, anonymous context for the public Sigrun checks.
- No player has an ongoing session. The development databases must be consistent: newly allocated Mimir event IDs must not collide with stale Frey permission rules.
- Event creation, registration, game creation, and round recording in the steps below must use the UI. API setup is limited to creating the account fixtures; do not pre-create the event, register its players, start the session, or insert rounds through APIs.

## Test data

### Accounts and seating

| Input                               | Value or generation rule                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| Accounts                            | One administrator plus eight players A–H; fresh for each attempt and retry                  |
| Email                               | `<new UUID>@test.com` for each account                                                      |
| Display name                        | `Test account` plus a unique six-letter suffix; use the A–H labels only in this description |
| Password                            | `SomeStrongPassword123321`                                                                  |
| Event title                         | `TEST SMOKE-005 <new UUID>`; the TEST marker suppresses notifications                       |
| Event type                          | Local rating                                                                                |
| Timezone                            | `Europe/Moscow`                                                                             |
| Tyr login                           | Player A, who is registered in the event and is not its administrator                       |
| Initial East / South / West / North | A / B / C / D respectively                                                                  |
| Other registered players            | E–H remain registered but do not join this session                                          |

Select all four seats explicitly in Tyr, including A if the UI preselects that account. Do not shuffle players. Throughout the round table, A–D mean these same people, even when their current seat winds change. The three other session players do not need to log in separately.

### Event rules

Use **European Mahjong Association rules** as the template, rather than whichever ruleset appears first. Configure these values in Forseti before saving the event, and verify them again after reopening its settings:

| Setting                                               | Value                                                                |
| ----------------------------------------------------- | -------------------------------------------------------------------- |
| Show rating table for everyone                        | On: the event and its results are publicly viewable                  |
| Uma bonus type                                        | Simple; 1st +15,000, 2nd +5,000, 3rd −5,000, 4th −15,000             |
| Equalize uma                                          | On; final raw scores in this case have no ties                       |
| Oka bonus                                             | 0                                                                    |
| Initial points                                        | 30,000                                                               |
| Tonpuusen                                             | Off: East and South rounds                                           |
| Disable renchans                                      | Off: dealer wins and dealer tenpai retain the dealer                 |
| Allow bankruptcy / Agariyame / Play additional rounds | Off                                                                  |
| Honba Value                                           | 300                                                                  |
| Atamahane                                             | Off: allow multiple ron winners                                      |
| Allow abortive draws                                  | On                                                                   |
| Nagashi mangan                                        | On                                                                   |
| Kuitan                                                | On: open Tanyao is worth one han                                     |
| Pay for honba by atamahane                            | Off: each double-ron winner receives honba payment                   |
| Collect riichi bets by atamahane                      | Off; the existing carried pot still goes to the closest winner       |
| Riichi goes to winner                                 | Off; no new riichi declarations occur on winning rounds in this case |
| Pay chombo as reverse mangan                          | Off                                                                  |
| Amount of chombo penalty                              | 20,000, recorded separately and applied at session completion        |
| Yakitori                                              | Off                                                                  |

Retain the template's other values. Do not alter the rules after starting the session.

### Round inputs

For every winning hand, select **Open hand**, **Tanyao**, **1 han**, and **30 fu**, with all dora, uradora, kandora, and kanuradora counts zero and no pao player. Verify the UI's resulting han/fu rather than treating han as an independent input if the UI calculates it from selected yaku. Using open Tanyao adapts the unit fixtures to a valid UI entry without needing an extra concealed-tsumo yaku.

Use Tyr's current round index and honba for each entry; the unit fixtures' fixed `roundIndex: 2` and `honba: 1` are not values to enter repeatedly into this session. Leave riichi unselected except where specified below.

| Entry | Starting round / honba | Outcome and UI inputs                                                                                                                       | Expected payments and state transition                                                                                                                                                                                                                |
| ----- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1    | East 1 / 0; dealer A   | Ron: B wins from C; one winning hand as above; no riichi                                                                                    | C pays B 1,000. Advance to East 2, dealer B, honba 0, no riichi pot.                                                                                                                                                                                  |
| R2    | East 2 / 0; dealer B   | Tsumo: B wins; winning hand as above; no riichi                                                                                             | A, C, and D each pay B 500. B remains dealer at East 2; honba becomes 1.                                                                                                                                                                              |
| R3    | East 2 / 1; dealer B   | Exhaustive draw: A and B tenpai; C and D noten; B declares riichi                                                                           | C and D each pay 1,500; A and B each receive 1,500. B also pays a 1,000 riichi deposit. Dealer B continues; honba becomes 2; one riichi stick remains on the table.                                                                                   |
| R4    | East 2 / 2; dealer B   | Abortive draw: D declares riichi; no winner, loser, or tenpai selection                                                                     | No hand-payment transfer. D pays a 1,000 riichi deposit. Dealer B continues; honba becomes 3; the pot contains two sticks.                                                                                                                            |
| R5    | East 2 / 3; dealer B   | Chombo: C is the offending player; no new riichi                                                                                            | Raw playing scores, dealer, honba, and the two carried riichi sticks remain unchanged. C has a separate −20,000 chombo penalty; do not subtract it from the raw playing score yet.                                                                    |
| R6    | East 2 / 3; dealer B   | Nagashi mangan: D is the sole nagashi player; B and D tenpai; A and C noten; no new riichi                                                  | B pays D 4,000; A and C each pay D 2,000. No additional noten or honba transfer, and the carried riichi pot is not awarded. B is tenpai and remains dealer; honba becomes 4; two riichi sticks remain.                                                |
| R7    | East 2 / 4; dealer B   | Choose Ron and select two winners, A and D, with C as the single discarder. Enter the specified winning hand for each winner; no new riichi | C pays A 1,000 plus 1,200 honba and pays D 1,000 plus 1,200 honba. D is the closest winner after C in seat order and receives the carried 2,000 riichi pot. Advance to East 3, dealer C, honba 0, empty riichi pot. One round contains both ron wins. |
| R8    | East 3 / 0; dealer C   | Ron: A wins from C; winning hand as above; no riichi                                                                                        | C pays A 1,000. Advance to East 4, dealer D, honba 0, empty riichi pot.                                                                                                                                                                               |
| R9    | East 4 / 0; dealer D   | Ron: B wins from D; winning hand as above; no riichi                                                                                        | D pays B 1,000. Advance to South 1, dealer A, honba 0, empty riichi pot.                                                                                                                                                                              |
| R10   | South 1 / 0; dealer A  | Ron: C wins from A; winning hand as above; no riichi                                                                                        | A pays C 1,000. Advance to South 2, dealer B, honba 0, empty riichi pot.                                                                                                                                                                              |
| R11   | South 2 / 0; dealer B  | Ron: D wins from B; winning hand as above; no riichi                                                                                        | B pays D 1,000. Advance to South 3, dealer C, honba 0, empty riichi pot.                                                                                                                                                                              |
| R12   | South 3 / 0; dealer C  | Ron: A wins from C; winning hand as above; no riichi                                                                                        | C pays A 1,000. Advance to South 4, dealer D, honba 0, empty riichi pot.                                                                                                                                                                              |
| R13   | South 4 / 0; dealer D  | Ron: B wins from D; winning hand as above; no riichi                                                                                        | D pays B 1,000. The final dealer does not win, so the session finishes naturally and Tyr shows its results screen.                                                                                                                                    |

R7 uses Tyr's Ron flow with multiple selected winners; it does not require a separate “Multiron” menu item.

### Score checkpoints

Assert the raw playing scores in Tyr after each saved entry. Chombo is a separate penalty indicator, not part of these scores while the session remains in progress.

| After entry   | A      | B      | C      | D      | Riichi sticks on table | Current round / dealer / honba | C's separate chombo penalty      |
| ------------- | ------ | ------ | ------ | ------ | ---------------------- | ------------------------------ | -------------------------------- |
| Session start | 30,000 | 30,000 | 30,000 | 30,000 | 0                      | East 1 / A / 0                 | 0                                |
| R1            | 30,000 | 31,000 | 29,000 | 30,000 | 0                      | East 2 / B / 0                 | 0                                |
| R2            | 29,500 | 32,500 | 28,500 | 29,500 | 0                      | East 2 / B / 1                 | 0                                |
| R3            | 31,000 | 33,000 | 27,000 | 28,000 | 1                      | East 2 / B / 2                 | 0                                |
| R4            | 31,000 | 33,000 | 27,000 | 27,000 | 2                      | East 2 / B / 3                 | 0                                |
| R5            | 31,000 | 33,000 | 27,000 | 27,000 | 2                      | East 2 / B / 3                 | −20,000                          |
| R6            | 29,000 | 29,000 | 25,000 | 35,000 | 2                      | East 2 / B / 4                 | −20,000                          |
| R7            | 31,200 | 29,000 | 20,600 | 39,200 | 0                      | East 3 / C / 0                 | −20,000                          |
| R8            | 32,200 | 29,000 | 19,600 | 39,200 | 0                      | East 4 / D / 0                 | −20,000                          |
| R9            | 32,200 | 30,000 | 19,600 | 38,200 | 0                      | South 1 / A / 0                | −20,000                          |
| R10           | 31,200 | 30,000 | 20,600 | 38,200 | 0                      | South 2 / B / 0                | −20,000                          |
| R11           | 31,200 | 29,000 | 20,600 | 39,200 | 0                      | South 3 / C / 0                | −20,000                          |
| R12           | 32,200 | 29,000 | 19,600 | 39,200 | 0                      | South 4 / D / 0                | −20,000                          |
| R13           | 32,200 | 30,000 | 19,600 | 38,200 | 0                      | Finished; results screen       | −20,000 applied to rating change |

At every checkpoint, the four raw playing scores plus `1,000 × riichi sticks on table` total 120,000. Read absolute points, not the optional score-difference display. Tyr may display East 1–4 as `東1`–`東4` and South 1–4 as `南1`–`南4`. R13 is checked on the results screen rather than expecting another active table.

### Final results in Tyr and Sigrun

| Player | Place by final raw score | Final raw score | Uma     | Chombo adjustment | Final rating change |
| ------ | ------------------------ | --------------- | ------- | ----------------- | ------------------- |
| A      | 2                        | 32,200          | +5,000  | 0                 | +7,200              |
| B      | 3                        | 30,000          | −5,000  | 0                 | −5,000              |
| C      | 4                        | 19,600          | −15,000 | −20,000           | −45,400             |
| D      | 1                        | 38,200          | +15,000 | 0                 | +23,200             |

Final rating change is `raw score − 30,000 + uma + chombo adjustment`; oka and chips contribute zero under this template. The raw scores total 120,000, while rating changes total −20,000 because of C's chombo. The penalty is applied exactly once to C's rating change, not to the displayed raw score or raw-score placement.

Capture Tyr's four displayed results keyed by player identity and compare the same fields against Sigrun's latest game for this event. Both must match the explicit expected values above as well as each other. Normalize thousands separators, whitespace, minus signs, and an optional leading plus sign before comparing numeric values. These UIs display rating changes in points (for example, 7,200), not divided by 1,000. Do not assume rows are ordered by final placement: Sigrun's wind badges identify original seating, not finishing rank.

## Steps and expected results

| Step | Action                                                                                                                                                                                                                 | Expected result                                                                                                                                                                                                                                                                 |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | In the administrator's context, open Forseti and log in with the fresh administrator's credentials.                                                                                                                    | Login fields appear initially; after login, the owned-events page has no events.                                                                                                                                                                                                |
| 2    | Choose “Create new event”; enter the unique TEST title, Local rating type, EMA template, and timezone. Set the explicit rules above through the appropriate settings tabs. Return to the basic tab and save.           | The entered settings are accepted; the owned-events page contains exactly the new event.                                                                                                                                                                                        |
| 3    | Open the event title link in a new tab, as in SMOKE-004. Verify the saved title, type, timezone, and scoring settings. Choose “Manage players”.                                                                        | Settings match the specified rules; the player-management list is initially empty. This retains SMOKE-004's full-navigation approach to the known Forseti permission-loading race.                                                                                              |
| 4    | Search for each of A–H by its unique display name and select the matching search result. Reload player management.                                                                                                     | All eight fixture players, and no others, are registered. The administrator is not automatically one of the participants. Registrations persist after reload.                                                                                                                   |
| 5    | In the separate player context, open Tyr. Enter A's email and password and log in.                                                                                                                                     | A is authenticated. The newly created event is available in the event selector by its unique title. The administrator's login is not reused.                                                                                                                                    |
| 6    | Select the new event in Tyr. Open “New game”. Fill East/South/West/North with A/B/C/D through the player-selection UI, searching by unique names where necessary.                                                      | The home screen identifies the correct event. The new-game screen contains exactly A–D in the specified seat order, with four distinct people; “Start game” is enabled.                                                                                                         |
| 7    | Press “Start game”.                                                                                                                                                                                                    | An active session opens with A–D, dealer A, East 1, honba 0, no riichi sticks, and 30,000 raw points each. The session belongs to the selected local event.                                                                                                                     |
| 8    | Enter R1–R7 in the specified order. For each entry, choose “Add round” and its outcome, set player statuses, and select hand details for every winner where applicable. Move to the payment preview before submitting. | Each required outcome is available under the configured rules. The preview names the correct participants and shows the expected transfers. In R7, both winners have their own hand details. Merely viewing the preview does not change saved scores or the saved round log.    |
| 9    | Submit each preview exactly once, then inspect the active table and game log before beginning the next entry (R1–R7).                                                                                                  | Each save adds exactly one completed round, with the specified outcome, participants, riichi declarations, and winning-hand details where applicable. Scores, dealer, honba, pot, and chombo indicator match that entry's checkpoint. R7 appears as one round with two winners. |
| 10   | After R7, refresh Tyr. Reopen the current game through the UI if the refresh returns to the event/home screen. Open its game log.                                                                                      | The same session is still in progress with exactly A–D. All seven entries persist in order; raw scores are A 31,200, B 29,000, C 20,600, D 39,200; dealer C, East 3, honba 0, no riichi sticks, and C's separate −20,000 penalty persist.                                       |
| 11   | Continue the same session with R8–R12 through “Add round”, payment preview, and one submission per entry. Inspect the table and log after each save.                                                                   | Each hand transfers 1,000 as specified and advances the dealer without renchan. All twelve entries persist in order, ending at South 4, dealer D, honba 0, empty pot, with R12's scores.                                                                                        |
| 12   | Enter R13 and check its preview, then submit exactly once. Do not use a finish/force-finish action.                                                                                                                    | The final transfer is D to B for 1,000. Tyr automatically leaves the active game and shows its populated results screen (`tyr-game-result`) for exactly A–D; there is no next active hand.                                                                                      |
| 13   | Read each player's raw score and rating change on Tyr's results screen and retain these values keyed by the fixture's person ID.                                                                                       | All four results match the final-results table. C's raw score is 19,600 and rating change is −45,400, proving the deferred chombo adjustment was applied once.                                                                                                                  |
| 14   | Confirm the results using the check button; do not choose repeat game.                                                                                                                                                 | Tyr returns to the event/home screen. The completed session is no longer available as an ongoing game; no second session is created.                                                                                                                                            |
| 15   | In the fresh Sigrun context, open this event's public page using its event ID retained from Forseti, then select “Recent games” in the event menu (the page heading is “Last games”).                                  | The heading names the unique TEST event. The latest-games list loads and contains exactly one finished game for this fresh event, with A–D and no E–H or administrator in its results. Scope the lookup to this event rather than the latest game across the whole system.      |
| 16   | Read the latest game's four result rows, matching each player by identity. Compare its raw scores and rating changes with the captured Tyr results and the final-results table.                                        | Each player has exactly the same numeric raw score and rating change in both UIs. The displayed game is finished; its outcome summary is Ron 8, Tsumo 1, Draw 2, Chombo 1, Nagashi 1 (double ron counts as one round and abortive draw is included in Draw).                    |
| 17   | Open that game's details through its share/details link, retain the session hash from the link, then reload the details page.                                                                                          | The same event and session hash remain selected. The game has exactly thirteen saved rounds in the specified order, including both R7 winners and the final South 4 ron. Its four results still match Tyr and the expected final table after reload.                            |

Wait for the populated results and Sigrun game rows using awaited UI assertions, without fixed sleeps or direct API reads to replace the UI checks. The thirteenth submission must finish the game naturally; never compensate for missing results by force-finishing or creating another game.

## Source fixtures and adaptations

- [Round fixtures](../../Mimir/src/tests/roundFixtures.ts) provide `ron`, `tsumo`, `draw`, `abort`, `chombo`, `nagashi`, and `multiron` inputs. [RoundModel tests](../../Mimir/src/models/tests/RoundModel.test.ts) exercise persistence for all seven outcomes and payment calculation for the single-outcome cases.
- [SessionState tests](../../Mimir/src/helpers/SessionState.test.ts) cover progression, abortive draws with carried riichi, and chombo without immediate payments. [PointsCalc tests](../../Mimir/src/helpers/PointsCalc.test.ts) cover payment calculations and awarding the carried double-ron pot to the closest winner.
- The checkpoint expectations follow [SessionState](../../Mimir/src/helpers/SessionState.ts) and [PointsCalc](../../Mimir/src/helpers/PointsCalc.ts), particularly nagashi carrying the riichi pot and chombo being recorded separately under EMA-style penalties.
- Final placement, uma, and deferred chombo expectations follow [SessionResultsModel](../../Mimir/src/models/SessionResultsModel.ts) and the [EMA ruleset](../../Mimir/src/entities/Ruleset.entity.ts). [Sigrun GameListing](../../Sigrun/app/components/GameListing.tsx) supplies the outcome-summary grouping used above.
- Adapt fixture IDs to this attempt's A–D identities, use the running session's round/honba values, explicitly enable abort and nagashi, and use open Tanyao for the one-han/30-fu winning hands. The fixtures are independent examples; this case combines them into one continuous session and therefore has its own score checkpoints.

## Cleanup and isolation

Create accounts, event, registrations, and session independently for each attempt, including retries. Preserve the Forseti administrator context separately from the Tyr player context. The four session participants must not be used by another case's active session.

This case retains its nine test accounts, eight event registrations, TEST event, and finished session in the development environment for inspection. Any future cleanup must be limited to that attempt's data; never remove unrelated events or registrations. A rerun must create new fixtures rather than resume this session.

## Implementation and coverage

- Status: Implemented.
- Implementation: [tests/local-session.spec.ts](../tests/local-session.spec.ts), `SMOKE-005: Registered player can finish a local session and view matching results in Tyr and Sigrun`. Uses independent account fixtures and UI actions without depending on SMOKE-004 having run.
- Coverage limits: Covers a local session with all seven selected outcomes, persisted in-progress state, natural completion, final uma/chombo scoring, and matching persisted results in Tyr and Sigrun. Does not cover aggregate event standings, pao, yakuman, triple ron, player replacement, penalties assigned by administrators, or round cancellation.
