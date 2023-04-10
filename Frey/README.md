## Frey: player authenticity verification & personal info management

![Frey](www/freyhires.png?raw=true "Frey")

**Frey** is a low-level backend for [Mimir](https://github.com/MahjongPantheon/pantheon/tree/master/Mimir),
[Tyr](https://github.com/MahjongPantheon/pantheon/tree/master/Tyr) and 
[Rheda](https://github.com/MahjongPantheon/pantheon/tree/master/Rheda), which provides authentication service
and players' personal data storage. 

Please use our [Bug tracker](https://pantheon.myjetbrains.com/youtrack/issues/) for error reports
and feature requests.

### Features

Frey is a simple authentication service with abilities of personal data storage. This includes:
- Player auth info storage to allow universal log-in within all pantheon services;
- Storage of personal info (like nicknames, avatars, links with social networks, etc).
- ACL abilities: Frey can decide if user can do something or not.
- And many more...

### Technologies of Frey

- Frey uses Twirp protocol to communicate with clients.
- PostgreSQL v12+ and PHP v8.0+ are required to run Frey in standalone mode.
- Nginx is the recommended web server to run Frey. See *nginx.example.conf* file for typical installation nginx config.
- [Api doc here](APIDOC.md)

### Standalone installation

- For standalone installation, run `make deps` from current folder to install all runtime dependencies.
- To configure your Frey instance, see `config/index.php` file, you may want to alter that file, or to make use of
local overrides, as described in the file.
- Make sure you have created database and user for Frey; if you migrated from other database, check that all tables
are owned by your database user. This is required to run migrations. Creating tables in schema other than `public` is
not tested (although may work somehow).
- Run `bin/phinx migrate -e production` to create tables in your database. It requires some `PHINX_DBPROD_FREY_*` environment
variables to be set, see phinx documentation and `phinx.yml` file for details.
- Use `opcache` module to speed up your installation. Recommended default values for opcache are:
    - `opcache.enable=1`
    - `opcache.memory_consumption=128`
    - `opcache.interned_strings_buffer=8`
    - `opcache.max_accelerated_files=4000`
    - `opcache.fast_shutdown=1`  

### Developer information

We accept any help with developing, testing and improving our system, so please feel free to create issues or send 
pull requests for missing functionality.

To start developing the project, make sure you have installed postgresql server, PHP v7.1 or higher and appropriate PDO 
module. Simpler way to start developing using Docker is described in parent folder, take a look at it.
- Use `make apidoc` from current folder to regenerate api methods documentation file.
- Remember to use PSR2 coding standards when adding php code.
- The DB migrations are implemented using [Phinx](http://docs.phinx.org), see its documentation for details.

Nginx is the recommended web server to run Frey. See *nginx.example.com* file for typical installation nginx config.

### Legend

**Frey** (or Freyr) is a god in Norse mythology associated with sacral kingship and prosperity, with sunshine
and fair weather. See wikipedia for details :)

