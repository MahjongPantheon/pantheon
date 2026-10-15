# AUTH-003: Visitor can open password recovery from Tyr

## Purpose

Verify that Tyr's password-recovery entry point reaches the recovery screen in a new tab.

## Scope

Tyr to Forseti browser navigation.

## Preconditions

- Tyr and Forseti are available and `TYR_URL` is configured.
- The browser is logged out.

## Test data

None.

## Steps and expected results

| Step | Action                                                                                             | Expected result                              |
| ---- | -------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1    | Open `TYR_URL` and click `tyr-login-recovery`, registering the new-page listener before the click. | A new browser tab opens.                     |
| 2    | Inspect the new tab.                                                                               | Text matching “Recover password” is visible. |

## Cleanup and isolation

No persistent data is created. Playwright's browser context isolates the tabs from other tests.

## Implementation and coverage

- Status: Implemented.
- Implementation: [register.spec.ts](../tests/register.spec.ts), `AUTH-003: Visitor can open password recovery from Tyr`.
- Coverage limits: Covers navigation only; does not submit a recovery request, retrieve mail, or reset a password.
