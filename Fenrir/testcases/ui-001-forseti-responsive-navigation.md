# UI-001: Visitor can navigate Forseti at mobile, tablet and desktop widths

## Purpose

Preserve responsive navigation and shell geometry during the Mantine migration.
Geometry assertions wait for the AppShell padding transition to settle after a
viewport breakpoint changes, while still requiring the input to remain outside
the desktop sidebar and inside the viewport.

## Scope

Forseti browser UI and the real services used when loading its development or
production build.

## Preconditions

- The development stack or CI production build is running and FORSETI_URL points to Forseti.
- A fresh browser context is logged out; no account or event data is required.

## Test data

| Input           | Value                                  |
| --------------- | -------------------------------------- |
| Viewport widths | 390, 767, 768, 1023, 1024, 1440 pixels |
| Viewport height | 900 pixels                             |

## Steps and expected results

| Step | Action                                               | Expected result                                                                                               |
| ---- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1    | Open login and resize to each width.                 | Login input is visible; header is 44px and footer is 60px tall.                                               |
| 2    | At widths below 1024px, open the menu.               | Sidebar is hidden; mobile trigger below 768px or tablet trigger from 768px opens the drawer.                  |
| 3    | Close the drawer, reopen it and choose sign-up.      | The close button hides the drawer; reopening and navigating hides it again.                                   |
| 4    | At widths from 1024px, use the sidebar sign-up link. | Sidebar sign-in link is visible and navbar is 350px wide.                                                     |
| 5    | Inspect sign-up, then return to login.               | URL and input show sign-up; input stays below the header, beyond the desktop sidebar and inside the viewport. |

## Cleanup and isolation

Only browser navigation is performed. A fresh context isolates cookies; no database records are created.

## Implementation and coverage

- Status: Implemented.
- Implementation: [forseti-layout.spec.ts](../tests/forseti-layout.spec.ts), `UI-001: Visitor can navigate Forseti at mobile, tablet and desktop widths`.
- Coverage limits: Public navigation and geometry; authenticated actions are covered by existing event and session cases.
