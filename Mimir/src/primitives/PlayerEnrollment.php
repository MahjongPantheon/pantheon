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
 * Class PlayerEnrollmentPrimitive
 *
 * Low-level model with basic CRUD operations and relations
 * @package Mimir
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
     * @var int|null
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

    /**
     * @return bool|mixed
     * @throws \Exception
     */
    protected function _create()
    {
        $playerReg = $this->_ds->table(self::$_table)->create();
        if (empty($this->_pin)) {
            $this->_pin = (string)mt_rand(100000, 999999);
        }

        try {
            $success = $this->_save($playerReg);
            if ($success) {
                $this->_id = $this->_ds->local()->lastInsertId();
            }
        } catch (\PDOException $e) { // duplicate unique key, get existing item
            $existingItem = self::findByPlayerAndEvent($this->_ds, $this->_playerId, $this->_eventId);
            if (!empty($existingItem)) {
                $this->_id = $existingItem[0]->_id;
                $this->_eventId = $existingItem[0]->_eventId;
                $this->_playerId = $existingItem[0]->_playerId;
                $this->_pin = $existingItem[0]->_pin;
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
     * @return int|null
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

    public function getEventId(): int
    {
        return $this->_eventId;
    }

    public function getPlayerId(): int
    {
        return $this->_playerId;
    }

    /**
     * @param DataSource $ds
     * @param int $playerId
     * @param int $eventId
     *
     * @return self[]
     *
     * @throws \Exception
     *
     * @psalm-return array<array-key, self>
     */
    public static function findByPlayerAndEvent(DataSource $ds, int $playerId, int $eventId)
    {
        return self::_findBySeveral($ds, [
            'player_id' => [$playerId],
            'event_id' => [$eventId]
        ], ['onlyLast' => true]);
    }

    /**
     * @param DataSource $ds
     * @param int $eventId
     * @return PlayerEnrollmentPrimitive[]
     * @throws \Exception
     */
    public static function findByEvent(DataSource $ds, int $eventId)
    {
        return self::_findBy($ds, 'event_id', [$eventId]);
    }

    /**
     * @param PlayerPrimitive $player
     * @param EventPrimitive $event
     * @return PlayerEnrollmentPrimitive
     * @throws InvalidParametersException
     */
    public function setReg(PlayerPrimitive $player, EventPrimitive $event)
    {
        $eId = $event->getId();
        $pId = $player->getId();
        if (empty($eId) || empty($pId)) {
            throw new InvalidParametersException('Attempted to assign deidented primitive');
        }
        $this->_eventId = $eId;
        $this->_playerId = $pId;
        return $this;
    }

    /**
     * @param DataSource $ds
     * @param string $pin
     * @return null|PlayerEnrollmentPrimitive
     * @throws \Exception
     */
    public static function findByPin(DataSource $ds, string $pin)
    {
        $result = self::_findBy($ds, 'reg_pin', [$pin]);
        if (empty($result)) {
            return null;
        }
        return $result[0];
    }
}
