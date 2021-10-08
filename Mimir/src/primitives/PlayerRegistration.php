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
require_once __DIR__ . '/../FreyClient.php';

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
        'id'             => '_id',
        'event_id'       => '_eventId',
        'player_id'      => '_playerId',
        'replacement_id' => '_replacementPlayerId',
        'local_id'       => '_localId',
        'ignore_seating' => '_ignoreSeating',
        'team_name'      => '_teamName',
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id' => $this->_integerTransform(true),
            '_eventId' => $this->_integerTransform(),
            '_replacementPlayerId' => $this->_integerTransform(true),
            '_playerId' => $this->_integerTransform(),
            '_localId' => $this->_integerTransform(true),
            '_ignoreSeating' => $this->_integerTransform(),
            '_teamName' => $this->_stringTransform(),
        ];
    }

    protected ?int $_id;
    protected int $_eventId;
    protected int $_playerId;
    protected ?int $_replacementPlayerId;
    protected ?int $_localId = null;
    protected int $_ignoreSeating;
    protected string $_teamName;

    /**
     * @return bool|mixed
     * @throws \Exception
     */
    protected function _create()
    {
        $playerReg = $this->_ds->table(self::$_table)->create();
        $success = $this->_save($playerReg);
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
     * @return int|null
     */
    public function getReplacementPlayerId()
    {
        return $this->_replacementPlayerId;
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
     * @return int|null
     */
    public function getLocalId()
    {
        return $this->_localId;
    }

    /**
     * @return int
     */
    public function getIgnoreSeating()
    {
        return $this->_ignoreSeating;
    }

    /**
     * @return string
     */
    public function getTeamName()
    {
        return $this->_teamName;
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
            'event_id'  => [$eventId]
        ], ['onlyLast' => true]);
    }

    /**
     * @param DataSource $ds
     * @param int $eventId
     * @return PlayerRegistrationPrimitive[]
     * @throws \Exception
     */
    public static function findByEventId(DataSource $ds, int $eventId)
    {
        return self::_findBy($ds, 'event_id', [$eventId]);
    }

    /**
     * @param DataSource $ds
     * @param int $playerId
     *
     * @return PlayerRegistrationPrimitive[]
     * @throws \Exception
     */
    public static function findByPlayerId(DataSource $ds, int $playerId)
    {
        return self::_findBy($ds, 'player_id', [$playerId]);
    }

    /**
     * @param DataSource $ds
     * @param int $eventId
     * @return int
     * @throws \Exception
     */
    public static function findNextFreeLocalId(DataSource $ds, int $eventId)
    {
        $result = $ds->table(static::$_table)
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
     * @param DataSource $ds
     * @param int $eventId
     * @param array $idMap
     * @throws \Exception
     * @return boolean
     */
    public static function updateLocalIds(DataSource $ds, int $eventId, array $idMap)
    {
        $regs = self::findByEventId($ds, $eventId);
        $upsertData = [];
        foreach ($regs as $regItem) {
            if (empty($idMap[$regItem->getPlayerId()])) {
                continue;
            }

            $upsertData []= [
                'id'             => $regItem->getId(),
                'event_id'       => $eventId,
                'player_id'      => $regItem->getPlayerId(),
                'replacement_id' => $regItem->getReplacementPlayerId(),
                'local_id'       => $idMap[$regItem->getPlayerId()],
                'team_name'      => empty($regItem->getTeamName()) ? '' : $regItem->getTeamName()
            ];
        }
        return $ds->local()->upsertQuery(self::$_table, $upsertData, ['id']);
    }

    /**
     * Update players' team mapping for team event
     *
     * @param DataSource $ds
     * @param int $eventId
     * @param array $idMap
     * @throws \Exception
     * @return boolean
     */
    public static function updateTeamNames(DataSource $ds, int $eventId, array $idMap)
    {
        $regs = self::findByEventId($ds, $eventId);
        $upsertData = [];
        foreach ($regs as $regItem) {
            if (empty($idMap[$regItem->getPlayerId()])) {
                continue;
            }

            $upsertData []= [
                'id'             => $regItem->getId(),
                'event_id'       => $eventId,
                'player_id'      => $regItem->getPlayerId(),
                'replacement_id' => $regItem->getReplacementPlayerId(),
                'local_id'       => empty($regItem->getLocalId()) ? null : $regItem->getLocalId(),
                'team_name'      => $idMap[$regItem->getPlayerId()]
            ];
        }
        return $ds->local()->upsertQuery(self::$_table, $upsertData, ['id']);
    }

    /**
     * @param PlayerPrimitive $player
     * @param EventPrimitive $event
     * @return PlayerRegistrationPrimitive
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
     * For testing/dev purposes only!
     * Please use setReg in business-logic code!
     *
     * @param int $playerId
     * @param EventPrimitive $event
     * @return PlayerRegistrationPrimitive
     * @throws InvalidParametersException
     */
    public function _setRegRaw($playerId, EventPrimitive $event)
    {
        $eId = $event->getId();
        if (empty($eId)) {
            throw new InvalidParametersException('Attempted to assign deidented primitive');
        }
        $this->_eventId = $eId;
        $this->_playerId = $playerId;
        return $this;
    }

    public function setLocalId(?int $localId): PlayerRegistrationPrimitive
    {
        $this->_localId = $localId;
        return $this;
    }

    public function setReplacementPlayerId(?int $replacementPlayerId): PlayerRegistrationPrimitive
    {
        $this->_replacementPlayerId = $replacementPlayerId;
        return $this;
    }

    public function setIgnoreSeating(int $ignoreSeating): PlayerRegistrationPrimitive
    {
        $this->_ignoreSeating = $ignoreSeating;
        return $this;
    }

    public function setTeamName(string $teamName): PlayerRegistrationPrimitive
    {
        $this->_teamName = $teamName;
        return $this;
    }

    /**
     * @param DataSource $ds
     * @param int $eventId
     * @return array ['id' => int, 'local_id' => int|null, 'ignore_seating' => int][]
     * @throws \Exception
     */
    public static function findRegisteredPlayersIdsByEvent(DataSource $ds, int $eventId)
    {
        return array_map(function (PlayerRegistrationPrimitive $p) {
            return ['id' => $p->_playerId, 'local_id' => $p->_localId, 'ignore_seating' => $p->_ignoreSeating];
        }, self::_findBy($ds, 'event_id', [$eventId]));
    }

    /**
     * @param DataSource $ds
     * @param int[] $eventIds
     *
     *
     * @return array
     * @throws \Exception
     */
    public static function findIgnoredPlayersIdsByEvent(DataSource $ds, array $eventIds): array
    {
        $result = $ds->table(static::$_table)
            ->whereIn('event_id', $eventIds)
            ->where('ignore_seating', 1)
            ->findArray();

        return array_map(function ($p) {
            return $p['player_id'];
        }, $result);
    }

    /**
     * @param DataSource $ds
     * @param int[] $eventIdList
     * @return array ['id' => int, 'local_id' => int|null, 'replacement_id' => int|null][]
     * @throws \Exception
     */
    public static function fetchPlayerRegData(DataSource $ds, array $eventIdList)
    {
        return array_map(function (PlayerRegistrationPrimitive $p) {
            return [
                'id' => $p->_playerId,
                'local_id' => $p->_localId,
                'replacement_id' => $p->_replacementPlayerId
            ];
        }, self::_findBy($ds, 'event_id', $eventIdList));
    }

    /**
     * @param DataSource $ds
     * @param int[] $eventIdList
     * @param int[] $playerIdList
     * @return array ['id' => int, 'local_id' => int|null, 'replacement_id' => int|null][]
     * @throws \Exception
     */
    public static function fetchPlayerRegDataByIds(DataSource $ds, array $eventIdList, array $playerIdList)
    {
        return array_map(function (PlayerRegistrationPrimitive $p) {
            return [
                'id' => $p->_playerId,
                'local_id' => $p->_localId,
                'replacement_id' => $p->_replacementPlayerId
            ];
        }, self::_findBySeveral($ds, ['event_id' => $eventIdList, 'player_id' => $playerIdList]));
    }

    /**
     * @param DataSource $ds
     * @param int $eventId
     * @return PlayerPrimitive[]
     * @throws \Exception
     */
    public static function findRegisteredPlayersByEvent(DataSource $ds, int $eventId)
    {
        $ids = array_map(function ($el) {
            return $el['id'];
        }, self::findRegisteredPlayersIdsByEvent($ds, $eventId));

        if (empty($ids)) {
            return [];
        }

        return PlayerPrimitive::findById($ds, $ids);
    }

    /**
     * Finds all players registered to event.
     * Output array has player local id as key and player id as value.
     *
     * @param DataSource $ds
     * @param int $eventId
     * @return array [local_id => Player_id, ...]
     * @throws \Exception
     */
    public static function findLocalIdsMapByEvent(DataSource $ds, int $eventId)
    {
        $map = [];
        $items = self::_findBy($ds, 'event_id', [$eventId]);

        foreach ($items as $regItem) {
            $map[$regItem->getLocalId()] = $regItem->getPlayerId();
        }
        return $map;
    }

    /**
     * Finds all players registered to event associated with team names they participate in.
     * Output array has player id as key and team name as value.
     *
     * @param DataSource $ds
     * @param int $eventId
     * @return array [player_id => team name, ...]
     * @throws \Exception
     */
    public static function findTeamNameMapByEvent(DataSource $ds, int $eventId)
    {
        $map = [];
        $items = self::_findBy($ds, 'event_id', [$eventId]);

        foreach ($items as $regItem) {
            if (!$regItem->getTeamName()) {
                continue;
            }

            $map[$regItem->getPlayerId()] = $regItem->getTeamName();
        }
        return $map;
    }
}
