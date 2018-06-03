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
 * Class GroupPrimitive
 * User groups
 *
 * Low-level model with basic CRUD operations and relations
 * @package Frey
 */
class GroupPrimitive extends Primitive
{
    protected static $_table = 'group';
    const REL_PERSON = 'person_group';
    const REL_PERSON_UNIQUE_COLUMNS = ['person_id', 'group_id'];

    protected static $_fieldsMapping = [
        'id'            => '_id',
        'title'         => '_title',
        'label_color'   => '_labelColor',
        'description'   => '_description',
        '::person'      => '_personIds', // external many-to-many relation
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id'           => $this->_integerTransform(true),
            '_title'        => $this->_stringTransform(),
            '_labelColor'   => $this->_stringTransform(true),
            '_description'  => $this->_stringTransform(),
            '_personIds'   => $this->_externalManyToManyTransform(
                self::REL_PERSON,
                'group_id',
                'person_id',
                self::REL_PERSON_UNIQUE_COLUMNS
            ),
        ];
    }

    /**
     * Local id
     * @var int
     */
    protected $_id;
    /**
     * Title of group
     * @var string
     */
    protected $_title;
    /**
     * Group label color (for visual purposes)
     * @var string
     */
    protected $_labelColor;
    /**
     * Brief description
     * @var string
     */
    protected $_description;
    /**
     * List of person ids belonging to this group
     * @var int[]
     */
    protected $_personIds = [];
    /**
     * List of person entities
     * @var PersonPrimitive[]
     */
    protected $_persons = null;

    protected function _create()
    {
        $group = $this->_db->table(self::$_table)->create();
        $success = $this->_save($group);
        if ($success) {
            $this->_id = $this->_db->lastInsertId();
        }

        return $success;
    }

    protected function _deident()
    {
        $this->_id = null;
    }

    public function drop()
    {
        // First remove all linked dependencies
        $this->_db->table(self::REL_PERSON)->where('group_id', $this->getId())->deleteMany();
        $this->_db->table('group_access')->where('group_id', $this->getId())->deleteMany();

        return parent::drop();
    }

    /**
     * @param IDb $db
     * @param $ids
     * @return GroupPrimitive[]
     * @throws \Exception
     */
    public static function findById(IDb $db, $ids)
    {
        return self::_findBy($db, 'id', $ids);
    }

    /**
     * @return int
     */
    public function getId(): int
    {
        return $this->_id;
    }

    /**
     * @return string
     */
    public function getTitle(): string
    {
        return $this->_title;
    }

    /**
     * @param string $title
     * @return GroupPrimitive
     */
    public function setTitle(string $title): GroupPrimitive
    {
        $this->_title = $title;
        return $this;
    }

    /**
     * @return string
     */
    public function getLabelColor(): string
    {
        return $this->_labelColor;
    }

    /**
     * @param string $color
     * @return GroupPrimitive
     */
    public function setLabelColor(string $color): GroupPrimitive
    {
        $this->_labelColor = $color;
        return $this;
    }

    /**
     * @return string
     */
    public function getDescription(): string
    {
        return $this->_description;
    }

    /**
     * @param string $description
     * @return GroupPrimitive
     */
    public function setDescription(string $description): GroupPrimitive
    {
        $this->_description = $description;
        return $this;
    }

    /**
     * @return int[]
     */
    public function getPersonIds()
    {
        return $this->_personIds;
    }

    /**
     * @return PersonPrimitive[]
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function getPersons()
    {
        if ($this->_persons === null) {
            $this->_persons = PersonPrimitive::findById(
                $this->_db,
                $this->_personIds
            );
            if (empty($this->_persons) || count($this->_persons) !== count($this->_personIds)) {
                $this->_persons = null;
                throw new EntityNotFoundException("Not all persons were found in DB (among id#" . implode(',', $this->_personIds));
            }
        }

        return $this->_persons;
    }

    /**
     * @param PersonPrimitive[] $persons
     * @return $this
     */
    public function setPersons($persons)
    {
        $this->_persons = $persons;
        $this->_personIds = array_map(function (PersonPrimitive $person) {
            return $person->getId();
        }, $persons);

        return $this;
    }
}
