
Api methods
-----------

### getRulesets
 Get available rulesets list


Parameters:

Returns: _string[]_ 

### getTimezones
 Get available timezones.
 If addr is provided, calculate preferred timezone based on IP.


Parameters:
* **$addr** (_string_) 

Returns: _array_ 

Exceptions:
* _\GeoIp2\Exception\AddressNotFoundException_ 
* _\MaxMind\Db\Reader\InvalidDatabaseException_ 

### getCountries
 Get available countries.
 If addr is provided, calculate preferred country based on IP.


Parameters:
* **$addr** (_string_) 

Returns: _array_ 

Exceptions:
* _\GeoIp2\Exception\AddressNotFoundException_ 
* _\MaxMind\Db\Reader\InvalidDatabaseException_ 

### getEvents
 List all available events in system (paginated)


Parameters:
* **$limit** (_int_) 
* **$offset** (_int_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### getEventsById
 List available events by id list


Parameters:
* **$ids** (_array_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### getMyEvents
 Get all active events of current user
 Output: [[id => ... , title => '...', description => '...'], ...]


Parameters:

Returns: _array_ 

Exceptions:
* _\Exception_ 

### getGameConfig
 Get event rules configuration


Parameters:
* **$eventId** (_int_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getRatingTable
 Get rating table for event


Parameters:
* **$eventIdList** (_array_) 
* **$orderBy** (_string_) either 'name', 'rating', 'avg_place' or 'avg_score'
* **$order** (_string_) either 'asc' or 'desc'
* **$withPrefinished** (_bool_) include prefinished games score

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getLastGames
 Get last games for the event


Parameters:
* **$eventIdList** (_array_) 
* **$limit** (_int_) 
* **$offset** (_int_) 
* **$orderBy** (_string_) either 'id' or 'end_date'
* **$order** (_string_) either 'asc' or 'desc'

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getGame
 Get game information


Parameters:
* **$representationalHash** (_string_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getGamesSeries
 Get games series for each player in event


Parameters:
* **$eventId** (_int_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getCurrentGames


Parameters:
* **$playerId** (_int_) 
* **$eventId** (_int_) 

Returns: _array_ of session data

Exceptions:
* _\Exception_ 

### getAllPlayers
 Get all players registered for event


Parameters:
* **$eventIdList** (_array_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### getTimerState


Parameters:
* **$eventId** (_int_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getGameOverview
 Get session overview
 [
      id => sessionId,
      players => [ ..[
          id => playerId,
          display_name,
          ident
      ].. ],
      state => [
          dealer => playerId,
          round => int,
          riichi => [ ..playerId.. ],
          honba => int,
          scores => [ ..int.. ],
          finished => bool,
          penalties => [ playerId => penaltySize, ... ]
      ]
 ]


Parameters:
* **$gameHashCode** (_string_) 

Returns: _array_ 

Exceptions:
* _EntityNotFoundException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### getPlayerStats


Parameters:
* **$playerId** (_int_) player to get stats for
* **$eventIdList** (_int[]_) event to get stats for

Returns: _array_ of statistics

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### addRound
 Add new round to interactive game


Parameters:
* **$gameHashcode** (_string_) Hashcode of game
* **$roundData** (_array_) Structure of round data
* **$dry** (_bool_) Dry run (without saving to db)

Returns: _bool|array_ Results|Results of dry run|False in case of error

Exceptions:
* _BadActionException_ 
* _\Exception_ 

### addOnlineReplay
 Add online replay


Parameters:
* **$eventId** (_int_) 
* **$link** (_string_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 
* _ParseException_ 

### getLastResults
 Get last game results of player in event


Parameters:
* **$playerId** (_int_) 
* **$eventId** (_int_) 

Returns: _array|null_ 

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### getLastRound
 Get last recorded round with player in event


Parameters:
* **$playerId** (_int_) 
* **$eventId** (_int_) 

Returns: _array|null_ 

Exceptions:
* _\Exception_ 

### getAllRounds
 Get all recorded round for session by hashcode


Parameters:
* **$hashcode** (_string_) 

Returns: _array|null_ 

Exceptions:
* _\Exception_ 

### getLastRoundByHash
 Get last recorded round for session by hashcode


Parameters:
* **$hashcode** (_string_) 

Returns: _array|null_ 

Exceptions:
* _\Exception_ 

### getEventForEdit
 Get settings of existing event


Parameters:
* **$id** (_int_) event id

Returns: _array_ 

Exceptions:
* _BadActionException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### createEvent


Parameters:
* **$type** (_string_) Either 'club', 'tournament' or 'online'
* **$title** (_string_) 
* **$description** (_string_) 
* **$ruleset** (_string_) one of possible ruleset names ('ema', 'jpmlA', 'tenhounet', or any other supported by system)
* **$gameDuration** (_int_) duration of game in this event in minutes
* **$timezone** (_string_) name of timezone, 'Asia/Irkutsk' for example
* **$series** (_int_) Length of game series, 0 to disable
* **$minGamesCount** (_int_) Minimum of games to be counted for ratings. 0 to disable.
* **$lobbyId** (_int_) Tenhou lobby id for online tournaments
* **$isTeam** (_bool_) If event is team tournament
* **$isPrescripted** (_bool_) If tournament should have predefined seating

Returns: _int_ 

Exceptions:
* _BadActionException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### updateEvent
 Update settings of existing event


Parameters:
* **$id** (_int_) event id
* **$title** (_string_) 
* **$description** (_string_) 
* **$ruleset** (_string_) one of possible ruleset names ('ema', 'jpmlA', 'tenhounet', or any other supported by system)
* **$gameDuration** (_int_) duration of game in this event in minutes
* **$timezone** (_string_) name of timezone, 'Asia/Irkutsk' for example
* **$series** (_int_) Length of game series, 0 to disable
* **$minGamesCount** (_int_) Minimum of games to be counted for ratings. 0 to disable.
* **$lobbyId** (_int_) Tenhou lobby id for online tournaments
* **$isTeam** (_bool_) If event is team tournament
* **$isPrescripted** (_bool_) If tournament should have predefined seating

Returns: _bool_ 

Exceptions:
* _BadActionException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### finishEvent
 Finish event


Parameters:
* **$eventId** (_int_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getTablesState
 Get tables state in tournament


Parameters:
* **$eventId** (_int_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### startTimer
 Start or restart timer for event


Parameters:
* **$eventId** (_int_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### registerPlayerCP
 Register for participation in event (from admin control panel)


Parameters:
* **$playerId** (_int_) 
* **$eventId** (_int_) 

Returns: _bool_ success?

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### unregisterPlayerCP
 Unregister from participation in event (from admin control panel)


Parameters:
* **$playerId** (_int_) 
* **$eventId** (_int_) 

Returns: _void_ 

Exceptions:
* _\Exception_ 

### updatePlayerSeatingFlagCP
 Update ignore_seating flag for registered player


Parameters:
* **$playerId** (_int_) 
* **$eventId** (_int_) 
* **$ignoreSeating** (_int_) 

Returns: _bool_ 

Exceptions:
* _\Exception_ 

### getAchievements
 Get achievements list for event


Parameters:
* **$eventIdList** (_array_) 
* **$achievementsList** (_array_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getAchievementsList


Parameters:

Returns: _array_ 

Exceptions:
* _AuthFailedException_ 

### toggleHideResults
 Toggle hide results table flag


Parameters:
* **$eventId** (_int_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### updatePlayersLocalIds
 Update static local identifiers for events with predefined seating.


Parameters:
* **$eventId** (_int_) 
* **$idMap** (_array_) Mapping of player_id => local_id

Returns: _bool_ 

Exceptions:
* _AuthFailedException_ 
* _\Exception_ 

### updatePlayerReplacement
 Update replacement_id for registered player.
 Assign -1 to remove replacement.


Parameters:
* **$playerId** (_int_) 
* **$eventId** (_int_) 
* **$replacementId** (_int_) 

Returns: _bool_ 

Exceptions:
* _\Exception_ 

### updatePlayersTeams
 Update team names for events with teams.


Parameters:
* **$eventId** (_int_) 
* **$teamNameMap** (_array_) Mapping of player_id => team_name

Returns: _bool_ 

Exceptions:
* _AuthFailedException_ 
* _\Exception_ 

### startGame
 Start new interactive game and return its hash


Parameters:
* **$eventId** (_int_) Event this session belongs to
* **$players** (_array_) Player id list

Returns: _string_ Hashcode of started game

Exceptions:
* _InvalidUserException_ 
* _DatabaseException_ 
* _\Exception_ 

### endGame
 Explicitly force end of interactive game


Parameters:
* **$gameHashcode** (_string_) Hashcode of game

Returns: _bool_ Success?

Exceptions:
* _\Exception_ 

### cancelGame
 Cancel game which is in progress now


Parameters:
* **$gameHashcode** (_string_) Hashcode of game

Returns: _bool_ Success?

Exceptions:
* _\Exception_ 

### finalizeSessions
 Finalize all pre-finished sessions in interactive tournament


Parameters:
* **$eventId** (_int_) 

Returns: _bool_ Success?

Exceptions:
* _\Exception_ 

### dropLastRound
 Drop last round from selected game
 For interactive mode (tournaments), and only for administrative purposes


Parameters:
* **$gameHashcode** (_string_) 

Returns: _bool_ Success?

Exceptions:
* _\Exception_ 

### definalizeGame
 Definalize session: drop results, set status flag to "in progress"
 For interactive mode (club games), and only for administrative purposes


Parameters:
* **$gameHashcode** (_string_) 

Returns: _boolean_ Success?

Exceptions:
* _\Exception_ 

### addPenalty
 Add penalty in interactive game


Parameters:
* **$eventId** (_int_) Hashcode of game
* **$playerId** (_int_) Id of penalized player
* **$amount** (_int_) Penalty amount
* **$reason** (_string_) Penalty reason

Returns: _bool_ Success?

Exceptions:
* _\Exception_ 

### addPenaltyGame
 Add game with penalty for all players.
 It was added for online tournament needs. Use it on your own risk.


Parameters:
* **$eventId** (_int_) Event this session belongs to
* **$players** (_array_) Player id list

Returns: _string_ Hashcode of added game

Exceptions:
* _InvalidUserException_ 
* _DatabaseException_ 
* _\Exception_ 

### getPlayer
 Get player info by id

Parameters:
* **$id** (_int_) 

Returns: _array_ 

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### getCurrentSeating
 Get current seating in tournament


Parameters:
* **$eventId** (_int_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### makeShuffledSeating
 Make new shuffled seating.
 This will also start games immediately if timer is not used.


Parameters:
* **$eventId** (_int_) 
* **$groupsCount** (_int_) 
* **$seed** (_int_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 
* _AuthFailedException_ 
* _\Exception_ 

### makeSwissSeating
 Make new swiss seating.
 This will also start games immediately if timer is not used.


Parameters:
* **$eventId** (_int_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 
* _AuthFailedException_ 
* _\Exception_ 

### generateSwissSeating
 Generate a new swiss seating.
 It is here because of online tournaments.


Parameters:
* **$eventId** (_int_) 

Returns: _array_ a multidimensional numerically indexed array

Exceptions:
* _AuthFailedException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### makeIntervalSeating
 Make new interval seating.
 This will also start games immediately if timer is not used.


Parameters:
* **$eventId** (_int_) 
* **$step** (_int_) 

Returns: _bool_ 

Exceptions:
* _AuthFailedException_ 
* _DatabaseException_ 
* _InvalidParametersException_ 
* _InvalidUserException_ 
* _\Exception_ 

### makePrescriptedSeating


Parameters:
* **$eventId** (_int_) 
* **$randomizeAtTables** (_bool_) 

Returns: _bool_ 

Exceptions:
* _AuthFailedException_ 
* _DatabaseException_ 
* _InvalidParametersException_ 
* _InvalidUserException_ 
* _\Exception_ 

### getNextPrescriptedSeating
 Get list of tables for next session. Each table is a list of players data.


Parameters:
* **$eventId** (_int_) 

Returns: _array_ 

Exceptions:
* _AuthFailedException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### getPrescriptedEventConfig
 Get prescripted config for event


Parameters:
* **$eventId** (_int_) 

Returns: _mixed_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### updatePrescriptedEventConfig
 Update prescripted config for event


Parameters:
* **$eventId** (_int_) 
* **$nextSessionIndex** (_int_) 
* **$prescript** (_string_) 

Returns: _mixed_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### addErrorLog


Parameters:
* **$facility** (_string_) 
* **$sessionHash** (_string_) 
* **$playerId** (_float_) 
* **$error** (_string_) 
* **$stack** (_string_) 

