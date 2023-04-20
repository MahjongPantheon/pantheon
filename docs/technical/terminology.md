## Pantheon terminology

- **Session** - 1) one particular game with partucilar players; 2) In admin panel
also can be used as a term for a set of games played simultaneously during the tournament;
- **Event** - either a tournament, a local club rating or an online event. 
A _separate rating table_ is a distinctive attribute of an event.
- **Round** - one hand during the session. Round is ended with one or another **outcome** 
(which is recorded into the field with the same name)
- **Session hash, game hash, representational hash** - a unique 24-symbol game identifier.
External spectators and players may know only this hash, the digital identifier is not
accessible outside the game data storage.
- **Player registration** - adding player to the rating table of current event. 
Can be done in Forseti administration service.
- **Player sign up** - adding player to the system. Player may sign up by themselves, or
be registered into the system by chief administrator.
- [Mimir, Frey] **Primitive** - a class with corresponding DB table. One object of primitive class
corresponds one row in that table. There are exceptions, though - for example, in case of
double or triple ron one object oj MultiRoundPrimitive class corresponds to two or three 
rows in `round` table.
- [Tyr] **Primitives** - in Tyr, this term does not carry any meaning :) 
- [Mimir, Frey] **Model** - a class containing a business logic of some aspect of the system. 
At the moment, there is no clear distinction between models and **controllers** in Mimir, though,
in Frey controllers just do some logging and call model methods.
- [Tyr, Forseti] **Service** - an isolated class or a set of functions, responsible for external 
effects, not bound to React.
