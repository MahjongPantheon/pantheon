<?php

namespace Rheda;

/**
* Interface IMimirClient
* THIS IS A GENERATED FILE! DO NOT MODIFY BY HAND, USE bin/clientGen.php
*
* @package Rheda*/
interface IMimirClient
{

    public function __construct(string $apiUrl);

/**
* @return \JsonRPC\Client
*/
    public function getClient();


    /**
     *  List all available events in system (paginated)
     * @param int $limit
     * @param int $offset
     * @return array
    */
    public function getEvents(int $limit, int $offset);

    /**
     *  List available events by id list
     * @param array $ids
     * @return array
    */
    public function getEventsById(array $ids);

    /**
     *  Get all active events of current user
     *  Output: [[id => ... , title => '...', description => '...'], ...]

     * @return array
    */
    public function getMyEvents();

    /**
     *  Get event rules configuration
     * @param int $eventId
     * @return array
    */
    public function getGameConfig(int $eventId);

    /**
     *  Get rating table for event
     * @param array $eventIdList
     * @param string $orderBy
     * @param string $order
     * @param bool $withPrefinished
     * @return array
    */
    public function getRatingTable(array $eventIdList, string $orderBy, string $order, bool $withPrefinished);

    /**
     *  Get last games for the event
     * @param array $eventIdList
     * @param int $limit
     * @param int $offset
     * @param string $orderBy
     * @param string $order
     * @return array
    */
    public function getLastGames(array $eventIdList, int $limit, int $offset, string $orderBy, string $order);

    /**
     *  Get game information
     * @param string $representationalHash
     * @return array
    */
    public function getGame(string $representationalHash);

    /**
     *  Get games series for each player in event
     * @param int $eventId
     * @return array
    */
    public function getGamesSeries(int $eventId);

    /**
     * @param int $playerId
     * @param int $eventId
     * @return array
    */
    public function getCurrentGames(int $playerId, int $eventId);

    /**
     *  Get all players registered for event
     * @param array $eventIdList
     * @return array
    */
    public function getAllPlayers(array $eventIdList);

    /**
     * @param int $eventId
     * @return array
    */
    public function getTimerState(int $eventId);

    /**
     *  Get session overview
     *  [
     *       id => sessionId,
     *       players => [ ..[
     *           id => playerId,
     *           display_name,
     *           ident
     *       ].. ],
     *       state => [
     *           dealer => playerId,
     *           round => int,
     *           riichi => [ ..playerId.. ],
     *           honba => int,
     *           scores => [ ..int.. ],
     *           finished => boolean,
     *           penalties => [ playerId => penaltySize, ... ]
     *       ]
     *  ]
     * @param string $gameHashCode
     * @return array
    */
    public function getGameOverview(string $gameHashCode);

    /**
     * @param int $playerId
     * @param int[] $eventIdList
     * @return array
    */
    public function getPlayerStats(int $playerId, array $eventIdList);

    /**
     *  Add new round to interactive game
     * @param string $gameHashcode
     * @param array $roundData
     * @param bool $dry
     * @return bool|array
    */
    public function addRound(string $gameHashcode, array $roundData, bool $dry);

    /**
     *  Add online replay
     * @param int $eventId
     * @param string $link
     * @return array
    */
    public function addOnlineReplay(int $eventId, string $link);

    /**
     *  Get last game results of player in event
     * @param int $playerId
     * @param int $eventId
     * @return array|null
    */
    public function getLastResults(int $playerId, int $eventId);

    /**
     *  Get last recorded round with player in event
     * @param int $playerId
     * @param int $eventId
     * @return array|null
    */
    public function getLastRound(int $playerId, int $eventId);

    /**
     *  Get last recorded round for session by hashcode
     * @param string $hashcode
     * @return array|null
    */
    public function getLastRoundByHash(string $hashcode);

    /**
     *  Get event rules configuration

     * @return array
    */
    public function getGameConfigT();

    /**

     * @return array
    */
    public function getTimerStateT();

    /**
     *  Get all players registered for event

     * @return array
    */
    public function getAllPlayersT();

    /**
     *  Get tables state in tournament from token

     * @return array
    */
    public function getTablesStateT();

    /**

     * @return array
    */
    public function getCurrentGamesT();

    /**
     *  Get last game results of player in event

     * @return array|null
    */
    public function getLastResultsT();

    /**
     *  Get last recorded round with player in event

     * @return array|null
    */
    public function getLastRoundT();

    /**
     *  Get player info by id

     * @return array
    */
    public function getPlayerT();

    /**
     *  Start new interactive game and return its hash
     * @param array $players
     * @return string
    */
    public function startGameT(array $players);

    /**
     * @param string $title
     * @param string $description
     * @param string $ruleset
     * @param int $gameDuration
     * @param string $timezone
     * @return int
    */
    public function createEvent(string $title, string $description, string $ruleset, int $gameDuration, string $timezone);

    /**
     *  Get tables state in tournament
     * @param int $eventId
     * @return array
    */
    public function getTablesState(int $eventId);

    /**
     *  Start or restart timer for event
     * @param int $eventId
     * @return bool
    */
    public function startTimer(int $eventId);

