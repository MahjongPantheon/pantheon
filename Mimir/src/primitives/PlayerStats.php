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
 * Class PlayerStatsPrimitive
 *
 * Represents pre-calculated achievements data items
 * Low-level model with basic CRUD operations and relations
 * @package Mimir
 */
class PlayerStatsPrimitive extends Primitive
{
    protected static $_table = 'player_stats';

    protected static $_fieldsMapping = [
        'id'            => '_id',
        'event_id'      => '_eventId',
        'player_id'     => '_playerId',
        'data'          => '_data',
        'last_update'   => '_lastUpdate',
        'need_recalc'   => '_needRecalc'
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id'              => $this->_integerTransform(),
            '_eventId'         => $this->_integerTransform(),
            '_playerId'        => $this->_integerTransform(),
            '_data'            => $this->_jsonTransform(),
            '_lastUpdate'      => $this->_stringTransform(true),
            '_needRecalc'      => $this->_integerTransform(),
        ];
    }

    /**
     * Json serialize-deserialize
     * @return \Closure[]
     */
    protected function _jsonTransform(): array
    {
        return [
            'serialize' => function ($obj) {
                return json_encode($obj);
            },
            'deserialize' => function ($str) {
                try {
                    return json_decode($str, true, 512, JSON_THROW_ON_ERROR);
                } catch (\Exception $e) {
                    return [];
                }
            }
        ];
    }

    /**
     * Local id
     * @var int|null
     */
    protected $_id;
    /**
     * Related event id
     * @var int
     */
    protected $_eventId;
    /**
     * Player id
     * @var int
     */
    protected $_playerId;
    /**
     * Pre-computed player stats
     *
     * @var array
     */
    protected $_data;
    /**
     * Last update date
     * @var string
     */
    protected $_lastUpdate;
    /**
     * Do we need recalculation?
     * @var int
     */
    protected $_needRecalc;

    /**
     * Find stats
     *
     * @param DataSource $ds
     * @param int $eventId
     * @param int $playerId
     * @throws \Exception
     * @return PlayerStatsPrimitive[]
     */
    public static function findByEventAndPlayer(DataSource $ds, $eventId, $playerId)
    {
        return self::_findBySeveral($ds, ['event_id' => [$eventId], 'player_id' => [$playerId]]);
    }

    /**
     * Invalidate all player stats
     *
     * @param DataSource $ds
     * @param int $playerId
     * @throws \Exception
     * @return bool
     */
    public static function invalidateByPlayer(DataSource $ds, $playerId)
    {
        return (bool)($ds->table(self::$_table)
            ->rawQuery('UPDATE ' . self::$_table . ' SET need_recalc = 1 WHERE player_id = ' . intval($playerId))
            ->findOne());
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
     * @return int|null
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * @return int
     */
    public function getEventId()
    {
        return $this->_eventId;
    }

    /**
     * @param int $eventId
     * @return PlayerStatsPrimitive
     */
    public function setEventId($eventId)
    {
        $this->_eventId = $eventId;
        return $this;
    }

    /**
     * @return int
     */
    public function getPlayerId()
    {
        return $this->_playerId;
    }

    /**
     * @param int $playerId
     * @return PlayerStatsPrimitive
     */
    public function setPlayerId($playerId)
    {
        $this->_playerId = $playerId;
        return $this;
    }

    /**
     * @return array
     */
    public function getData()
    {
        return $this->_data;
    }

    /**
     * @param array $data
     * @return PlayerStatsPrimitive
     */
    public function setData($data)
    {
        $this->_data = $data;
        return $this;
    }

    /**
     * @return string
     */
    public function getLastUpdate()
    {
        return $this->_lastUpdate;
    }

    /**
     * @param string $lastUpdate
     * @return PlayerStatsPrimitive
     */
    public function setLastUpdate($lastUpdate)
    {
        $this->_lastUpdate = $lastUpdate;
        return $this;
    }

    /**
     * @return boolean
     */
    public function getNeedRecalc()
    {
        return $this->_needRecalc === 1;
    }

    /**
     * @param boolean $needRecalc
     * @return PlayerStatsPrimitive
     */
    public function setNeedRecalc($needRecalc)
    {
        $this->_needRecalc = $needRecalc ? 1 : 0;
        return $this;
    }
}
