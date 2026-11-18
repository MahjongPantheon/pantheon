## Sigrun: ratings and games frontend

![Sigrun](assets/ico/favicon.png?raw=true 'Sigrun')

**Sigrun** is a frontend for [Frey](https://github.com/MahjongPantheon/pantheon/tree/master/Frey) (user data storage) and
[Mimir](https://github.com/MahjongPantheon/pantheon/tree/master/Mimir) (games data storage).
Sigrun provides a convenient view of games and player statistics for japanese (riichi) mahjong sessions.

### Features

- Viewing player ratings for particular events
- Viewing last games with details
- Viewing player statistics (like rating history or summary of collected hands)
- Viewing timer and seating for tournaments (for external projector or screen)
- Viewing events list
- And many more...

### Developer information

Unit test coverage (`./run test sigrun` from the repository root) must reach
at least 85% for lines, statements, functions, and branches. Reports are written
to `Sigrun/coverage/`.

Sigrun uses Mantine 9 with React 19.2 or later. Keep all `@mantine/*` packages
on the same version. `app/ThemeProvider.tsx` retains the previous radius,
light-variant colors, and shared day/night cookie mapping. Emotion remains the
styling integration; SSR creates a cache per request and emits extracted styles
after the bundled stylesheets so custom component styles take precedence.
Statistics charts use `react-chartjs-2` and Chart.js. Rating history allows native
touch and mouse-wheel page scrolling; tapping a point selects its game immediately. The preview controls
keep the selected point highlighted. A range slider below the rating graph controls
the visible games without capturing page scroll gestures. Winning-game stars, live language changes,
and the dimmed palette are preserved. The zoom plugin loads only in the browser
so server rendering does not depend on Hammer.js browser globals.
Page metadata is emitted once per page using React 19's document-head handling,
including fallback metadata for loading and unavailable views.

Migration references: [v6 to v7](https://mantine.dev/guides/6x-to-7x/),
[v7 to v8](https://mantine.dev/guides/7x-to-8x/), and
[v8 to v9](https://mantine.dev/guides/8x-to-9x/).
`app/ThemeProvider.test.tsx` and `app/helpers/renderDocument.test.tsx` cover
theme persistence, hydration, and request-specific CSS extraction.
Fenrir's UI-004 case covers responsive navigation and display preferences;
run it against a production SSR build as well as the development server.

Online PWA navigations request fresh SSR HTML. The precached HTML shell is used
only as an offline fallback and renders on the client without hydration. The
client also accepts shells cached by older service workers. Browser-only charts
start loading after hydration, with the same skeletons on the server and client.
Fenrir's PWA-001 case verifies online reloads and offline navigation with an active
service worker against the production SSR build.

We accept any help with developing, testing and improving our system, so please feel free to create issues or send
pull requests for missing functionality.

### Server rendering and memory

Production SSR preloads data for the matched route and renders the React tree once.
Storage, language, API credentials, cancellation, and Emotion caches belong to each
request. The browser reuses the same hydration keys and fetches data normally during
navigation. Add a matching loader in `app/services/routeData.ts` when introducing a
new `useIsomorphicState` key; missing SSR loaders fail explicitly.

Event-list descriptions are extracted directly from the Markdown syntax tree.
JSDOM is a development dependency used by tests and is not loaded by production SSR.
The production launcher also reads the HTML template once per worker.

The following server-only environment settings bound work in each of the six SSR
workers:

| Setting                  | Default | Meaning                                                                    |
| ------------------------ | ------- | -------------------------------------------------------------------------- |
| `SIGRUN_SSR_CONCURRENCY` | `4`     | Maximum active page requests, including preloading and rendering.          |
| `SIGRUN_SSR_QUEUE_SIZE`  | `8`     | Maximum waiting requests; `0` rejects immediately when busy.               |
| `SIGRUN_SSR_TIMEOUT_MS`  | `10000` | Total request budget, including queue time and upstream response decoding. |

A full queue returns HTTP 503 with `Retry-After: 1`. An expired budget returns HTTP 504. Client disconnects and expired budgets abort upstream RPCs. A render slot is
released when its work actually settles, even if an upstream implementation ignores
cancellation. These limits bound pending pages; an individual large response can
still require substantial memory. Benchmark representative traffic before adjusting
the limits. The Vite development server uses client rendering and does not apply
these SSR limits.

### Public game JSON

External tools can fetch a session without authentication using
`GET /api/game/:sessionHash` on the Sigrun host. Use the 40-character lowercase
hexadecimal hash from the game's public link; no event ID is required. For example:

```sh
curl https://rating.pantheon.org/api/game/750cd6015c59aed57ebd9260d03fb80adb3b83f7
```

The response is `application/json` with `Cache-Control: no-store` for both live and
completed games. Poll the same URL to refresh scores; this endpoint does not stream
updates. Its top-level fields are:

| Field                                  | Contents                                                                                                                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sessionHash`, `eventId`, `tableIndex` | Public session hash, owning event, and table index (`null` when unassigned).                                                                                               |
| `players`                              | Players in table order, with `id`, `title`, `hasAvatar`, `lastUpdate`, current `score`, `yakitori`, and optional replacement profile in `replacedBy` (`null` when absent). |
| `state`                                | Current `dealer` (player ID), `roundIndex`, `riichiCount`, `honbaCount`, `scores`, `finished`, `lastHandStarted`, and `chombo`.                                            |
| `timerState`                           | Event timer information, or `null` when unavailable.                                                                                                                       |
| `game`                                 | `sessionHash`, end `date` (`null` while live), `replayLink`, `finalResults`, recorded `rounds`, and public player profiles. Final results are empty until calculated.      |

State, timer, round outcomes, and final-result entries follow the existing
[`Common/proto/atoms.proto`](../Common/proto/atoms.proto) and
[`Common/proto/mimir.proto`](../Common/proto/mimir.proto) JSON shapes, with camelCase
field names. Nested protobuf fields with default values may be omitted. The
top-level `state` counters and flags are always present. Use `players[].score` or
`state.scores` for live points and `game.finalResults` for completed placement and
rating changes. The overview and game details are read sequentially, so a newly
recorded round can appear in game details before the next score refresh.

Only public profile fields (`id`, `title`, `hasAvatar`, `lastUpdate`) are returned;
the internal numeric session ID and round submission token are excluded. Knowing a
session hash grants the same viewing access as the existing public game page.

Errors also return JSON, shaped as
`{"error":{"code":"not_found","message":"Game not found."}}`:

| HTTP status | `error.code`         | Meaning                                                                                          |
| ----------- | -------------------- | ------------------------------------------------------------------------------------------------ |
| 400         | `invalid_argument`   | Missing or malformed session hash.                                                               |
| 404         | `not_found`          | Unknown session hash.                                                                            |
| 405         | `method_not_allowed` | Method other than GET (`Allow: GET`).                                                            |
| 502         | `unavailable`        | Mimir failed, returned invalid JSON/data, or exceeded the 10-second request budget. Retry later. |

The route is implemented in TypeScript in `app/services/gameApi.ts` and covered by
`app/services/gameApi.test.ts`. The normal `./run task Sigrun build` compiles it into
`dist/server/gameApi.js`; the production server loads that middleware on the first
API request. Vite loads the same TypeScript source during development.

The route runs in both the production SSR server and the Vite development server.
Both use `VITE_MIMIR_URL_SSR`, falling back to `VITE_MIMIR_URL`, for server-side
requests through Mimir's existing Twirp JSON API. Deploy the Mimir `not_found`
response change together with Sigrun to distinguish unknown hashes from outages.

### Legend

**Sigrun** (Old Norse "victory rune") is a valkyrie in Norse mythology. See wikipedia for details :)
