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
 * Class PersonPrimitive
 *
 * Low-level model with basic CRUD operations and relations
 * @package Frey
 */
class PersonPrimitive extends Primitive
{
    protected static $_table = 'person';
    const REL_GROUP = 'person_group';
    const REL_GROUP_UNIQUE_COLUMNS = ['person_id', 'group_id'];

    protected static $_fieldsMapping = [
        'id'                => '_id',
        'email'             => '_email',
        'phone'             => '_phone',
        'title'             => '_title',
        'auth_hash'         => '_authHash',
        'auth_salt'         => '_authSalt',
        'auth_reset_token'  => '_authResetToken',
        'city'              => '_city',
        'tenhou_id'         => '_tenhouId',
        'disabled'          => '_disabled',
        'is_superadmin'     => '_superadmin',
        '::group'           => '_groupIds', // external many-to-many relation
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id'       => $this->_integerTransform(true),
            '_email'    => $this->_stringTransform(),
            '_phone'    => $this->_stringTransform(),
            '_title'    => $this->_stringTransform(),
            '_authHash' => $this->_stringTransform(),
            '_authSalt' => $this->_stringTransform(),
            '_authResetToken' => $this->_stringTransform(true),
            '_city'     => $this->_stringTransform(true),
            '_tenhouId' => $this->_stringTransform(true),
            '_disabled' => $this->_integerTransform(),
            '_superadmin' => $this->_integerTransform(),
            '_groupIds'   => $this->_externalManyToManyTransform(
                self::REL_GROUP,
                'person_id',
                'group_id',
                self::REL_GROUP_UNIQUE_COLUMNS
            ),
        ];
    }

    /**
     * Local id
     * @var int | null
     */
    protected $_id;
    /**
     * Person's email. Used both as primary login identifier and contact info.
     * @var string
     */
    protected $_email;
    /**
     * Person's phone number. Used as contact info.
     * @var string
     */
    protected $_phone;
    /**
     * How person should be called across systems
     * @var string
     */
    protected $_title;
    /**
     * Full stored password hash created as password_hash(client_side_token)
     * @var string
     */
    protected $_authHash;
    /**
     * Salt used to create permanent client-side token as hash(password.salt)
     * @var string
     */
    protected $_authSalt;
    /**
     * Used for check if user really wants to reset his password.
     * This token is sent over email as 2nd-factor auth.
     * @var string
     */
    protected $_authResetToken;
    /**
     * Personal data: person local city
     * @var string
     */
    protected $_city;
    /**
     * Personal data: associated tenhou.net ID
     * @var string
     */
    protected $_tenhouId;
    /**
     * If this personal account is disabled
     * @var int
     */
    protected $_disabled;
    /**
     * If this personal account has all possible privileges
     * @var int
     */
    protected $_superadmin;
    /**
     * List of group ids this person belongs to
     * @var int[]
     */
    protected $_groupIds = [];
    /**
     * List of group entities
     * @var GroupPrimitive[]|null
     */
    protected $_groups = null;

    /**
     * Find persons by local ids (primary key)
     *
     * @param IDb $db
     * @param int[] $ids
     * @throws \Exception
     * @return PersonPrimitive[]
     */
    public static function findById(IDb $db, $ids)
    {
        return self::_findBy($db, 'id', $ids);
    }

    /**
     * Find persons by tenhou ids (indexed search)
     *
     * @param IDb $db
     * @param int[] $ids
     * @throws \Exception
     * @return PersonPrimitive[]
     */
    public static function findByTenhouId(IDb $db, $ids)
    {
        return self::_findBy($db, 'tenhou_id', $ids);
    }

    /**
     * Find persons by email addresses (indexed search)
     *
     * @param IDb $db
     * @param string[] $emails
     * @throws \Exception
     * @return PersonPrimitive[]
     */
    public static function findByEmail(IDb $db, $emails)
    {
        return self::_findBy($db, 'email', $emails);
    }

    /**
     * Fuzzy search by title (simple pattern search).
     *
     * @param IDb $db
     * @param string $query
     * @return PersonPrimitive[]|null
     */
    public static function findByTitleFuzzy(IDb $db, string $query)
    {
        $query = str_replace(['%', '_'], '', $query);
        if (mb_strlen($query) <= 2) {
            return null;
        }

        $objects = $db->table(self::$_table)
            ->whereLike('title', '%' . $query . '%')
            ->findArray();

        return array_map(function ($item) use ($db) {
            return self::_recreateInstance($db, $item);
        }, $objects);
    }

    protected function _create()
    {
        $person = $this->_db->table(self::$_table)->create();
        $success = $this->_save($person);
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
     * @return int | null
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * @return string
     */
    public function getEmail(): string
    {
        return $this->_email;
    }

    /**
     * @param string $email
     * @return PersonPrimitive
     */
    public function setEmail(string $email): PersonPrimitive
    {
        $this->_email = $email;
        return $this;
    }

    /**
     * @return string
     */
    public function getPhone(): string
    {
        return $this->_phone;
    }

    /**
     * @param string $phone
     * @return PersonPrimitive
     */
    public function setPhone(string $phone): PersonPrimitive
    {
        $this->_phone = $phone;
        return $this;
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
     * @return PersonPrimitive
     */
    public function setTitle(string $title): PersonPrimitive
    {
        $this->_title = $title;
        return $this;
    }

    /**
     * @return string
     */
    public function getAuthHash(): string
    {
        return $this->_authHash;
    }

    /**
     * @param string $authHash
     * @return PersonPrimitive
     */
    public function setAuthHash(string $authHash): PersonPrimitive
    {
        $this->_authHash = $authHash;
        return $this;
    }

    /**
     * @return string
     */
    public function getAuthSalt(): string
    {
        return $this->_authSalt;
    }

    /**
     * @param string $authSalt
     * @return PersonPrimitive
     */
    public function setAuthSalt(string $authSalt): PersonPrimitive
    {
        $this->_authSalt = $authSalt;
        return $this;
    }

    /**
     * @return string
     */
    public function getAuthResetToken(): string
    {
        return $this->_authResetToken ?: '';
    }

    /**
     * @param string $authResetToken
     * @return PersonPrimitive
     */
    public function setAuthResetToken(string $authResetToken): PersonPrimitive
    {
        $this->_authResetToken = $authResetToken;
        return $this;
    }

    /**
     * @return string
     */
    public function getCity(): string
    {
        return $this->_city ?: '';
    }

    /**
     * @param string|null $city
     * @return PersonPrimitive
     */
    public function setCity($city): PersonPrimitive
    {
        $this->_city = $city ?: '';
        return $this;
    }

    /**
     * @return string
     */
    public function getTenhouId(): string
    {
        return $this->_tenhouId ?: '';
    }

    /**
     * @param string|null $tenhouId
     * @return PersonPrimitive
     */
    public function setTenhouId($tenhouId): PersonPrimitive
    {
        $this->_tenhouId = $tenhouId ?: '';
        return $this;
    }

    /**
     * @return bool
     */
    public function getDisabled(): bool
    {
        return $this->_disabled == 1;
    }

    /**
     * @param bool $disabled
     * @return PersonPrimitive
     */
    public function setDisabled(bool $disabled): PersonPrimitive
    {
        $this->_disabled = $disabled ? 1 : 0;
        return $this;
    }

    /**
     * @return bool
     */
    public function getIsSuperadmin(): bool
    {
        return $this->_superadmin == 1;
    }

    /**
     * @param bool $superadmin
     * @return PersonPrimitive
     */
    public function setIsSuperadmin(bool $superadmin): PersonPrimitive
    {
        $this->_superadmin = $superadmin ? 1 : 0;
        return $this;
    }

    /**
     * @return int[]
     */
    public function getGroupIds()
    {
        return $this->_groupIds;
    }

    /**
     * @return GroupPrimitive[]
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function getGroups()
    {
        if ($this->_groups === null) {
            if (empty($this->_groupIds)) {
                $this->_groups = [];
            } else {
                $this->_groups = GroupPrimitive::findById(
                    $this->_db,
                    $this->_groupIds
                );
                if (empty($this->_groups) || count($this->_groups) !== count($this->_groupIds)) {
                    $this->_groups = null;
                    throw new EntityNotFoundException("Not all groups were found in DB (among id#" . implode(',', $this->_groupIds));
                }
            }
        }

        return $this->_groups;
    }

    /**
     * @param GroupPrimitive[] $groups
     * @return PersonPrimitive
     */
    public function setGroups($groups)
    {
        $this->_groups = $groups;
        $this->_groupIds = array_map(function (GroupPrimitive $group) {
            return $group->getId();
        }, $groups);

        return $this;
    }
}
