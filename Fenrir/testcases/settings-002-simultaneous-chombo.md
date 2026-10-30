# SETTINGS-002: Players can record simultaneous chombo after timeout as one hand

## Purpose

Verify that multiple players can receive chombo in one submission, consuming one timed hand.

## Scope

Tyr mobile selection and confirmation; Mimir event rules, preview, recording and history.

## Preconditions

- Development services and account-fixture setup are available.
- The case creates its own administrator, four players, event and session.
- The administrator owns the event and registers all four players.

## Test data

| Input         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| Viewport      | 390 × 844, touch enabled                                     |
| Preset        | EMA 2025, one-more-hand, chombo counts as a hand             |
| Timer         | Zero-minute tournament timer, allowed to expire before entry |
| Chombo groups | First two players together, then the remaining two together  |

## Steps and expected results

| Step | Action                                                 | Expected result                                                                                                   |
| ---- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| 1    | Fetch presets and create an isolated event and session | EMA 2025 enables the unified setting and exposes no old flag                                                      |
| 2    | Start the timer and log in to Tyr as a participant     | The session can be opened after timeout                                                                           |
| 3    | Select both first-group players, toggle one off and on | Buttons remain enabled and the other selection is preserved                                                       |
| 4    | Preview and submit                                     | Both names and penalties are included; one round is stored, the extra hand starts, and the session remains active |
| 5    | Submit the second group                                | One additional round is stored; both penalties apply before the session finishes                                  |
| 6    | Read the overview and history                          | Four penalties and two grouped rounds are present                                                                 |

## Cleanup and isolation

Unique accounts and event title are generated per attempt. The event is retained for debugging; no shared event or timer is modified.

## Implementation and coverage

- Status: Implemented.
- Implementation: `../tests/chombo.spec.ts`, “SETTINGS-002: Players can record simultaneous chombo after timeout as one hand”.
- Coverage limits: One-more-hand with fixed chombo penalties. Unit/API tests separately cover other ending policies, reverse-mangan payments, invalid IDs, retries, undo, and migration.
