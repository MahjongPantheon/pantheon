# SETTINGS-003: Administrator can allow triple ron while keeping other abortive draws

## Purpose

Verify that the three abortive-draw modes persist, appear on public rules, and
allow a real triple ron to be previewed and recorded when explicitly selected.

## Scope

Forseti event settings, Mimir Twirp API, Sigrun public rules, and Tyr round entry.

## Preconditions

- Running development services, or the root production-build e2e environment.
- Independent ordinary administrator and four player accounts created through the
  shared account helper. No existing event or session is required.
- Account creation uses the permissions and environment in the Fenrir README.

## Test data

| Input           | Value or generation rule                                                        |
| --------------- | ------------------------------------------------------------------------------- |
| Event           | Local event named `TEST SETTINGS-003 <UUID>`, EMA preset, 30,000 initial points |
| Modes           | Disabled; All; All except triple ron                                            |
| Session         | Four new players in fixed seating, first player is East                         |
| Round           | Three non-dealer winners, each open tanyao, 1 han / 30 fu, East discards        |
| Expected scores | East 27,000; South/West/North 31,000 each; East 2, zero honba                   |

## Steps and expected results

| Step | Action                                                                                        | Expected result                                                                                             |
| ---- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1    | Create event, register players, and start the session through real APIs                       | Every setup request succeeds                                                                                |
| 2    | Open the player's session in Tyr, then save each mode through Forseti and reload its settings | Stored flags and the visible selected mode match the choice; Tyr stays open                                 |
| 3    | Open the public rules page after every save                                                   | Read-only Abortive draws field shows the saved mode                                                         |
| 4    | Start round entry in the already-open Tyr session after selecting the final mode              | Current rules are loaded; abortive draw remains available; three ron winners can be selected and deselected |
| 5    | Enter all three hands, inspect preview, and submit                                            | Three 1,000-point transfers appear; PreviewRound and AddRound succeed                                       |
| 6    | Inspect Tyr table and saved session/game through Mimir                                        | Expected four scores, East 2, zero honba, one multiron containing three hands                               |

## Cleanup and isolation

The uniquely named event, accounts, and session are retained in the isolated test
environment. Each attempt creates independent fixtures, including retries. The
administrator and spectator contexts are closed on completion or failure. Failure screenshots use the
shared helper.

## Implementation and coverage

- Status: Implemented.
- Implementation: [tests/abortive-draw-settings.spec.ts](../tests/abortive-draw-settings.spec.ts),
  `SETTINGS-003: Administrator can allow triple ron while keeping other abortive draws`.
- Coverage limits: Covers settings persistence, public browser display, and the
  new mode's real scoring flow. Unit/API tests cover legacy rejection, atamahane,
  sanma, dealer repeats, riichi deposits and honba. The normal development run does
  not validate production SSR; run the production-build flow for that.
