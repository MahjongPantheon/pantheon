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

require_once __DIR__ . '/../exceptions/EntityNotFound.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';
require_once __DIR__ . '/../Primitive.php';
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
                        $this->getEvent()->getRuleset(),
                        $this->getPlayersIds(),
                        $str
                    );
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
     * @var int
     */
    protected $_eventId;
    /**
     *
     * @var EventPrimitive
     */
    protected $_event;

    /**
     * Client-known hash to identify game
     * @var string
     */
    protected $_representationalHash;

    /**
     * tenhou game hash, for deduplication
     * @var string
     */
    protected $_replayHash;

    /**
     * Number of table in tournament
     * @var int
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
     * ordered list of player ids, east to north.
     * @var int[]
     */
    protected $_playersIds = [];

    /**
     * Ordered list of player entities
     * @var PlayerPrimitive[]
     */
    protected $_players = null;

    const STATUS_PLANNED = 'planned';
    const STATUS_INPROGRESS = 'inprogress';
    const STATUS_PREFINISHED = 'prefinished';
    const STATUS_FINISHED = 'finished';

    /**
     * planned / inprogress / prefinished / finished
     * @var string
     */
    protected $_status;

    /**
     * current game status
     * @var SessionState
     */
    protected $_current;

    public function __construct(IDb $db)
    {
        parent::__construct($db);
        $this->_startDate = date('Y-m-d H:i:s'); // may be actualized on restore
    }

    /**
     * Find sessions by local ids (primary key)
     *
     * @param IDb $db
     * @param int[] $ids
     * @throws \Exception
     * @return SessionPrimitive[]
     */
    public static function findById(IDb $db, $ids)
    {
        return self::_findBy($db, 'id', $ids);
    }

    /**
     * Find sessions by state (indexed search, paginated)
     *
     * @param IDb $db
     * @param integer $eventId
     * @param string $replayHash
     * @throws \Exception
     * @return SessionPrimitive[]
     */
    public static function findByReplayHashAndEvent(IDb $db, $eventId, $replayHash)
    {
        return self::_findBySeveral(
            $db,
            ['event_id' => [$eventId], 'replay_hash' => [$replayHash]]
        );
    }

    /**
     * Find all sessions in progress
     *
     * @param IDb $db
     * @throws \Exception
     * @return SessionPrimitive[]
     */
    public static function findAllInProgress(IDb $db)
    {
        return self::_findBy($db, 'status', [SessionPrimitive::STATUS_INPROGRESS]);
    }

    /**
     * Find sessions by client-aware hash list (indexed search)
     *
     * @param IDb $db
     * @param string[] $hashList
     * @throws \Exception
     * @return SessionPrimitive[]
     */
    public static function findByRepresentationalHash(IDb $db, $hashList)
    {
        return self::_findBy($db, 'representational_hash', $hashList);
    }

    /**
     * Find sessions by state (indexed search, paginated)
     *
     * @param IDb $db
     * @param integer $eventId
     * @param string|string[] $status
     * @param integer $offset
     * @param integer $limit
     * @param string $orderBy
     * @param string $order
     * @throws \Exception
     * @return SessionPrimitive[]
     */
    public static function findByEventAndStatus(
        IDb $db,
        $eventId,
        $status,
        $offset = 0,
        $limit = null,
        $orderBy = 'id',
        $order = 'desc'
    ) {

        return self::_findBySeveral(
            $db,
            ['status' => (array)$status, 'event_id' => [$eventId]],
            [
                'limit' => $limit, 'offset'  => $offset,
                'order' => $order, 'orderBy' => $orderBy
            ]
        );
    }

    /**
     * Get data of players' seating during all event
     *
     * @param IDb $db
     * @param $eventId
     * @return array TODO: should it be here? It behaves like non-ORM method :/
     */
    public static function getPlayersSeatingInEvent(IDb $db, $eventId)
    {
        return $db->table(self::$_table)
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
     * @param IDb $db
     * @param $playerId
     * @param $eventId
     * @param $withStatus
     * @return SessionPrimitive[]
     */
    public static function findByPlayerAndEvent(IDb $db, $playerId, $eventId, $withStatus = '*')
    {
        $playerId = intval($playerId);
        $eventId = intval($eventId);

        // TODO: here we can precache players, ids are known as GROUP_CONCAT(player_id)
        $orm = $db->table(self::$_table)
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

        return array_map(function ($data) use ($db) {
            return self::_recreateInstance($db, $data);
        }, $result);
    }

    /**
     * Find last session of player in event
     *
     * @param IDb $db
     * @param $playerId
     * @param $eventId
     * @param string $withStatus
     * @return SessionPrimitive
     */
    public static function findLastByPlayerAndEvent(IDb $db, $playerId, $eventId, $withStatus = '*')
    {
        $conditions = [
            'sp.player_id'  => [$playerId],
            's.event_id' => [$eventId]
        ];
        if ($withStatus !== '*') {
            $conditions['s.status'] = [$withStatus];
        }

        $orm = $db->table(static::$_table)->tableAlias('s')
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
        return self::_recreateInstance($db, $item);
    }

    /**
     * Total count of played games
     *
     * @param IDb $db
     * @param $eventId
     * @param $withStatus
     * @return integer
     */
    public static function gamesCount(IDb $db, $eventId, $withStatus)
    {
        $result = $db->table(self::$_table)
            ->where('event_id', $eventId)
            ->where('status', $withStatus)
            ->count();

        return $result;
    }

    /**
     * Save session instance to db
     * @return bool success
     */
    public function save()
    {
        if (empty($this->_representationalHash)) {
            // Set representation hash only if it is empty
            $this->_representationalHash = sha1(implode(',', $this->_playersIds) . $this->_startDate);
        }
        return parent::save();
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
     * @param \Mimir\EventPrimitive $event
     * @return $this
     */
    public function setEvent(EventPrimitive $event)
    {
        $this->_event = $event;
        $this->_eventId = $event->getId();
        return $this;
    }

    /**
     * @throws EntityNotFoundException
     * @return \Mimir\EventPrimitive
     */
    public function getEvent()
    {
        if (!$this->_event) {
            $foundEvents = EventPrimitive::findById($this->_db, [$this->_eventId]);
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
     * @return int
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * @param int $tableIndex
     * @return $this
     */
    public function setTableIndex($tableIndex)
    {
        $this->_tableIndex = $tableIndex;
        return $this;
    }

    /**
     * @return string
     */
    public function getTableIndex()
    {
        return $this->_tableIndex;
    }

    /**
     * @return string
     */
    public function getStartDate()
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
     * @param \Mimir\PlayerPrimitive[] $players
     * @return $this
     */
    public function setPlayers($players)
    {
        $this->_players = $players;
        $this->_playersIds = array_map(function (PlayerPrimitive $player) {
            return $player->getId();
        }, $players);

        return $this;
    }

    /**
     * @throws EntityNotFoundException
     * @return \Mimir\PlayerPrimitive[]
     */
    public function getPlayers()
    {
        if ($this->_players === null) {
            $this->_players = PlayerPrimitive::findById(
                $this->_db,
                $this->_playersIds
            );
            if (empty($this->_players) || count($this->_players) !== count($this->_playersIds)) {
                $this->_players = null;
                throw new EntityNotFoundException("Not all players were found in DB (among id#" . implode(',', $this->_playersIds));
            }

            $this->_players = array_filter(array_map(function ($id) {
                // Re-sort players to match request order - important!
                foreach ($this->_players as $p) {
                    if ($p->getId() == $id) {
                        return $p;
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
     * @param string $replayHash
     * @return $this
     */
    public function setReplayHash($replayHash)
    {
        $this->_replayHash = $replayHash;
        return $this;
    }

    /**
     * @return string
     */
    public function getReplayHash()
    {
        return $this->_replayHash;
    }

    /**
     * @return string
     */
    public function getReplayLink()
    {
        if (empty($this->_replayHash)) {
            return '';
        }
        return base64_decode('aHR0cDovL3RlbmhvdS5uZXQv') . '0/?log=' . $this->_replayHash;
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
     * @return SessionState
     */
    public function getCurrentState()
    {
        if (empty($this->_current)) {
            $this->_current = new SessionState(
                $this->getEvent()->getRuleset(),
                $this->getPlayersIds()
            );
        }
        return $this->_current;
    }

    /**
     * Update current session intermediate state
     * WARNING: This should be called strictly AFTER round is saved to DB!
     *
     * @param RoundPrimitive $round
     * @return bool
     */
    public function updateCurrentState(RoundPrimitive $round)
    {
        $lastTimer = $this->getEvent()->getLastTimer(); // may be null if timer is not set!

        switch ($this->getEvent()->getRuleset()->timerPolicy()) {
            case 'yellowZone':
                $isInYellowZone = $this->getEvent()->getUseTimer() && $lastTimer && (
                    $lastTimer + (
                        $this->getEvent()->getGameDuration() * 60
                        - $this->getEvent()->getRuleset()->yellowZone()
                    ) < time()
                );

                if ($isInYellowZone && $round->getOutcome() !== 'chombo') {
                    if (!$this->getCurrentState()->yellowZoneAlreadyPlayed()) {
                        $this->getCurrentState()->update($round);
                        $this->getCurrentState()->setYellowZonePlayed(); // call before '->save' to save in one shot
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
                    $success = $success && $this->prefinish();
                }

                break;
            case 'redZone':
                $this->getCurrentState()->update($round);
                $success = $this->save();

                $isInRedZone = $this->getEvent()->getUseTimer() && $lastTimer && (
                    $lastTimer + (
                        $this->getEvent()->getGameDuration() * 60
                        - $this->getEvent()->getRuleset()->redZone()
                    ) < time()
                );

                if ($isInRedZone && $round->getOutcome() !== 'chombo') {
                    // should not finish game if chombo was made
                    $this->getCurrentState()->forceFinish();
                }

                if ($this->getCurrentState()->isFinished()) {
                    $success = $success && $this->prefinish();
                }

                break;
            default: // no zones, just update
                $this->getCurrentState()->update($round);
                $success = $this->save();

                // We should finish game here for offline events, but online ones will be finished manually in model.
                // Looks ugly :( But works as expected, so let it be until we find better solution.
                if (!$this->getEvent()->getIsOnline() && $this->getCurrentState()->isFinished()) {
                    $success = $success && $this->prefinish();
                }
        }

        return $success;
    }

    /**
     * @param RoundPrimitive $round
     * @return array [SessionState, array]
     */
    public function dryRunUpdateCurrentState(RoundPrimitive $round)
    {
        $cloneState = clone $this->getCurrentState();
        $paymentsInfo = $cloneState->update($round);
        return [$cloneState, $paymentsInfo];
    }

    /**
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

        return $success && $this->_finalizeGame();
    }

    /**
     * Generate session results
     * @return bool
     */
    protected function _finalizeGame()
    {
        $sessionResults = $this->getSessionResults();
        return array_reduce($sessionResults, function ($acc, SessionResultsPrimitive $result) {
            $playerHistoryItem = PlayerHistoryPrimitive::makeNewHistoryItem(
                $this->_db,
                $result->getPlayer(),
                $this,
                $result->getRatingDelta(),
                $result->getPlace()
            );

            // Should save the result explicitly! It's not saved inside ->getSessionResults()
            return $acc && $result->save() && $playerHistoryItem->save();
        }, true);
    }

    /**
     * Get a list on unsaved session results primitives
     * @return SessionResultsPrimitive[]
     */
    public function getSessionResults()
    {
        return array_map(function (PlayerPrimitive $player) {
            return (new SessionResultsPrimitive($this->_db))
                ->setPlayer($player)
                ->setSession($this)
                ->calc($this->getEvent()->getRuleset(), $this->getCurrentState(), $this->getPlayersIds());
        }, $this->getPlayers());
    }

    /**
     * Rollback round in current session
     * @param RoundPrimitive|MultiRoundPrimitive $round
     * @throws InvalidParametersException
     */
    public function rollback(RoundPrimitive $round)
    {
        $this->_current = $round->getLastSessionState();
        $round->drop();
        $this->setStatus(SessionPrimitive::STATUS_INPROGRESS)->save();
    }
}
