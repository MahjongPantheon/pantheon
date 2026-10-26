# UI-005: Visitor can dismiss Sigrun navigation with a left swipe

## Purpose

Match Forseti's deliberate left-swipe dismissal and 44px close-button target while preserving vertical scrolling and normal navigation.

## Scope

Sigrun mobile and tablet navigation using real Chromium touch input through CDP.

## Preconditions

- The development stack is running at `SIGRUN_URL`.
- A fresh browser context is logged out. No account or event fixtures are needed.

## Test data

| Input                | Value                                                  |
| -------------------- | ------------------------------------------------------ |
| Viewports            | 375×812 and 900×812                                    |
| Initial route        | `/filter/TEST`                                         |
| Closing swipe        | 150px left with 5px vertical movement                  |
| Non-closing gestures | Vertical movement, right swipe, and 30px left movement |

## Steps and expected results

| Step | Action                                                 | Expected result                                                             |
| ---- | ------------------------------------------------------ | --------------------------------------------------------------------------- |
| 1    | Open navigation                                        | The dialog is visible and fully on screen                                   |
| 2    | Swipe vertically, rightward, and a short distance left | The drawer remains open after each gesture                                  |
| 3    | Swipe deliberately left                                | The drawer closes and `/filter/TEST` remains the current route              |
| 4    | Reopen and use the close button                        | Its width and height are 44px, matching Forseti; clicking closes the drawer |
| 5    | Reopen and select To events list                       | The homepage opens and the drawer closes normally                           |

## Cleanup and isolation

Each viewport uses a fresh context and context-local touch emulation. No shared data is changed.

## Implementation and coverage

- Implemented in [sigrun-ui.spec.ts](../tests/sigrun-ui.spec.ts), `UI-005: Visitor can dismiss Sigrun navigation with a left swipe at 375px` and `... at 900px`.
- Chromium touch coverage; hook unit tests also cover canceled gestures, multiple touches, scroll direction, and accidental click suppression.
