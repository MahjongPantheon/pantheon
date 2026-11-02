## Gullveig: file storage

**Gullveig** is a built-in service providing files storage for Pantheon.

### Legend

**Gullveig** is an evil witch and goddess of greed in norse mythology. See wikipedia for details :)

### Runtime and API

Gullveig uses TypeScript on Node.js. nginx serves `/files/` from the existing
`gullveigstorage01` volume and `/static/` from `www/static`, including the shared fonts.
No storage migration is needed.

Uploads require the `X-Internal-Query-Secret` header matching the nonempty
`INTERNAL_QUERY_SECRET` shared with Frey; missing configuration or credentials return
HTTP 403. Clients upload through Frey after its user permission checks. Public reads
of `/files/` and `/static/` continue through nginx.

POST JSON to `/` with `{ "userId": 42, "avatar": "data:image/png;base64,..." }`.
JPEG, PNG and GIF inputs up to 512 KB are cropped to the center and saved as
128×128 JPEGs at `/files/avatars/user_42.jpg` (quality 85). Transparent pixels
render on black and animated GIFs use the first frame. Uploads replace files
atomically. The response is `{ "ok": true }`; invalid uploads return HTTP 400
with `{ "error": "..." }`, and storage failures return HTTP 500.
The nginx request limit is 1 MB to accommodate base64 encoding.

### Development and deployment

Use the same `pantheon-container-base-v4` container as the other Node services.
After updating an existing installation, rebuild/recreate the Gullveig container
with the appropriate Compose file before installing dependencies.

From the repository root:

- `./run deps` installs dependencies from the committed pnpm lockfiles.
- `./run restart-watcher gullveig` starts the TypeScript watcher and Node inspector (host port 4209).
  `bin/pantheon dev` also starts Gullveig with the other services.
- `./run lint gullveig` runs the container checks.
- `./run test gullveig` runs the Vitest upload tests using isolated temporary storage.
  Gullveig is also included in `./run test` and `./run test --verbose`.
- `./run source-prod compile` builds and stages the server in `Gullveig-dist` and
  installs production dependencies. `./run source-prod compile` and `./run e2e prepare` include it.

As with Mimir, the `.local` hostname proxies to the development watcher on port
4009; `.internal` proxies to the compiled server on port 41091. Production runs
as the container's `user`, which owns the avatar directory. Fonts and existing
avatars remain available through nginx independently of the upload server.
