<?php
/*  Mimir: mahjong games storage
 *  Copyright (C) 2016  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
namespace Mimir;

require_once __DIR__ . '/../Primitive.php';
require_once __DIR__ . '/PlayerRegistration.php';
require_once __DIR__ . '/../Ruleset.php';

/**
 * Class EventPrimitive
 *
 * Low-level model with basic CRUD operations and relations
 * @package Mimir
 */
class EventPrimitive extends Primitive
{
    protected static $_table = 'event';
    const REL_USER = 'event_registered_players';

    protected static $_fieldsMapping = [
        'id'                => '_id',
        'title'             => '_title',
        'description'       => '_description',
        'start_time'        => '_startTime',
        'end_time'          => '_endTime',
        'game_duration'     => '_gameDuration',
        'last_timer'        => '_lastTimer',
        'owner_formation'   => '_ownerFormationId',
        'owner_player'      => '_ownerPlayerId',
        'type'              => '_type', // DEPRECATED: to be removed in 2.x
        'is_online'         => '_isOnline',
        'is_textlog'        => '_isTextlog',
        'sync_start'        => '_syncStart',
        'sync_end'          => '_syncEnd',
        'auto_seating'      => '_autoSeating',
        'sort_by_games'     => '_sortByGames',
        'use_timer'         => '_useTimer',
        'use_penalty'       => '_usePenalty',
        'allow_player_append' => '_allowPlayerAppend',
        'stat_host'         => '_statHost',
        'lobby_id'          => '_lobbyId',
        'ruleset'           => '_ruleset',
        'timezone'          => '_timezone',
        'series_length'     => '_seriesLength',
        'games_status'      => '_gamesStatus',
        'hide_results'      => '_hideResults',
        'is_prescripted'    => '_isPrescripted',
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_ownerFormationId'   => $this->_integerTransform(true),
            '_ownerPlayerId'      => $this->_integerTransform(true),
            '_startTime'          => $this->_stringTransform(true),
            '_endTime'            => $this->_stringTransform(true),
            '_gameDuration'       => $this->_integerTransform(true),
            '_lastTimer'          => $this->_integerTransform(true),
            '_id'                 => $this->_integerTransform(true),
            '_lobbyId'            => $this->_integerTransform(true),
            '_type'               => $this->_stringTransform(), // DEPRECATED: to be removed in 2.x
            '_isOnline'           => $this->_integerTransform(),
            '_isTextlog'          => $this->_integerTransform(),
            '_isPrescripted'      => $this->_integerTransform(),
            '_syncStart'          => $this->_integerTransform(),
            '_syncEnd'            => $this->_integerTransform(),
            '_autoSeating'        => $this->_integerTransform(),
            '_sortByGames'        => $this->_integerTransform(),
            '_allowPlayerAppend'  => $this->_integerTransform(),
            '_timezone'           => $this->_stringTransform(),
            '_useTimer'           => $this->_integerTransform(),
            '_usePenalty'         => $this->_integerTransform(),
            '_statHost'           => $this->_stringTransform(),
            '_seriesLength'       => $this->_integerTransform(),
            '_gamesStatus'        => $this->_stringTransform(true),
            '_hideResults'        => $this->_integerTransform(),
            '_ruleset'            => [
                'serialize' => function (Ruleset $rules) {
                    return $rules->title();
                },
                'deserialize' => function ($rulesId) {
                    return Ruleset::instance($rulesId);
                }
            ]
        ];
    }

    /**
     * Local id
     * @var int
     */
    protected $_id;
    /**
     * Event title
     * @var string
     */
    protected $_title;
    /**
     * Event description
     * @var string
     */
    protected $_description;
    /**
     * Start date and time
     * @var string
     */
    protected $_startTime;
    /**
     * End date and time
     * @var string
     */
    protected $_endTime;
    /**
     * Host of statistics frontend
     * @var string
     */
    protected $_statHost;
    /**
     * Last triggered timer timestamp
     * @var int
     */
    protected $_lastTimer;
    /**
     * Timer red zone amount in seconds, or null to disable
     * @var int|null
     */
    protected $_redZone;
    /**
     * Game duration for current event, in minutes
     * @var int
     */
    protected $_gameDuration;
    /**
     * Timezone description string (like UTC or Europe/Moscow)
     * @var string
     */
    protected $_timezone;
    /**
     * Owner organisation
     * @var FormationPrimitive|null
     */
    protected $_ownerFormation = null;
    /**
     * Owner organisation id
     * @var int
     */
    protected $_ownerFormationId;
    /**
     * Owner player
     * @var PlayerPrimitive|null
     */
    protected $_ownerPlayer = null;
    /**
     * Owner player id
     * @var int
     */
    protected $_ownerPlayerId;
    /**
     * Event type: online/offline, tournament/simple, etc
     * @deprecated to be removed in 2.x
     * @var int
     */
    protected $_type;
    /**
     * should tables start synchronously or not (if not, players may start games when they want)
     * @var int
     */
    protected $_syncStart;
    /**
     * Should tables finish synchronously or not: if yes, when out of time, table will
     * be taken into 'pre-finished' state. Last round may be cancelled in this state.
     * @var integer
     */
    protected $_syncEnd;
    /**
     * enable automatic seating feature. Disabled if allow_player_append == true.
     * @var int
     */
    protected $_autoSeating;
    /**
     * if true, players' rating table is sorted by games count first.
     * @var int
     */
    protected $_sortByGames;
    /**
     * if true, new player may join event even if some games are already finished. Also, if true, games may
     * be started only manually, and even when players count is not divisible by 4.
     * @var int
     */
    protected $_allowPlayerAppend;
    /**
     * if true, event is treated as online (paifu log parser is used). Disabled if is_textlog = true
     * @var int
     */
    protected $_isOnline;
    /**
     * if true, timer is shown in mobile app, also timer page is available in administration tools
     * @var int
     */
    protected $_useTimer;
    /**
     * if true, penalty page is available in administration tools
     * @var int
     */
    protected $_usePenalty;
    /**
     * if true, non-interactive text log parser is used. For offline games.
     * @var int
     */
    protected $_isTextlog;
    /**
     * if true, event seating is predefined and no manual or automatic seating abilities are provided
     * @var int
     */
    protected $_isPrescripted;
    /**
     * Tenhou lobby id (for online events)
     * @var int
     */
    protected $_lobbyId;
    /**
     * Rules to apply to the event
     * @var Ruleset
     */
    protected $_ruleset;
    /**
     * How many games should be in the series
     * @var integer
     */
    protected $_seriesLength;
    /**
     * Should be rating table hidden or not
     * @var integer
     */
    protected $_hideResults;
    /**
     * Status of games in event: one of
     * - seating_ready
     * - started
     * - NULL
     * In club events without timer should be null
     * @var string
     */
    protected $_gamesStatus = null;
    const GS_SEATING_READY = 'seating_ready';
    const GS_STARTED = 'started';

    public function __construct(IDb $db)
    {
        parent::__construct($db);
        $this->_startTime = date('Y-m-d H:i:s'); // may be actualized on restore
    }

    /**
     * Find events by local ids (primary key)
     *
     * @param IDb $db
     * @param int[] $ids
     * @throws \Exception
     * @return EventPrimitive[]
     */
    public static function findById(IDb $db, $ids)
    {
        return self::_findBy($db, 'id', $ids);
    }

    /**
     * Find events by lobby (indexed search)
     *
     * @param IDb $db
     * @param string[] $lobbyList
     * @throws \Exception
     * @return EventPrimitive[]
     */
    public static function findByLobby(IDb $db, $lobbyList)
    {
        // TODO: All games in lobby are likely to be too much. Make pagination here.
        return self::_findBy($db, 'lobby_id', $lobbyList);
    }

    protected function _create()
    {
        $session = $this->_db->table(self::$_table)->create();
        $success = $this->_save($session);
        if ($success) {
            $this->_id = $this->_db->lastInsertId();
        }

        return $success;
    }

    protected function _deident()
    {
        $this->_id = null;
    }

    /**
     * @param string $description
     * @return EventPrimitive
     */
    public function setDescription($description)
    {
        $this->_description = $description;
        return $this;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->_description;
    }

    /**
     * @param string $endTime
     * @return EventPrimitive
     */
    public function setEndTime($endTime)
    {
        $this->_endTime = $endTime;
        return $this;
    }

    /**
     * @return string
     */
    public function getEndTime()
    {
        return $this->_endTime;
    }

    /**
     * @param string $redZone
     * @return EventPrimitive
     */
    public function setRedZone($redZone)
    {
        $this->_redZone = $redZone;
        return $this;
    }

    /**
     * Timer red zone in seconds
     * @return string
     */
    public function getRedZone()
    {
        return $this->_redZone;
    }

    /**
     * @param int $gameDuration in minutes
     * @return EventPrimitive
     */
    public function setGameDuration($gameDuration)
    {
        $this->_gameDuration = $gameDuration;
        return $this;
    }

    /**
     * Game duration in minutes
     * @return int
     */
    public function getGameDuration()
    {
        return $this->_gameDuration;
    }

    /**
     * @param int $lastTimer
     * @return EventPrimitive
     */
    public function setLastTimer($lastTimer)
    {
        $this->_lastTimer = $lastTimer;
        return $this;
    }

    /**
     * @return int
     */
    public function getLastTimer()
    {
        return $this->_lastTimer;
    }

    /**
     * @param string $timezone
     * @return EventPrimitive
     */
    public function setTimezone($timezone)
    {
        $this->_timezone = $timezone;
        return $this;
    }

    /**
     * @return string
     */
    public function getTimezone()
    {
        return $this->_timezone;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * @return Ruleset
     */
    public function getRuleset()
    {
        return $this->_ruleset;
    }

    /**
     * @param Ruleset $rules
     * @return EventPrimitive
     */
    public function setRuleset(Ruleset $rules)
    {
        $this->_ruleset = $rules;
        return $this;
    }

    /**
     * @param int $lobbyId
     * @return EventPrimitive
     */
    public function setLobbyId($lobbyId)
    {
        $this->_lobbyId = $lobbyId;
        return $this;
    }

    /**
     * @return int
     */
    public function getLobbyId()
    {
        return $this->_lobbyId;
    }

    /**
     * @param null|\Mimir\FormationPrimitive $ownerFormation
     * @return EventPrimitive
     */
    public function setOwnerFormation(FormationPrimitive $ownerFormation)
    {
        $this->_ownerFormation = $ownerFormation;
        $this->_ownerFormationId = $ownerFormation->getId();
        return $this;
    }

    /**
     * @throws EntityNotFoundException
     * @return null|\Mimir\FormationPrimitive
     */
    public function getOwnerFormation()
    {
        if (!$this->_ownerFormation) {
            $foundFormations = FormationPrimitive::findById($this->_db, [$this->_ownerFormationId]);
            if (empty($foundFormations)) {
                throw new EntityNotFoundException("Entity FormationPrimitive with id#" . $this->_ownerFormationId . ' not found in DB');
            }
            $this->_ownerFormation = $foundFormations[0];
        }
        return $this->_ownerFormation;
    }

    /**
     * @return int
     */
    public function getOwnerFormationId()
    {
        return $this->_ownerFormationId;
    }

    /**
     * @param null|\Mimir\PlayerPrimitive $ownerPlayer
     * @return EventPrimitive
     */
    public function setOwnerPlayer(PlayerPrimitive $ownerPlayer)
    {
        $this->_ownerPlayer = $ownerPlayer;
        $this->_ownerPlayerId = $ownerPlayer->getId();
        return $this;
    }

    /**
     * @throws EntityNotFoundException
     * @return null|\Mimir\PlayerPrimitive
     */
    public function getOwnerPlayer()
    {
        if (!$this->_ownerPlayer) {
            $foundPlayers = PlayerPrimitive::findById($this->_db, [$this->_ownerPlayerId]);
            if (empty($foundPlayers)) {
                throw new EntityNotFoundException("Entity PlayerPrimitive with id#" . $this->_ownerPlayerId . ' not found in DB');
            }
            $this->_ownerPlayer = $foundPlayers[0];
        }
        return $this->_ownerPlayer;
    }

    /**
     * @return int
     */
    public function getOwnerPlayerId()
    {
        return $this->_ownerPlayerId;
    }

    /**
     * @param string $startTime
     * @return EventPrimitive
     */
    public function setStartTime($startTime)
    {
        $this->_startTime = $startTime;
        return $this;
    }

    /**
     * @return string
     */
    public function getStartTime()
    {
        return $this->_startTime;
    }

    /**
     * @param string $title
     * @return EventPrimitive
     */
    public function setTitle($title)
    {
        $this->_title = $title;
        return $this;
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->_title;
    }

    /**
     * @param string $type
     * @deprecated to be removed in 2.x
     * @return EventPrimitive
     */
    public function setType($type)
    {
        if ($type == 'online') {
            $this->setIsOnline(1);
        }
        $this->_type = $type;
        return $this;
    }

    /**
     * @deprecated to be removed in 2.x
     * @return string
     */
    public function getType()
    {
        return $this->_type;
    }

    /**
     * @return int
     */
    public function getSyncStart()
    {
        return $this->_syncStart;
    }

    /**
     * @param int $syncStart
     * @return EventPrimitive
     */
    public function setSyncStart($syncStart)
    {
        $this->_syncStart = $syncStart;
        return $this;
    }

    /**
     * @return int
     */
    public function getAutoSeating()
    {
        if ($this->_allowPlayerAppend) {
            return false;
        }

        return $this->_autoSeating;
    }

    /**
     * @param int $autoSeating
     * @return EventPrimitive
     */
    public function setAutoSeating($autoSeating)
    {
        $this->_autoSeating = $autoSeating;
        return $this;
    }

    /**
     * @return int
     */
    public function getSortByGames()
    {
        return $this->_sortByGames;
    }

    /**
     * @param int $sortByGames
     * @return EventPrimitive
     */
    public function setSortByGames($sortByGames)
    {
        $this->_sortByGames = $sortByGames;
        return $this;
    }

    /**
     * @return int
     */
    public function getAllowPlayerAppend()
    {
        return $this->_allowPlayerAppend;
    }

    /**
     * @param int $allowPlayerAppend
     * @return EventPrimitive
     */
    public function setAllowPlayerAppend($allowPlayerAppend)
    {
        $this->_allowPlayerAppend = $allowPlayerAppend;
        $this->_type = $allowPlayerAppend ? 'offline' : 'offline_interactive_tournament'; // DEPRECATED: to be removed in 2.x
        return $this;
    }

    /**
     * @return int
     */
    public function getIsOnline()
    {
        if ($this->_isTextlog) {
            return false;
        }

        return $this->_isOnline;
    }

    /**
     * @param int $isOnline
     * @return EventPrimitive
     */
    public function setIsOnline($isOnline)
    {
        $this->_isOnline = $isOnline;
        if ($isOnline) {
            $this->_type = 'online'; // DEPRECATED: to be removed in 2.x
        }
        return $this;
    }

    /**
     * @return int
     */
    public function getIsTextlog()
    {
        return $this->_isTextlog;
    }

    /**
     * @param int $isTextlog
     * @return EventPrimitive
     */
    public function setIsTextlog($isTextlog)
    {
        $this->_isTextlog = $isTextlog;
        return $this;
    }

    /**
     * @return int
     */
    public function getIsPrescripted()
    {
        return $this->_isPrescripted;
    }

    /**
     * @param int $isPrescripted
     * @return EventPrimitive
     */
    public function setIsPrescripted($isPrescripted)
    {
        $this->_isPrescripted = $isPrescripted;
        return $this;
    }

    /**
     * @return int
     */
    public function getUseTimer()
    {
        return $this->_useTimer;
    }

    /**
     * @return int
     */
    public function getUsePenalty()
    {
        return $this->_usePenalty;
    }

    /**
     * @param int $useTimer
     * @return EventPrimitive
     */
    public function setUseTimer($useTimer)
    {
        $this->_useTimer = $useTimer;
        if (!$useTimer) { // disable timer?
            $this->_gamesStatus = null;
        }
        return $this;
    }

    /**
     * @param int $usePenalty
     * @return EventPrimitive
     */
    public function setUsePenalty($usePenalty)
    {
        $this->_usePenalty = $usePenalty;
        return $this;
    }

    /**
     * @param string $host
     * @return EventPrimitive
     */
    public function setStatHost($host)
    {
        $this->_statHost = $host;
        return $this;
    }

    /**
     * @return string
     */
    public function getStatHost()
    {
        return $this->_statHost;
    }

    /**
     * @return \int[]
     */
    public function getRegisteredPlayersIds()
    {
        return PlayerRegistrationPrimitive::findRegisteredPlayersIdsByEvent($this->_db, $this->getId());
    }

    /**
     * @return integer
     */
    public function getSeriesLength()
    {
        return $this->_seriesLength;
    }

    /**
     * @param integer $seriesLength
     * @return EventPrimitive
     */
    public function setSeriesLength($seriesLength)
    {
        $this->_seriesLength = $seriesLength;
        return $this;
    }

    /**
     * @return integer
     */
    public function getSyncEnd()
    {
        return $this->_syncEnd;
    }

    /**
     * @param integer $syncEnd
     * @return EventPrimitive
     */
    public function setSyncEnd($syncEnd)
    {
        $this->_syncEnd = $syncEnd;
        return $this;
    }

    /**
     * @return integer
     */
    public function getHideResults()
    {
        return $this->_hideResults;
    }

    /**
     * @param integer $hideResults
     * @return EventPrimitive
     */
    public function setHideResults($hideResults)
    {
        $this->_hideResults = $hideResults;
        return $this;
    }

    /**
     * @return string | null
     */
    public function getGamesStatus()
    {
        return $this->_gamesStatus;
    }

    /**
     * @param string $gamesStatus
     * @throws InvalidParametersException
     * @return EventPrimitive
     */
    public function setGamesStatus($gamesStatus)
    {
        if ($gamesStatus != self::GS_SEATING_READY &&
            $gamesStatus != self::GS_STARTED &&
            $gamesStatus !== null
        ) {
            throw new InvalidParametersException('Games status should be one of [seating_ready|started|NULL]');
        }
        $this->_gamesStatus = $gamesStatus;
        return $this;
    }
}
