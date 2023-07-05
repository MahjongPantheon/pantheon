## Hugin: monitoring tool

**Hugin** is a built-in service providing monitoring and simple analytics for Pantheon.

Hugin includes **[munin](http://munin-monitoring.org/)** service to monitor what's happening inside containers. It's accessible via
port 4011 of the container network, though you will need to set up reverse proxy to access it from the outside. See `nginx-reverse-proxy.example.conf` for examples.

Analytics page can be found at `[forseti_url]/stats`, though, only account with superadmin privileges will have access to it.

Hugin does not collect any private information, and all the analytics are de-personalized. This makes Hugin GDPR-compliant and allowed to be used in EU.

### Legend

**Hugin** is one of two crows of Odin, watching for everything happening across the worlds (**Munin** is the second one :D ). See wikipedia for details :)
