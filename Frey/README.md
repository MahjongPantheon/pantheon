## Frey: player authenticity verification & personal info management

![Frey](www/freyhires.png?raw=true "Frey")

**Frey** is a low-level backend for [Mimir](https://github.com/MahjongPantheon/pantheon/tree/master/Mimir) (storage service),
[Tyr](https://github.com/MahjongPantheon/pantheon/tree/master/Tyr) (mobile assistant),
[Forseti](https://github.com/MahjongPantheon/pantheon/tree/master/Forseti) (user profile and administration service), and 
[Sigrun](https://github.com/MahjongPantheon/pantheon/tree/master/Sigrun) (rating tables and visualizations). Frey provides authentication service
and players' personal data storage.

### Features

Frey is a simple authentication service with abilities of personal data storage. This includes:
- Player auth info storage to allow universal log-in within all pantheon services;
- Storage of personal info (like nicknames, avatars, links with social networks, etc).
- ACL abilities: Frey can decide if user can do something or not.
- And many more...

### Developer information

We accept any help with developing, testing and improving our system, so please feel free to create issues or send 
pull requests for missing functionality.

- Remember to use PSR2 coding standards when adding php code.
- The DB migrations are implemented using [Phinx](http://docs.phinx.org), see its documentation for details.

### Legend

**Frey** (or Freyr) is a god in Norse mythology associated with sacral kingship and prosperity, with sunshine
and fair weather. See wikipedia for details :)

