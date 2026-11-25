# RULES-001: Administrator can correct starting winds while retaining recorded outcomes

## Purpose

Verify atomic correction of an active offline session after two rounds, retaining
the named outcome participants and recalculating dealer payments and progression.

## Scope

Forseti Games Control, Frey authentication/permissions and Mimir session history.

## Preconditions

- Running development stack and account creation as described in the Fenrir README.
- Fresh ordinary administrator and four player accounts created for each attempt.
- Administrator creates a unique local EMA event and registers all four players.

## Test data

| Input           | Value                                                                |
| --------------- | -------------------------------------------------------------------- |
| Event           | `TEST RULES-001` plus a fresh UUID                                   |
| Initial seating | Four fresh players, in account creation order                        |
| Recorded rounds | East wins 1 han/30 fu ron from West, then draw with only East tenpai |
| Correction      | Swap initial East and South                                          |

## Steps and expected results

| Step | Action                                                        | Expected result                                                                                                                                                                           |
| ---- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Record both rounds through authenticated Mimir setup calls    | Both rounds persist and the initial dealer repeats                                                                                                                                        |
| 2    | Log in to Forseti and open the table's Correct seating dialog | Dialog explains that outcomes remain attached to named players                                                                                                                            |
| 3    | Select South's player for starting East                       | Starting South automatically becomes the previous East                                                                                                                                    |
| 4    | Confirm correction                                            | One successful RPC contains the exact corrected permutation; dialog closes and the table shows 29000 for the original East                                                                |
| 5    | Read the persisted overview and history                       | Starting order is swapped, scores in corrected order are 24000/29000/23000/24000, current round is East 2 with one honba, token changes, both outcomes retain participants and hand value |
| 6    | Reload Games Control and reopen the dialog                    | Table retains corrected scores and starting East remains the selected player                                                                                                              |

## Cleanup and isolation

Accounts and the uniquely named event/session are retained for diagnosis in the
disposable test environment. Each attempt and retry uses fresh mutable data.
The case sends no email and does not depend on another case's event or session.

## Implementation and coverage

- Implemented in [correct-seating.spec.ts](../tests/correct-seating.spec.ts),
  `RULES-001: Administrator can correct starting winds while retaining recorded outcomes`.
- Covers the real administration flow and persisted replay. Mimir unit/database
  tests cover all outcomes, sanma, rejection guards, rollback and concurrency.
