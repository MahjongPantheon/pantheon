# AUTH-001: Visitor can sign up, confirm their email, and log in

## Purpose

Verify the complete account activation journey, from sign-up through email confirmation to an authenticated Forseti screen.

## Scope

Forseti UI, Frey authentication, and Hermod email delivery.

## Preconditions

- The development stack is running and `FORSETI_URL` and `HERMOD_URL` are configured.
- The browser is logged out.
- The test can retrieve confirmation email through Hermod.
- No other email-producing flow competes for the latest message while this case uses `getLastMail()`.

## Test data

| Input | Value or generation rule |
| --- | --- |
| Email | `<new UUID>@test.com`, generated for every attempt, including retries |
| Display name | `Test account` |
| Password | `SomeStrongPassword123321` |
| Privacy policy | Accepted |

## Steps and expected results

| Step | Action | Expected result |
| --- | --- | --- |
| 1 | Open Forseti `/profile/signup`, enter the test data, accept the privacy policy, and submit. | `forseti-signup-success` is visible. |
| 2 | Retrieve the confirmation email through Hermod. | The message contains an HTTP or HTTPS confirmation link. |
| 3 | Open the link's path using the configured Forseti origin. | `forseti-confirm-success` is visible. |
| 4 | Click `forseti-confirm-go-to-login`. | Text matching “Login to your account” is visible. |
| 5 | Enter the same email and password and submit the login form. | Text matching “Manage my events” is visible. |

## Cleanup and isolation

The existing test generates a unique email but does not delete the created account. Accounts remain in the test environment; this case must not reuse them or depend on them in later tests. Any future cleanup must target only data owned by this attempt.

The [mail helper](../tests/utils/mail.ts) retrieves the latest message without filtering by recipient. Unique email addresses alone do not isolate this shared resource. Prevent competing email-producing tests from running concurrently until recipient-specific retrieval is available.

## Implementation and coverage

- Status: Implemented.
- Implementation: [register.spec.ts](../tests/register.spec.ts), `AUTH-001: Visitor can sign up, confirm their email, and log in`.
- Coverage limits: Establishes successful sign-up, confirmation, and login through the UI. Does not assert the email recipient, reject login before confirmation, or verify authentication after reloading.
- Proposed improvements: Retrieve and assert the email for this attempt's recipient and define scoped account cleanup.

“Sign-up” means creating a system account. “Player registration” means adding a player to an event's rating table; see [Pantheon terminology](../../docs/technical/terminology.md).
