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
 * Class PersonAccessPrimitive
 * Primitive for ACL rules for a single user
 *
 * Low-level model with basic CRUD operations and relations
 * @package Frey
 */
class PersonAccessPrimitive extends AccessPrimitive
{
    protected static $_table = 'person_access';

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
     * Find rules by person id list
     *
     * @param IDb $db
     * @param $ids
     * @return PersonAccessPrimitive[]
     * @throws \Exception
     */
    public static function findByPerson(IDb $db, $ids)
    {
        return self::_findBy($db, 'person_id', $ids);
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
}