    /**
     *  Register for participation in event
     * @param string $pin
     * @return string
    */
    public function registerPlayer(string $pin);

    /**
     *  Register for participation in event (from admin control panel)
     * @param int $playerId
     * @param int $eventId
     * @return bool
    */
    public function registerPlayerCP(int $playerId, int $eventId);

    /**
     *  Unregister from participation in event (from admin control panel)
     * @param int $playerId
     * @param int $eventId
     * @return void
    */
    public function unregisterPlayerCP(int $playerId, int $eventId);

    /**
     *  Update ignore_seating flag for registered player
     * @param int $playerId
     * @param int $eventId
     * @param int $ignoreSeating
     * @return bool
    */
    public function updatePlayerSeatingFlagCP(int $playerId, int $eventId, int $ignoreSeating);

    /**
     *  Enroll player to registration lists. Player should make a self-registration after this, or
     *  administrator may approve the player manually, and only after that the player will appear in rating table.
     * @param int $playerId
     * @param int $eventId
     * @return string
    */
    public function enrollPlayerCP(int $playerId, int $eventId);

    /**
     *  Get all players enrolled for event
     * @param int $eventId
     * @return array
    */
    public function getAllEnrolled(int $eventId);

    /**
     *  Get achievements list for event
     * @param array $eventIdList
     * @param array $achievementsList
     * @return array
    */
    public function getAchievements(array $eventIdList, array $achievementsList);

    /**

     * @return array
    */
    public function getAchievementsList();

    /**
     *  Toggle hide results table flag
     * @param int $eventId
     * @return bool
    */
    public function toggleHideResults(int $eventId);

    /**
     *  Update static local identifiers for events with predefined seating.
     * @param int $eventId
     * @param array $idMap
     * @return bool
    */
    public function updatePlayersLocalIds(int $eventId, array $idMap);

    /**
     *  Update team names for events with teams.
     * @param int $eventId
     * @param array $teamNameMap
     * @return bool
    */
    public function updatePlayersTeams(int $eventId, array $teamNameMap);

    /**
     *  Start new interactive game and return its hash
     * @param int $eventId
     * @param array $players
     * @return string
    */
    public function startGame(int $eventId, array $players);

    /**
     *  Explicitly force end of interactive game
     * @param string $gameHashcode
     * @return bool
    */
    public function endGame(string $gameHashcode);

    /**
     *  Cancel game which is in progress now
     * @param string $gameHashcode
     * @return bool
    */
    public function cancelGame(string $gameHashcode);

    /**
     *  Finalize all pre-finished sessions in interactive tournament
     * @param int $eventId
     * @return bool
    */
    public function finalizeSessions(int $eventId);

    /**
     *  Drop last round from selected game
     *  For interactive mode (tournaments), and only for administrative purposes
     * @param string $gameHashcode
     * @return boolean
    */
    public function dropLastRound(string $gameHashcode);

    /**
     *  Add penalty in interactive game
     * @param int $eventId
     * @param int $playerId
     * @param int $amount
     * @param string $reason
     * @return bool
    */
    public function addPenalty(int $eventId, int $playerId, int $amount, string $reason);

    /**
     *  Get player info by id
     * @param int $id
     * @return array
    */
    public function getPlayer(int $id);

    /**
     *  Get all system players
     *  TODO: replace it with some search/autocomplete! Amounts of data might be very large!

     * @return array
    */
    public function getEverybody();

    /**
     *  Get current seating in tournament
     * @param int $eventId
     * @return array
    */
    public function getCurrentSeating(int $eventId);

    /**
     *  Make new shuffled seating.
     *  This will also start games immediately if timer is not used.
     * @param int $eventId
     * @param int $groupsCount
     * @param int $seed
     * @return bool
    */
    public function makeShuffledSeating(int $eventId, int $groupsCount, int $seed);

    /**
     *  Make new swiss seating.
     *  This will also start games immediately if timer is not used.
     * @param int $eventId
     * @return bool
    */
    public function makeSwissSeating(int $eventId);

    /**
     *  Generate a new swiss seating.
     *  It is here because of online tournaments.
     * @param int $eventId
     * @return array
    */
    public function generateSwissSeating(int $eventId);

    /**
     *  Make new interval seating.
     *  This will also start games immediately if timer is not used.
     * @param int $eventId
     * @param int $step
     * @return bool
    */
    public function makeIntervalSeating(int $eventId, int $step);

    /**
     * @param int $eventId
     * @param bool $randomizeAtTables
     * @return bool
    */
    public function makePrescriptedSeating(int $eventId, bool $randomizeAtTables);

    /**
     *  Get list of tables for next session. Each table is a list of players data.
     * @param int $eventId
     * @return array
    */
    public function getNextPrescriptedSeating(int $eventId);

    /**
     *  Get prescripted config for event
     * @param int $eventId
     * @return mixed
    */
    public function getPrescriptedEventConfig(int $eventId);

    /**
     *  Update prescripted config for event
     * @param int $eventId
     * @param int $nextSessionIndex
     * @param string $prescript
     * @return mixed
    */
    public function updatePrescriptedEventConfig(int $eventId, int $nextSessionIndex, string $prescript);
}
