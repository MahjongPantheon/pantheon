# SMOKE-002: Visitor can open Tyr

## Purpose

Verify that the mobile game assistant loads with its expected browser title.

## Scope

Tyr browser entry point.

## Preconditions

- Tyr is running and `TYR_URL` is configured.
- A fresh browser context is available; no account or event fixture is required.

## Test data

None.

## Steps and expected results

| Step | Action          | Expected result                   |
| ---- | --------------- | --------------------------------- |
| 1    | Open `TYR_URL`. | The browser title contains “Tyr”. |

## Cleanup and isolation

No persistent data is created.

## Implementation and coverage

- Status: Implemented.
- Implementation: [open.spec.ts](../tests/open.spec.ts), `SMOKE-002: Visitor can open Tyr`.
- Coverage limits: A title smoke check does not establish that authentication or session recording works.
