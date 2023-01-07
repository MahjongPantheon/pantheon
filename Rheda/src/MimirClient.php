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
     *  Get available rulesets list
     *
     * @return array
    */
    public function getRulesets(): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getRulesets', []);
    }

    /**
     *  Get available timezones.
     *  If addr is provided, calculate preferred timezone based on IP.
     *
     * @param string $addr
     * @return array
    */
    public function getTimezones(string $addr): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getTimezones', [$addr]);
    }

    /**
     *  Get available countries.
     *  If addr is provided, calculate preferred country based on IP.
     *
     * @param string $addr
     * @return array
    */
    public function getCountries(string $addr): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getCountries', [$addr]);
    }

    /**
     *  List all available events in system (paginated)
     *
     * @param int $limit
     * @param int $offset
     * @param bool $filterUnlisted
     * @return array
    */
    public function getEvents(int $limit, int $offset, bool $filterUnlisted): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getEvents', [$limit, $offset, $filterUnlisted]);
    }

    /**
     *  List available events by id list
     *
     * @param array $ids
     * @return array
    */
    public function getEventsById(array $ids): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getEventsById', [$ids]);
    }

    /**
     *  Get all active events of current user
     *  Output: [[id => ... , title => '...', description => '...'], ...]
     *
     * @return array
    */
    public function getMyEvents(): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getMyEvents', []);
    }

    /**
     *  Get event rules configuration
     *
     * @param int $eventId
     * @return array
    */
    public function getGameConfig(int $eventId): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getGameConfig', [$eventId]);
    }

    /**
     *  Get rating table for event
     *
     * @param array $eventIdList
     * @param string $orderBy
     * @param string $order
     * @param bool $withPrefinished
     * @return array
    */
    public function getRatingTable(array $eventIdList, string $orderBy, string $order, bool $withPrefinished): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getRatingTable', [$eventIdList, $orderBy, $order, $withPrefinished]);
    }

    /**
     *  Get last games for the event
     *
     * @param array $eventIdList
     * @param int $limit
     * @param int $offset
     * @param string $orderBy
     * @param string $order
     * @return array
    */
    public function getLastGames(array $eventIdList, int $limit, int $offset, string $orderBy, string $order): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getLastGames', [$eventIdList, $limit, $offset, $orderBy, $order]);
    }

    /**
     *  Get game information
     *
     * @param string $representationalHash
     * @return array
    */
    public function getGame(string $representationalHash): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getGame', [$representationalHash]);
    }

    /**
     *  Get games series for each player in event
     *
     * @param int $eventId
     * @return array
    */
    public function getGamesSeries(int $eventId): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getGamesSeries', [$eventId]);
    }

    /**
     * @param int $playerId
     * @param int $eventId
     * @return array
    */
    public function getCurrentGames(int $playerId, int $eventId): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getCurrentGames', [$playerId, $eventId]);
    }

    /**
     *  Get all players registered for event
     *
     * @param array $eventIdList
     * @return array
    */
    public function getAllPlayers(array $eventIdList): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getAllPlayers', [$eventIdList]);
    }

    /**
     * @param int $eventId
     * @return array
    */
    public function getTimerState(int $eventId): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getTimerState', [$eventId]);
    }

    /**
     *  Get session overview
     *  [
     *       id => sessionId,
     *       players => [ ..[
     *           id => playerId,
     *           title,
     *           ident
     *       ].. ],
     *       state => [
     *           dealer => playerId,
     *           round => int,
     *           riichi => [ ..playerId.. ],
     *           honba => int,
     *           scores => [ ..int.. ],
     *           finished => bool,
     *           penalties => [ playerId => penaltySize, ... ]
     *       ]
     *  ]
     *
     * @param string $gameHashCode
     * @return array
    */
    public function getGameOverview(string $gameHashCode): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getGameOverview', [$gameHashCode]);
    }

    /**
     * @param int $playerId
     * @param int[] $eventIdList
     * @return array
    */
    public function getPlayerStats(int $playerId, array $eventIdList): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getPlayerStats', [$playerId, $eventIdList]);
    }

    /**
     *  Add new round to interactive game
     *
     * @param string $gameHashcode
     * @param array $roundData
     * @param bool $dry
     * @return bool|array
    */
    public function addRound(string $gameHashcode, array $roundData, bool $dry)
    {
        /** @phpstan-ignore-next-line */
        return $this->_client->execute('addRound', [$gameHashcode, $roundData, $dry]);
    }

    /**
     *  Add online replay
     *
     * @param int $eventId
     * @param string $link
     * @return array
    */
    public function addOnlineReplay(int $eventId, string $link): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('addOnlineReplay', [$eventId, $link]);
    }

    /**
     *  Get last game results of player in event
     *
     * @param int $playerId
     * @param int $eventId
     * @return array|null
    */
    public function getLastResults(int $playerId, int $eventId)
    {
        /** @phpstan-ignore-next-line */
        return $this->_client->execute('getLastResults', [$playerId, $eventId]);
    }

    /**
     *  Get last recorded round with player in event
     *
     * @param int $playerId
     * @param int $eventId
     * @return array|null
    */
    public function getLastRound(int $playerId, int $eventId)
    {
        /** @phpstan-ignore-next-line */
        return $this->_client->execute('getLastRound', [$playerId, $eventId]);
    }

    /**
     *  Get all recorded round for session by hashcode
     *
     * @param string $hashcode
     * @return array|null
    */
    public function getAllRounds(string $hashcode)
    {
        /** @phpstan-ignore-next-line */
        return $this->_client->execute('getAllRounds', [$hashcode]);
    }

    /**
     *  Get last recorded round for session by hashcode
     *
     * @param string $hashcode
     * @return array|null
    */
    public function getLastRoundByHash(string $hashcode)
    {
        /** @phpstan-ignore-next-line */
        return $this->_client->execute('getLastRoundByHash', [$hashcode]);
    }

    /**
     *  Get settings of existing event
     *
     * @param int $id
     * @return array
    */
    public function getEventForEdit(int $id): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getEventForEdit', [$id]);
    }

    /**
     * @param int $eventId
     * @return bool
    */
    public function rebuildScoring(int $eventId): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('rebuildScoring', [$eventId]);
    }

    /**
     * @param string $type
     * @param string $title
     * @param string $description
     * @param string $ruleset
     * @param int $gameDuration
     * @param string $timezone
     * @param int $series
     * @param int $minGamesCount
     * @param int $lobbyId
     * @param bool $isTeam
     * @param bool $isPrescripted
     * @param int $autostartTimer
     * @param string $rulesetChangesJson
     * @return int
    */
    public function createEvent(string $type, string $title, string $description, string $ruleset, int $gameDuration, string $timezone, int $series, int $minGamesCount, int $lobbyId, bool $isTeam, bool $isPrescripted, int $autostartTimer, string $rulesetChangesJson): int
    {
        /** @phpstan-ignore-next-line */
        return (int)$this->_client->execute('createEvent', [$type, $title, $description, $ruleset, $gameDuration, $timezone, $series, $minGamesCount, $lobbyId, $isTeam, $isPrescripted, $autostartTimer, $rulesetChangesJson]);
    }

    /**
     *  Update settings of existing event
     *
     * @param int $id
     * @param string $title
     * @param string $description
     * @param string $ruleset
     * @param int $gameDuration
     * @param string $timezone
     * @param int $series
     * @param int $minGamesCount
     * @param int $lobbyId
     * @param bool $isTeam
     * @param bool $isPrescripted
     * @param int $autostartTimer
     * @param string $rulesetChangesJson
     * @return bool
    */
    public function updateEvent(int $id, string $title, string $description, string $ruleset, int $gameDuration, string $timezone, int $series, int $minGamesCount, int $lobbyId, bool $isTeam, bool $isPrescripted, int $autostartTimer, string $rulesetChangesJson): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('updateEvent', [$id, $title, $description, $ruleset, $gameDuration, $timezone, $series, $minGamesCount, $lobbyId, $isTeam, $isPrescripted, $autostartTimer, $rulesetChangesJson]);
    }

    /**
     *  Finish event
     *
     * @param int $eventId
     * @return bool
    */
    public function finishEvent(int $eventId): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('finishEvent', [$eventId]);
    }

    /**
     *  Toggle event visibility on mainpage
     *
     * @param int $eventId
     * @return bool
    */
    public function toggleListed(int $eventId): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('toggleListed', [$eventId]);
    }

    /**
     *  Get tables state in tournament
     *
     * @param int $eventId
     * @return array
    */
    public function getTablesState(int $eventId): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getTablesState', [$eventId]);
    }

    /**
     *  Start or restart timer for event
     *
     * @param int $eventId
     * @return bool
    */
    public function startTimer(int $eventId): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('startTimer', [$eventId]);
    }

    /**
     *  Register for participation in event (from admin control panel)
     *
     * @param int $playerId
     * @param int $eventId
     * @return bool
    */
    public function registerPlayerCP(int $playerId, int $eventId): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('registerPlayerCP', [$playerId, $eventId]);
    }

    /**
     *  Unregister from participation in event (from admin control panel)
     *
     * @param int $playerId
     * @param int $eventId
     * @return void
    */
    public function unregisterPlayerCP(int $playerId, int $eventId): void
    {
        /** @phpstan-ignore-next-line */
        $this->_client->execute('unregisterPlayerCP', [$playerId, $eventId]);
    }

    /**
     *  Update ignore_seating flag for registered player
     *
     * @param int $playerId
     * @param int $eventId
     * @param int $ignoreSeating
     * @return bool
    */
    public function updatePlayerSeatingFlagCP(int $playerId, int $eventId, int $ignoreSeating): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('updatePlayerSeatingFlagCP', [$playerId, $eventId, $ignoreSeating]);
    }

    /**
     *  Get achievements list for event
     *
     * @param array $eventIdList
     * @param array $achievementsList
     * @return array
    */
    public function getAchievements(array $eventIdList, array $achievementsList): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getAchievements', [$eventIdList, $achievementsList]);
    }

    /**
     * @return array
    */
    public function getAchievementsList(): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getAchievementsList', []);
    }

    /**
     *  Toggle hide results table flag
     *
     * @param int $eventId
     * @return bool
    */
    public function toggleHideResults(int $eventId): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('toggleHideResults', [$eventId]);
    }

    /**
     *  Update static local identifiers for events with predefined seating.
     *
     * @param int $eventId
     * @param array $idMap
     * @return bool
    */
    public function updatePlayersLocalIds(int $eventId, array $idMap): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('updatePlayersLocalIds', [$eventId, $idMap]);
    }

    /**
     *  Update replacement_id for registered player.
     *  Assign -1 to remove replacement.
     *
     * @param int $playerId
     * @param int $eventId
     * @param int $replacementId
     * @return bool
    */
    public function updatePlayerReplacement(int $playerId, int $eventId, int $replacementId): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('updatePlayerReplacement', [$playerId, $eventId, $replacementId]);
    }

    /**
     *  Update team names for events with teams.
     *
     * @param int $eventId
     * @param array $teamNameMap
     * @return bool
    */
    public function updatePlayersTeams(int $eventId, array $teamNameMap): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('updatePlayersTeams', [$eventId, $teamNameMap]);
    }

    /**
     *  Start new interactive game and return its hash
     *
     * @param int $eventId
     * @param array $players
     * @return string
    */
    public function startGame(int $eventId, array $players): string
    {
        /** @phpstan-ignore-next-line */
        return (string)$this->_client->execute('startGame', [$eventId, $players]);
    }

    /**
     *  Explicitly force end of interactive game
     *
     * @param string $gameHashcode
     * @return bool
    */
    public function endGame(string $gameHashcode): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('endGame', [$gameHashcode]);
    }

    /**
     *  Cancel game which is in progress now
     *
     * @param string $gameHashcode
     * @return bool
    */
    public function cancelGame(string $gameHashcode): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('cancelGame', [$gameHashcode]);
    }

    /**
     *  Finalize all pre-finished sessions in interactive tournament
     *
     * @param int $eventId
     * @return bool
    */
    public function finalizeSessions(int $eventId): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('finalizeSessions', [$eventId]);
    }

    /**
     *  Drop last round from selected game
     *  For interactive mode (tournaments), and only for administrative purposes
     *
     * @param string $gameHashcode
     * @return bool
    */
    public function dropLastRound(string $gameHashcode): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('dropLastRound', [$gameHashcode]);
    }

    /**
     *  Definalize session: drop results, set status flag to "in progress"
     *  For interactive mode (club games), and only for administrative purposes
     *
     * @param string $gameHashcode
     * @return bool
    */
    public function definalizeGame(string $gameHashcode): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('definalizeGame', [$gameHashcode]);
    }

    /**
     *  Add penalty in interactive game
     *
     * @param int $eventId
     * @param int $playerId
     * @param int $amount
     * @param string $reason
     * @return bool
    */
    public function addPenalty(int $eventId, int $playerId, int $amount, string $reason): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('addPenalty', [$eventId, $playerId, $amount, $reason]);
    }

    /**
     *  Add game with penalty for all players.
     *  It was added for online tournament needs. Use it on your own risk.
     *
     * @param int $eventId
     * @param array $players
     * @return string
    */
    public function addPenaltyGame(int $eventId, array $players): string
    {
        /** @phpstan-ignore-next-line */
        return (string)$this->_client->execute('addPenaltyGame', [$eventId, $players]);
    }

    /**
     *  Get player info by id
     * @param int $id
     * @return array
    */
    public function getPlayer(int $id): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getPlayer', [$id]);
    }

    /**
     *  Get current seating in tournament
     *
     * @param int $eventId
     * @return array
    */
    public function getCurrentSeating(int $eventId): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getCurrentSeating', [$eventId]);
    }

    /**
     *  Make new shuffled seating.
     *  This will also start games immediately if timer is not used.
     *
     * @param int $eventId
     * @param int $groupsCount
     * @param int $seed
     * @return bool
    */
    public function makeShuffledSeating(int $eventId, int $groupsCount, int $seed): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('makeShuffledSeating', [$eventId, $groupsCount, $seed]);
    }

    /**
     *  Make new swiss seating.
     *  This will also start games immediately if timer is not used.
     *
     * @param int $eventId
     * @return bool
    */
    public function makeSwissSeating(int $eventId): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('makeSwissSeating', [$eventId]);
    }

    /**
     *  Reset current seating in case of any mistake
     *
     * @param int $eventId
     * @return void
    */
    public function resetSeating(int $eventId): void
    {
        /** @phpstan-ignore-next-line */
        $this->_client->execute('resetSeating', [$eventId]);
    }

    /**
     *  Generate a new swiss seating.
     *  It is here because of online tournaments.
     *
     * @param int $eventId
     * @return array
    */
    public function generateSwissSeating(int $eventId): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('generateSwissSeating', [$eventId]);
    }

    /**
     *  Make new interval seating.
     *  This will also start games immediately if timer is not used.
     *
     * @param int $eventId
     * @param int $step
     * @return bool
    */
    public function makeIntervalSeating(int $eventId, int $step): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('makeIntervalSeating', [$eventId, $step]);
    }

    /**
     * @param int $eventId
     * @param bool $randomizeAtTables
     * @return bool
    */
    public function makePrescriptedSeating(int $eventId, bool $randomizeAtTables): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('makePrescriptedSeating', [$eventId, $randomizeAtTables]);
    }

    /**
     *  Get list of tables for next session. Each table is a list of players data.
     *
     * @param int $eventId
     * @return array
    */
    public function getNextPrescriptedSeating(int $eventId): array
    {
        /** @phpstan-ignore-next-line */
        return (array)$this->_client->execute('getNextPrescriptedSeating', [$eventId]);
    }

    /**
     *  Get prescripted config for event
     *
     * @param int $eventId
     * @return mixed
    */
    public function getPrescriptedEventConfig(int $eventId)
    {
        /** @phpstan-ignore-next-line */
        return $this->_client->execute('getPrescriptedEventConfig', [$eventId]);
    }

    /**
     *  Update prescripted config for event
     *
     * @param int $eventId
     * @param int $nextSessionIndex
     * @param string $prescript
     * @return mixed
    */
    public function updatePrescriptedEventConfig(int $eventId, int $nextSessionIndex, string $prescript)
    {
        /** @phpstan-ignore-next-line */
        return $this->_client->execute('updatePrescriptedEventConfig', [$eventId, $nextSessionIndex, $prescript]);
    }

    /**
     * @param int $eventId
     * @return bool
    */
    public function initStartingTimer(int $eventId): bool
    {
        /** @phpstan-ignore-next-line */
        return (bool)$this->_client->execute('initStartingTimer', [$eventId]);
    }

    /**
     * @param int $eventId
     * @return int
    */
    public function getStartingTimer(int $eventId): int
    {
        /** @phpstan-ignore-next-line */
        return (int)$this->_client->execute('getStartingTimer', [$eventId]);
    }

    /**
     * @param string $facility
     * @param string $sessionHash
     * @param float $playerId
     * @param string $error
     * @param string $stack
     * @return void
    */
    public function addErrorLog(string $facility, string $sessionHash, float $playerId, string $error, string $stack): void
    {
        /** @phpstan-ignore-next-line */
        $this->_client->execute('addErrorLog', [$facility, $sessionHash, $playerId, $error, $stack]);
    }
}
