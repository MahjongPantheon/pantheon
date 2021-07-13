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

require_once __DIR__ . '/Access.php';

/**
 * Class GroupAccessPrimitive
 * Primitive for ACL rules for group of users
 *
 * Low-level model with basic CRUD operations and relations
 * @package Frey
 */
class GroupAccessPrimitive extends AccessPrimitive
{
    protected static $_table = 'group_access';

    protected static $_fieldsMapping = [
        'id'                => '_id',
        'group_id'          => '_groupId',
        'event_id'          => '_eventId',
        'acl_type'          => '_aclType',
        'acl_name'          => '_aclName',
        'acl_value'         => '_aclValue',
        'allowed_values'    => '_allowedValues',
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id'        => $this->_integerTransform(true),
            '_groupId'   => $this->_integerTransform(),
            '_eventId'   => $this->_integerTransform(true),
            '_aclType'   => $this->_stringTransform(),
            '_aclName'   => $this->_stringTransform(),
            '_aclValue'  => $this->_stringTransform(),
            '_allowedValues' => $this->_csvTransform(),
        ];
    }

    /**
     * Id of group this rule is applied to
     * @var int
     */
    protected $_groupId;
    /**
     * Person this rule is applied to
     * @var GroupPrimitive
     */
    protected $_group;

    /**
     * Find rules by group id
     *
     * @param IDb $db
     * @param int[] $ids
     *
     * @return GroupAccessPrimitive[]
     * @throws \Exception
     */
    public static function findByGroup(IDb $db, array $ids)
    {
        return self::_findBy($db, 'group_id', $ids);
    }

    /**
     * @return int
     */
    public function getGroupId(): int
    {
        return $this->_groupId;
    }

    /**
     * @throws \Exception
     * @return GroupPrimitive
     */
    public function getGroup(): GroupPrimitive
    {
        if (empty($this->_group)) {
            $foundGroups = GroupPrimitive::findById($this->_db, [$this->_groupId]);
            if (empty($foundGroups)) {
                throw new EntityNotFoundException("Entity GroupPrimitive with id#" . $this->_groupId . ' not found in DB');
            }
            $this->_group = $foundGroups[0];
        }
        return $this->_group;
    }

    /**
     * @param GroupPrimitive $group
     * @return GroupAccessPrimitive
     * @throws InvalidParametersException
     */
    public function setGroup(GroupPrimitive $group): GroupAccessPrimitive
    {
        $id = $group->getId();
        if (empty($id)) {
            throw new InvalidParametersException('Attempted to use deidented primitive');
        }
        $this->_group = $group;
        $this->_groupId = $id;
        return $this;
    }
}
