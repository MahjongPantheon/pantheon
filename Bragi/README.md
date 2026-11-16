## Bragi: Pantheon landing pages

Bragi uses React 19 and Mantine 9 with `@mantine/emotion` for its existing styles.
The browser and server share the same theme and stylesheet imports. Server renders
use a separate Emotion cache per request and render a full document to collect
React metadata before extracting the hydrated root markup.

Run `./run test bragi` from the repository root for the metadata and route regression
test. Bragi is also included in the root `./run test` target.

### User guides

The English and Russian guides are paired MDX files in `app/pages`. Keep the
existing URLs when updating them so published links continue to work:

- `/en/getStarted` and `/ru/getStarted`: event modes, account sign-up, event
  registration, profile management and password recovery.
- `/en/forPlayers` and `/ru/forPlayers`: mobile assistant instructions.
- `/en/forHosts#club` and `/ru/forHosts#club`: club administrator flow.
- `/en/forHosts#tournament` and `/ru/forHosts#tournament`: tournament administrator
  flow, including the `#predefined` seating section.
- `/en/seatings` and `/ru/seatings`: seating methods, local IDs and initial winds.

Guide screenshots live in `public/assets/img/guides/{en,ru}`. They were captured
from the development applications on 17 November 2026 with synthetic accounts
and unlisted TEST events, using a 1280 × 900 administration viewport and a
390 × 844 mobile viewport. They contain no production player data. The earlier
`forPlayers` assets are retained for compatibility with previously published links.

To refresh screenshots, start the development stack with `./run dev --detach` and
use Fenrir's Playwright browser against the `.pantheon.local` services. Create
ordinary development accounts and separate TEST club, tournament and predefined
events; do not capture a live tournament. Set the interface language before each
capture and wait for data and fonts to load. Capture actual controls at these stages:

- Account sign-up, password recovery, own profile and new event type selection.
- Registered club and tournament players; a club game before its first hand and
  the latest-hand cancellation confirmation after a hand has been recorded.
- First tournament seating, seating ready, global extra-time confirmation, results
  approval, and interval selection after the previous session is approved.
- Saved local IDs and a validated predefined script with two sessions.
- Mobile event selection, home, settings, filled new-game form, table assignment,
  running timer, outcome selection, player statuses, hand details, preview and log.

Keep both languages in sync and use descriptive alt text and captions. Link cross-page
section references with language-prefixed anchors so direct navigation scrolls to the
section. Verify the guides at desktop and phone widths, check every image loads, and
run `./run lint Bragi`, `./run test Bragi` and `./run task Bragi build`. The MDX content
is translated in its paired files; shared React strings use the normal i18n pipeline.
The guides and screenshots are included in the normal Bragi browser/server build
and deployment; no separate publishing service is required.
