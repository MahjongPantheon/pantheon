# UI-003: Visitor can dismiss the narrow-screen drawer with a left swipe

## Purpose

Allow touch users to dismiss the navigation drawer without interrupting scrolling or accidentally following a menu link.

## Scope

Forseti navigation in Chromium with real touch input dispatched through CDP.

## Preconditions

- The development stack is running and FORSETI_URL points to Forseti.
- A fresh browser context is logged out. No account or event data is needed.

## Test data

| Input                | Value                                                      |
| -------------------- | ---------------------------------------------------------- |
| Viewport             | 375 by 812 pixels                                          |
| Closing swipe        | 150 pixels left with 5 pixels vertical movement            |
| Non-closing gestures | Vertical movement, right swipe, and 30-pixel left movement |

## Steps and expected results

| Step | Action                                                  | Expected result                                             |
| ---- | ------------------------------------------------------- | ----------------------------------------------------------- |
| 1    | Open the mobile navigation drawer.                      | The dialog is visible and fully on screen.                  |
| 2    | Swipe vertically, rightward, and a short distance left. | The drawer remains open after each gesture.                 |
| 3    | Swipe deliberately left across the menu.                | The drawer closes and the current login route is preserved. |
| 4    | Reopen the drawer and tap sign-up.                      | The sign-up route opens and the drawer closes normally.     |

## Cleanup and isolation

Only navigation and context-local touch emulation are used. No database records are created.

## Implementation and coverage

- Status: Implemented.
- Implementation: [forseti-layout.spec.ts](../tests/forseti-layout.spec.ts), `UI-003: Visitor can dismiss the narrow-screen drawer with a left swipe`.
- Coverage limits: Chromium touch input at 375px. Unit tests additionally cover cancellation, multiple touches, and accidental click suppression.
