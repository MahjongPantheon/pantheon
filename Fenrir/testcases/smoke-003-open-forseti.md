# SMOKE-003: Visitor can open Forseti

## Purpose

Verify that the administration frontend loads with its expected browser title.

## Scope

Forseti browser entry point.

## Preconditions

- Forseti is running and `FORSETI_URL` is configured.
- A fresh browser context is available; no account or event fixture is required.

## Test data

None.

## Steps and expected results

| Step | Action              | Expected result                       |
| ---- | ------------------- | ------------------------------------- |
| 1    | Open `FORSETI_URL`. | The browser title contains “Forseti”. |

## Cleanup and isolation

No persistent data is created.

## Implementation and coverage

- Status: Implemented.
- Implementation: [open.spec.ts](../tests/open.spec.ts), `SMOKE-003: Visitor can open Forseti`.
- Coverage limits: A title smoke check does not establish that login, permissions, or administration workflows work.
