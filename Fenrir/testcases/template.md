# <ID>: <Actor can achieve an outcome under a condition>

## Purpose

Describe the user outcome and behavior or integration this case verifies.

## Scope

Identify the entry UI and services involved.

## Preconditions

- Required environment and configuration.
- Initial authentication state and permissions.
- Required existing data and how this case creates or seeds it independently.

## Test data

| Input   | Value or generation rule                                   |
| ------- | ---------------------------------------------------------- |
| <Input> | <Exact value; specify uniqueness per attempt where needed> |

## Steps and expected results

| Step | Action        | Expected result                        |
| ---- | ------------- | -------------------------------------- |
| 1    | <User action> | <Specific observable result to assert> |
| 2    | <User action> | <Specific observable result to assert> |

## Cleanup and isolation

Describe created data, cleanup or retention, and shared resources that require isolation. Account for parallel runs and retries.

## Implementation and coverage

- Status: <Proposed or implemented>.
- Implementation: <Relative link to spec file and exact test title>.
- Coverage limits: <What this case actually establishes>.
- Proposed improvements: <Additional checks not yet implemented, if applicable>.
