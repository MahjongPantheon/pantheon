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
        'event_ids'         => '_eventIds',
        'acl_type'          => '_aclType',
        'acl_name'          => '_aclName',
        'acl_value'         => '_aclValue',
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id'        => $this->_integerTransform(true),
            '_groupId'   => $this->_integerTransform(),
            '_eventIds'  => $this->_csvTransform(),
            '_aclType'   => $this->_stringTransform(),
            '_aclName'   => $this->_stringTransform(),
            '_aclValue'  => $this->_stringTransform(),
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
     * @param $ids
     * @return GroupAccessPrimitive[]
     * @throws \Exception
     */
    public static function findByGroup(IDb $db, $ids)
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
     */
    public function setGroup(GroupPrimitive $group): GroupAccessPrimitive
    {
        $this->_group = $group;
        $this->_groupId = $group->getId();
        return $this;
    }
}
