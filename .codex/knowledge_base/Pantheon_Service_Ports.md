# Pantheon service ports

Checked against repository configuration on 22 October 2026. These are configured ports, not a snapshot of running listeners. Paths and source links are relative to this document. Consult this reference before applying changes, verify affected configuration, and update the tables when assignments change.

## Network and host ports

Services communicate on the Compose `internal_net` network (normally `pantheon_internal_net`) using container DNS names and **container ports**. Host publications are separate: for example, Mimir is `http://mimir.pantheon.internal:80` inside the network and `http://127.0.0.1:4001` on the host. Development `.pantheon.local` aliases route to development processes; `.pantheon.internal` names route to production handlers in service Nginx configurations.

The table follows [AMD64 Compose](../../docker-compose-amd64.yml), the source of truth for port mappings; [ARM64 Compose](../../docker-compose-arm64.yml) must match. All entries below use TCP. Every host publication in this table binds to `127.0.0.1` except the development reverse proxy, whose root Makefile publishes `80:80`.

| Service | Container DNS name | Container port | Host port | Purpose |
| --- | --- | --- | --- | --- |
| Mimir | `mimir.pantheon.internal` | 80 | 4001 | Game API via Nginx |
| Sigrun | `sigrun.pantheon.internal` | 80 | 4002 | Public ratings/statistics site via Nginx |
| Tyr | `tyr.pantheon.internal` | 80 | 4003 | Mobile interface via Nginx |
| Frey | `frey.pantheon.internal` | 80 | 4004 | Identity API via Nginx |
| Forseti | `forseti.pantheon.internal` | 80 | 4005 | Administration interface via Nginx |
| Bragi | `bragi.pantheon.internal` | 80 | 4006 | Landing site via Nginx |
| Hermod | `hermod.pantheon.internal` | 80 | 4007 | Mail HTTP endpoint via Nginx |
| Hugin | `hugin.pantheon.internal` | 80 | 4008 | Monitoring/error API via Nginx; `munin.pantheon.internal` alias proxies Prometheus |
| Gullveig | `gullveig.pantheon.internal` | 80 | 4009 | Uploads and file serving via Nginx |
| Skirnir | `skirnir.pantheon.internal` | 80 | 4010 | Notification API via Nginx |
| Fenrir | `fenrir.pantheon.internal` | 80 | 4011 | Playwright UI proxy; Compose `e2e` profile |
| Meili | `meili.pantheon.internal` | 80 | 4012 | GeoIP API via Nginx |
| PostgreSQL | `db.pantheon.internal` | 5432 | 5532 | Shared database server |
| Redis | `redis.pantheon.internal` | 6379 | 6379 | Cache server |
| pgAdmin | `pgadmin.pantheon.internal` / `pga.pantheon.internal` | 80 | 5632 | Database administration UI |
| Grafana | `grafana.pantheon.internal` | 3000 | 3000 | Monitoring UI |
| cAdvisor | `cadvisor.pantheon.internal` | 8080 | 8080 | Container metrics |
| PostgreSQL exporter | `dbwatcher.pantheon.internal` | 9187 | 9187 | Database metrics |
| Dozzle | `dozzle.pantheon.internal` | 8080 | 8050 | Container log UI |
| Development reverse proxy | `pantheon-reverse-proxy-container` | 80 | 80 | Hostname routing into the container network |

The [development reverse proxy](../../Common/ReverseProxy/nginx.conf) forwards ordinary service hostnames to port 80, Grafana to 3000, and Dozzle to 8080. Its lifecycle and publication are in the [root Makefile](../../Makefile). An external production reverse proxy may listen on 80/443; those are deployment entry points, not application worker ports.

## Processes inside service containers

These ports are not separately host-published by Compose unless listed in the next section. Nginx connects to the local workers. Production worker ranges are inclusive. Mimir, Frey, Sigrun and Bragi use eight workers each; Meili uses four; Gullveig, Skirnir and Hermod each run one production worker.

