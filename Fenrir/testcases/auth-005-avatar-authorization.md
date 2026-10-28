# AUTH-005: Account owner can upload an avatar through Frey while direct replacement is denied

## Purpose

Verify authenticated avatar updates across Frey and Gullveig, and prevent anonymous direct uploads from bypassing Frey's permission checks.

## Scope

Frey profile API, Gullveig upload handler, and nginx public avatar reads. This is an API integration flow rather than browser form coverage.

## Preconditions

- Frey and Gullveig run the updated code with the same nonempty `INTERNAL_QUERY_SECRET`.
- Frey migrations have been applied. `FREY_URL` and `GULLVEIG_URL` identify the test environment; the latter defaults to the documented development hostname.
- The account helper can create an ordinary account independently.

## Test data

| Input       | Value or generation rule                        |
| ----------- | ----------------------------------------------- |
| Account     | Unique account from `createTestAccounts`        |
| Avatar      | Valid embedded one-pixel PNG fixture            |
| Credentials | Token returned by Frey's real authorization API |

## Steps and expected results

| Step | Action                                                               | Expected result                               |
| ---- | -------------------------------------------------------------------- | --------------------------------------------- |
| 1    | Authorize the new account.                                           | Authorization succeeds.                       |
| 2    | Update the account's profile and avatar through Frey with its token. | The update succeeds and Me reports hasAvatar. |
| 3    | Read the public avatar URL.                                          | A nonempty JPEG is served.                    |
| 4    | POST directly to Gullveig without the service secret.                | HTTP 403 is returned.                         |
| 5    | Read the public avatar again.                                        | The original JPEG bytes remain unchanged.     |

## Cleanup and isolation

Each attempt creates a unique account and avatar filename. Both are retained in the test environment. No existing account or avatar is modified, and no shared mailbox is used.

## Implementation and coverage

- Status: Implemented.
- Implementation: [avatars.spec.ts](../tests/avatars.spec.ts), `AUTH-005: Account owner can upload an avatar through Frey while direct replacement is denied`.
- Coverage limits: Verifies API authorization, service-to-service credentials, and persistent public storage. Gullveig unit tests also reject empty/wrong secrets and missing server configuration. Does not exercise the profile image-selection UI.
