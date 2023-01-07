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
    const ID_PLACEHOLDER = '##ID##';

    protected static $_fieldsMapping = [
        'id'                => '_id',
        'title'             => '_title',
        'description'       => '_description',
        'start_time'        => '_startTime',
        'end_time'          => '_endTime',
        'game_duration'     => '_gameDuration',
        'last_timer'        => '_lastTimer',
        'is_online'         => '_isOnline',
        'is_team'           => '_isTeam',
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
        'ruleset_changes'   => '_rulesetChanges',
        'timezone'          => '_timezone',
        'series_length'     => '_seriesLength',
        'games_status'      => '_gamesStatus',
        'hide_results'      => '_hideResults',
        'is_prescripted'    => '_isPrescripted',
        'min_games_count'   => '_minGamesCount',
        'finished'          => '_finished',
        'next_game_start_time' => '_nextGameStartTime',
        'time_to_start'     => '_timeToStart',
        'is_listed'         => '_isListed',
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_startTime'          => $this->_stringTransform(true),
            '_endTime'            => $this->_stringTransform(true),
            '_gameDuration'       => $this->_integerTransform(true),
            '_lastTimer'          => $this->_integerTransform(true),
            '_id'                 => $this->_integerTransform(true),
            '_lobbyId'            => $this->_integerTransform(true),
            '_isOnline'           => $this->_integerTransform(),
            '_isTeam'             => $this->_integerTransform(),
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
            '_minGamesCount'      => $this->_integerTransform(),
            '_finished'           => $this->_integerTransform(),
            '_nextGameStartTime'  => $this->_integerTransform(),
            '_timeToStart'        => $this->_integerTransform(),
            '_isListed'           => $this->_integerTransform(),
            '_ruleset'            => [
                'serialize' => function (\Common\Ruleset $rules) {
                    return $rules->title();
                },
                'deserialize' => function ($rulesId) {
                    return \Common\Ruleset::instance($rulesId);
                }
            ],
            '_rulesetChanges'     => [
                'serialize' => function ($changes) {
                    return empty($changes) ? '{}' : json_encode($changes);
                },
                'deserialize' => function ($changesJson) {
                    return json_decode($changesJson, true) ?? [];
                }
            ]
        ];
    }

    /**
     * Local id
     * @var int|null
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
     * if true, event is treated as online (paifu log parser is used).
     * @var int
     */
    protected $_isOnline;
    /**
     * if true, event is treated as team tournament
     * @var int
     */
    protected $_isTeam;
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
     * @var \Common\Ruleset
     */
    protected $_ruleset;
    /**
     * Changes to base ruleset for current event
     * @var array
     */
    protected $_rulesetChanges;
    /**
     * How many games should be in the series
     * @var integer
     */
    protected $_seriesLength;
    /**
     * How many games should be played in the event
     * @var integer
     */
    protected $_minGamesCount;
    /**
     * Should be rating table hidden or not
     * @var integer
     */
    protected $_hideResults;
    /**
     * Is event finished / closed
     * @var integer
     */
    protected $_finished;
    /**
     * What interval next game should start in
     * @var integer
     */
    protected $_timeToStart;
    /**
     * Next game start time
     * @var integer
     */
    protected $_nextGameStartTime;
    /**
     * Is event listed on main page
     * @var integer
     */
    protected $_isListed;
    /**
     * Status of games in event: one of
     * - seating_ready
     * - started
     * - NULL
     * In club events without timer should be null
     * @var string|null
     */
    protected $_gamesStatus = null;
    const GS_SEATING_READY = 'seating_ready';
    const GS_STARTED = 'started';

    /**
     * EventPrimitive constructor.
     * @param DataSource $ds
     * @throws \Exception
     */
    public function __construct(DataSource $ds)
    {
        parent::__construct($ds);
        $this->_startTime = date('Y-m-d H:i:s'); // may be actualized on restore
    }

    /**
     * Find events by local ids (primary key)
     *
     * @param DataSource $ds
     * @param int[] $ids
     * @throws \Exception
     * @return EventPrimitive[]
     */
    public static function findById(DataSource $ds, $ids)
    {
        return self::_findBy($ds, 'id', $ids);
    }

    /**
     * Find events by lobby (indexed search)
     *
     * @param DataSource $ds
     * @param string[] $lobbyList
     * @throws \Exception
     * @return EventPrimitive[]
     */
    public static function findByLobby(DataSource $ds, $lobbyList)
    {
        // TODO: All games in lobby are likely to be too much. Make pagination here.
        return self::_findBy($ds, 'lobby_id', $lobbyList);
    }

    /**
     * @return bool|mixed
     * @throws \Exception
     */
    protected function _create()
    {
        $session = $this->_ds->table(self::$_table)->create();
        $success = $this->_save($session);
        if ($success) {
            $this->_id = $this->_ds->local()->lastInsertId();
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
     * @param int|null $redZone
     * @return EventPrimitive
     */
    public function setRedZone($redZone)
    {
        $this->_redZone = $redZone;
        return $this;
    }

    /**
     * Timer red zone in seconds
     *
     * @return int|null
     */
    public function getRedZone(): ?int
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
     * @return int|null
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * @return \Common\Ruleset
     */
    public function getRuleset()
    {
        return $this->_ruleset->applyChanges($this->_rulesetChanges ?: []);
    }

    /**
     * @param \Common\Ruleset $rules
     * @return EventPrimitive
     */
    public function setRuleset(\Common\Ruleset $rules)
    {
        $this->_ruleset = $rules;
        return $this;
    }

    /**
     * @param array $changes
     * @return EventPrimitive
     */
    public function setRulesetChanges($changes)
    {
        $this->_rulesetChanges = $changes;
        return $this;
    }

    /**
     * @return array
     */
    public function getRulesetChanges()
    {
        return $this->_rulesetChanges;
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
     * @return false|int
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
        return $this;
    }

    /**
     * @return false|int
     */
    public function getIsOnline()
    {
        return $this->_isOnline;
    }

    /**
     * @return int
     */
    public function getIsTeam()
    {
        return $this->_isTeam;
    }

    /**
     * @param int $isOnline
     * @return EventPrimitive
     */
    public function setIsOnline($isOnline)
    {
        $this->_isOnline = $isOnline;
        return $this;
    }

    /**
     * @param int $isTeam
     * @return EventPrimitive
     */
    public function setIsTeam($isTeam)
    {
        $this->_isTeam = $isTeam;
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
     * @return int[]
     * @throws \Exception
     */
    public function getRegisteredPlayersIds()
    {
        if (!$this->_id) {
            throw new InvalidParametersException('Attempted to assign deidented primitive');
        }
        return array_map(function ($el) {
            return $el['id'];
        }, PlayerRegistrationPrimitive::findRegisteredPlayersIdsByEvent($this->_ds, $this->_id));
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
    public function getMinGamesCount()
    {
        return $this->_minGamesCount;
    }

    /**
     * @param integer $minGamesCount
     * @return EventPrimitive
     */
    public function setMinGamesCount($minGamesCount)
    {
        $this->_minGamesCount = $minGamesCount;
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

    /**
     * @return int
     */
    public function getIsFinished()
    {
        return $this->_finished;
    }

    /**
     * @param int $isFinished
     * @return EventPrimitive
     */
    public function setIsFinished($isFinished)
    {
        $this->_finished = $isFinished;
        return $this;
    }

    /**
     * @return int
     */
    public function getTimeToStart()
    {
        return $this->_timeToStart;
    }

    /**
     * @param int $time
     * @return EventPrimitive
     */
    public function setTimeToStart($time)
    {
        $this->_timeToStart = $time;
        return $this;
    }

    /**
     * @return int
     */
    public function getNextGameStartTime()
    {
        return $this->_nextGameStartTime;
    }

    /**
     * @param int $startTime
     * @return EventPrimitive
     */
    public function setNextGameStartTime($startTime)
    {
        $this->_nextGameStartTime = $startTime;
        return $this;
    }

    /**
     * @return int
     */
    public function getIsListed()
    {
        return $this->_isListed;
    }

    /**
     * @param int $isListed
     * @return EventPrimitive
     */
    public function setIsListed($isListed)
    {
        $this->_isListed = $isListed;
        return $this;
    }

    /**
     * Check if events are compatible (can be used in aggregated event).
     *
     * @param EventPrimitive[] $eventList
     * @return boolean
     */
    public static function areEventsCompatible($eventList)
    {
        $mainEvent = $eventList[0];

        foreach ($eventList as $event) {
            if ($event->getRuleset()->title() !== $mainEvent->getRuleset()->title()) {
                return false;
            }
        }

        return true;
    }
}
