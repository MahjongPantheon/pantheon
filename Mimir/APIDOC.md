
Api methods
-----------

### getGameConfig
Parameters:
* **$eventId** (_integer_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### getRatingTable
Parameters:
* **$eventId** (_integer_) 
* **$orderBy** (_string_) either 'name', 'rating', 'avg_place' or 'avg_score'
* **$order** (_string_) either 'asc' or 'desc'

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### getLastGames
Parameters:
* **$eventId** (_integer_) 
* **$limit** (_integer_) 
* **$offset** (_integer_) 
* **$orderBy** (_string_) either 'id' or 'end_date'
* **$order** (_string_) either 'asc' or 'desc'

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### getGame
Parameters:
* **$representationalHash** (_string_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### getGamesSeries
Parameters:
* **$eventId** (_integer_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### getCurrentGames
Parameters:
* **$playerId** (_int_) 
* **$eventId** (_int_) 

Returns: _array_ of session data

Exceptions:
* _AuthFailedException_ 

### getAllPlayers
Parameters:
* **$eventId** (_integer_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### getPlayerIdByIdent
Parameters:
* **$playerIdent** (_string_) unique identifying string

Returns: _int_ player id

Exceptions:
* _EntityNotFoundException_ 

### getTimerState
Parameters:
* **$eventId** (_integer_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### getGameOverview
Parameters:
* **$gameHashCode** (_string_) 

Returns: _array_ 

Exceptions:
* _EntityNotFoundException_ 
* _InvalidParametersException_ 

### getPlayerStats
Parameters:
* **$playerId** (_int_) player to get stats for
* **$eventId** (_int_) event to get stats for

Returns: _array_ of statistics

Exceptions:
* _EntityNotFoundException_ 

### addRound
Parameters:
* **$gameHashcode** (_string_) Hashcode of game
* **$roundData** (_array_) Structure of round data
* **$dry** (_boolean_) Dry run (without saving to db)

Returns: _bool|array_ Success|Results of dry run

Exceptions:
* _DatabaseException_ 
* _BadActionException_ 

### addOnlineReplay
Parameters:
* **$eventId** (_int_) 
* **$link** (_string_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 
* _ParseException_ 

### getLastResults
Parameters:
* **$playerId** (_int_) 
* **$eventId** (_int_) 

Returns: _array|null_ 

Exceptions:
* _EntityNotFoundException_ 

### getLastRound
Parameters:
* **$playerId** (_int_) 
* **$eventId** (_int_) 

Returns: _array|null_ 

Exceptions:
* _EntityNotFoundException_ 

### getLastRoundByHash
Parameters:
* **$hashcode** (_string_) 

Returns: _array|null_ 

Exceptions:
* _EntityNotFoundException_ 

### getGameConfigT
Parameters:

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### getTimerStateT
Parameters:

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### getAllPlayersT
Parameters:

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### getTablesStateT
Parameters:

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### getCurrentGamesT
Parameters:

Returns: _array_ of session data

Exceptions:
* _AuthFailedException_ 
* _InvalidParametersException_ 

### getLastResultsT
Parameters:

Returns: _array|null_ 

Exceptions:
* _InvalidParametersException_ 
* _EntityNotFoundException_ 

### getLastRoundT
Parameters:

Returns: _array|null_ 

Exceptions:
* _InvalidParametersException_ 
* _EntityNotFoundException_ 

### getPlayerT
Parameters:

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _EntityNotFoundException_ 

### startGameT
Parameters:
* **$players** (_array_) Player id list

Returns: _string_ Hashcode of started game

Exceptions:
* _InvalidUserException_ 
* _DatabaseException_ 
* _InvalidParametersException_ 

### createEvent
Parameters:
* **$title** (_string_) 
* **$description** (_string_) 
* **$type** (_string_) either 'online' or 'offline' or 'offline_interactive_tournament'
* **$ruleset** (_string_) one of possible ruleset names ('ema', 'jpmlA', 'tenhounet', or any other supported by system)
* **$gameDuration** (_int_) duration of game in this event in minutes
* **$timezone** (_string_) name of timezone, 'Asia/Irkutsk' for example

Returns: _int_ 

Exceptions:
* _BadActionException_ 

### getTablesState
Parameters:
* **$eventId** (_integer_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### startTimer
Parameters:
* **$eventId** (_integer_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 

### registerPlayer
Parameters:
* **$pin** (_integer_) 

Returns: _string_ Auth token

Exceptions:
* _InvalidParametersException_ 

### registerPlayerCP
Parameters:
* **$playerId** (_integer_) 
* **$eventId** (_integer_) 

Returns: _bool_ success?

Exceptions:
* _InvalidParametersException_ 

### unregisterPlayerCP
Parameters:
* **$playerId** (_integer_) 
* **$eventId** (_integer_) 

Returns: _void_ 

Exceptions:
* _InvalidParametersException_ 

### enrollPlayerCP
Parameters:
* **$playerId** (_integer_) 
* **$eventId** (_integer_) 

Returns: _string_ Secret pin code for self-registration

Exceptions:
* _AuthFailedException_ 
* _BadActionException_ 
* _InvalidParametersException_ 

### getAllEnrolled
Parameters:
* **$eventId** (_integer_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### getAchievements
Parameters:
* **$eventId** (_integer_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### toggleHideResults
Parameters:
* **$eventId** (_integer_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 

### startGame
Parameters:
* **$eventId** (_int_) Event this session belongs to
* **$players** (_array_) Player id list

Returns: _string_ Hashcode of started game

Exceptions:
* _InvalidUserException_ 
* _DatabaseException_ 

### endGame
Parameters:
* **$gameHashcode** (_string_) Hashcode of game

Returns: _bool_ Success?

Exceptions:
* _DatabaseException_ 
* _BadActionException_ 

### addTextLog
Parameters:
* **$eventId** (_int_) 
* **$text** (_string_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 
* _ParseException_ 

### dropLastRound
Parameters:
* **$gameHashcode** (_string_) 

Returns: _boolean_ Success?

### addPenalty
Parameters:
* **$eventId** (_integer_) Hashcode of game
* **$playerId** (_integer_) Id of penalized player
* **$amount** (_integer_) Penalty amount
* **$reason** (_string_) Panelty reason

Returns: _bool_ Success?

Exceptions:
* _DatabaseException_ 
* _BadActionException_ 

### addPlayer
Parameters:
* **$ident** (_string_) oauth ident, if any
* **$alias** (_string_) textlog alias for quicker enter
* **$displayName** (_string_) how to display player in stats
* **$tenhouId** (_string_) tenhou username

Returns: _int_ player id

Exceptions:
* _MalformedPayloadException_ 
* _InvalidUserException_ 

### updatePlayer
Parameters:
* **$id** (_int_) player to update
* **$ident** (_string_) oauth ident, if any
* **$alias** (_string_) textlog alias for quicker enter
* **$displayName** (_string_) how to display player in stats
* **$tenhouId** (_string_) tenhou username

Returns: _int_ player id

Exceptions:
* _EntityNotFoundException_ 
* _MalformedPayloadException_ 

### getPlayer
Parameters:
* **$id** (_int_) 

Returns: _array_ 

Exceptions:
* _EntityNotFoundException_ 

### getEverybody
Parameters:

Returns: _array_ 

### generateSeating
Parameters:
* **$eventId** (_int_) 
* **$groupsCount** (_int_) 
* **$seed** (_int_) 

Returns: _array_ 

Exceptions:
* _AuthFailedException_ 
* _InvalidParametersException_ 

### getCurrentSeating
Parameters:
* **$eventId** (_integer_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### startGamesWithSeating
Parameters:
* **$eventId** (_int_) 
* **$groupsCount** (_int_) 
* **$seed** (_int_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 
* _AuthFailedException_ 

### startGamesWithSwissSeating
Parameters:
* **$eventId** (_int_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 
* _AuthFailedException_ 

### startGamesWithManualSeating
Parameters:
* **$eventId** (_int_) 
* **$tablesDescription** (_string_) 
* **$randomize** (_boolean_) - randomize each table by winds

Returns: _bool_ 

Exceptions:
* _AuthFailedException_ 
* _DatabaseException_ 
* _InvalidParametersException_ 
* _InvalidUserException_ 

