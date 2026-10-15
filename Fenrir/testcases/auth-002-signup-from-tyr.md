# AUTH-002: Visitor can open account sign-up from Tyr

## Purpose

Verify that Tyr's sign-up entry point reaches the account creation screen in a new tab.

## Scope

Tyr to Forseti browser navigation.

## Preconditions

- Tyr and Forseti are available in the development stack and `TYR_URL` is configured.
- The browser is logged out.

## Test data

None.

## Steps and expected results

| Step | Action                                                                                               | Expected result                                |
| ---- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1    | Open `TYR_URL` and click `tyr-login-signup`, with the new-page listener registered before the click. | A new browser tab opens.                       |
| 2    | Inspect the new tab.                                                                                 | The heading “Register new account” is visible. |

## Cleanup and isolation

No persistent data is created. Playwright's browser context isolates the tabs from other tests.

## Implementation and coverage

- Status: Implemented.
- Implementation: [register.spec.ts](../tests/register.spec.ts), `AUTH-002: Visitor can open account sign-up from Tyr`.
- Coverage limits: Asserts that a new tab displays the sign-up heading. Does not submit the form or explicitly assert the destination URL.
- Proposed improvements: Assert the destination URL if reaching the configured Forseti service is part of the requirement.
