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
namespace Riichi;

use \Idiorm\ORM;

require_once __DIR__ . '/../Primitive.php';
require_once __DIR__ . '/Player.php';

/**
 * Class PlayerEnrollmentPrimitive
 *
 * Low-level model with basic CRUD operations and relations
 * @package Riichi
 */
class PlayerEnrollmentPrimitive extends Primitive
{
    protected static $_table = 'event_enrolled_players';

    protected static $_fieldsMapping = [
        'id'        => '_id',
        'event_id'  => '_eventId',
        'player_id' => '_playerId',
        'reg_pin'   => '_pin',
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id' => $this->_integerTransform(true),
            '_eventId' => $this->_integerTransform(),
            '_playerId' => $this->_integerTransform(),
            '_pin' => $this->_integerTransform()
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
    protected $_pin;

    protected function _create()
    {
        $playerReg = $this->_db->table(self::$_table)->create();
        if (empty($this->_pin)) {
            $this->_pin = mt_rand(100000, 999999);
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
                $this->_pin = $existingItem->_pin;
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
    public function getPin()
    {
        return $this->_pin;
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
     * @param IDb $db
     * @param $playerId
     * @param $eventId
     * @return PlayerEnrollmentPrimitive
     * @throws \Exception
     */
    public static function findByPlayerAndEvent(IDb $db, $playerId, $eventId)
    {
        return self::_findBySeveral($db, [
            'player_id' => [$playerId],
            'event_id' => [$eventId]
        ], ['onlyLast' => true]);
    }

    /**
     * @param IDb $db
     * @param $eventId
     * @return PlayerEnrollmentPrimitive[]
     * @throws \Exception
     */
    public static function findByEvent(IDb $db, $eventId)
    {
        return self::_findBy($db, 'event_id', [$eventId]);
    }

    /**
     * @param PlayerPrimitive $player
     * @param EventPrimitive $event
     * @return PlayerEnrollmentPrimitive
     */
    public function setReg(PlayerPrimitive $player, EventPrimitive $event)
    {
        $this->_eventId = $event->getId();
        $this->_playerId = $player->getId();
        return $this;
    }

    /**
     * @param IDb $db
     * @param $pin
     * @return null|PlayerEnrollmentPrimitive
     * @throws \Exception
     */
    public static function findByPin(IDb $db, $pin)
    {
        $result = self::_findBy($db, 'reg_pin', [$pin]);
        if (empty($result)) {
            return null;
        }
        return $result[0];
    }
}
