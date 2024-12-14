## List of Pantheon subsystems

### Main services

- **Mimir** is a specialized backend database containing all games data and statistics.
- **Frey** is a backend for authorization and personal data management.
- **Tyr** is assistant app, which provides game overview and automated scoring abilities for every player using their handheld device.
- **Sigrun** is a server-side rendered web application aimed to show Mimir's data pretty and conveniently. It includes rating tables, statistics, graphs, last games and achievements.
- **Forseti** is an administration panel and user profile management tool.

#### Minor services

- **Bragi** is this landing page with information about the system
- **Gullveig** is a simple storage for user generated content (at the moment, mostly user avatars).
- **Hermod** is a pantheon mail service (optional, may be replaced with external IMAP service).
- **Hugin** is a monitoring service, which includes prometheus setup and also collects errors from all pantheon frontends.