| Service | Development process port | Production process port(s) | Configuration sources |
| --- | --- | --- | --- |
| Mimir | 4001 | 41011–41018 | [Nginx](../../Mimir/mimir-container.nginx.conf), [Supervisor](../../Mimir/supervisord.conf), [server](../../Mimir/src/server.ts) |
| Frey | 4004 | 41041–41048 | [Nginx](../../Frey/frey-container.nginx.conf), [Supervisor](../../Frey/supervisord.conf), [environment loader](../../Frey/app/helpers/env.ts) |
| Sigrun | 4002 (Vite) | 41021–41028 (SSR) | [Vite](../../Sigrun/vite.config.ts), [Nginx](../../Sigrun/sigrun-container.nginx.conf), [Supervisor](../../Sigrun/supervisord.conf) |
| Bragi | 4008 (Vite) | 41081–41088 (SSR) | [Vite](../../Bragi/vite.config.ts), [Nginx](../../Bragi/bragi-container.nginx.conf), [Supervisor](../../Bragi/supervisord.conf) |
| Tyr | 4003 (Vite) | Static files on Nginx port 80 | [Vite](../../Tyr/vite.config.ts), [Nginx](../../Tyr/tyr-container.nginx.conf) |
| Forseti | 4007 (Vite) | Static files on Nginx port 80 | [Vite](../../Forseti/vite.config.ts), [Nginx](../../Forseti/forseti-container.nginx.conf) |
| Skirnir | 4015 | 41151 | [Nginx](../../Skirnir/skirnir-container.nginx.conf), [Supervisor](../../Skirnir/supervisord.conf), [server](../../Skirnir/app/server.ts) |
| Fenrir | 4017 (Playwright UI, when started) | No application production worker | [Makefile](../../Fenrir/Makefile), [Nginx](../../Fenrir/fenrir-container.nginx.conf) |
| Gullveig | 4009 | 41091 | [Nginx](../../Gullveig/gullveig-container.nginx.conf), [Supervisor](../../Gullveig/supervisord.conf), [server](../../Gullveig/src/server.ts) |
| Meili | 4012 | 41121–41124 | [Nginx](../../Meili/meili-container.nginx.conf), [Supervisor](../../Meili/supervisord.conf), [server](../../Meili/src/server.ts) |
| Hermod | 4007 | 41071 | [Nginx](../../Hermod/hermod-container.nginx.conf), [Supervisor](../../Hermod/configs/supervisord.conf), [server](../../Hermod/src/server.ts) |
| Hugin | 9000 (PHP-FPM/FastCGI) | 9000 (PHP-FPM/FastCGI) | Owning service `*-container.nginx.conf`; [shared PHP image](../../Common/Backend/Dockerfile) |
| Hugin Prometheus | 9090 | 9090 | [Supervisor](../../Hugin/supervisord.conf), [Munin Nginx virtual host](../../Hugin/hugin-container.nginx.conf) |
| Hugin node exporter | 9100 | 9100 | [Supervisor](../../Hugin/supervisord.conf), [scrape targets](../../Hugin/config/prometheus_partial_config.conf) |
| Hermod SMTP | 25; 587 submission declared by image | Same; submission depends on mail setup | [Dockerfile](../../Hermod/Dockerfile), [mail setup](../../Hermod/scripts/common-run.sh); neither port is host-published by Compose |
| Hermod OpenDKIM | 8891 (localhost) | 8891 (localhost) | [OpenDKIM configuration](../../Hermod/configs/opendkim.conf) |

Standalone SSR launchers default to Sigrun 4102 and Bragi 4108 when `PORT` is absent ([Sigrun](../../Sigrun/server.js), [Bragi](../../Bragi/server.js)); Supervisor overrides them with the production ranges above. Skirnir's production Supervisor sets `SKIRNIR_PORT=41151`; its server otherwise defaults to 4015. Environment overrides can change process ports, so keep callers and proxy upstreams aligned.

