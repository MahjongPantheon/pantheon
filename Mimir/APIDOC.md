
Api methods
-----------

### getEvents
Parameters:
* **$limit** (_integer_) 
* **$offset** (_integer_) 

Returns: _array_ 

### getGameConfig
Parameters:
* **$eventId** (_integer_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getRatingTable
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
Parameters:
* **$eventIdList** (_array_) 
* **$limit** (_integer_) 
* **$offset** (_integer_) 
* **$orderBy** (_string_) either 'id' or 'end_date'
* **$order** (_string_) either 'asc' or 'desc'

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getGame
Parameters:
* **$representationalHash** (_string_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getGamesSeries
Parameters:
* **$eventId** (_integer_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getCurrentGames
Parameters:
* **$playerId** (_int_) 
* **$eventId** (_int_) 

Returns: _array_ of session data

### getAllPlayers
Parameters:
* **$eventIdList** (_array_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### getPlayerIdByIdent
Parameters:
* **$playerIdent** (_string_) unique identifying string

Returns: _int_ player id

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### getTimerState
Parameters:
* **$eventId** (_integer_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getGameOverview
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
* **$eventId** (_int_) event to get stats for

Returns: _array_ of statistics

Exceptions:
* _EntityNotFoundException_ 

### addRound
Parameters:
* **$gameHashcode** (_string_) Hashcode of game
* **$roundData** (_array_) Structure of round data
* **$dry** (_boolean_) Dry run (without saving to db)

Returns: _bool|array_ Results|Results of dry run|False in case of error

Exceptions:
* _BadActionException_ 
* _\Exception_ 

### addOnlineReplay
Parameters:
* **$eventId** (_int_) 
* **$link** (_string_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 
* _ParseException_ 

### getLastResults
Parameters:
* **$playerId** (_int_) 
* **$eventId** (_int_) 

Returns: _array|null_ 

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### getLastRound
Parameters:
* **$playerId** (_int_) 
* **$eventId** (_int_) 

Returns: _array|null_ 

Exceptions:
* _\Exception_ 

### getLastRoundByHash
Parameters:
* **$hashcode** (_string_) 

Returns: _array|null_ 

Exceptions:
* _\Exception_ 

### getGameConfigT
Parameters:

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getTimerStateT
Parameters:

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getAllPlayersT
Parameters:

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getTablesStateT
Parameters:

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getCurrentGamesT
Parameters:

Returns: _array_ of session data

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getLastResultsT
Parameters:

Returns: _array|null_ 

Exceptions:
* _InvalidParametersException_ 
* _EntityNotFoundException_ 
* _\Exception_ 

### getLastRoundT
Parameters:

Returns: _array|null_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getPlayerT
Parameters:

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _EntityNotFoundException_ 
* _\Exception_ 

### startGameT
Parameters:
* **$players** (_array_) Player id list

Returns: _string_ Hashcode of started game

Exceptions:
* _InvalidUserException_ 
* _DatabaseException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### createEvent
Parameters:
* **$title** (_string_) 
* **$description** (_string_) 
* **$ruleset** (_string_) one of possible ruleset names ('ema', 'jpmlA', 'tenhounet', or any other supported by system)
* **$gameDuration** (_int_) duration of game in this event in minutes
* **$timezone** (_string_) name of timezone, 'Asia/Irkutsk' for example

Returns: _int_ 

Exceptions:
* _BadActionException_ 
* _InvalidParametersException_ 

### getTablesState
Parameters:
* **$eventId** (_integer_) 
* **$includeAllRounds** (_bool_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### startTimer
Parameters:
* **$eventId** (_integer_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### registerPlayer
Parameters:
* **$pin** (_integer_) 

Returns: _string_ Auth token

Exceptions:
* _\Exception_ 

### registerPlayerCP
Parameters:
* **$playerId** (_integer_) 
* **$eventId** (_integer_) 

Returns: _bool_ success?

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### unregisterPlayerCP
Parameters:
* **$playerId** (_integer_) 
* **$eventId** (_integer_) 

Returns: _void_ 

Exceptions:
* _\Exception_ 

### updatePlayerSeatingFlagCP
Parameters:
* **$playerId** (_integer_) 
* **$eventId** (_integer_) 
* **$ignoreSeating** (_integer_) 

Returns: _bool_ 

Exceptions:
* _\Exception_ 

### enrollPlayerCP
Parameters:
* **$playerId** (_integer_) 
* **$eventId** (_integer_) 

Returns: _string_ Secret pin code for self-registration

Exceptions:
* _AuthFailedException_ 
* _BadActionException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### getAllEnrolled
Parameters:
* **$eventId** (_integer_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### getAchievements
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
Parameters:
* **$eventId** (_integer_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### updatePlayersLocalIds
Parameters:
* **$eventId** (_integer_) 
* **$idMap** (_array_) Mapping of player_id => local_id

Returns: _bool_ 

Exceptions:
* _AuthFailedException_ 
* _\Exception_ 

### updatePlayersTeams
Parameters:
* **$eventId** (_integer_) 
* **$teamNameMap** (_array_) Mapping of player_id => team_name

Returns: _bool_ 

Exceptions:
* _AuthFailedException_ 
* _\Exception_ 

### startGame
Parameters:
* **$eventId** (_int_) Event this session belongs to
* **$players** (_array_) Player id list

Returns: _string_ Hashcode of started game

Exceptions:
* _InvalidUserException_ 
* _DatabaseException_ 
* _\Exception_ 

### endGame
Parameters:
* **$gameHashcode** (_string_) Hashcode of game

Returns: _bool_ Success?

### cancelGame
Parameters:
* **$gameHashcode** (_string_) Hashcode of game

Returns: _bool_ Success?

### finalizeSessions
Parameters:
* **$eventId** (_int_) 

Returns: _bool_ Success?

Exceptions:
* _\Exception_ 

### addTextLog
Parameters:
* **$eventId** (_int_) 
* **$text** (_string_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 
* _ParseException_ 

### dropLastRound
Parameters:
* **$gameHashcode** (_string_) 

Returns: _boolean_ Success?

Exceptions:
* _\Exception_ 

### definalizeGame
Parameters:
* **$gameHashcode** (_string_) 

Returns: _boolean_ Success?

Exceptions:
* _\Exception_ 

### addPenalty
Parameters:
* **$eventId** (_integer_) Hashcode of game
* **$playerId** (_integer_) Id of penalized player
* **$amount** (_integer_) Penalty amount
* **$reason** (_string_) Penalty reason

Returns: _bool_ Success?

Exceptions:
* _\Exception_ 

### addPenaltyGame
Parameters:
* **$eventId** (_int_) Event this session belongs to
* **$players** (_array_) Player id list

Returns: _string_ Hashcode of started game

Exceptions:
* _InvalidUserException_ 
* _DatabaseException_ 
* _\Exception_ 

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
* _AuthFailedException_ 

### updatePlayer
Parameters:
* **$id** (_int_) player to update (required)
* **$ident** (_string_) oauth ident (optional)
* **$alias** (_string_) textlog alias for quicker enter (optional)
* **$displayName** (_string_) how to display player in stats (optional)
* **$tenhouId** (_string_) tenhou username (optional)
* **$isReplacement** (_bool_) flag (optional)

Returns: _int_ player id

Exceptions:
* _EntityNotFoundException_ 
* _MalformedPayloadException_ 
* _AuthFailedException_ 
* _\Exception_ 

### getPlayer
Parameters:
* **$id** (_int_) 

Returns: _array_ 

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### getEverybody
Parameters:

Returns: _array_ 

### getCurrentSeating
Parameters:
* **$eventId** (_integer_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### makeShuffledSeating
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
Parameters:
* **$eventId** (_int_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 
* _AuthFailedException_ 
* _\Exception_ 

### generateSwissSeating
Parameters:
* **$eventId** (_int_) 

Returns: _array_ a multidimensional numerically indexed array

Exceptions:
* _AuthFailedException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### makeIntervalSeating
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
* **$eventId** (_integer_) 
* **$randomizeAtTables** (_boolean_) 

Returns: _bool_ 

Exceptions:
* _AuthFailedException_ 
* _DatabaseException_ 
* _InvalidParametersException_ 
* _InvalidUserException_ 
* _\Exception_ 

### getNextPrescriptedSeating
Parameters:
* **$eventId** (_integer_) 

Returns: _array_ 

Exceptions:
* _AuthFailedException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### getPrescriptedEventConfig
Parameters:
* **$eventId** (_integer_) 

Returns: _mixed_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### updatePrescriptedEventConfig
Parameters:
* **$eventId** (_integer_) 
* **$nextSessionIndex** (_integer_) 
* **$prescript** (_string_) 

Returns: _mixed_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

