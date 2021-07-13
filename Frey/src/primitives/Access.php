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

require_once __DIR__ . '/../Primitive.php';

/**
 * Class AccessPrimitive
 * Primitive for ACL rules for abstract entity
 *
 * Low-level model with basic CRUD operations and relations
 * @package Frey
 */
abstract class AccessPrimitive extends Primitive
{
    const TYPE_BOOL = 'bool';
    const TYPE_INT = 'int';
    const TYPE_ENUM = 'enum'; // Type is called enum to prevent filling value fields with arbitrary strings.

    /**
     * Local id
     * @var int | null
     */
    protected $_id;
    /**
     * Event this rule is applied to. If empty, this means rule is applied system-wide.
     * @var int
     */
    protected $_eventId;
    /**
     * Data type stored in this cell. Can be bool, enum or int
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
     * Should have strict string type for database storage
     * @var string
     */
    protected $_aclValue;
    /**
     * ACL enum allowed values list
     * @var string[]
     */
    protected $_allowedValues = [];

    protected function _create()
    {
        $accessRule = $this->_db->table(static::$_table)->create();
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
     * @param IDb $db
     * @param int[] $ids
     *
     * @return AccessPrimitive[]
     * @throws \Exception
     */
    public static function findById(IDb $db, array $ids)
    {
        return self::_findBy($db, 'id', $ids);
    }

    /**
     * @return int | null
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
     * @return self
     */
    public function setEventId($eventId)
    {
        $this->_eventId = $eventId;
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
     * @return self
     */
    public function setAclType(string $aclType)
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
     * @return self
     */
    public function setAclName(string $aclName)
    {
        $this->_aclName = $aclName;
        return $this;
    }

    /**
     * @return array
     */
    public function getAllowedValues(): array
    {
        switch ($this->_aclType) {
            case self::TYPE_BOOL:
                return ['true', 'false'];
            case self::TYPE_ENUM:
                return $this->_allowedValues ?: [];
            case self::TYPE_INT:
            default:
                return [];
        }
    }

    /**
     * @param array $allowedValues
     * @return self
     */
    public function setAllowedValues(array $allowedValues)
    {
        $this->_allowedValues = $allowedValues;
        return $this;
    }

    /**
     * @return string|int|bool
     * @throws InvalidParametersException
     */
    public function getAclValue()
    {
        switch ($this->_aclType) {
            case AccessPrimitive::TYPE_BOOL:
                return $this->_aclValue == 'true';
            case AccessPrimitive::TYPE_INT:
                return intval($this->_aclValue);
            case AccessPrimitive::TYPE_ENUM:
                return $this->_aclValue;
            default:
                throw new InvalidParametersException('Unsupported ACL type');
        }
    }

    /**
     * @param string|int|bool $aclValue
     * @throws InvalidParametersException
     * @return self
     */
    public function setAclValue($aclValue)
    {
        switch ($this->_aclType) {
            case AccessPrimitive::TYPE_BOOL:
                $this->_aclValue = (!!$aclValue) ? 'true' : 'false';
                return $this;
            case AccessPrimitive::TYPE_INT:
                $this->_aclValue = (string)intval($aclValue);
                return $this;
            case AccessPrimitive::TYPE_ENUM:
                $this->_aclValue = (string)$aclValue;
                return $this;
            default:
                throw new InvalidParametersException('Unsupported ACL type');
        }
    }
}
