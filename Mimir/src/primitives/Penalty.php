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

/**
 * Class PenaltyPrimitive
 *
 * @package Mimir
 */
class PenaltyPrimitive extends Primitive
{
    protected static $_table = 'penalty';

    protected static $_fieldsMapping = [
        'id'                => '_id',
        'player_id'         => '_playerId',
        'event_id'          => '_eventId',
        'session_id'        => '_sessionId',
        'created_at'        => '_createdAt',
        'assigned_by'       => '_assignedBy',
        'amount'            => '_amount',
        'reason'            => '_reason',
        'cancelled'         => '_cancelled',
        'cancelled_reason'  => '_cancelledReason',

    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id'              => $this->_integerTransform(),
            '_playerId'        => $this->_integerTransform(),
            '_eventId'         => $this->_integerTransform(),
            '_sessionId'       => $this->_integerTransform(true),
            '_createdAt'       => $this->_stringTransform(),
            '_assignedBy'      => $this->_integerTransform(),
            '_amount'          => $this->_integerTransform(),
            '_reason'          => $this->_stringTransform(),
            '_cancelled'       => $this->_integerTransform(),
            '_cancelledReason' => $this->_stringTransform(true),
        ];
    }

    /**
     * Local id
     * @var int|null
     */
    protected $_id;
    /**
     * Creation date
     * @var string
     */
    protected $_createdAt;
    /**
     * Penalized player
     * @var PlayerPrimitive | null
     */
    protected $_player;
    /**
     * Penalized player id
     * @var int
     */
    protected $_playerId;
    /**
     * Event penalty was applied in
     * @var EventPrimitive | null
     */
    protected $_event;
    /**
     * ID of event penalty was applied in
     * @var int
     */
    protected $_eventId;
    /**
     * (optional) Session during which the penalty has been applied
     * @var int|null
     */
    protected $_sessionId;
    /**
     * Referee who added a penalty
     * @var int
     */
    protected $_assignedBy;
    /**
     * Penalty points amount
     * @var int
     */
    protected $_amount;
    /**
     * Reason of the penalty
     * @var string
     */
    protected $_reason;
    /**
     * (Boolean) if the penalty should not be counted in the event
     * @var int
     */
    protected $_cancelled;
    /**
     * Reason of penalty cancellation
     * @var string|null
     */
    protected $_cancelledReason;

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
     * @param DataSource $ds
     * @param int[] $ids
     * @return PenaltyPrimitive[]
     * @throws \Exception
     */
    public static function findById(DataSource $ds, $ids)
    {
        return self::_findBy($ds, 'id', $ids);
    }

    /**
     * @param DataSource $ds
     * @param int[] $eventIds
     * @return PenaltyPrimitive[]
     * @throws \Exception
     */
    public static function findByEventId(DataSource $ds, $eventIds)
    {
        return self::_findBy($ds, 'event_id', $eventIds);
    }

    /**
     * @param DataSource $ds
     * @param int[] $sessionIds
     * @return PenaltyPrimitive[]
     * @throws \Exception
     */
    public static function findBySessionId(DataSource $ds, $sessionIds)
    {
        return self::_findBy($ds, 'session_id', $sessionIds);
    }

    /**
     * @param DataSource $ds
     * @param int $eventId
     * @param int $playerId
     * @return PenaltyPrimitive[]
     * @throws \Exception
     */
    public static function findByEventAndPlayer(DataSource $ds, $eventId, $playerId)
    {
        return self::_findBySeveral($ds, [
            'player_id'  => [$playerId],
            'event_id'   => [$eventId]
        ]);
    }

    /**
     * @return int|null
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * @return string
     */
    public function getCreatedAt(): string
    {
        return $this->_createdAt;
    }

    /**
     * @param string $createdAt
     * @return PenaltyPrimitive
     */
    public function setCreatedAt(string $createdAt): PenaltyPrimitive
    {
        $this->_createdAt = $createdAt;
        return $this;
    }

    /**
     * @return \Mimir\PlayerPrimitive
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getPlayer(): PlayerPrimitive
    {
        if (empty($this->_player)) {
            $p = PlayerPrimitive::findById($this->_ds, [$this->_playerId]);
            if (empty($p) || empty($p[0]->getId())) {
                throw new InvalidParametersException('Attempted to assign deidented primitive');
            }
            $this->_player = $p[0];
            $this->_playerId = $p[0]->getId();
        }

        return $this->_player;
    }

    /**
     * @param PlayerPrimitive $player
     * @return $this
     */
    public function setPlayer(PlayerPrimitive $player): PenaltyPrimitive
    {
        $this->_player = $player;
        $this->_playerId = $player->getId() ?? 0;
        return $this;
    }

    /**
     * @return int
     */
    public function getPlayerId(): int
    {
        return $this->_playerId;
    }

    /**
     * @param int $playerId
     * @return PenaltyPrimitive
     */
    public function setPlayerId(int $playerId): PenaltyPrimitive
    {
        $this->_playerId = $playerId;
        return $this;
    }

    /**
     * @return \Mimir\EventPrimitive
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getEvent(): EventPrimitive
    {
        if (empty($this->_event)) {
            $e = EventPrimitive::findById($this->_ds, [$this->_eventId]);
            if (empty($e) || empty($e[0]->getId())) {
                throw new InvalidParametersException('Attempted to assign deidented primitive');
            }
            $this->_event = $e[0];
            $this->_eventId = $e[0]->getId();
        }

        return $this->_event;
    }

    /**
     * @param EventPrimitive $event
     * @return $this
     */
    public function setEvent(EventPrimitive $event): PenaltyPrimitive
    {
        $this->_event = $event;
        $this->_eventId = $event->getId() ?? 0;
        return $this;
    }

    /**
     * @return int
     */
    public function getEventId(): int
    {
        return $this->_eventId;
    }

    /**
     * @param int $eventId
     * @return PenaltyPrimitive
     */
    public function setEventId(int $eventId): PenaltyPrimitive
    {
        $this->_eventId = $eventId;
        return $this;
    }

    /**
     * @return int|null
     */
    public function getSessionId(): ?int
    {
        return $this->_sessionId;
    }

    /**
     * @param int|null $sessionId
     * @return PenaltyPrimitive
     */
    public function setSessionId(?int $sessionId): PenaltyPrimitive
    {
        $this->_sessionId = $sessionId;
        return $this;
    }

    /**
     * @return int
     */
    public function getAssignedBy(): int
    {
        return $this->_assignedBy;
    }

    /**
     * @param int $assignedBy
     * @return PenaltyPrimitive
     */
    public function setAssignedBy(int $assignedBy): PenaltyPrimitive
    {
        $this->_assignedBy = $assignedBy;
        return $this;
    }

    /**
     * @return int
     */
    public function getAmount(): int
    {
        return $this->_amount;
    }

    /**
     * @param int $amount
     * @return PenaltyPrimitive
     */
    public function setAmount(int $amount): PenaltyPrimitive
    {
        $this->_amount = $amount;
        return $this;
    }

    /**
     * @return string
     */
    public function getReason(): string
    {
        return $this->_reason;
    }

    /**
     * @param string $reason
     * @return PenaltyPrimitive
     */
    public function setReason(string $reason): PenaltyPrimitive
    {
        $this->_reason = $reason;
        return $this;
    }

    /**
     * @return int
     */
    public function getCancelled(): int
    {
        return $this->_cancelled;
    }

    /**
     * @param int $cancelled
     * @return PenaltyPrimitive
     */
    public function setCancelled(int $cancelled): PenaltyPrimitive
    {
        $this->_cancelled = $cancelled;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getCancelledReason(): ?string
    {
        return $this->_cancelledReason;
    }

    /**
     * @param string|null $cancelledReason
     * @return PenaltyPrimitive
     */
    public function setCancelledReason(?string $cancelledReason): PenaltyPrimitive
    {
        $this->_cancelledReason = $cancelledReason;
        return $this;
    }
}
