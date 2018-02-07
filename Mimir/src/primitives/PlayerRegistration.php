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
require_once __DIR__ . '/Player.php';

/**
 * Class PlayerRegistrationPrimitive
 *
 * Low-level model with basic CRUD operations and relations
 * @package Mimir
 */
class PlayerRegistrationPrimitive extends Primitive
{
    protected static $_table = 'event_registered_players';

    protected static $_fieldsMapping = [
        'id'            => '_id',
        'event_id'      => '_eventId',
        'player_id'     => '_playerId',
        'auth_token'    => '_token',
        'local_id'      => '_localId'
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id' => $this->_integerTransform(true),
            '_eventId' => $this->_integerTransform(),
            '_token' => $this->_stringTransform(),
            '_playerId' => $this->_integerTransform(),
            '_localId' => $this->_integerTransform(true)
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
     * @var int
     */
    protected $_playerId;
    /**
     * @var string
     */
    protected $_token;
    /**
     * @var int
     */
    protected $_localId;

    protected function _create()
    {
        $playerReg = $this->_db->table(self::$_table)->create();
        if (empty($this->_token)) {
            $this->_token = sha1('PlayerReg' . microtime());
        }

        try {
            $success = $this->_save($playerReg);
            if ($success) {
                $this->_id = $this->_db->lastInsertId();
            }
        } catch (\PDOException $e) { // duplicate unique key, get existing item
            $existingItem = self::findByPlayerAndEvent($this->_db, $this->_playerId, $this->_eventId);
            if (!empty($existingItem)) {
                $this->_id = $existingItem->_id;
                $this->_eventId = $existingItem->_eventId;
                $this->_playerId = $existingItem->_playerId;
                $this->_token = sha1('PlayerReg' . microtime()); // Token to be updated on every re-issue!
                $this->save();
                $success = true;
            } else {
                $success = false;
            }
        }

        return $success;
    }

    protected function _deident()
    {
        $this->_id = null;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * @return string
     */
    public function getToken()
    {
        return $this->_token;
    }

    public function getEventId()
    {
        return $this->_eventId;
    }

    public function getPlayerId()
    {
        return $this->_playerId;
    }

    /**
     * @return int
     */
    public function getLocalId()
    {
        return $this->_localId;
    }

    /**
     * @param IDb $db
     * @param $playerId
     * @param $eventId
     * @return PlayerRegistrationPrimitive | []
     * @throws \Exception
     */
    public static function findByPlayerAndEvent(IDb $db, $playerId, $eventId)
    {
        return self::_findBySeveral($db, [
            'player_id' => [$playerId],
            'event_id'  => [$eventId]
        ], ['onlyLast' => true]);
    }

    /**
     * @param IDb $db
     * @param $eventId
     * @return PlayerRegistrationPrimitive[]
     * @throws \Exception
     */
    public static function findByEventId(IDb $db, $eventId)
    {
        return self::_findBy($db, 'event_id', [$eventId]);
    }

    /**
     * @param IDb $db
     * @param $eventId
     * @return int
     * @throws \Exception
     */
    public static function findNextFreeLocalId(IDb $db, $eventId)
    {
        $result = $db->table(static::$_table)
            ->where('event_id', $eventId)
            ->orderByDesc('local_id')
            ->limit(1)
            ->findArray();

        if (empty($result)) {
            return 1; // first player in event ever
        }

        return $result[0]['local_id'] + 1;
    }

    /**
     * Update players' local ids mapping for prescripted event
     *
     * @param IDb $db
     * @param $eventId
     * @param $idMap
     * @throws \Exception
     * @return boolean
     */
    public static function updateLocalIds(IDb $db, $eventId, $idMap)
    {
        $regs = self::findByEventId($db, $eventId);
        $upsertData = [];
        foreach ($regs as $regItem) {
            if (empty($idMap[$regItem->getPlayerId()])) {
                continue;
            }

            $upsertData []= [
                'id'            => $regItem->getId(),
                'event_id'      => $eventId,
                'player_id'     => $regItem->getPlayerId(),
                'auth_token'    => $regItem->getToken(),
                'local_id'      => $idMap[$regItem->getPlayerId()]
            ];
        }
        return $db->upsertQuery(self::$_table, $upsertData, ['id']);
    }

    /**
     * @param PlayerPrimitive $player
     * @param EventPrimitive $event
     * @return PlayerRegistrationPrimitive
     */
    public function setReg(PlayerPrimitive $player, EventPrimitive $event)
    {
        $this->_eventId = $event->getId();
        $this->_playerId = $player->getId();
        return $this;
    }

    /**
     * @param int $localId
     * @return $this
     */
    public function setLocalId($localId)
    {
        $this->_localId = $localId;
        return $this;
    }

    /**
     * @param IDb $db
     * @param $eventId
     * @return int[]
     * @throws \Exception
     */
    public static function findRegisteredPlayersIdsByEvent(IDb $db, $eventId)
    {
        return array_map(function (PlayerRegistrationPrimitive $p) {
            return $p->_playerId;
        }, self::_findBy($db, 'event_id', [$eventId]));
    }

    /**
     * @param IDb $db
     * @param $eventId
     * @return PlayerPrimitive[]
     * @throws \Exception
     */
    public static function findRegisteredPlayersByEvent(IDb $db, $eventId)
    {
        $ids = self::findRegisteredPlayersIdsByEvent($db, $eventId);
        if (empty($ids)) {
            return [];
        }

        return PlayerPrimitive::findById($db, $ids);
    }

    /**
     * @param IDb $db
     * @param $token
     * @return null|PlayerRegistrationPrimitive
     * @throws \Exception
     */
    public static function findEventAndPlayerByToken(IDb $db, $token)
    {
        if (empty($token)) {
            return null;
        }

        $result = self::_findBy($db, 'auth_token', [$token]);
        if (empty($result)) {
            return null;
        }
        return $result[0];
    }

    /**
     * Finds all players registered to event.
     * Output array has player local id as key and player id as value.
     *
     * @param IDb $db
     * @param $eventId
     * @return array [local_id => Player_id, ...]
     * @throws \Exception
     */
    public static function findLocalIdsMapByEvent(IDb $db, $eventId)
    {
        $map = [];
        /** @var PlayerRegistrationPrimitive[] $items */
        $items = self::_findBy($db, 'event_id', [$eventId]);

        foreach ($items as $regItem) {
            $map[$regItem->getLocalId()] = $regItem->getPlayerId();
        }
        return $map;
    }
}
