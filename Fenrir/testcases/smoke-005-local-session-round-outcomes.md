# SMOKE-005: Registered player can finish a local session and view matching results in Tyr and Sigrun

## Purpose

Verify the journey from creating a local event and registering its players in Forseti to starting a session in Tyr and recording 46 rounds, including seven initial outcome checks, the complete yaku catalogue, and four advancing hands to complete South 4. Verify payments, dealer continuation, honba, riichi carryover, persistence, automatic completion, and matching final results in Tyr and Sigrun through the UI.

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

| Setting                                               | Value                                                          |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| Show rating table for everyone                        | On: the event and its results are publicly viewable            |
| Uma bonus type                                        | Simple; 1st +15,000, 2nd +5,000, 3rd −5,000, 4th −15,000       |
| Equalize uma                                          | On; final raw scores in this case have no ties                 |
| Oka bonus                                             | 0                                                              |
| Initial points                                        | 30,000                                                         |
| Tonpuusen                                             | Off: East and South rounds                                     |
| Disable renchans                                      | Off: dealer wins and dealer tenpai retain the dealer           |
| Allow bankruptcy / Agariyame / Play additional rounds | Off                                                            |
| Honba Value                                           | 300                                                            |
| Atamahane                                             | Off: allow multiple ron winners                                |
| Allow abortive draws                                  | On                                                             |
| Nagashi mangan                                        | On                                                             |
| Kuitan                                                | On: open Tanyao is worth one han                               |
| Pay for honba by atamahane                            | Off: each double-ron winner receives honba payment             |
| Collect riichi bets by atamahane                      | Off; the existing carried pot still goes to the closest winner |
| Riichi goes to winner                                 | Off; a winning declarer recovers their own deposit             |
| Pay chombo as reverse mangan                          | Off                                                            |
| Amount of chombo penalty                              | 20,000, recorded separately and applied at session completion  |
| Yakitori                                              | Off                                                            |

Retain the template's other values. Do not alter the rules after starting the session.

### Complete yaku coverage rules

Enable all allowed yaku, multiple yakuman, and double yakuman variants 45/46/47; leave Daisuushii single. Enable pao only for Daisangen/Daisuushii. Retain other EMA defaults, including counted yakuman off. Verify these settings after reopening the event. See the [hand catalogue](smoke-hand-catalogue.md) for the explicit compatible combinations, fu and dora values.

### Round inputs and score checkpoints

R1–R7 retain the outcome/carryover checks below. Each initial winning hand is open Tanyao, 1 han, 30 fu, dora 0, no pao. A–D always refer to initial East/South/West/North identities.

| Entry | Input                      | Raw A/B/C/D after save        | Next deal; honba; pot |
| ----- | -------------------------- | ----------------------------- | --------------------- |
| R1    | B ron from C               | 30000 / 31000 / 29000 / 30000 | East 2; 0; 0          |
| R2    | Dealer B tsumo             | 29500 / 32500 / 28500 / 29500 | East 2; 1; 0          |
| R3    | Draw: A/B tenpai, B riichi | 31000 / 33000 / 27000 / 28000 | East 2; 2; 1          |
| R4    | Abortive draw: D riichi    | 31000 / 33000 / 27000 / 27000 | East 2; 3; 2          |
| R5    | Chombo: C                  | 31000 / 33000 / 27000 / 27000 | East 2; 3; 2          |
| R6    | Nagashi: D; B/D tenpai     | 29000 / 29000 / 25000 / 35000 | East 2; 4; 2          |
| R7    | Double ron: A and D from C | 31200 / 29000 / 20600 / 39200 | East 3; 0; 0          |

R3 transfers two 1,500 noten payments plus B's 1,000 deposit. R4 carries a second deposit. R5 records C's separate −20,000 penalty without changing playing scores. R6 transfers 2,000/4,000/2,000 to D without awarding the carried pot. R7 pays each winner 1,000 + 1,200 honba, and the carried 2,000 pot goes to D.

R8–R42 enter **H01–H35 in order** from the [catalogue](smoke-hand-catalogue.md#hand-inputs), selecting players according to its dealer rule. R43–R46 use the catalogue's finishing hands from South 1 through South 4. Every retained entry has explicit score and payment checkpoints in the fixture's `local.rounds` array.

### Final results in Tyr and Sigrun

| Player | Raw score | Rating change including uma and chombo |
| ------ | --------- | -------------------------------------- |
| A      | 1189300   | 1174300                                |
| B      | -1089100  | -1134100                               |
| C      | -6400     | -61400                                 |
| D      | 26200     | 1200                                   |

## Steps and expected results

1. Create nine independent account fixtures. Log in as administrator in Forseti and create the TEST local event from EMA with the explicit rules above. Reopen its title in a fresh tab as in SMOKE-004 and verify all saved settings.
2. Register A–H through Manage players. Reload and verify exactly eight distinct registrations; administrator is absent.
3. In a separate Tyr context, log in as A. Select the event, explicitly choose A/B/C/D in East/South/West/North order, and start a new game. Assert all four begin at 30,000, East 1, honba/pot zero.
4. Preview R1, back out without saving, and verify unchanged table and empty log. Enter R1 again and submit once.
5. Enter R2–R7. Before each save, verify the previous scores and payment arrows. After each save, verify all scores, current dealer, honba, pot, penalty indicator, retained count, and latest log entry. Reload after R7, reopen the current game if necessary, and verify the full seven-entry history.
6. Enter H01–H35, then the four finishing hands. For every hand assert the complete yaku selection, dora, calculated han/fu, preview payments, and saved score checkpoint. Do not force-finish. Dealer continuation allows catalogue coverage without ending the game early.
7. The final South 4 nondealer ron automatically opens Tyr's populated results screen. Check exactly four players and the explicit raw scores/rating changes above. Capture them keyed by person ID, confirm, and verify no current game remains.
8. In an anonymous Sigrun context, open this event's Last games page. Expect exactly one game and 46 retained rounds (Ron 35 / Tsumo 7 / Draw 2 / Chombo 1 / Nagashi 1). Compare all four results with the explicit fixture and captured Tyr results. Check every persisted round's starting wind, players, yaku, han/fu, and dora, including both R7 winners and the final South 4 hand.
9. Open the game's details via its link, retain its hash, reload, and repeat the results/history checks. Do not identify the event by a global latest-game query.

## Timeout and implementation requirements

Use one `SMOKE-005` test, **30 minutes per attempt**, with bounded action and assertion waits and meaningful per-round steps. Use UI state/request completion waits, never fixed sleeps. API setup is limited to creating accounts. Routine game-log checks may inspect only the latest entry and total count; reload and publication checkpoints verify full history. Keep contexts for administrator, recorder, and spectator isolated.

## Cleanup and isolation

Retain this attempt's TEST event and accounts for inspection. Retries use new accounts and a new event. Close extra contexts; never alter unrelated sessions.

## Implementation and coverage

- Status: Implemented in [local-session.spec.ts](../tests/local-session.spec.ts), with [shared UI helpers](../tests/utils/game-flow.ts) and [explicit scenario checkpoints](../tests/utils/hand-scenarios.json).
- Covers all 46 yaku in one local event, diverse fu/dora, all six outcomes, dealer continuation, carryover, deferred chombo, persistence, natural completion, and matching Tyr/Sigrun results. Tournament synchronization is covered by SMOKE-006.
