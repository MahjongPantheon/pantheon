## Hugin: monitoring tool

**Hugin** is a built-in service providing monitoring and simple analytics for Pantheon.

Analytics page can be found at `[forseti_url]/stats`, though, only account with superadmin privileges will have access to it.

Analytics retain the existing session identifiers, device/location categories and event metadata. Raw client IPs are used only for GeoIP lookup and are never stored in PostgreSQL or Redis.

### Legend

**Hugin** is one of two crows of Odin, watching for everything happening across the worlds. See wikipedia for details :)

### TypeScript runtime and APIs

The API uses Node.js, Kysely and PostgreSQL. Four Supervisor-managed workers on
ports 41081–41084 share nginx `least_conn` balancing and keepalive connections.
The development server uses port 4008; its inspector uses 4208. Host HTTP
publication remains 4008. Prometheus, node exporter, the Munin proxy and the
Prometheus storage volume keep their existing roles.

Existing interfaces remain available:

- POST `/` accepts analytics JSON (`s`, `si`, `h`, `o`, `d`, `sc`, `l`, `t`, `b`,
  optional `e` and `m`) or an error/source object. Responses remain `ok` or
  `malformed payload`. Error sources cover the existing frontend patterns and
  the Frey/Mimir backend callers.
- POST `/addMetric` accepts `[{ "m": "metric_name", "v": 1, "s": "service" }]`.
- GET `/metrics` exposes `pantheon_*` gauges with the `service` label. Values
  live in the shared Redis registry in `redis.pantheon.internal`, so every worker sees the same data.
- `/v2/common.Hugin/GetLastDay`, `GetLastMonth` and `GetLastYear` retain the
  existing protobuf and Twirp JSON contract. No protocol regeneration is needed.

GeoLite readers and database pools are reused per worker. Ingestion batches up
to 100 rows, flushes partial batches after 10 ms, and returns `ok` only after
PostgreSQL commits. Pending queues are bounded; overload returns HTTP 503 and
write failures return HTTP 500. Shutdown drains queued writes. Each worker uses
at most four PostgreSQL connections by default (`HUGIN_DB_POOL_SIZE` overrides
this). The shared Redis registry uses `HUGIN_REDIS_HOST`/`HUGIN_REDIS_PORT`,
defaulting to `redis.pantheon.internal:6379`; `REDIS_HOST` remains a host fallback.
`HUGIN_REDIS_USER`/`HUGIN_REDIS_PASSWORD` configure authentication, using the same
defaults as Frey/Mimir. Hugin does not run its own Redis server.
Gauges are refreshed by their existing publishers after deployment.

### Database migration and scheduled work

The existing `PHINX_DB_HUGIN_HOST`, `PORT`, `NAME`, `USER` and `PASS` environment
variables still configure PostgreSQL. Run the root `bin/pantheon migrate` flow as before.
The service's `container_migrate` target now runs the Kysely migration CLI.
Its baseline creates the final schema on a new database, or adopts existing
Phinx tables and leaves their data and `phinxlog` history intact. It also applies
the historic text-column widening when needed. Future migrations belong under
`src/migrations`; generated PHP protobuf classes are no longer a dependency.

Cron runs as `user` in both development and production. `cron/run.sh` executes
TypeScript job sources through `tsx` in development and compiled Node jobs from
`Hugin-dist` in production. Development cron tasks require the normal `bin/pantheon dev`
dependency and migration setup, without a production build. The schedule is:

- Daily aggregation at 03:15: upsert the previous calendar day's counts, then
  remove older raw events in the same transaction.
- Monthly aggregation at 04:15 on the fifth: combine the previous calendar
  month's daily rows, upserting the result.
- Error cleanup at 02:38 on the third: retain errors since midnight two days
  earlier, then vacuum the event/error tables.
- Every minute: publish the current system-error count as a shared gauge.

Dates and boundaries use `moment` and `moment-timezone`. `HUGIN_TIMEZONE`
defaults to UTC; cron itself runs in UTC. Aggregation windows are half-open so
midnight belongs to one period, and monthly histogram keys are added once.
Daily/monthly upserts can be rerun safely. Reporting retains the 24-hour,
30-day and 372-day windows of the PHP implementation.

### Development and validation

Rebuild/recreate Hugin's container after migrating from the PHP image, then use
`bin/pantheon deps`, `bin/pantheon migrate` and `bin/pantheon source-prod compile` from the repository root.
The compiled server, migrations, maintenance jobs and GeoLite databases are
staged in `Hugin-dist`; production/e2e compilation includes Hugin automatically.
`bin/pantheon restart-watcher hugin` starts the development watcher; `parallel_dev.sh` includes it.

Run `bin/pantheon lint hugin` and `bin/pantheon test hugin` from the
root. Hugin is also included in `bin/pantheon test` and `bin/pantheon test --verbose`. Its tests
use `PHINX_DB_HUGIN_NAME_UNIT` (default `hugin_unit`), which must be a separate
`_unit` or `_test` database; they never reset the configured application database.
Tests need PostgreSQL and the shared Redis container. They cover real persistence,
Phinx schema adoption, protobuf/JSON APIs, shared metrics, aggregation/retention,
batched write failures, and daylight-saving boundaries.

For final cross-service checks, recreate the development containers, start
`parallel_dev.sh`, then run `bin/pantheon e2e dev`.
