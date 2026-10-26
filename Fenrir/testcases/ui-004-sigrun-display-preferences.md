# UI-004: Visitor can navigate Sigrun and retain display preferences

## Purpose

Verify responsive navigation, theme persistence, language switching, valid menu markup, and metadata after the Mantine migration. Capture console errors as well as uncaught browser errors.

## Scope

Sigrun public event list, shared cookie storage, and mobile/tablet navigation drawer.

## Preconditions

- Sigrun and its normal backend dependencies are running at `SIGRUN_URL`.
- The visitor is unauthenticated; no accounts or event fixtures are required.
- A fresh browser context starts with English and default display preferences.

## Test data

| Input       | Value                                              |
| ----------- | -------------------------------------------------- |
| Viewports   | Desktop 1440×1000, tablet 900×1000, mobile 390×844 |
| Preferences | Dark scheme, dimmed palette, Russian then English  |

## Steps and expected results

| Step | Action                                             | Expected result                                                                                       |
| ---- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1    | Open the event list                                | English Sigrun title; exactly one title and description in the document head                          |
| 2    | Open navigation and toggle color scheme            | Dark scheme is applied; mobile/tablet drawer closes                                                   |
| 3    | Enable dimmed colors and reload                    | Blue shade 6 is `#40678c`; dark scheme and dimmed palette survive reload                              |
| 4    | On mobile/tablet, open the drawer and press Escape | Drawer closes and focus returns to its opener                                                         |
| 5    | Switch to Russian and back to English              | Title changes with the language and returns to English, with one title and no uncaught browser errors |

## Cleanup and isolation

Every viewport runs in its own browser context. Only its cookies are changed; no shared records or mail are created.

## Implementation and coverage

- Implemented in [sigrun-ui.spec.ts](../tests/sigrun-ui.spec.ts), with titles `UI-004: Visitor can navigate Sigrun and retain display preferences on desktop`, `... on tablet`, and `... on mobile`.
- Works against development or production SSR builds by selecting `SIGRUN_URL`. SSR is covered only when the configured host serves the production build.
- Does not establish rating correctness, authenticated replay submission, or graph interactions; existing session and tournament cases cover those flows.
