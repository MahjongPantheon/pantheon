# SMOKE-001: Visitor can open Sigrun

## Purpose

Verify that the public ratings frontend loads with its expected browser title.

## Scope

Sigrun browser entry point.

## Preconditions

- Sigrun is running in the development stack and `SIGRUN_URL` is configured.
- A fresh browser context is available; no account or event fixture is required.

## Test data

None.

## Steps and expected results

| Step | Action             | Expected result                      |
| ---- | ------------------ | ------------------------------------ |
| 1    | Open `SIGRUN_URL`. | The browser title contains “Sigrun”. |

## Cleanup and isolation

No persistent data is created.

## Implementation and coverage

- Status: Implemented.
- Implementation: [open.spec.ts](../tests/open.spec.ts), `SMOKE-001: Visitor can open Sigrun`.
- Coverage limits: A title smoke check does not establish that rating data loads or is correct, or that server-side rendering works.
- Proposed additional case: Seed known event and player data independently, open the event's rating view, and assert expected displayed ratings. Give that behavior its own case ID and test.
