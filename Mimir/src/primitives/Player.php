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
require_once __DIR__ . '/../exceptions/BadAction.php';

/**
 * Class PlayerPrimitive
 *
 * Networked primitive: uses remote service as a data source
 * @package Mimir
 */
class PlayerPrimitive extends Primitive
{
    /**
     * Local id
     * @var int|null
     */
    protected $_id;
    /**
     * How to display in state
     * @var string
     */
    protected $_displayName;
    /**
     * Tenhou username (actually not id!)
     * @var string
     */
    protected $_tenhouId;
    /**
     * Is player a substitution player
     *
     * TODO: в аккаунтной схеме с заменами будут сложности. Надо что-то придумывать.
     *
     * @var int
     */
    protected $_isReplacement = 0;

    /**
     * PlayerPrimitive constructor.
     * @param DataSource $ds
     */
    public function __construct(DataSource $ds)
    {
        // Parent constructor not called intentionally.
        $this->_ds = $ds;
    }

    /**
     * Find players by local ids
     *
     * @param DataSource $ds
     * @param int[] $ids
     * @throws \Exception
     * @return PlayerPrimitive[]
     */
    public static function findById(DataSource $ds, array $ids)
    {
        $data = $ds->remote()->getPersonalInfo($ids);

        return array_map(function ($item) use ($ds) {
            return (new PlayerPrimitive($ds))
                ->setTenhouId($item['tenhou_id'])
                ->setDisplayName($item['title'])
                ->_setId($item['id']);
        }, $data);
    }

    /**
     * Find players by tenhou ids
     * Method should maintain sorting of items according to ids order.
     *
     * @param DataSource $ds
     * @param string[] $ids
     * @throws \Exception
     * @return PlayerPrimitive[]
     */
    public static function findByTenhouId(DataSource $ds, $ids)
    {
        $playersData = $ds->remote()->findByTenhouIds($ids);
        /** @var PlayerPrimitive[] $players */
        $players = array_map(function ($item) use ($ds) {
            return (new PlayerPrimitive($ds))
                ->setTenhouId($item['tenhou_id'])
                ->setDisplayName($item['title'])
                ->_setId($item['id']);
        }, $playersData);

        $playersMap = array_combine(
            array_map(function (PlayerPrimitive $player) {
                return $player->getTenhouId();
            }, $players),
            $players
        );

        if (!$playersMap) {
            throw new InvalidParametersException('Cant combine inequal arrays');
        }

        return array_filter(array_map(function ($id) use ($playersMap) {
            return empty($playersMap[$id]) ? null : $playersMap[$id];
        }, $ids));
    }

    /**
     * @return mixed|void
     * @throws BadActionException
     */
    protected function _create()
    {
        throw new BadActionException('Networked Player primitives are considered to be readonly!');
    }

    /**
     * @return bool|void
     * @throws BadActionException
     */
    public function save()
    {
        throw new BadActionException('Networked Player primitives are considered to be readonly!');
    }

    protected function _deident()
    {
        $this->_id = null;
    }

    /**
     * @param string $displayName
     * @return $this
     */
    public function setDisplayName($displayName)
    {
        $this->_displayName = $displayName;
        return $this;
    }

    /**
     * @return string
     */
    public function getDisplayName()
    {
        return $this->_displayName;
    }

    /**
     * @return int|null
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * @param int $id
     * @return $this
     */
    protected function _setId($id)
    {
        $this->_id = $id;
        return $this;
    }

    /**
     * @param string $tenhouId
     * @return $this
     */
    public function setTenhouId($tenhouId)
    {
        $this->_tenhouId = $tenhouId;
        return $this;
    }

    /**
     * @return string
     */
    public function getTenhouId()
    {
        return $this->_tenhouId;
    }

    /**
     * @param int $isRep
     * @return $this
     */
    public function setIsReplacement($isRep)
    {
        $this->_isReplacement = $isRep;
        return $this;
    }

    /**
     * @return int
     */
    public function getIsReplacement()
    {
        return $this->_isReplacement;
    }
}
