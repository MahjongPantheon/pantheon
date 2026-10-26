# UI-002: Visitor can persist Forseti color scheme and dimmed palette

## Purpose

Preserve light/dark rendering, dimmed palettes and the shared day/night cookie format.

## Scope

Forseti browser UI and its existing shared storage implementation.

## Preconditions

- The development stack is running and FORSETI_URL points to Forseti.
- A fresh browser context is logged out with no preference cookies.

## Test data

| Input        | Value                             |
| ------------ | --------------------------------- |
| Viewport     | 1440 by 900 pixels                |
| Color sample | Mantine blue shade 6 CSS variable |

## Steps and expected results

| Step | Action                                   | Expected result                                                                |
| ---- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| 1    | Open login.                              | HTML declares the light scheme; record the normal blue shade.                  |
| 2    | Toggle scheme and dimmed colors.         | HTML declares dark; the blue shade changes.                                    |
| 3    | Reload.                                  | Dark scheme and dimmed shade persist; thm=night and dim=1 cookies are stored.  |
| 4    | Toggle both preferences back and reload. | Light scheme and original shade persist; thm=day and dim=0 cookies are stored. |

## Cleanup and isolation

Preferences exist only in the test's browser context. No account or database data is changed.

## Implementation and coverage

- Status: Implemented.
- Implementation: [forseti-layout.spec.ts](../tests/forseti-layout.spec.ts), `UI-002: Visitor can persist Forseti color scheme and dimmed palette`.
- Coverage limits: Forseti rendering and cookie compatibility; does not exercise Tyr reading the shared cookies.
