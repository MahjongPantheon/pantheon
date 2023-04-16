<?php

namespace Rheda;

use Common\GameConfig;

/**
 * @package Rheda
 */
interface IMimirClient
{
    public function __construct(string $apiUrl);

    /**
    * @return \JsonRPC\Client
    */
    public function getClient();

    /**
     *  List all available events in system (paginated)
     *
     * @param int $limit
     * @param int $offset
     * @param bool $filterUnlisted
     * @return array
    */
    public function getEvents(int $limit, int $offset, bool $filterUnlisted): array;

    /**
     *  Get event rules configuration
     *
     * @param int $eventId
     * @return GameConfig
    */
    public function getGameConfig(int $eventId): GameConfig;

    /**
     *  Get rating table for event
     *
     * @param array $eventIdList
     * @param string $orderBy
     * @param string $order
     * @param bool $withPrefinished
     * @return array
    */
    public function getRatingTable(array $eventIdList, string $orderBy, string $order, bool $withPrefinished): array;

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
    public function getLastGames(array $eventIdList, int $limit, int $offset, string $orderBy, string $order): array;

    /**
     *  Get game information
     *
     * @param string $representationalHash
     * @return array
    */
    public function getGame(string $representationalHash): array;

    /**
     *  Get games series for each player in event
     *
     * @param int $eventId
     * @return array
    */
    public function getGamesSeries(int $eventId): array;

    /**
     *  Get all players registered for event
     *
     * @param array $eventIdList
     * @return array
    */
    public function getAllPlayers(array $eventIdList): array;

    /**
     * @param int $eventId
     * @return array
    */
    public function getTimerState(int $eventId): array;

    /**
     * @param int $playerId
     * @param int[] $eventIdList
     * @return array
    */
    public function getPlayerStats(int $playerId, array $eventIdList): array;

    /**
     *  Add online replay
     *
     * @param int $eventId
     * @param string $link
     * @return array
    */
    public function addOnlineReplay(int $eventId, string $link): array;

    /**
     *  Get achievements list for event
     *
     * @param array $eventIdList
     * @param array $achievementsList
     * @return array
    */
    public function getAchievements(array $eventIdList, array $achievementsList): array;

    /**
     *  Get player info by id
     * @param int $id
     * @return array
    */
    public function getPlayer(int $id): array;

    /**
     *  Get current seating in tournament
     *
     * @param int $eventId
     * @return array
    */
    public function getCurrentSeating(int $eventId): array;

    /**
     * @param int $eventId
     * @return int
    */
    public function getStartingTimer(int $eventId): int;
}
