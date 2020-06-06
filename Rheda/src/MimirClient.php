<?php

namespace Rheda;

require_once __DIR__ . '/HttpClient.php'; // TODO: replace with custom jsonrpc httpclient implementation path
require_once __DIR__ . '/interfaces/IMimirClient.php'; // TODO: replace with custom mimir client interface path

/**
 * Class MimirClient
 * THIS IS A GENERATED FILE! DO NOT MODIFY BY HAND, USE bin/clientGen.php
 *
 * @package Rheda */
class MimirClient implements IMimirClient
{
    /**
    * @var \JsonRPC\Client
    */
    protected $_client;

    public function __construct(string $apiUrl)
    {
        $this->_client = new \JsonRPC\Client($apiUrl, false, new HttpClient($apiUrl));
    }

    /**
     * @return \JsonRPC\Client
     */
    public function getClient()
    {
        return $this->_client;
    }

    /**
     *  List all available events in system (paginated)
     * @param int $limit
     * @param int $offset
     * @throws \Exception

     * @return array
     */
    public function getEvents(int $limit, int $offset): array
    {
        return (array)$this->_client->execute('getEvents', [$limit, $offset]);
    }

    /**
     *  List available events by id list
     * @param array $ids
     * @throws \Exception

     * @return array
     */
    public function getEventsById(array $ids): array
    {
        return (array)$this->_client->execute('getEventsById', [$ids]);
    }

    /**
     *  Get all active events of current user
     *  Output: [[id => ... , title => '...', description => '...'], ...]

     * @throws \Exception

     * @return array
     */
    public function getMyEvents(): array
    {
        return (array)$this->_client->execute('getMyEvents', []);
    }

    /**
     *  Get event rules configuration
     * @param int $eventId
     * @throws \Exception

     * @return array
     */
    public function getGameConfig(int $eventId): array
    {
        return (array)$this->_client->execute('getGameConfig', [$eventId]);
    }

    /**
     *  Get rating table for event
     * @param array $eventIdList
     * @param string $orderBy
     * @param string $order
     * @param bool $withPrefinished
     * @throws \Exception

     * @return array
     */
    public function getRatingTable(array $eventIdList, string $orderBy, string $order, bool $withPrefinished): array
    {
        return (array)$this->_client->execute('getRatingTable', [$eventIdList, $orderBy, $order, $withPrefinished]);
    }

    /**
     *  Get last games for the event
     * @param array $eventIdList
     * @param int $limit
     * @param int $offset
     * @param string $orderBy
     * @param string $order
     * @throws \Exception

     * @return array
     */
    public function getLastGames(array $eventIdList, int $limit, int $offset, string $orderBy, string $order): array
    {
        return (array)$this->_client->execute('getLastGames', [$eventIdList, $limit, $offset, $orderBy, $order]);
    }

    /**
     *  Get game information
     * @param string $representationalHash
     * @throws \Exception

     * @return array
     */
    public function getGame(string $representationalHash): array
    {
        return (array)$this->_client->execute('getGame', [$representationalHash]);
    }

    /**
     *  Get games series for each player in event
     * @param int $eventId
     * @throws \Exception

     * @return array
     */
    public function getGamesSeries(int $eventId): array
    {
        return (array)$this->_client->execute('getGamesSeries', [$eventId]);
    }

    /**
     * @param int $playerId
     * @param int $eventId
     * @throws \Exception

     * @return array
     */
    public function getCurrentGames(int $playerId, int $eventId): array
    {
        return (array)$this->_client->execute('getCurrentGames', [$playerId, $eventId]);
    }

    /**
     *  Get all players registered for event
     * @param array $eventIdList
     * @throws \Exception

     * @return array
     */
    public function getAllPlayers(array $eventIdList): array
    {
        return (array)$this->_client->execute('getAllPlayers', [$eventIdList]);
    }

    /**
     * @param int $eventId
     * @throws \Exception

     * @return array
     */
    public function getTimerState(int $eventId): array
    {
        return (array)$this->_client->execute('getTimerState', [$eventId]);
    }

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
     * @throws \Exception

     * @return array
     */
    public function getGameOverview(string $gameHashCode): array
    {
        return (array)$this->_client->execute('getGameOverview', [$gameHashCode]);
    }

    /**
     * @param int $playerId
     * @param int[] $eventIdList
     * @throws \Exception

     * @return array
     */
    public function getPlayerStats(int $playerId, array $eventIdList): array
    {
        return (array)$this->_client->execute('getPlayerStats', [$playerId, $eventIdList]);
    }

