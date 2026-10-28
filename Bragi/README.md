## Bragi: Pantheon landing pages

Bragi uses React 19 and Mantine 9 with `@mantine/emotion` for its existing styles.
The browser and server share the same theme and stylesheet imports. Server renders
use a separate Emotion cache per request and render a full document to collect
React metadata before extracting the hydrated root markup.

Run `make bragi_test` from the repository root for the metadata and route regression
test. Bragi is also included in the root `make test` target.
