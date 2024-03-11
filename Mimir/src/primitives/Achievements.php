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
 * Class AchievementsPrimitive
 *
 * Represents pre-calculated achievements data items
 * Low-level model with basic CRUD operations and relations
 * @package Mimir
 */
class AchievementsPrimitive extends Primitive
{
    protected static $_table = 'achievements';

    protected static $_fieldsMapping = [
        'id'            => '_id',
        'event_id'      => '_eventId',
        'data'          => '_data',
        'last_update'   => '_lastUpdate',
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id'              => $this->_integerTransform(),
            '_eventId'         => $this->_integerTransform(),
            '_data'            => $this->_jsonTransform(),
            '_lastUpdate'      => $this->_stringTransform(true),
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
     * Related event
     * @var EventPrimitive|null
     */
    protected $_event;
    /**
     * Achievements data
     *
     * [
     *   id => [
     *      title => '...',
     *      data => [...]
     *      ....
     *   ],
     *   ....
     * ]
     * @var array
     */
    protected $_data;
    /**
     * Last update date
     * @var string
     */
    protected $_lastUpdate;

    /**
     * Find achievements by event ids
     *
     * @param DataSource $ds
     * @param int[] $ids
     * @throws \Exception
     * @return AchievementsPrimitive[]
     */
    public static function findByEventId(DataSource $ds, $ids)
    {
        return self::_findBy($ds, 'event_id', $ids);
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
     * @return AchievementsPrimitive
     */
    public function setEventId($eventId)
    {
        $this->_eventId = $eventId;
        return $this;
    }

    /**
     * @return EventPrimitive
     * @throws EntityNotFoundException
     * @throws \Exception
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
     * @param EventPrimitive $event
     * @return AchievementsPrimitive
     * @throws InvalidParametersException
     */
    public function setEvent($event)
    {
        $id = $event->getId();
        if (empty($id)) {
            throw new InvalidParametersException('Attempted to assign deidented primitive');
        }
        $this->_eventId = $id;
        $this->_event = $event;
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
     * @return AchievementsPrimitive
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
     * @return AchievementsPrimitive
     */
    public function setLastUpdate($lastUpdate)
    {
        $this->_lastUpdate = $lastUpdate;
        return $this;
    }
}