    /**
     *  Add new round to interactive game
     * @param string $gameHashcode
     * @param array $roundData
     * @param bool $dry
     * @throws \Exception

     * @return bool|array
     */
    public function addRound(string $gameHashcode, array $roundData, bool $dry)
    {
        return $this->_client->execute('addRound', [$gameHashcode, $roundData, $dry]);
    }

    /**
     *  Add online replay
     * @param int $eventId
     * @param string $link
     * @throws \Exception

     * @return array
     */
    public function addOnlineReplay(int $eventId, string $link): array
    {
        return (array)$this->_client->execute('addOnlineReplay', [$eventId, $link]);
    }

    /**
     *  Get last game results of player in event
     * @param int $playerId
     * @param int $eventId
     * @throws \Exception

     * @return array|null
     */
    public function getLastResults(int $playerId, int $eventId)
    {
        return $this->_client->execute('getLastResults', [$playerId, $eventId]);
    }

    /**
     *  Get last recorded round with player in event
     * @param int $playerId
     * @param int $eventId
     * @throws \Exception

     * @return array|null
     */
    public function getLastRound(int $playerId, int $eventId)
    {
        return $this->_client->execute('getLastRound', [$playerId, $eventId]);
    }

    /**
     *  Get last recorded round for session by hashcode
     * @param string $hashcode
     * @throws \Exception

     * @return array|null
     */
    public function getLastRoundByHash(string $hashcode)
    {
        return $this->_client->execute('getLastRoundByHash', [$hashcode]);
    }

    /**
     *  Get event rules configuration

     * @throws \Exception

     * @return array
     */
    public function getGameConfigT(): array
    {
        return (array)$this->_client->execute('getGameConfigT', []);
    }

    /**

     * @throws \Exception

     * @return array
     */
    public function getTimerStateT(): array
    {
        return (array)$this->_client->execute('getTimerStateT', []);
    }

    /**
     *  Get all players registered for event

     * @throws \Exception

     * @return array
     */
    public function getAllPlayersT(): array
    {
        return (array)$this->_client->execute('getAllPlayersT', []);
    }

    /**
     *  Get tables state in tournament from token

     * @throws \Exception

     * @return array
     */
    public function getTablesStateT(): array
    {
        return (array)$this->_client->execute('getTablesStateT', []);
    }

    /**

     * @throws \Exception

     * @return array
     */
    public function getCurrentGamesT(): array
    {
        return (array)$this->_client->execute('getCurrentGamesT', []);
    }

    /**
     *  Get last game results of player in event

     * @throws \Exception

     * @return array|null
     */
    public function getLastResultsT()
    {
        return $this->_client->execute('getLastResultsT', []);
    }

    /**
     *  Get last recorded round with player in event

     * @throws \Exception

     * @return array|null
     */
    public function getLastRoundT()
    {
        return $this->_client->execute('getLastRoundT', []);
    }

    /**
     *  Get player info by id

     * @throws \Exception

     * @return array
     */
    public function getPlayerT(): array
    {
        return (array)$this->_client->execute('getPlayerT', []);
    }

    /**
     *  Start new interactive game and return its hash
     * @param array $players
     * @throws \Exception

     * @return string
     */
    public function startGameT(array $players): string
    {
        return (string)$this->_client->execute('startGameT', [$players]);
    }

    /**
     * @param string $title
     * @param string $description
     * @param string $ruleset
     * @param int $gameDuration
     * @param string $timezone
     * @throws \Exception

     * @return int
     */
    public function createEvent(string $title, string $description, string $ruleset, int $gameDuration, string $timezone): int
    {
        return (int)$this->_client->execute('createEvent', [$title, $description, $ruleset, $gameDuration, $timezone]);
    }

    /**
     *  Get tables state in tournament
     * @param int $eventId
     * @throws \Exception

     * @return array
     */
    public function getTablesState(int $eventId): array
    {
        return (array)$this->_client->execute('getTablesState', [$eventId]);
    }

    /**
     *  Start or restart timer for event
     * @param int $eventId
     * @throws \Exception

     * @return bool
     */
    public function startTimer(int $eventId): bool
    {
        return (bool)$this->_client->execute('startTimer', [$eventId]);
    }

