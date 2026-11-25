# REFEREE-001: Event referees share private notes and see player links on penalties

## Purpose

Verify that two event referees can append and read shared event notes, that player-linked notes appear on the event's Penalties page, and that ordinary players and anonymous callers cannot read or add notes.

## Scope

Forseti notes, navigation, and Penalties UI; Mimir notes storage and authorization; Frey accounts and event rights. Uses real services without mocked RPCs.

## Preconditions

- Running development stack, or an e2e-enabled production stack, with current Mimir migrations applied.
- Four fresh ordinary accounts are created through `createTestAccounts`: event administrator, two referees, and a registered player.
- Setup creates two independent tournament events, registers the player in the first, and grants its two referee roles through Frey.

## Test data

| Input    | Value or generation rule                                                 |
| -------- | ------------------------------------------------------------------------ |
| Events   | `TEST REFEREE-001` plus a UUID per event and attempt                     |
| Accounts | Fresh account IDs and unique email addresses per attempt                 |
| Notes    | Event instructions, player observation, and follow-up, each with a UUID  |
| Penalty  | 500 points, reason `Existing penalty`, assigned to the registered player |

## Steps and expected results

| Step | Action                                                                          | Expected result                                                                                                                                    |
| ---- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | First referee opens Notes and adds an event-wide note and a player-linked note. | Notes menu is visible; both notes persist after reload; linked note shows player, author, and timestamp.                                           |
| 2    | Second referee opens Notes in a separate browser context and adds a follow-up.  | Both original notes are visible; first referee sees follow-up after Refresh notes; admin RPC returns three notes and the correct follow-up author. |
| 3    | Admin reads notes for the second event.                                         | No notes from the first event are returned.                                                                                                        |
| 4    | Assign a penalty and open Penalties as the second referee.                      | Linked note appears; event-wide notes are absent; existing 500-point penalty remains visible.                                                      |
| 5    | Anonymous caller and registered player request list/add RPCs.                   | Both operations fail; private content is absent from error responses.                                                                              |
| 6    | Registered player opens Notes directly.                                         | Access message is visible; note form, private text, and notes menu are absent; admin still reads exactly three notes.                              |

## Cleanup and isolation

Accounts, events, notes, rights, registration, and penalty remain in the disposable test environment. Every attempt creates fresh IDs and UUIDs, so concurrent runs and retries do not share mutable data. Browser contexts are closed independently. Setup uses development confirmation codes or guarded fixture APIs and does not send registration emails.

## Implementation and coverage

- Status: implemented.
- Implementation: [referee-notes.spec.ts](../tests/referee-notes.spec.ts), `REFEREE-001: Event referees share private notes and see player links on penalties`.
- Coverage limits: proves persistence, event isolation, referee collaboration, private access, and unchanged visible penalty data through the development stack. Focused Mimir tests additionally cover body validation, unregistered player rejection, and preserving links after unregistration.