## Tests, debugging, and process control

| Service | Port(s) | Purpose and publication | Configuration sources |
| --- | --- | --- | --- |
| Mimir | 4201 | Development Node inspector; host-published at the same port | [Makefile](../../Mimir/Makefile), Compose |
| Mimir | 4301 | HTTP test server; host-published at the same port. Also mentioned as an optional cron inspector, so these uses must not run together. | [Test server](../../Mimir/src/tests/testserver.ts), [Supervisor comment](../../Mimir/supervisord.conf), Compose |
| Mimir | 4401 | Test-server Node inspector; host-published at the same port | [Makefile](../../Mimir/Makefile), Compose |
| Mimir | 4501 | Optional Jest inspector in a commented Makefile command; host-published at the same port | [Makefile](../../Mimir/Makefile), Compose |
| Frey | 4204 | Development Node inspector; host-published at the same port | [Makefile](../../Frey/Makefile), Compose |
| Frey | 4304 | HTTP test server; no host publication | [Test server](../../Frey/app/tests/testserver.ts) |
| Frey | 4404 | Test-server Node inspector; host-published at the same port | [Makefile](../../Frey/Makefile), Compose |
| Frey | 4504 | Published reservation; no corresponding listener found in current service launch commands | Compose |
| Mimir, Frey | 9001 | Supervisor HTTP control bound to container localhost; no host publication | Respective `supervisord.conf` |
| Bragi | 30012 | Supervisor HTTP control bound to container localhost; no host publication | [Supervisor](../../Bragi/supervisord.conf) |
| Skirnir | 30013 | Supervisor HTTP control bound to container localhost; no host publication | [Supervisor](../../Skirnir/supervisord.conf) |
| Sigrun | 30014 | Supervisor HTTP control bound to container localhost; no host publication | [Supervisor](../../Sigrun/supervisord.conf) |
| Gullveig | 4209 | Development Node inspector; host-published on `127.0.0.1` at the same port | [Makefile](../../Gullveig/Makefile), Compose |
| Gullveig | 30015 | Supervisor HTTP control bound to container localhost; no host publication | [Supervisor](../../Gullveig/supervisord.conf) |
| Hugin | 30016 | Supervisor HTTP control bound to container localhost; no host publication | [Supervisor](../../Hugin/supervisord.conf) |
| Meili | 4212 | Development Node inspector; host-published on `127.0.0.1` at the same port | [Makefile](../../Meili/Makefile), Compose |
| Meili | 30017 | Supervisor HTTP control bound to container localhost; no host publication | [Supervisor](../../Meili/supervisord.conf) |
| Hermod | 4207 | Development Node inspector; host-published on `127.0.0.1` at the same port | [Makefile](../../Hermod/Makefile), Compose |
| Hermod | 30018 | Supervisor HTTP control bound to container localhost; no host publication | [Supervisor](../../Hermod/configs/supervisord.conf) |
| Hugin | 9001 | Xdebug client destination at `172.17.0.1`, enabled by debug setup; not a listener in the PHP container | Respective service Makefile `enable_debug` target |

Compose publishes Mimir 4201/4301/4401/4501 and Frey 4204/4404/4504 on all host interfaces for both TCP and UDP. The actual HTTP/Node inspector listeners use TCP; a published UDP mapping does not imply a UDP listener.

## Applying changes

- Check the owning service's Nginx upstreams, process entry point, Supervisor configuration, Makefile, and callers before changing a port.
- Keep host ports, container ports, and container-local worker ports distinct. Reusing a number in separate containers is normal; reusing a listening port in one container can conflict.
- Apply Compose mapping changes to both architectures, using AMD64 as the source of truth. Update environment examples and reverse-proxy examples when affected, without copying secrets into this document.
- Update this reference alongside configuration changes. Follow [root validation guidance](../../AGENTS.md); documentation checks alone do not establish runtime connectivity.
