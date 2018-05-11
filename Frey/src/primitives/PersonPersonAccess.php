<?php
/*  Frey: ACL & user data storage
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
namespace Frey;

;

require_once __DIR__ . '/../Primitive.php';

/**
 * Class PersonAccessPrimitive
 * Primitive for ACL rules for a single user
 *
 * Low-level model with basic CRUD operations and relations
 * @package Frey
 */
class PersonAccessPrimitive extends Primitive
{
    protected static $_table = 'person_access';
    const TYPE_BOOL = 'bool';
    const TYPE_INT = 'int';
    const TYPE_ENUM = 'enum'; // Type is called enum to prevent filling value fields with arbitrary strings.

    protected static $_fieldsMapping = [
        'id'                => '_id',
        'person_id'         => '_personId',
        'event_ids'         => '_eventIds',
        'acl_type'          => '_aclType',
        'acl_name'          => '_aclName',
        'acl_value'         => '_aclValue',
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id'        => $this->_integerTransform(true),
            '_personId'  => $this->_integerTransform(),
            '_eventIds'  => $this->_csvTransform(),
            '_aclType'   => $this->_stringTransform(),
            '_aclName'   => $this->_stringTransform(),
            '_aclValue'  => $this->_stringTransform(),
        ];
    }

    /**
     * Local id
     * @var int
     */
    protected $_id;
    /**
     * Id of person this rule is applied to
     * @var int
     */
    protected $_personId;
    /**
     * Person this rule is applied to
     * @var PersonPrimitive
     */
    protected $_person;
    /**
     * Events this rule is applied to. If empty, this means rule is applied system-wide.
     * @var int[]
     */
    protected $_eventIds;
    /**
     * Data type stored in this cell. Can be boolean, enum or integer
     * @var string
     */
    protected $_aclType;
    /**
     * ACL item recognizable name to differentiate this one from others
     * @var string
     */
    protected $_aclName;
    /**
     * ACL value. Has limit of 255 bytes long for performance reasons
     * @var string
     */
    protected $_aclValue;

    protected function _create()
    {
        $accessRule = $this->_db->table(self::$_table)->create();
        $success = $this->_save($accessRule);
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
     * @return int
     */
    public function getId(): int
    {
        return $this->_id;
    }

    /**
     * @return int
     */
    public function getPersonId(): int
    {
        return $this->_personId;
    }

    /**
     * @throws \Exception
     * @return PersonPrimitive
     */
    public function getPerson(): PersonPrimitive
    {
        if (empty($this->_person)) {
            $foundPersons = PersonPrimitive::findById($this->_db, [$this->_personId]);
            if (empty($foundPersons)) {
                throw new EntityNotFoundException("Entity PersonPrimitive with id#" . $this->_personId . ' not found in DB');
            }
            $this->_person = $foundPersons[0];
        }
        return $this->_person;
    }

    /**
     * @param PersonPrimitive $person
     * @return PersonAccessPrimitive
     */
    public function setPerson(PersonPrimitive $person): PersonAccessPrimitive
    {
        $this->_person = $person;
        $this->_personId = $person->getId();
        return $this;
    }

    /**
     * @return int[]
     */
    public function getEventsId()
    {
        return $this->_eventIds;
    }

    /**
     * @param int[] $eventIds
     * @return PersonAccessPrimitive
     */
    public function setEventIds($eventIds): PersonAccessPrimitive
    {
        $this->_eventIds = $eventIds;
        return $this;
    }

    /**
     * @return string
     */
    public function getAclType(): string
    {
        return $this->_aclType;
    }

    /**
     * @param string $aclType
     * @return PersonAccessPrimitive
     */
    public function setAclType(string $aclType): PersonAccessPrimitive
    {
        if ($aclType != self::TYPE_BOOL && $aclType != self::TYPE_ENUM && $aclType != self::TYPE_INT) {
            throw new \InvalidArgumentException('Unsupported ACL type: see TYPE_ constants in AccessPrimitive');
        }
        $this->_aclType = $aclType;
        return $this;
    }

    /**
     * @return string
     */
    public function getAclName(): string
    {
        return $this->_aclName;
    }

    /**
     * @param string $aclName
     * @return PersonAccessPrimitive
     */
    public function setAclName(string $aclName): PersonAccessPrimitive
    {
        $this->_aclName = $aclName;
        return $this;
    }

    /**
     * @return string
     */
    public function getAclValue(): string
    {
        return $this->_aclValue;
    }

    /**
     * @param string $aclValue
     * @return PersonAccessPrimitive
     */
    public function setAclValue(string $aclValue): PersonAccessPrimitive
    {
        $this->_aclValue = $aclValue;
        return $this;
    }
}
