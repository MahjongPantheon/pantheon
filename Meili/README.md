## Meili: geoip provider

**Meili** is a built-in service providing geoip data for Pantheon.

### Legend

**Meili** is a god associated with travel in norse mythology. See wikipedia for details :)

### Runtime and API

Meili uses TypeScript on Node.js and reads the existing `bin/GeoLite2-City.mmdb`
with `maxmind`. Each worker opens the database once and reuses its reader.
The country and timezone lists in `src/data` preserve the PHP API's values and
ordering. Update those lists deliberately when updating the available choices.

POST JSON to `/` (including requests without a JSON Content-Type header, as
Forseti sends them):

- `{ "action": "get_countries", "ip": "8.8.8.8" }` returns
  `{ "countries": [{ "code": "AF", "name": "Afghanistan" }, ...], "preferredByIp": "US" }`.
- `{ "action": "get_timezones", "ip": "8.8.8.8" }` returns
  `{ "timezones": ["Africa/Abidjan", ...], "preferredByIp": "America/Chicago" }`.

An omitted, null or empty `ip` uses the connecting peer address forwarded by
nginx in `X-Real-IP`. Explicit invalid, private or unknown IPs produce an empty
preference. Unknown actions return JSON `null`. Invalid requests return HTTP 400.
If the database is unavailable, Meili still returns the lists with empty
preferences and logs the database error at startup.

### Development and deployment

The container uses `pantheon-container-base-v4`, matching Mimir and Gullveig.
Rebuild/recreate the Meili container when migrating from the PHP implementation.

From the repository root:

- `make deps` installs dependencies from the committed pnpm lockfile.
- `make dev_meili` starts the TypeScript watcher on port 4012, with the Node
  inspector on port 4212. `parallel_dev.sh` also starts Meili.
- `make meili_oxlint meili_oxfmt meili_typecheck` runs the container checks.
- `make meili_test` runs Jest API tests and real database lookup regression tests.
  Meili is included in `make test` and `make test_verbose`.
- `make prod_build_meili` stages the compiled server and GeoLite database in
  `Meili-dist` and installs production dependencies. `prod_compile` and
  `e2e_compile` include this build and reload all four workers.

The `.local` hostname routes to the development watcher on port 4012.
The `.internal` hostname uses nginx `least_conn` balancing and upstream keepalive
across four Supervisor-managed workers on ports 41121–41124. Workers run as the
container's `user`. Supervisor control remains on container localhost port 30017.
Host HTTP publication remains `127.0.0.1:4012`, and the inspector publishes
`127.0.0.1:4212`. After changing the GeoLite database, rebuild and reload the
production distribution so all workers use the same database version.
