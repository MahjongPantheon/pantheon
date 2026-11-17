## Bragi: Pantheon landing pages

Bragi uses React 19 and Mantine 9 with `@mantine/emotion` for its existing styles.
The browser and server share the same theme and stylesheet imports. Server renders
use a separate Emotion cache per request and render a full document to collect
React metadata before extracting the hydrated root markup.

Run `./run test bragi` from the repository root for the metadata and route regression
test. Bragi is also included in the root `./run test` target.

### User guides

The guides are localized MDX files in `app/pages` for English (`en`), Russian (`ru`),
Japanese (`jp`), Simplified Chinese (`cn`), Korean (`ko`), German (`de`) and Belarusian
(`be`). URL codes match the shared Pantheon language preference; HTML language tags
use `ja` and `zh` for Japanese and Chinese. Keep the
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

Keep all language editions in sync and use descriptive alt text and captions. Link cross-page
section references with language-prefixed anchors so direct navigation scrolls to the
section. Verify the guides at desktop and phone widths, check every image loads, and
run `./run lint Bragi`, `./run test Bragi` and `./run task Bragi build`. The MDX content
is translated in its locale files; shared React strings use `app/i18n/*.po` through
`./run i18n extract Bragi` and `./run i18n compile Bragi`. Preserve existing human
translations when updating catalogs.
The guides and screenshots are included in the normal Bragi browser/server build
and deployment; no separate publishing service is required.

The five new language editions use machine-generated translations, with a localized
notice and GitHub/Discord contribution links at the bottom of each page. English
and Russian pages invite the same help while explaining that other editions include
machine translations. The Russian-only `howToPlay` and `yakuList` reference pages
remain untranslated. Switching from these pages to another language opens that
language's home page.

New language guides reuse the English screenshots with translated alt text and
captions through `GuideScreenshot`; their introductions explain the screenshot
language. Refine the matching `app/pages/*_{jp,cn,ko,de,be}.mdx` files directly.
The URL controls header links and all shared UI text, including on direct visits,
server renders and browser Back/Forward. Language switching preserves the current
page, query and anchor. The sitemap uses the same route registry as the site.
