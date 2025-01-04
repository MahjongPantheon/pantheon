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

use Common\EndingPolicy;
use Common\PlatformType;

require_once __DIR__ . '/../exceptions/EntityNotFound.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';
require_once __DIR__ . '/../Primitive.php';
require_once __DIR__ . '/../primitives/PlayerStats.php';
require_once __DIR__ . '/../helpers/SessionState.php';
require_once __DIR__ . '/../helpers/Date.php';
require_once __DIR__ . '/SessionResults.php';

/**
 * Class SessionPrimitive
 *
 * Low-level model with basic CRUD operations and relations
 * @package Mimir
 */
class SessionPrimitive extends Primitive
{
    protected static $_table = 'session';
    const REL_USER = 'session_player';
    const REL_USER_UNIQUE_COLUMNS = ['session_id', 'player_id'];

    protected static $_fieldsMapping = [
        'id'                    => '_id',
        'event_id'              => '_eventId',
        'representational_hash' => '_representationalHash',
        'replay_hash'           => '_replayHash',
        'table_index'           => '_tableIndex',
        'start_date'            => '_startDate',
        'end_date'              => '_endDate',
        'extra_time'            => '_extraTime',
        '::session_player'      => '_playersIds', // external many-to-many relation
        'status'                => '_status',
        'intermediate_results'  => '_current',
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id'           => $this->_integerTransform(true),
            '_playersIds'   => $this->_externalManyToManyTransform(
                self::REL_USER,
                'session_id',
                'player_id',
                self::REL_USER_UNIQUE_COLUMNS
            ),
            '_eventId'      => $this->_integerTransform(),
            '_representationalHash' => $this->_stringTransform(true),
            '_replayHash'   => $this->_stringTransform(true),
            '_tableIndex'   => $this->_integerTransform(true),
            '_startDate'    => $this->_stringTransform(true),
            '_endDate'      => $this->_stringTransform(true),
            '_extraTime'    => $this->_integerTransform(),
            '_status'       => $this->_stringTransform(true),
            '_current'      => [
                'serialize' => function (SessionState $obj = null) {
                    if (!$obj) {
                        return '';
                    }
                    return $obj->toJson();
                },
                'deserialize' => function ($str) {
                    return SessionState::fromJson(
                        $this->getEvent()->getRulesetConfig(),
                        $this->getPlayersIds(),
                        $str
                    );
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
     * @var int
     */
    protected $_eventId;
    /**
     *
     * @var EventPrimitive|null
     */
    protected $_event;

    /**
     * Client-known hash to identify game
     * @var string
     */
    protected $_representationalHash;

    /**
     * tenhou game hash, for deduplication
     * @var string|null
     */
    protected $_replayHash;

    /**
     * Number of table in tournament
     * @var int|null
     */
    protected $_tableIndex = null;

    /**
     * Timestamp
     * @var string
     */
    protected $_startDate;

    /**
     * Timestamp
     * @var string
     */
    protected $_endDate;

    /**
     * Extra time for the table used for timer prolongation
     * @var int
     */
    protected $_extraTime;

    /**
     * ordered list of player ids, east to north.
     * @var int[]
     */
    protected $_playersIds = [];

    /**
     * Ordered list of player entities
     * @var PlayerPrimitive[]|null
     */
    protected $_players = null;

    const STATUS_PLANNED = 'planned';
    const STATUS_INPROGRESS = 'inprogress';
    const STATUS_PREFINISHED = 'prefinished';
    const STATUS_FINISHED = 'finished';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * planned / inprogress / prefinished / finished
     * @var string
     */
    protected $_status;

    /**
     * current game status
     * @var SessionState|null
     */
    protected $_current;

    /**
     * chips at the end of the game per player
     * @var array
     */
    protected $_chips;

    /**
     * SessionPrimitive constructor.
     * @param DataSource $ds
     * @throws \Exception
     */
    public function __construct(DataSource $ds)
    {
        parent::__construct($ds);
        $this->_startDate = date('Y-m-d H:i:s'); // may be actualized on restore
    }

    /**
     * Find sessions by local ids (primary key)
     *
     * @param DataSource $ds
     * @param int[] $ids
     * @throws \Exception
     * @return SessionPrimitive[]
     */
    public static function findById(DataSource $ds, $ids)
    {
        return self::_findBy($ds, 'id', $ids);
    }

    /**
     * Find sessions by state (indexed search, paginated)
     *
     * @param DataSource $ds
     * @param integer $eventId
     * @param string $replayHash
     *
     * @throws \Exception
     *
     * @return array[]
     *
     * @psalm-return array<array-key, self>
     */
    public static function findByReplayHashAndEvent(DataSource $ds, $eventId, $replayHash)
    {
        // Note: plain select here to avoid session reconstruction for online games with same player names
        return $ds->table(self::$_table)
            ->where('event_id', $eventId)
            ->where('replay_hash', $replayHash)
            ->findArray();
    }

    /**
     * Find all sessions in progress
     *
     * @param DataSource $ds
     * @throws \Exception
     * @return SessionPrimitive[]
     */
    public static function findAllInProgress(DataSource $ds)
    {
        return self::_findBy($ds, 'status', [SessionPrimitive::STATUS_INPROGRESS]);
    }

    /**
     * Find sessions by client-aware hash list (indexed search)
     *
     * @param DataSource $ds
     * @param string[] $hashList
     * @throws \Exception
     * @return SessionPrimitive[]
     */
    public static function findByRepresentationalHash(DataSource $ds, $hashList)
    {
        return self::_findBy($ds, 'representational_hash', $hashList);
    }

    /**
     * Find sessions by state (indexed search, paginated)
     *
     * @param DataSource $ds
     * @param integer[] $eventIds
     * @param string|string[] $status
     * @param integer $offset
     * @param integer $limit
     * @param string $orderBy
     * @param string $order
     *
     * @throws \Exception
     *
     * @return self[]
     *
     * @psalm-return array<array-key, self>
     */
    public static function findByEventAndStatus(
        DataSource $ds,
        $eventIds,
        $status,
        $offset = 0,
        $limit = null,
        $orderBy = 'id',
        $order = 'desc'
    ) {

        return self::_findBySeveral(
            $ds,
            ['status' => (array)$status, 'event_id' => $eventIds],
            [
                'limit' => $limit, 'offset'  => $offset,
                'order' => $order, 'orderBy' => $orderBy
            ]
        );
    }

    /**
     * Find sessions by state (indexed search, paginated)
     *
     * @param DataSource $ds
     * @param array $eventIdList
     * @param string|string[] $status
     * @param integer $offset
     * @param integer $limit
     * @param string $orderBy
     * @param string $order
     *
     * @throws \Exception
     *
     * @return self[]
     *
     * @psalm-return array<array-key, self>
     */
    public static function findByEventListAndStatus(
        DataSource $ds,
        $eventIdList,
        $status,
        $offset = 0,
        $limit = null,
        $orderBy = 'id',
        $order = 'desc'
    ) {

        return self::_findBySeveral(
            $ds,
            ['status' => (array)$status, 'event_id' => $eventIdList],
            [
                'limit' => $limit, 'offset'  => $offset,
                'order' => $order, 'orderBy' => $orderBy
            ]
        );
    }

    /**
     * Get data of players' seating during all event
     *
     * @param DataSource $ds
     * @param int $eventId
     * @throws \Exception
     * @return array TODO: should it be here? It behaves like non-ORM method :/
     */
    public static function getPlayersSeatingInEvent(DataSource $ds, int $eventId): array
    {
        return $ds->table(self::$_table)
            ->select('player_id')
            ->select('order')
            ->join(self::REL_USER, [self::REL_USER . '.session_id', '=', self::$_table . '.id'])
            ->where(self::$_table . '.event_id', $eventId)
            ->orderByAsc('session_id')
            ->orderByAsc('order')
            ->findArray();
    }

    /**
     * Find session by player/event
     *
     * @param DataSource $ds
     * @param int $playerId
     * @param int $eventId
     * @param string $withStatus
     * @throws \Exception
     * @return SessionPrimitive[]
     */
    public static function findByPlayerAndEvent(DataSource $ds, int $playerId, int $eventId, string $withStatus = '*')
    {
        // TODO: here we can precache players, ids are known as GROUP_CONCAT(player_id)
        $orm = $ds->table(self::$_table)
            ->select(self::$_table . '.*')
            ->leftOuterJoin(self::REL_USER, [self::REL_USER . '.session_id', '=', self::$_table . '.id'])
            ->where(self::REL_USER . '.player_id', $playerId)
            ->where(self::$_table . '.event_id', $eventId)
            ->groupBy(self::$_table . '.id');
        if ($withStatus !== '*') {
            $orm->where(self::$_table . '.status', $withStatus);
        }

        $result = $orm->findArray();
        if (empty($result)) {
            return [];
        }

        return array_map(function ($data) use ($ds) {
            return self::_recreateInstance($ds, $data);
        }, $result);
    }

    /**
     * Find last session of player in event
     *
     * @param DataSource $ds
     * @param int $playerId
     * @param int $eventId
     * @param string $withStatus
     *
     * @throws \Exception
     *
     * @return null|self
     */
    public static function findLastByPlayerAndEvent(DataSource $ds, int $playerId, int $eventId, $withStatus = '*'): ?self
    {
        $conditions = [
            'sp.player_id'  => [$playerId],
            's.event_id' => [$eventId]
        ];
        if ($withStatus !== '*') {
            $conditions['s.status'] = [$withStatus];
        }

        $orm = $ds->table(static::$_table)->tableAlias('s')
            ->select('*')
            ->select('s.id', 'id') // session_player also has 'id' field, we need to select it explicitly
            ->join(self::REL_USER, ['sp.session_id', '=', 's.id'], 'sp');

        foreach ($conditions as $key => $identifiers) {
            $orm = $orm->whereIn($key, $identifiers);
        }

        $orm = $orm->orderByDesc('s.id'); // primary key
        $item = $orm->findOne();

        if (!empty($item)) {
            $item = $item->asArray();
        } else {
            return null;
        }
        return self::_recreateInstance($ds, $item);
    }

    /**
     * Total count of played games
     *
     * @param DataSource $ds
     * @param array $eventIdList
     * @param string $withStatus
     * @throws \Exception
     * @return integer
     */
    public static function getGamesCount(DataSource $ds, array $eventIdList, string $withStatus): int
    {
        $result = $ds->table(self::$_table)
            ->whereIn('event_id', $eventIdList)
            ->where('status', $withStatus)
            ->count();

        return (int)$result;
    }

    /**
     * Save session instance to db
     * @throws \Exception
     * @return bool success
     */
    public function save()
    {
        if (empty($this->_representationalHash)) {
            // Set representation hash only if it is empty
            // Here we rely on fact that same group of players can't start several games in the same minute.
            $this->_representationalHash = sha1(
                implode(',', $this->_playersIds) .
                DateHelper::getDateWithoutSeconds($this->_startDate) .
                (empty(getenv('SEED_REPEAT')) ? '' : mt_rand(0, 999999)) // additional randomness for big event seeder, not used in production
            );
        }
        return parent::save();
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

    /**
     * @return Primitive
     * @throws \Exception
     */
    public function drop()
    {
        $this->_ds->table(self::REL_USER)
            ->where('session_id', $this->_id)
            ->deleteMany();
        return parent::drop();
    }

    protected function _deident()
    {
        $this->_id = null;
    }

    /**
     * @param \Mimir\EventPrimitive $event
     * @return $this
     * @throws InvalidParametersException
     */
    public function setEvent(EventPrimitive $event)
    {
        $id = $event->getId();
        if (!$id) {
            throw new InvalidParametersException('Attempted to assign deidented primitive');
        }
        $this->_event = $event;
        $this->_eventId = $id;
        return $this;
    }

    /**
     * @throws EntityNotFoundException
     * @throws \Exception
     * @return \Mimir\EventPrimitive
     */
    public function getEvent()
    {
        if (!$this->_event) {
            $foundEvents = EventPrimitive::findById($this->_ds, [$this->_eventId]);
            if (empty($foundEvents)) {
                throw new EntityNotFoundException("Entity EventPrimitive with id#" . $this->_eventId . ' not found in DB');
            }
            $this->_event = $foundEvents[0];
        }
        return $this->_event;
    }

    /**
     * @return int
     */
    public function getEventId()
    {
        return $this->_eventId;
    }

    /**
     * @return int|null
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * @param int|null $tableIndex
     * @return $this
     */
    public function setTableIndex($tableIndex)
    {
        $this->_tableIndex = $tableIndex;
        return $this;
    }

    /**
     * @return int|null
     */
    public function getTableIndex()
    {
        return $this->_tableIndex;
    }

    /**
     * @throws EntityNotFoundException
     * @throws \Exception
     *
     * @return null|string
     */
    public function getStartDate(): ?string
    {
        if (!$this->_startDate) {
            return null;
        }
        return DateHelper::getLocalDate($this->_startDate, $this->getEvent()->getTimezone());
    }

    /**
     * @param string $date UTC date string
     * @return $this
     */
    public function setEndDate($date)
    {
        $this->_endDate = $date;
        return $this;
    }

    /**
     * @throws \Exception
     * @return string|null
     */
    public function getEndDate()
    {
        if (!$this->_endDate) {
            return null;
        }
        return DateHelper::getLocalDate($this->_endDate, $this->getEvent()->getTimezone());
    }

    /**
     * @param int $extraTime additional time in seconds
     * @return $this
     */
    public function setExtraTime(int $extraTime)
    {
        $this->_extraTime = $extraTime;
        return $this;
    }

    /**
     * @return int
     */
    public function getExtraTime()
    {
        return $this->_extraTime;
    }

    /**
     * @param \Mimir\PlayerPrimitive[] $players
     * @return $this
     */
    public function setPlayers($players)
    {
        $this->_players = $players;
        // @phpstan-ignore-next-line
        $this->_playersIds = array_map(function (PlayerPrimitive $player) {
            return $player->getId();
        }, $players);

        return $this;
    }

    /**
     * @throws EntityNotFoundException
     * @throws \Exception
     * @return \Mimir\PlayerPrimitive[]
     */
    public function getPlayers()
    {
        if ($this->_players === null) {
            $this->_players = PlayerPrimitive::findById(
                $this->_ds,
                $this->_playersIds
            );
            if (empty($this->_players) || count($this->_players) !== count($this->_playersIds)) {
                $this->_players = null;
                throw new EntityNotFoundException("Not all players were found in DB (among id#" . implode(',', $this->_playersIds));
            }

            $this->_players = array_filter(array_map(function ($id) {
                if (!empty($this->_players)) {
                    // Re-sort players to match request order - important!
                    foreach ($this->_players as $p) {
                        if ($p->getId() == $id) {
                            return $p;
                        }
                    }
                }
                return null;
            }, $this->_playersIds));
        }
        return $this->_players;
    }

    /**
     * @return int[]
     */
    public function getPlayersIds()
    {
        return $this->_playersIds;
    }

    /**
     * @param string|null $replayHash
     * @return $this
     */
    public function setReplayHash($replayHash)
    {
        $this->_replayHash = $replayHash;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getReplayHash()
    {
        return $this->_replayHash;
    }

    /**
     * @param int $platformId
     * @return string
     */
    public function getReplayLink($platformId = 1): string
    {
        $defaultReplayLink = '';
        if (empty($this->_replayHash)) {
            return $defaultReplayLink;
        }

        if ($platformId === PlatformType::PLATFORM_TYPE_TENHOUNET) {
            return base64_decode('aHR0cDovL3RlbmhvdS5uZXQv') . '0/?log=' . $this->_replayHash;
        }

        if ($platformId === PlatformType::PLATFORM_TYPE_MAHJONGSOUL) {
            return base64_decode('aHR0cHM6Ly9tYWhqb25nc291bC5nYW1lLnlvLXN0YXIuY29t') . '/?paipu=' . $this->_replayHash;
        }

        return $defaultReplayLink;
    }

    /**
     * Client-known hash to find games
     *
     * Warning! This will be empty for all new Sessions until they are saved!
     * @return string
     */
    public function getRepresentationalHash()
    {
        return $this->_representationalHash;
    }

    /**
     * @deprecated Do not use this! Left as is only for testing purposes.
     * @param string $hash
     * @return $this
     */
    public function _setRepresentationalHash(string $hash)
    {
        $this->_representationalHash = $hash;
        return $this;
    }

    /**
     * @param string $status
     * @return $this
     */
    public function setStatus($status)
    {
        $this->_status = $status;
        return $this;
    }

    /**
     * @return string
     */
    public function getStatus()
    {
        return $this->_status;
    }

    /**
     * @param array<int|null, int> $chips
     * @return $this
     */
    public function setChips($chips)
    {
        // @phpstan-ignore-next-line
        $this->_chips = $chips;
        return $this;
    }

    /**
     * @return array
     */
    public function getChips()
    {
        return $this->_chips;
    }

    /**
     * @throws \Exception
     * @return SessionState
     */
    public function getCurrentState(): SessionState
    {
        if (empty($this->_current)) {
            $this->_current = new SessionState(
                $this->getEvent()->getRulesetConfig(),
                $this->getPlayersIds()
            );
        }
        $this->_current->setChips($this->getChips());
        return $this->_current;
    }

    /**
     * Update current session intermediate state
     * WARNING: This should be called strictly AFTER round is saved to DB!
     *
     * @param RoundPrimitive $round
     * @return false|array
     * @throws InvalidParametersException|EntityNotFoundException
     */
    public function updateCurrentState(RoundPrimitive $round)
    {
        $lastTimer = $this->getEvent()->getLastTimer(); // may be null if timer is not set!

        switch ($this->getEvent()->getRulesetConfig()->rules()->getEndingPolicy()) {
            case EndingPolicy::ENDING_POLICY_EP_ONE_MORE_HAND:
                $noTimeLeft = $this->getEvent()->getUseTimer() && $lastTimer && (
                    $lastTimer + (
                        $this->getEvent()->getGameDuration() * 60 + $this->getExtraTime()
                    ) < time()
                );

                if ($noTimeLeft && $round->getOutcome() !== 'chombo') {
                    if (!$this->getCurrentState()->lastHandStarted()) {
                        $this->getCurrentState()->update($round);
                        $this->getCurrentState()->setLastHandStarted(); // call before '->save' to save in one shot
                        $success = $this->save();
                    } else {
                        // this is red zone, in fact
                        $this->getCurrentState()->update($round);
                        $success = $this->save();
                        $this->getCurrentState()->forceFinish();
                    }
                } else {
                    $this->getCurrentState()->update($round);
                    $success = $this->save();
                }

                if ($this->getCurrentState()->isFinished()) {
                    $this->scheduleRecalcStats();
                    $success = $success && $this->prefinish();
                }

                break;
            case EndingPolicy::ENDING_POLICY_EP_END_AFTER_HAND:
                $this->getCurrentState()->update($round);
                $success = $this->save();

                $noTimeLeft = $this->getEvent()->getUseTimer() && $lastTimer && (
                    $lastTimer + (
                        $this->getEvent()->getGameDuration() * 60 + $this->getExtraTime()
                    ) < time()
                );

                // should finish game if it's in red zone, except case when chombo was made
                if ($noTimeLeft && $round->getOutcome() !== 'chombo') {
                    $this->getCurrentState()->forceFinish();
                }

                if ($this->getCurrentState()->isFinished()) {
                    $this->scheduleRecalcStats();
                    $success = $success && $this->prefinish();
                }

                break;
            default: // no policies, just update
                $this->getCurrentState()->update($round);
                $success = $this->save();

                // We should finish game here for offline events, but online ones will be finished manually in model.
                // Looks ugly :( But works as expected, so let it be until we find better solution.
                if (!$this->getEvent()->getIsOnline() && $this->getCurrentState()->isFinished()) {
                    $this->scheduleRecalcStats();
                    $success = $success && $this->prefinish();
                }
        }

        return $success ? $this->getCurrentState()->toArray() : false;
    }

    /**
     * Schedule rebuild player stats
     * @return void
     * @throws \Exception
     */
    public function scheduleRecalcStats()
    {
        foreach ($this->getPlayersIds() as $playerId) {
            (new JobsQueuePrimitive($this->_ds))
                ->setJobName(JobsQueuePrimitive::JOB_PLAYER_STATS)
                ->setJobArguments(['playerId' => $playerId, 'eventId' => $this->getEventId()])
                ->setCreatedAt(date('Y-m-d H:i:s'))
                ->save();
        }
    }

    /**
     * @param RoundPrimitive $round
     * @throws \Exception
     * @return array [SessionState, array]
     */
    public function dryRunUpdateCurrentState(RoundPrimitive $round)
    {
        $cloneState = clone $this->getCurrentState();
        $paymentsInfo = $cloneState->update($round);
        return [$cloneState, $paymentsInfo];
    }

    /**
     * @throws \Exception
     * @return bool
     */
    public function prefinish()
    {
        // pre-finish state is not applied for games without synchronous ending
        if (!$this->getEvent()->getSyncEnd()) {
            return $this->finish();
        }

        if ($this->getStatus() === SessionPrimitive::STATUS_PREFINISHED) {
            return false;
        }

        return $this
            ->setStatus(SessionPrimitive::STATUS_PREFINISHED)
            ->setEndDate(date('Y-m-d H:i:s'))
            ->save();
    }

    /**
     * @throws \Exception
     * @return bool
     */
    public function finish()
    {
        if ($this->getStatus() === SessionPrimitive::STATUS_FINISHED) {
            return false;
        }

        if (!$this->getEndDate()) {
            // Set end date if it is empty; for prefinished games it won't be.
            $this->setEndDate(date('Y-m-d H:i:s'));
        }

        $success = $this
            ->setStatus(SessionPrimitive::STATUS_FINISHED)
            ->save();
        $this->scheduleRecalcStats();

        return $success && $this->_finalizeGame();
    }

    /**
     * Add chips bonus to final scores
     * @return void
     */
    public function updateScoresWithChipsBonus()
    {
        $chips = $this->getChips();
        $state = $this->getCurrentState();
        $scores = $state->getScores();
        $chipsBonus = $this->getEvent()->getRulesetConfig()->rules()->getChipsValue();
        foreach ($chips as $playerId => $chipsCount) {
            $scores[$playerId] += $chipsCount * $chipsBonus;
        }
        $state->setScores($scores);
    }

    /**
     * Generate session results
     * @param bool $useSavedReplacements
     * @throws \Exception
     * @return bool
     */
    protected function _finalizeGame($useSavedReplacements = false)
    {
        if (!$useSavedReplacements) {
            // save replacements to session state for possible recalculations
            $players = PlayerRegistrationPrimitive::findByPlayerAndEvent($this->_ds, $this->getPlayersIds(), $this->_eventId);
            $replacements = array_reduce(
                $players,
                function ($acc, PlayerRegistrationPrimitive $reg) {
                    if ($reg->getReplacementPlayerId()) {
                        $acc[$reg->getPlayerId()] = $reg->getReplacementPlayerId();
                    }
                    return $acc;
                },
                []
            );

            $this->getCurrentState()->setReplacements($replacements);
            $this->save();
        }

        $sessionResults = $this->getSessionResults();

        return array_reduce($sessionResults, function ($acc, SessionResultsPrimitive $result) {
            $playerHistoryItem = PlayerHistoryPrimitive::makeNewHistoryItem(
                $this->_ds,
                $result->getPlayer(),
                $this,
                $result->getRatingDelta(),
                $result->getPlace(),
                $result->getChips()
            );

            // Should save the result explicitly! It's not saved inside ->getSessionResults()
            return $acc && $result->save() && $playerHistoryItem->save();
        }, true);
    }

    /**
     * @throws \Exception
     * @return void
     */
    public function recreateHistory()
    {
        $this->_finalizeGame(true);
    }

    /**
     * Get a list on unsaved session results primitives
     * @throws \Exception
     * @return SessionResultsPrimitive[]
     */
    public function getSessionResults()
    {
        if ($this->getEvent()->getRulesetConfig()->rules()->getRiichiGoesToWinner()) {
            $placesMap = SessionResultsPrimitive::calcPlacesMap($this->getCurrentState()->getScores(), $this->getPlayersIds());
            // Split riichi bets in case of bump
            $scores = array_map(function ($el) {
                return $el['score'];
            }, array_values($placesMap));

            $firstPlacesCount = 1;
            if ($scores[1] === $scores[0]) {
                $firstPlacesCount = 2;
                if ($scores[2] === $scores[1]) {
                    $firstPlacesCount = 3;
                    if ($scores[3] === $scores[2]) { // oh wow lol
                        $firstPlacesCount = 4;
                    }
                }
            }

            $riichiBetAmount = (int)(100 * floor(($this->getCurrentState()->getRiichiBets() * 10.) / $firstPlacesCount));

            foreach ($this->getPlayers() as $player) {
                if ($placesMap[$player->getId()]['place'] <= $firstPlacesCount) {
                    $this->getCurrentState()->giveRiichiBetsToPlayer($player->getId(), $riichiBetAmount);
                }
            }
        }

        return array_map(function (PlayerPrimitive $player) {
            return (new SessionResultsPrimitive($this->_ds))
                ->setPlayer($player)
                ->setSession($this)
                ->calc($this->getEvent()->getRulesetConfig(), $this->getCurrentState(), $this->getPlayersIds());
        }, $this->getPlayers());
    }

    /**
     * Rollback round in current session
     *
     * @param RoundPrimitive|MultiRoundPrimitive $round
     *
     * @throws \Exception
     *
     * @return void
     */
    public function rollback(RoundPrimitive $round): void
    {
        $this->_current = $round->getLastSessionState();
        $round->drop();
        $this->setStatus(SessionPrimitive::STATUS_INPROGRESS)->save();
    }

    /**
     * Check if current session is chronologically last for all its players.
     * Exclude cancelled games, as they're not counted
     * @return bool
     * @throws \Exception
     */
    public function isLastForPlayers()
    {
        $last = $this->_ds->table(self::REL_USER)
            ->join(
                self::$_table,
                self::$_table . '.id = ' . self::REL_USER . '.session_id ' .
                'AND ' . self::$_table . ".event_id = " . $this->_eventId . ' '.
                'AND ' . self::$_table . ".status != 'cancelled'"
            )
            ->whereIn('player_id', $this->getPlayersIds())
            ->orderByDesc(self::REL_USER . '.id')
            ->limit(4)
            ->findArray();

        foreach ($last as $item) {
            if ($item['session_id'] != $this->_id) {
                return false;
            }
        }

        return true;
    }
}