    /**
     *  Register for participation in event
     * @param string $pin
     * @throws \Exception

     * @return string
     */
    public function registerPlayer(string $pin): string
    {
        return (string)$this->_client->execute('registerPlayer', [$pin]);
    }

    /**
     *  Register for participation in event (from admin control panel)
     * @param int $playerId
     * @param int $eventId
     * @throws \Exception

     * @return bool
     */
    public function registerPlayerCP(int $playerId, int $eventId): bool
    {
        return (bool)$this->_client->execute('registerPlayerCP', [$playerId, $eventId]);
    }

    /**
     *  Unregister from participation in event (from admin control panel)
     * @param int $playerId
     * @param int $eventId
     * @throws \Exception

     * @return void
     */
    public function unregisterPlayerCP(int $playerId, int $eventId): void
    {
        $this->_client->execute('unregisterPlayerCP', [$playerId, $eventId]);
    }

    /**
     *  Update ignore_seating flag for registered player
     * @param int $playerId
     * @param int $eventId
     * @param int $ignoreSeating
     * @throws \Exception

     * @return bool
     */
    public function updatePlayerSeatingFlagCP(int $playerId, int $eventId, int $ignoreSeating): bool
    {
        return (bool)$this->_client->execute('updatePlayerSeatingFlagCP', [$playerId, $eventId, $ignoreSeating]);
    }

    /**
     *  Enroll player to registration lists. Player should make a self-registration after this, or
     *  administrator may approve the player manually, and only after that the player will appear in rating table.
     * @param int $playerId
     * @param int $eventId
     * @throws \Exception

     * @return string
     */
    public function enrollPlayerCP(int $playerId, int $eventId): string
    {
        return (string)$this->_client->execute('enrollPlayerCP', [$playerId, $eventId]);
    }

    /**
     *  Get all players enrolled for event
     * @param int $eventId
     * @throws \Exception

     * @return array
     */
    public function getAllEnrolled(int $eventId): array
    {
        return (array)$this->_client->execute('getAllEnrolled', [$eventId]);
    }

    /**
     *  Get achievements list for event
     * @param array $eventIdList
     * @param array $achievementsList
     * @throws \Exception

     * @return array
     */
    public function getAchievements(array $eventIdList, array $achievementsList): array
    {
        return (array)$this->_client->execute('getAchievements', [$eventIdList, $achievementsList]);
    }

    /**

     * @throws \Exception

     * @return array
     */
    public function getAchievementsList(): array
    {
        return (array)$this->_client->execute('getAchievementsList', []);
    }

    /**
     *  Toggle hide results table flag
     * @param int $eventId
     * @throws \Exception

     * @return bool
     */
    public function toggleHideResults(int $eventId): bool
    {
        return (bool)$this->_client->execute('toggleHideResults', [$eventId]);
    }

    /**
     *  Update static local identifiers for events with predefined seating.
     * @param int $eventId
     * @param array $idMap
     * @throws \Exception

     * @return bool
     */
    public function updatePlayersLocalIds(int $eventId, array $idMap): bool
    {
        return (bool)$this->_client->execute('updatePlayersLocalIds', [$eventId, $idMap]);
    }

    /**
     *  Update team names for events with teams.
     * @param int $eventId
     * @param array $teamNameMap
     * @throws \Exception

     * @return bool
     */
    public function updatePlayersTeams(int $eventId, array $teamNameMap): bool
    {
        return (bool)$this->_client->execute('updatePlayersTeams', [$eventId, $teamNameMap]);
    }

    /**
     *  Start new interactive game and return its hash
     * @param int $eventId
     * @param array $players
     * @throws \Exception

     * @return string
     */
    public function startGame(int $eventId, array $players): string
    {
        return (string)$this->_client->execute('startGame', [$eventId, $players]);
    }

    /**
     *  Explicitly force end of interactive game
     * @param string $gameHashcode
     * @throws \Exception

     * @return bool
     */
    public function endGame(string $gameHashcode): bool
    {
        return (bool)$this->_client->execute('endGame', [$gameHashcode]);
    }

    /**
     *  Cancel game which is in progress now
     * @param string $gameHashcode
     * @throws \Exception

     * @return bool
     */
    public function cancelGame(string $gameHashcode): bool
    {
        return (bool)$this->_client->execute('cancelGame', [$gameHashcode]);
    }

