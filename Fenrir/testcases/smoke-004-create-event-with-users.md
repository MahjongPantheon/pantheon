# SMOKE-004: Create a local event and add players there

## Purpose

Verify that a player can create their own local event and add players there

## Scope

Forseti UI, Frey account setup and permissions, and Mimir event and player registration APIs. The described steps do not exercise Sigrun.

## Preconditions

- In production-build CI, `.pantheon.internal` services are running and the workflow supplies fixture-superadmin credentials for the guarded `E2eCreateAccounts` API. Browser actions use fresh ordinary accounts. The development alternative below uses `.pantheon.local` services.
- For development runs, the development stack is running and `FORSETI_URL` and `SIGRUN_URL` are configured.
- The browser is logged out.
- `FREY_URL` points to Frey's `.pantheon.local` development endpoint, which returns confirmation codes for sign-up. No superadmin credentials are needed for this path.
- Alternatively, configure both `E2E_SUPERADMIN_EMAIL` and `E2E_SUPERADMIN_PASSWORD` for an existing superadmin used only for fixture creation, and enable `E2E_TEST_MODE=1` in Frey. See [Fenrir setup](../README.md).
- 1 separate mock user should be created with known unique email and password before the test run. Refer to the user as event administrator.
- 8 mock users should be created before the test run using Frey service with known email and passwords.

## Test data

| Input          | Value or generation rule                                                     |
| -------------- | ---------------------------------------------------------------------------- |
| Email          | `<new UUID>@test.com`, generated for every attempt, including retries        |
| Display name   | `Test account` with unique 6-letter suffix                                   |
| Password       | `SomeStrongPassword123321`                                                   |
| Privacy policy | Accepted                                                                     |
| Event title    | `TEST SMOKE-004 <new UUID>`; the TEST marker suppresses player notifications |
| Ruleset        | First available option selected from the popup                               |
| Timezone       | `Europe/Moscow` selected from the popup                                      |

Accounts are created through Frey's development `RequestRegistration` and `ApproveRegistration` RPCs, or through guarded `E2eCreateAccounts` when superadmin credentials are configured. Fixture setup does not involve a privacy-policy checkbox or confirmation email. The event administrator is a fresh ordinary account; any configured setup superadmin is not used for browser actions.

## Steps and expected results

| Step | Action                                                                                                                                             | Expected result                                                   |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1    | Open `FORSETI_URL`                                                                                                                                 | Login and password fields appeared                                |
| 2    | Enter event administrator credentials and press Log in                                                                                             | Empty list of own events appears                                  |
| 3    | Press "Create new event" menu item                                                                                                                 | The form of new event appears                                     |
| 4    | Fill the form with an unique event name, select Local event type, select one of event rules from the popup, select one of timezones from the popup | Data is filled in the first form tab                              |
| 5    | Press the event form's save control (`forseti-event-settings-save`, currently titled "Save changes")                                               | List of owned events with one item appears                        |
| 6    | Open the event title link in a new browser tab (middle-click)                                                                                      | Event settings form appears with freshly loaded event permissions |
| 7    | Press "Manage players" menu item                                                                                                                   | Empty players list appears                                        |
| 8    | Type name of each of 8 mock users in the search field and click on the popup item appeared                                                         | All 8 mock users are added to the event                           |
| 9    | Reload the player-management page                                                                                                                  | Exactly the same 8 mock users remain registered                   |

## Cleanup and isolation

Each attempt, including retries, creates nine fresh accounts with unique emails and a uniquely named event. Account creation does not send email, so this case does not compete for the shared latest-message mailbox. The test retains its accounts and event in the test environment; it does not delete unrelated data or depend on previous runs.

## Implementation and coverage

- Status: Implemented.
- Implementation: [events.spec.ts](../tests/events.spec.ts), `SMOKE-004: Create a local event and add players there`.
- Coverage limits: Verifies event creation and persistent player registration through Forseti. Opens the title link in a new tab to avoid Forseti's existing in-app permission-loading race; the ordinary in-app click remains unfixed and is not validated by this case. Does not exercise Sigrun, session recording, or scoring.
