# AUTH-004: Account owner can reset a password once and log in with the new password

## Purpose

Verify that password recovery completes through Forseti and that a consumed reset link cannot be reused after the password changes.

## Scope

Forseti recovery and login pages, Frey registration, password recovery, and authentication.

## Preconditions

- Development services are running, with a `.pantheon.local` `FREY_URL` that returns recovery links in dialogs.
- Frey migrations, including reset-token expiry, have been applied.
- The browser begins without authentication. The account helper creates an ordinary account independently for this attempt.

## Test data

| Input        | Value or generation rule                            |
| ------------ | --------------------------------------------------- |
| Account      | Unique email and password from `createTestAccounts` |
| New password | `NewStrongPassword123321!`                          |
| Recovery URL | Captured from the real development dialog           |

## Steps and expected results

| Step | Action                                                  | Expected result                                                            |
| ---- | ------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1    | Request recovery on the Forseti page for this account.  | The sent-email message appears and the dialog supplies a confirmation URL. |
| 2    | Follow the URL and approve recovery.                    | The new-password form becomes available.                                   |
| 3    | Submit the new strong password.                         | The successful-update message appears.                                     |
| 4    | Follow the login link and use the new password.         | Manage my events is visible.                                               |
| 5    | Revisit the original recovery URL and approve it again. | Password recovery failed is visible.                                       |
| 6    | Authorize through Frey with the new password.           | Authorization succeeds, proving the rejected reuse did not change it.      |

## Cleanup and isolation

Every attempt creates its own account, which is retained in the development database. No existing account is modified. This development-only flow sends no email and does not consume the shared last-mail helper.

## Implementation and coverage

- Status: Implemented.
- Implementation: [recovery.spec.ts](../tests/recovery.spec.ts), `AUTH-004: Account owner can reset a password once and log in with the new password`.
- Coverage limits: Skipped outside the development Frey hostname. Does not verify production mail delivery. Expiry, concurrent redemption, and pending-link invalidation on password change are covered by Frey integration tests.
