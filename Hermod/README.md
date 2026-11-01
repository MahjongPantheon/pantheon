## Hermod: mail delivery

Hermod accepts Pantheon's authenticated HTTP mail requests and hands them to the
local Postfix queue. Postfix, OpenDKIM, their startup scripts, environment
settings, queue/configuration volumes, and private key mounts retain their roles.
The HTTP server and development mail-dump utility use TypeScript on Node.js.

### HTTP API

POST `application/x-www-form-urlencoded` data to `/` with:

- `actionkey`: the configured `MAIL_ACTION_KEY` (defaults to `CHANGE_ME`, as before).
- `data`: base64-encoded UTF-8 JSON containing
  `[to, subject, body, headers, additionalParams]`, matching Frey's mailer.

The subject may already be MIME-encoded; the multipart body and header values
are passed to Postfix without rebuilding the email. Supported additional
parameters are `-F "sender name"` and `-f sender@example.org`. They become literal
arguments to `/usr/sbin/sendmail -t -i`; no shell interprets them. Header line
breaks and unsupported options are rejected.

Successful submission returns HTTP 200 with an empty body. An incorrect or
missing key retains the existing `Action key check failed` response and HTTP
200 status. Malformed mail returns HTTP 400; local submission failures return
HTTP 500. Authentication failures never write the supplied or configured key to
a debug file.

`actionkey=...&dump=true` returns the last successfully submitted mail's decoded
text and HTML parts with the existing section labels used by Fenrir. The raw
multipart body remains in `/tmp/last_sent_mail`, replaced atomically after local
submission succeeds. The dump is empty until the first submission. `make
dump_last_mail` from the repository root prints the same contents through the
compiled Node CLI. This cache records queue acceptance, not final delivery.

### Development and deployment

Hermod uses `pantheon-container-base-v4` with the Postfix/OpenDKIM packages added
in its Dockerfile. Rebuild/recreate the Hermod container when migrating from PHP.
Its source mount now includes the whole `Hermod` directory; private keys remain
on their existing dedicated mount.

From the repository root:

- `bin/pantheon deps` installs the committed pnpm dependencies.
- `bin/pantheon restart-watcher hermod` starts the TypeScript watcher on port 4007 and the Node
  inspector on port 4207; `parallel_dev.sh` includes it.
- `bin/pantheon lint hermod` runs the container checks.
- `bin/pantheon test hermod` tests the HTTP contract, MIME dumps and sendmail process
  handling using fake sendmail executables. These tests send no external mail.
  Root `bin/pantheon test` and `bin/pantheon test --verbose` include Hermod.
- `bin/pantheon source-prod compile` stages `server.js` and `dump-mail.js` in `Hermod-dist`.
  `bin/pantheon source-prod compile` and `bin/pantheon e2e prepare` build and reload the server too.

nginx routes `.local` to the development process on 4007 and `.internal` to the
production process on 41071. The host HTTP publication remains 4007; the inspector
publishes 4207 on localhost. Supervisor control uses container localhost 30018.
SMTP ports 25/587 and OpenDKIM's localhost port 8891 keep their existing setup.
For final mail-flow checks, recreate the development containers, start
`parallel_dev.sh`, then run `bin/pantheon e2e dev`.