    /**
     *  Finalize all pre-finished sessions in interactive tournament
     * @param int $eventId
     * @throws \Exception

     * @return bool
     */
    public function finalizeSessions(int $eventId): bool
    {
        return (bool)$this->_client->execute('finalizeSessions', [$eventId]);
    }

    /**
     *  Drop last round from selected game
     *  For interactive mode (tournaments), and only for administrative purposes
     * @param string $gameHashcode
     * @throws \Exception

     * @return boolean
     */
    public function dropLastRound(string $gameHashcode): boolean
    {
        return (boolean)$this->_client->execute('dropLastRound', [$gameHashcode]);
    }

    /**
     *  Add penalty in interactive game
     * @param int $eventId
     * @param int $playerId
     * @param int $amount
     * @param string $reason
     * @throws \Exception

     * @return bool
     */
    public function addPenalty(int $eventId, int $playerId, int $amount, string $reason): bool
    {
        return (bool)$this->_client->execute('addPenalty', [$eventId, $playerId, $amount, $reason]);
    }

    /**
     *  Get player info by id
     * @param int $id
     * @throws \Exception

     * @return array
     */
    public function getPlayer(int $id): array
    {
        return (array)$this->_client->execute('getPlayer', [$id]);
    }

    /**
     *  Get all system players
     *  TODO: replace it with some search/autocomplete! Amounts of data might be very large!

     * @throws \Exception

     * @return array
     */
    public function getEverybody(): array
    {
        return (array)$this->_client->execute('getEverybody', []);
    }

    /**
     *  Get current seating in tournament
     * @param int $eventId
     * @throws \Exception

     * @return array
     */
    public function getCurrentSeating(int $eventId): array
    {
        return (array)$this->_client->execute('getCurrentSeating', [$eventId]);
    }

    /**
     *  Make new shuffled seating.
     *  This will also start games immediately if timer is not used.
     * @param int $eventId
     * @param int $groupsCount
     * @param int $seed
     * @throws \Exception

     * @return bool
     */
    public function makeShuffledSeating(int $eventId, int $groupsCount, int $seed): bool
    {
        return (bool)$this->_client->execute('makeShuffledSeating', [$eventId, $groupsCount, $seed]);
    }

    /**
     *  Make new swiss seating.
     *  This will also start games immediately if timer is not used.
     * @param int $eventId
     * @throws \Exception

     * @return bool
     */
    public function makeSwissSeating(int $eventId): bool
    {
        return (bool)$this->_client->execute('makeSwissSeating', [$eventId]);
    }

    /**
     *  Generate a new swiss seating.
     *  It is here because of online tournaments.
     * @param int $eventId
     * @throws \Exception

     * @return array
     */
    public function generateSwissSeating(int $eventId): array
    {
        return (array)$this->_client->execute('generateSwissSeating', [$eventId]);
    }

    /**
     *  Make new interval seating.
     *  This will also start games immediately if timer is not used.
     * @param int $eventId
     * @param int $step
     * @throws \Exception

     * @return bool
     */
    public function makeIntervalSeating(int $eventId, int $step): bool
    {
        return (bool)$this->_client->execute('makeIntervalSeating', [$eventId, $step]);
    }

    /**
     * @param int $eventId
     * @param bool $randomizeAtTables
     * @throws \Exception

     * @return bool
     */
    public function makePrescriptedSeating(int $eventId, bool $randomizeAtTables): bool
    {
        return (bool)$this->_client->execute('makePrescriptedSeating', [$eventId, $randomizeAtTables]);
    }

    /**
     *  Get list of tables for next session. Each table is a list of players data.
     * @param int $eventId
     * @throws \Exception

     * @return array
     */
    public function getNextPrescriptedSeating(int $eventId): array
    {
        return (array)$this->_client->execute('getNextPrescriptedSeating', [$eventId]);
    }

    /**
     *  Get prescripted config for event
     * @param int $eventId
     * @throws \Exception

     * @return mixed
     */
    public function getPrescriptedEventConfig(int $eventId)
    {
        return $this->_client->execute('getPrescriptedEventConfig', [$eventId]);
    }

    /**
     *  Update prescripted config for event
     * @param int $eventId
     * @param int $nextSessionIndex
     * @param string $prescript
     * @throws \Exception

     * @return mixed
     */
    public function updatePrescriptedEventConfig(int $eventId, int $nextSessionIndex, string $prescript)
    {
        return $this->_client->execute('updatePrescriptedEventConfig', [$eventId, $nextSessionIndex, $prescript]);
    }
}
