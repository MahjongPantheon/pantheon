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
 * Class FormationPrimitive
 *
 * Represents any organisation, club, association of players, etc
 * Low-level model with basic CRUD operations and relations
 * @package Mimir
 */
class FormationPrimitive extends Primitive
{
    protected static $_table = 'formation';

    protected static $_fieldsMapping = [
        'id'            => '_id',
        'title'         => '_title',
        'description'   => '_description',
        'city'          => '_city',
        'logo'          => '_logo',
        'contact_info'  => '_contactInfo',
        'primary_owner' => '_primaryOwnerId',
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_primaryOwnerId'  => $this->_integerTransform(),
            '_id'              => $this->_integerTransform(true),
        ];
    }

    // TODO! many-to-many relation here!

    /**
     * Local id
     * @var int
     */
    protected $_id;
    /**
     * FormationPrimitive title
     * @var string
     */
    protected $_title;
    /**
     * FormationPrimitive location
     * @var string
     */
    protected $_city;
    /**
     * FormationPrimitive description
     * @var string
     */
    protected $_description;
    /**
     * Logo image local URL
     * @var string
     */
    protected $_logo;
    /**
     * Contact info
     * @var string
     */
    protected $_contactInfo;
    /**
     * Owner player
     * @var PlayerPrimitive|null
     */
    protected $_primaryOwner = null;
    /**
     * Owner player id
     * @var int
     */
    protected $_primaryOwnerId;

    /**
     * Find formations by local ids (primary key)
     *
     * @param IDb $db
     * @param int[] $ids
     * @throws \Exception
     * @return FormationPrimitive[]
     */
    public static function findById(IDb $db, $ids)
    {
        return self::_findBy($db, 'id', $ids);
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
     * @param string $description
     * @return FormationPrimitive
     */
    public function setDescription($description)
    {
        $this->_description = $description;
        return $this;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->_description;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * @param null|\Mimir\PlayerPrimitive $owner
     * @return FormationPrimitive
     */
    public function setPrimaryOwner($owner)
    {
        $this->_primaryOwner = $owner;
        $this->_primaryOwnerId = $owner->getId();
        return $this;
    }

    /**
     * @throws EntityNotFoundException
     * @return null|\Mimir\PlayerPrimitive
     */
    public function getPrimaryOwner()
    {
        if (!$this->_primaryOwner) {
            $foundUsers = PlayerPrimitive::findById($this->_db, [$this->_primaryOwnerId]);
            if (empty($foundUsers)) {
                throw new EntityNotFoundException("Entity PlayerPrimitive with id#" . $this->_primaryOwnerId . ' not found in DB');
            }
            $this->_primaryOwner = $foundUsers[0];
        }
        return $this->_primaryOwner;
    }

    /**
     * @param string $title
     * @return FormationPrimitive
     */
    public function setTitle($title)
    {
        $this->_title = $title;
        return $this;
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->_title;
    }

    /**
     * @param string $logo
     * @return FormationPrimitive
     */
    public function setLogo($logo)
    {
        $this->_logo = $logo;
        return $this;
    }

    /**
     * @return string
     */
    public function getLogo()
    {
        return $this->_logo;
    }

    /**
     * @return int
     */
    public function getPrimaryOwnerId()
    {
        return $this->_primaryOwnerId;
    }

    /**
     * @param string $contactInfo
     * @return FormationPrimitive
     */
    public function setContactInfo($contactInfo)
    {
        $this->_contactInfo = $contactInfo;
        return $this;
    }

    /**
     * @return string
     */
    public function getContactInfo()
    {
        return $this->_contactInfo;
    }

    /**
     * @param string $city
     * @return FormationPrimitive
     */
    public function setCity($city)
    {
        $this->_city = $city;
        return $this;
    }

    /**
     * @return string
     */
    public function getCity()
    {
        return $this->_city;
    }
}
